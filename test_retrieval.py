from sqlalchemy import select, func
from sqlalchemy.orm import Session

from database import engine
from models import DocumentChunk
from models import Course, Document, DocumentChunk
from models import Document

from sqlalchemy import text
from database import engine

with engine.connect() as connection:
    result = connection.execute(
        text("""
            SELECT
                current_database(),
                current_schema(),
                inet_server_addr(),
                current_setting('server_version')
        """)
    ).fetchone()

    print("Database:", result[0])
    print("Schema:", result[1])
    print("Server address:", result[2])
    print("PostgreSQL version:", result[3])