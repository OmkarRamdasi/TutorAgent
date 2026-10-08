from fastapi import (
    Depends,
    FastAPI,
    Header,
    UploadFile,
    File,
    HTTPException,
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pathlib import Path
import shutil
import uuid

from ingest import ingest_pdf

from ask import (
    ask_tutor,
    evaluate_answer,
    TutorResponse,
)

from firebase_config import verify_token
from database import SessionLocal

from models import (
    User,
    Course,
    Document,
    LearningProgress,
)


app = FastAPI()

security = HTTPBearer()


# ============================================================
# REQUEST MODELS
# ============================================================

class AskRequest(BaseModel):
    question: str
    course_id: str
    
class SummaryRequest(BaseModel):
    course_id: str


class EvaluateRequest(BaseModel):
    course_id: str
    topic: str
    concept: str
    quiz_question: str
    expected_answer: str
    quiz_explanation: str
    student_answer: str


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOAD DIRECTORY
# ============================================================

UPLOAD_DIR = Path(
    "data/uploads"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# FIREBASE AUTHENTICATION
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    )
):
    token = credentials.credentials

    try:

        decoded_token = verify_token(
            token
        )

        return decoded_token

    except Exception as e:

        print(
            "Firebase token verification failed:",
            e
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token"
        )


# ============================================================
# POSTGRESQL USER
# ============================================================

def get_or_create_user(
    firebase_user
):

    db = SessionLocal()

    try:

        uid = firebase_user["uid"]

        email = firebase_user.get(
            "email"
        )

        user = (
            db.query(User)
            .filter(
                User.id == uid
            )
            .first()
        )

        if not user:

            user = User(
                id=uid,
                email=email
            )

            db.add(user)

            db.commit()

            db.refresh(
                user
            )

        return user

    finally:

        db.close()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "LearnAI API is running"
    }


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/me")
def get_me(
    current_user=Depends(
        get_current_user
    )
):

    user = get_or_create_user(
        current_user
    )

    return {
        "uid": user.id,
        "email": user.email
    }


# ============================================================
# GET COURSES
# ============================================================

@app.get("/courses")
def get_courses(
    current_user=Depends(
        get_current_user
    )
):

    user = get_or_create_user(
        current_user
    )

    db = SessionLocal()

    try:

        courses = (
            db.query(Course)
            .filter(
                Course.user_id == user.id
            )
            .order_by(
                Course.created_at.desc()
            )
            .all()
        )

        result = []

        for course in courses:

            documents = (
                db.query(Document)
                .filter(
                    Document.course_id == course.id
                )
                .all()
            )

            result.append({

                "id": course.id,

                "title": course.title,

                "created_at": course.created_at,

                "documents": [

                    {
                        "id": document.id,

                        "filename": document.filename,

                        "pages": document.pages,

                        "chunks": document.chunks,

                        "status": document.status,
                    }

                    for document in documents
                ],
            })

        return result

    finally:

        db.close()


# ============================================================
# UPLOAD PDF
# ============================================================

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),

    current_user=Depends(
        get_current_user
    )
):

    if file.content_type != "application/pdf":

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    user = get_or_create_user(
        current_user
    )

    course_id = str(
        uuid.uuid4()
    )

    document_id = str(
        uuid.uuid4()
    )

    file_path = (
        UPLOAD_DIR /
        file.filename
    )

    # --------------------------------------------------------
    # 1. Save uploaded PDF
    # --------------------------------------------------------

    with file_path.open(
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    # --------------------------------------------------------
    # 2. Create Course + Document
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        course = Course(
            id=course_id,

            user_id=user.id,

            title=file.filename
        )

        db.add(course)

        document = Document(
            id=document_id,

            course_id=course_id,

            filename=file.filename,

            file_path=str(
                file_path
            ),

            status="processing"
        )

        db.add(document)

        db.commit()

    except Exception:

        db.rollback()

        db.close()

        raise

    finally:

        if db:

            db.close()

    # --------------------------------------------------------
    # 3. Process PDF / create embeddings
    # --------------------------------------------------------

    print(
        "\nUPLOAD DEBUG"
    )

    print(
        "user_id:",
        user.id
    )

    print(
        "course_id:",
        course_id
    )

    print(
        "document_id:",
        document_id
    )

    try:

        result = ingest_pdf(
            str(file_path),

            user.id,

            course_id,

            document_id
        )

    except Exception as e:

        db = SessionLocal()

        try:

            document = (
                db.query(Document)
                .filter(
                    Document.id == document_id
                )
                .first()
            )

            if document:

                document.status = "failed"

                db.commit()

        finally:

            db.close()

        print(
            "PDF processing failed:",
            e
        )

        raise HTTPException(
            status_code=500,

            detail=(
                "PDF uploaded but "
                "AI processing failed."
            )
        )

    # --------------------------------------------------------
    # 4. Update document after processing
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id
            )
            .first()
        )

        if document:

            document.pages = result[
                "pages"
            ]

            document.chunks = result[
                "chunks"
            ]

            document.status = "ready"

        db.commit()

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()

    return {

        "message": (
            "PDF uploaded and "
            "processed successfully"
        ),

        "course_id": course_id,

        "document_id": document_id,

        "filename": file.filename,

        "pages": result["pages"],

        "chunks": result["chunks"],

        "status": "ready"
    }


