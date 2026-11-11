
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.strip()

    # Use Psycopg 3 explicitly
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1
        )

    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgres://",
            "postgresql+psycopg://",
            1
        )

else:
    # Local PostgreSQL fallback
    DATABASE_PASSWORD = os.getenv("POSTGRES_PASSWORD")

    if not DATABASE_PASSWORD:
        raise ValueError(
            "Set DATABASE_URL or POSTGRES_PASSWORD"
        )

    DATABASE_URL = URL.create(
        drivername="postgresql+psycopg",
        username="postgres",
        password=DATABASE_PASSWORD,
        host="localhost",
        port=5433,
        database="learnai",
    )

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=2,
    pool_timeout=30,
    connect_args={
        "connect_timeout": 10,
    },
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()
