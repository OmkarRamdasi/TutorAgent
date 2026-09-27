from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    courses = relationship(
        "Course",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True)

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="courses"
    )

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
        ForeignKey("courses.id"),
        nullable=False
    )

    filename = Column(
        String,
        nullable=False
    )

    pages = Column(Integer)

    chunks = Column(Integer)

    file_path = Column(Text)

    status = Column(
        String,
        default="uploaded"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    course = relationship(
        "Course",
        back_populates="documents"
    )


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String, primary_key=True)

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False
    )

    course_id = Column(
        String,
        ForeignKey("courses.id"),
        nullable=False
    )

    concept = Column(
        String,
        nullable=False
    )

    mastery = Column(
        Integer,
        default=0
    )

    status = Column(
        String,
        default="learning"
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )