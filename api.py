
import hashlib
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4
import os

from fastapi import (
    Depends,
    FastAPI,
    Header,
    UploadFile,
    File,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from ask import (
    ask_tutor,
    evaluate_answer,
    generate_practice_for_course,
    TutorResponse,
)
from database import SessionLocal
from firebase_config import verify_token
from ingest import ingest_pdf
from models import (
    User,
    Course,
    Document,
    LearningProgress,
    PracticeQuestion,
)


app = FastAPI()

security = HTTPBearer()


frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173"
    ).split(",")
    if origin.strip()
]

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
    student_answer: str
    
    expected_answer: str | None = None
    quiz_explanation: str | None = None
    practice_question_id: str | None = None


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
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
    current_user=Depends(get_current_user)
):
    # 1. Validate the uploaded PDF
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF is empty."
        )

    # 2. Calculate the file hash
    file_hash = hashlib.sha256(file_bytes).hexdigest()

    user = get_or_create_user(current_user)

    course_id = str(uuid.uuid4())
    document_id = str(uuid.uuid4())

    safe_filename = Path(
        file.filename or "uploaded.pdf"
    ).name

    file_path = UPLOAD_DIR / f"{document_id}_{safe_filename}"

    # 3. Check for duplicate PDFs
    db = SessionLocal()

    try:
        existing_document = (
            db.query(Document)
            .join(Course, Document.course_id == Course.id)
            .filter(
                Course.user_id == user.id,
                Document.file_hash == file_hash,
                Document.status != "failed"
            )
            .first()
        )

        if existing_document:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": (
                        "This PDF has already been uploaded. "
                        "Continue learning from your existing course."
                    ),
                    "existing_course_id": existing_document.course_id,
                    "existing_document_id": existing_document.id
                }
            )

        # 4. Save the uploaded PDF
        with file_path.open("wb") as buffer:
            buffer.write(file_bytes)

        # 5. Create the course
        course = Course(
            id=course_id,
            user_id=user.id,
            title=safe_filename
        )

        db.add(course)

        # 6. Create the document record
        document = Document(
            id=document_id,
            course_id=course_id,
            filename=safe_filename,
            file_hash=file_hash,
            file_path=str(file_path),
            status="processing"
        )

        db.add(document)
        db.commit()

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise

    finally:
        db.close()

    # 7. Extract concepts and create embeddings
    try:
        result = ingest_pdf(
            str(file_path),
            user.id,
            course_id,
            document_id
        )

        concepts = result.get("concepts", [])

    except Exception as e:
        import traceback

        print("PDF processing failed:", repr(e))
        traceback.print_exc()

        db = SessionLocal()

        try:
            document = (
                db.query(Document)
                .filter(Document.id == document_id)
                .first()
            )

            if document:
                document.status = "failed"
                db.commit()

        except Exception:
            db.rollback()
            traceback.print_exc()

        finally:
            db.close()

        raise HTTPException(
            status_code=500,
            detail="PDF uploaded but AI processing failed."
        )

    # 8. Save concept roadmap and processing results
    db = SessionLocal()

    try:
        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document record not found."
            )

        # Initialize progress records for discovered concepts.
        for item in concepts:
            topic = item["topic"].strip()
            concept = item["concept"].strip()

            if not topic or not concept:
                continue

            existing_progress = (
                db.query(LearningProgress)
                .filter(
                    LearningProgress.user_id == user.id,
                    LearningProgress.course_id == course_id,
                    LearningProgress.topic == topic,
                    LearningProgress.concept == concept
                )
                .first()
            )

            if existing_progress:
                continue

            progress = LearningProgress(
                id=str(uuid.uuid4()),
                user_id=user.id,
                course_id=course_id,
                topic=topic,
                concept=concept,
                attempts=0,
                correct=0,
                incorrect=0,
                mastery=0,
                status="not_started"
            )

            db.add(progress)

        document.pages = result["pages"]
        document.chunks = result["chunks"]
        document.status = "ready"

        db.commit()

        # Return the complete saved roadmap, including existing records.
        roadmap = (
            db.query(LearningProgress)
            .filter(
                LearningProgress.user_id == user.id,
                LearningProgress.course_id == course_id
            )
            .order_by(
                LearningProgress.topic,
                LearningProgress.concept
            )
            .all()
        )

        return {
            "message": "PDF uploaded and processed successfully.",
            "course_id": course_id,
            "document_id": document_id,
            "filename": safe_filename,
            "pages": result["pages"],
            "chunks": result["chunks"],
            "status": "ready",
            "concepts_count": len(roadmap),
            "concepts": [
                {
                    "id": item.id,
                    "topic": item.topic,
                    "concept": item.concept,
                    "attempts": item.attempts,
                    "mastery": item.mastery,
                    "status": item.status
                }
                for item in roadmap
            ]
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
        await file.close()


   


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

    except RuntimeError as e:
        if "does not contain enough information" in str(e):
            raise HTTPException(
                status_code=422,
                detail=str(e)
            )

        raise HTTPException(
            status_code=500,
            detail="Tutor failed to process the question."
        )

    except Exception as e:
        import traceback

        print("\n========== TUTOR ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("=================================\n")

        raise HTTPException(
            status_code=500,
            detail="Tutor failed to process the question."
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
    Create or update progress for a concept.
    A concept requires at least 3 attempts and 90% mastery
    to be marked as mastered.
    """

    db = SessionLocal()

    try:
        progress = (
            db.query(LearningProgress)
            .filter(
                LearningProgress.user_id == user_id,
                LearningProgress.course_id == course_id,
                LearningProgress.topic == topic,
                LearningProgress.concept == concept
            )
            .first()
        )

        # Create the progress record if it doesn't exist.
        if not progress:
            progress = LearningProgress(
                id=str(uuid.uuid4()),
                user_id=user_id,
                course_id=course_id,
                topic=topic,
                concept=concept,
                attempts=0,
                correct=0,
                incorrect=0,
                mastery=0,
                status="not_started"
            )

            db.add(progress)

        # Record this attempt.
        progress.attempts += 1

        if is_correct:
            progress.correct += 1
        else:
            progress.incorrect += 1

        # Calculate mastery as the percentage of correct answers.
        progress.mastery = round(
            (progress.correct / progress.attempts) * 100
        )

        # Update the learning status.
        if progress.attempts >= 3 and progress.mastery >= 90:
            progress.status = "mastered"
        else:
            progress.status = "learning"

        db.commit()
        db.refresh(progress)

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
    current_user=Depends(get_current_user)
):
    user = get_or_create_user(current_user)
    db = SessionLocal()

    try:
        # 1. Verify that the course belongs to the logged-in user.
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

        # 2. Load the saved Practice question when an ID is provided.
        practice_question = None

        if request.practice_question_id:
            practice_question = (
                db.query(PracticeQuestion)
                .filter(
                    PracticeQuestion.id == request.practice_question_id,
                    PracticeQuestion.course_id == request.course_id,
                    PracticeQuestion.user_id == user.id
                )
                .first()
            )

            if not practice_question:
                raise HTTPException(
                    status_code=404,
                    detail="Practice question not found"
                )

            if practice_question.status == "answered":
                raise HTTPException(
                    status_code=409,
                    detail="This practice question has already been answered."
                )

            # Use the trusted answer stored in the database.
            tutor_response = TutorResponse(
                topic=practice_question.topic,
                concept=practice_question.concept,
                lesson="",
                quiz_question=practice_question.quiz_question,
                expected_answer=practice_question.expected_answer,
                quiz_explanation=practice_question.quiz_explanation
            )

        else:
            # 3. Preserve the normal AI Tutor evaluation flow.
            if (
                not request.expected_answer
                or not request.quiz_explanation
            ):
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Missing expected answer or explanation. "
                        "For Practice evaluations, provide a valid "
                        "practice_question_id."
                    )
                )

            tutor_response = TutorResponse(
                topic=request.topic,
                concept=request.concept,
                lesson="",
                quiz_question=request.quiz_question,
                expected_answer=request.expected_answer,
                quiz_explanation=request.quiz_explanation
            )

        # 4. Evaluate the student's answer.
        evaluation = evaluate_answer(
            tutor_response,
            request.student_answer
        )

        if evaluation is None:
            raise HTTPException(
                status_code=500,
                detail="Could not evaluate the answer."
            )

        # 5. Save Learning Journey progress.
        progress = save_learning_progress(
            user_id=user.id,
            course_id=request.course_id,
            topic=tutor_response.topic,
            concept=tutor_response.concept,
            is_correct=evaluation.correct
        )

        # 6. Save the evaluation for Practice questions.
        if practice_question:
            practice_question.student_answer = request.student_answer
            practice_question.evaluation_feedback = evaluation.feedback
            practice_question.is_correct = evaluation.correct
            practice_question.status = "answered"
            practice_question.answered_at = datetime.utcnow()

            db.commit()

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
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        import traceback

        print("\n========== EVALUATION ERROR ==========")
        print("Error:", repr(e))
        traceback.print_exc()
        print("======================================\n")

        raise HTTPException(
            status_code=500,
            detail="Failed to evaluate answer."
        )

    finally:
        db.close()


# ============================================================
# Practice API
# ============================================================

class PracticeRequest(BaseModel):
    topic: str | None = None
    concept: str | None = None

@app.post("/practice/{course_id}")
def generate_practice(
    course_id: str,
    request: PracticeRequest,
    current_user=Depends(get_current_user)
):
    user = get_or_create_user(current_user)
    db = SessionLocal()

    try:
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

        practice = generate_practice_for_course(
            course_id=course_id,
            user_id=user.id,
            topic=request.topic,
            concept=request.concept,
        )

        saved_question = PracticeQuestion(
            id=str(uuid4()),
            user_id=user.id,
            course_id=course_id,
            topic=practice["topic"],
            concept=practice["concept"],
            quiz_question=practice["quiz_question"],
            expected_answer=practice["expected_answer"],
            quiz_explanation=practice["quiz_explanation"],
            status="pending",
        )

        db.add(saved_question)
        db.commit()
        db.refresh(saved_question)

        return {
            "id": saved_question.id,
            "course_id": saved_question.course_id,
            "topic": saved_question.topic,
            "concept": saved_question.concept,
            "quiz_question": saved_question.quiz_question,
            "status": saved_question.status,
            "created_at": saved_question.created_at.isoformat()
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Failed to generate a practice question."
        )

    finally:
        db.close()



# ============================================================
# Practice History API
# ============================================================       
@app.get("/practice/{course_id}/history")
def get_practice_history(
    course_id: str,
    current_user=Depends(get_current_user)
):
    user = get_or_create_user(current_user)
    db = SessionLocal()

    try:
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

        questions = (
            db.query(PracticeQuestion)
            .filter(
                PracticeQuestion.course_id == course_id,
                PracticeQuestion.user_id == user.id
            )
            .order_by(PracticeQuestion.created_at.desc())
            .all()
        )

        return {
            "course_id": course_id,
            "questions": [
                {
                    "id": item.id,
                    "topic": item.topic,
                    "concept": item.concept,
                    "quiz_question": item.quiz_question,
                    "student_answer": item.student_answer,
                    "evaluation_feedback": item.evaluation_feedback,
                    "is_correct": item.is_correct,
                    "status": item.status,
                    "created_at": item.created_at.isoformat(),
                    "answered_at": (
                        item.answered_at.isoformat()
                        if item.answered_at else None
                    )
                }
                for item in questions
            ]
        }

    finally:
        db.close()
        
        

@app.get("/practice/{course_id}/question/{question_id}")
def get_practice_question(
    course_id: str,
    question_id: str,
    current_user=Depends(get_current_user)
):
    user = get_or_create_user(current_user)
    db = SessionLocal()

    try:
        # Verify course ownership.
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

        # Find the question belonging to this user and course.
        question = (
            db.query(PracticeQuestion)
            .filter(
                PracticeQuestion.id == question_id,
                PracticeQuestion.course_id == course_id,
                PracticeQuestion.user_id == user.id
            )
            .first()
        )

        if not question:
            raise HTTPException(
                status_code=404,
                detail="Practice question not found"
            )

        # Never expose the expected answer or explanation here.
        return {
            "id": question.id,
            "course_id": question.course_id,
            "topic": question.topic,
            "concept": question.concept,
            "quiz_question": question.quiz_question,
            "status": question.status,
            "created_at": question.created_at.isoformat(),
        }

    finally:
        db.close()
        

# ============================================================
# GET LEARNING PROGRESS
# ============================================================

@app.get("/progress/{course_id}")
def get_learning_progress(
    course_id: str,
    current_user=Depends(get_current_user)
):
    user = get_or_create_user(current_user)
    db = SessionLocal()

    try:
        # Verify that the course belongs to the logged-in user.
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

        # Retrieve progress records for this course and user.
        progress_records = (
            db.query(LearningProgress)
            .filter(
                LearningProgress.user_id == user.id,
                LearningProgress.course_id == course_id
            )
            .order_by(LearningProgress.topic, LearningProgress.concept)
            .all()
        )

        return {
            "course_id": course_id,
            "progress": [
                {
                    "id": item.id,
                    "topic": item.topic,
                    "concept": item.concept,
                    "attempts": item.attempts,
                    "correct": item.correct,
                    "incorrect": item.incorrect,
                    "mastery": item.mastery,
                    "status": item.status,
                    "updated_at": (
                        item.updated_at.isoformat()
                        if item.updated_at
                        else None
                    )
                }
                for item in progress_records
            ]
        }

    finally:
        db.close()