# ============================================================
# ASK TUTOR
# ============================================================

@app.post("/ask")
def ask_tutor_endpoint(
    request: AskRequest,

    current_user=Depends(
        get_current_user
    )
):

    user = get_or_create_user(
        current_user
    )

    # --------------------------------------------------------
    # Verify course belongs to logged-in user
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        course = (
            db.query(Course)
            .filter(
                Course.id == request.course_id,

                Course.user_id == user.id
            )
            .first()
        )

        if not course:

            raise HTTPException(
                status_code=404,

                detail="Course not found"
            )

    finally:

        db.close()

    try:

        result = ask_tutor(
            request.question,

            request.course_id,
            user.id
        )

        return {

            "topic": result.topic,

            "concept": result.concept,

            "lesson": result.lesson,

            "quiz_question": (
                result.quiz_question
            ),

            "expected_answer": (
                result.expected_answer
            ),

            "quiz_explanation": (
                result.quiz_explanation
            )
        }

    except Exception as e:

        import traceback

        print(
            "\n========== TUTOR ERROR =========="
        )

        print(
            "Error:",
            repr(e)
        )

        traceback.print_exc()

        print(
            "=================================\n"
        )

        raise HTTPException(
            status_code=500,

            detail=(
                "Tutor failed to "
                "process the question."
            )
        )


# ============================================================
# COURSE SUMMARY
# ============================================================

