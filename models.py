
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    Boolean,
    UniqueConstraint,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base
from pgvector.sqlalchemy import Vector


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    courses = relationship(
        "Course",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="courses")

    documents = relationship(
        "Document",
        back_populates="course",
        cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True)
    course_id = Column(
        String,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False
    )

    filename = Column(String, nullable=False)
    file_hash = Column(String(64), nullable=True, index=True)
    pages = Column(Integer, default=0)
    chunks = Column(Integer, default=0)
    file_path = Column(String, nullable=False)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="documents")

    document_chunks = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String, primary_key=True)

    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(
        String,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False
    )

    topic = Column(String, nullable=False)
    concept = Column(String, nullable=False)

    attempts = Column(Integer, default=0, nullable=False)
    correct = Column(Integer, default=0, nullable=False)
    incorrect = Column(Integer, default=0, nullable=False)

    # Mastery is stored as a percentage: 0–100
    mastery = Column(Integer, default=0, nullable=False)

    status = Column(String, default="not_started", nullable=False)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "course_id",
            "topic",
            "concept",
            name="uq_learning_progress_user_course_concept"
        ),
        CheckConstraint("mastery >= 0 AND mastery <= 100"),
        CheckConstraint("attempts >= 0 AND correct >= 0 AND incorrect >= 0"),
    )


class PracticeQuestion(Base):
    __tablename__ = "practice_questions"

    id = Column(String, primary_key=True)

    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(
        String,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False
    )

    topic = Column(String, nullable=False)
    concept = Column(String, nullable=False)

    quiz_question = Column(Text, nullable=False)
    expected_answer = Column(Text, nullable=False)
    quiz_explanation = Column(Text, nullable=False)

    student_answer = Column(Text, nullable=True)
    evaluation_feedback = Column(Text, nullable=True)

    is_correct = Column(Boolean, nullable=True)
    status = Column(String, default="pending", nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    answered_at = Column(DateTime, nullable=True)


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True)

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    course_id = Column(
        String,
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    document_id = Column(
        String,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    page = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)

    embedding = Column(Vector(3072), nullable=False)

    content_hash = Column(String(64), nullable=False)

    topic = Column(String, nullable=True)
    concept = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship(
        "Document",
        back_populates="document_chunks"
    )
