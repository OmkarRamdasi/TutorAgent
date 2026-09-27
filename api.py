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
from ask import ask_tutor
from firebase_config import verify_token
from database import SessionLocal
from models import User, Course, Document


app = FastAPI()
security = HTTPBearer()

class AskRequest(BaseModel):
    question: str
    course_id: str

# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Upload directory
# -----------------------------

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# -----------------------------
# Firebase authentication
# -----------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        decoded_token = verify_token(token)
        return decoded_token

    except Exception as e:
        print("Firebase token verification failed:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token"
        )


# -----------------------------
# PostgreSQL user
# -----------------------------

def get_or_create_user(firebase_user):

    db = SessionLocal()

    try:

        uid = firebase_user["uid"]
        email = firebase_user.get("email")

        user = (
            db.query(User)
            .filter(User.id == uid)
            .first()
        )

        if not user:

            user = User(
                id=uid,
                email=email
            )

            db.add(user)

            db.commit()

            db.refresh(user)

        return user

    finally:

        db.close()


# -----------------------------
# Root
# -----------------------------

@app.get("/")
def root():

    return {
        "message": "LearnAI API is running"
    }


# -----------------------------
# Current user
# -----------------------------

@app.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):

    user = get_or_create_user(
        current_user
    )

    return {
        "uid": user.id,
        "email": user.email
    }

# -----------------------------
# Get Courses
# -----------------------------
@app.get("/courses")
def get_courses(current_user=Depends(get_current_user)):
    user = get_or_create_user(current_user)

    db = SessionLocal()

    try:
        courses = (
            db.query(Course)
            .filter(Course.user_id == user.id)
            .order_by(Course.created_at.desc())
            .all()
        )

        result = []

        for course in courses:

            documents = (
                db.query(Document)
                .filter(Document.course_id == course.id)
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
# -----------------------------
# Upload PDF
# -----------------------------
@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    user = get_or_create_user(current_user)

    course_id = str(uuid.uuid4())
    document_id = str(uuid.uuid4())

    file_path = UPLOAD_DIR / file.filename

    # 1. Save the uploaded PDF
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Create Course + Document first
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
            file_path=str(file_path),
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

    # 3. Process PDF / create embeddings
    print("\nUPLOAD DEBUG")
    print("user_id:", user.id)
    print("course_id:", course_id)
    print("document_id:", document_id)
    try:
        result = ingest_pdf(str(file_path),user.id, course_id, document_id)

    except Exception as e:
        # Processing failed
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

        finally:
            db.close()

        print("PDF processing failed:", e)

        raise HTTPException(
            status_code=500,
            detail="PDF uploaded but AI processing failed."
        )

    # 4. Processing succeeded → update document
    db = SessionLocal()

    try:
        document = (
            db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

        if document:
            document.pages = result["pages"]
            document.chunks = result["chunks"]
            document.status = "ready"

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

    return {
        "message": "PDF uploaded and processed successfully",
        "course_id": course_id,
        "document_id": document_id,
        "filename": file.filename,
        "pages": result["pages"],
        "chunks": result["chunks"],
        "status": "ready"
    }
    
    
    
@app.post("/ask")
def ask_tutor_endpoint(
    request: AskRequest,
    current_user=Depends(get_current_user)
):
    user = get_or_create_user(current_user)

    # Verify that this course belongs to the logged-in user
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
            request.course_id
        )

        return {
            "topic": result.topic,
            "concept": result.concept,
            "lesson": result.lesson,
            "quiz_question": result.quiz_question,
            "expected_answer": result.expected_answer,
            "quiz_explanation": result.quiz_explanation
        }

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