@app.post("/summary")
def generate_course_summary(
    request: SummaryRequest,
    current_user=Depends(
        get_current_user
    )
):

    user = get_or_create_user(
        current_user
    )

    # --------------------------------------------------------
    # Verify course belongs to logged-in user
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        course = (
            db.query(Course)
            .filter(
                Course.id == request.course_id,
                Course.user_id == user.id
            )
            .first()
        )

        if not course:

            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        # ----------------------------------------------------
        # Return saved summary if it already exists
        # ----------------------------------------------------

        if course.summary:

            return {
                "course_id": request.course_id,
                "summary": course.summary
            }

    finally:

        db.close()

    # --------------------------------------------------------
    # Generate summary only if it doesn't exist
    # --------------------------------------------------------

    try:

        from ask import generate_course_summary

        summary = generate_course_summary(
            request.course_id
        )

    except Exception as e:

        import traceback

        print("\n========== SUMMARY ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("==================================\n")

        raise HTTPException(
            status_code=500,
            detail="Failed to generate course summary."
        )

    # --------------------------------------------------------
    # Save generated summary to database
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        course = (
            db.query(Course)
            .filter(
                Course.id == request.course_id,
                Course.user_id == user.id
            )
            .first()
        )

        if not course:

            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        course.summary = summary

        db.commit()

    finally:

        db.close()

    # --------------------------------------------------------
    # Return summary
    # --------------------------------------------------------

    return {
        "course_id": request.course_id,
        "summary": summary
    }

    # --------------------------------------------------------
    # Generate summary
    # --------------------------------------------------------

    try:

        from ask import generate_course_summary

        summary = generate_course_summary(
            request.course_id
        )

        return {
            "course_id": request.course_id,
            "summary": summary
        }

    except Exception as e:

        import traceback

        print(
            "\n========== SUMMARY ERROR =========="
        )

        print(
            "Error:",
            repr(e)
        )

        traceback.print_exc()

        print(
            "==================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate course summary."
        )


# ============================================================
# SAVE LEARNING PROGRESS
# ============================================================

def save_learning_progress(
    user_id: str,
    course_id: str,
    topic: str,
    concept: str,
    is_correct: bool
):
    """
    Create or update learning progress
    for a specific user, course and concept.
    """

    db = SessionLocal()

    try:

        progress = (
            db.query(
                LearningProgress
            )
            .filter(

                LearningProgress.user_id
                == user_id,

                LearningProgress.course_id
                == course_id,

                LearningProgress.topic
                == topic,

                LearningProgress.concept
                == concept
            )
            .first()
        )

        # ----------------------------------------------------
        # Create progress record
        # ----------------------------------------------------

        if not progress:

            progress = LearningProgress(

                id=str(
                    uuid.uuid4()
                ),

                user_id=user_id,

                course_id=course_id,

                topic=topic,

                concept=concept,

                attempts=0,

                correct=0,

                incorrect=0,

                mastery=0,

                status="learning"
            )

            db.add(
                progress
            )

        # ----------------------------------------------------
        # Record attempt
        # ----------------------------------------------------

        progress.attempts += 1

        if is_correct:

            progress.correct += 1

        else:

            progress.incorrect += 1

        # ----------------------------------------------------
        # Calculate mastery
        # ----------------------------------------------------

        progress.mastery = round(
            (
                progress.correct /
                progress.attempts
            ) * 100
        )

        # ----------------------------------------------------
        # Determine learning state
        # ----------------------------------------------------

        if progress.mastery < 50:

            progress.status = "weak"

        elif progress.mastery < 80:

            progress.status = "learning"

        else:

            progress.status = "strong"

        db.commit()

        db.refresh(
            progress
        )

        return progress

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()


# ============================================================
# EVALUATE STUDENT ANSWER
# ============================================================

@app.post("/evaluate")
def evaluate_student_answer(
    request: EvaluateRequest,

    current_user=Depends(
        get_current_user
    )
):

    user = get_or_create_user(
        current_user
    )

    # --------------------------------------------------------
    # Verify course belongs to logged-in user
    # --------------------------------------------------------

    db = SessionLocal()

    try:

        course = (
            db.query(Course)
            .filter(

                Course.id
                == request.course_id,

                Course.user_id
                == user.id
            )
            .first()
        )

        if not course:

            raise HTTPException(
                status_code=404,

                detail="Course not found"
            )

    finally:

        db.close()

    try:

        # ----------------------------------------------------
        # Reconstruct TutorResponse
        # ----------------------------------------------------

        tutor_response = TutorResponse(

            topic=request.topic,

            concept=request.concept,

            lesson="",

            quiz_question=(
                request.quiz_question
            ),

            expected_answer=(
                request.expected_answer
            ),

            quiz_explanation=(
                request.quiz_explanation
            )
        )

        # ----------------------------------------------------
        # Evaluate answer using Gemini
        # ----------------------------------------------------

        evaluation = evaluate_answer(

            tutor_response,

            request.student_answer
        )

        if evaluation is None:

            raise HTTPException(
                status_code=500,

                detail=(
                    "Could not "
                    "evaluate the answer."
                )
            )

        # ----------------------------------------------------
        # Save progress
        # ----------------------------------------------------

        progress = save_learning_progress(

            user_id=user.id,

            course_id=request.course_id,

            topic=request.topic,

            concept=request.concept,

            is_correct=evaluation.correct
        )

        # ----------------------------------------------------
        # Return evaluation + progress
        # ----------------------------------------------------

        return {

            "correct": evaluation.correct,

            "feedback": evaluation.feedback,

            "progress": {

                "topic": progress.topic,

                "concept": progress.concept,

                "attempts": progress.attempts,

                "correct": progress.correct,

                "incorrect": progress.incorrect,

                "mastery": progress.mastery,

                "status": progress.status
            }
        }

    except HTTPException:

        raise

    except Exception as e:

        import traceback

        print(
            "\n========== EVALUATION ERROR =========="
        )

        print(
            "Error:",
            repr(e)
        )

        traceback.print_exc()

        print(
            "======================================\n"
        )

        raise HTTPException(
            status_code=500,

            detail=(
                "Failed to "
                "evaluate answer."
            )
        )
        
# ============================================================
# GET COURSE PROGRESS
# ============================================================
      
@app.get("/progress/{course_id}")
def get_course_progress(
    course_id: str,
    current_user=Depends(
        get_current_user
    )
):

    user = get_or_create_user(
        current_user
    )

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Verify course belongs to logged-in user
        # ----------------------------------------------------

        course = (
            db.query(Course)
            .filter(
                Course.id == course_id,
                Course.user_id == user.id
            )
            .first()
        )

        if not course:

            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        # ----------------------------------------------------
        # Fetch learning progress
        # ----------------------------------------------------

        progress_records = (
            db.query(LearningProgress)
            .filter(
                LearningProgress.course_id
                == course_id,

                LearningProgress.user_id
                == user.id
            )
            .order_by(
                LearningProgress.updated_at.desc()
            )
            .all()
        )

        # ----------------------------------------------------
        # Return progress
        # ----------------------------------------------------

        return {
            "course_id": course_id,

            "progress": [
                {
                    "topic": progress.topic,

                    "concept": progress.concept,

                    "attempts": progress.attempts,

                    "correct": progress.correct,

                    "incorrect": progress.incorrect,

                    "mastery": progress.mastery,

                    "status": progress.status
                }

                for progress in progress_records
            ]
        }

    except HTTPException:

        raise

    except Exception as e:

        import traceback

        print(
            "\n========== PROGRESS ERROR =========="
        )

        print(
            "Error:",
            repr(e)
        )

        traceback.print_exc()

        print(
            "====================================\n"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch course progress."
        )

    finally:

        db.close()