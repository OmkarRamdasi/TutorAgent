import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_PASSWORD = os.getenv("POSTGRES_PASSWORD")

if not DATABASE_PASSWORD:
    raise ValueError("POSTGRES_PASSWORD is not set in .env")

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
    echo=True,
    connect_args={"connect_timeout": 5},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()