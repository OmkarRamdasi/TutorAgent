
import os

from dotenv import load_dotenv
from google import genai
from sqlalchemy import select, cast
from sqlalchemy.orm import Session
from pgvector.sqlalchemy import HALFVEC

from database import engine
from models import DocumentChunk


# -----------------------------
# Gemini
# -----------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=GEMINI_API_KEY)


# -----------------------------
# Create embedding
# -----------------------------

def create_embedding(text):

    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )

    embedding = result.embeddings[0].values

    if len(embedding) != 3072:
        raise ValueError(
            f"Expected 3072 embedding dimensions, got {len(embedding)}"
        )

    return embedding


# -----------------------------
# Retrieve relevant chunks
# -----------------------------

def retrieve_chunks(
    question,
    course_id,
    user_id,
    top_k=3
  
):

    if not question or not question.strip():
        raise ValueError("Question cannot be empty")
    
    if not user_id or not user_id.strip():
        raise ValueError("user_id is required for retrieval")
    
    if top_k < 1:
        raise ValueError("top_k must be at least 1")


    question_embedding = create_embedding(question)

    with Session(engine) as session:

        # Match the halfvec HNSW index created in Neon
        half_embedding = cast(
            DocumentChunk.embedding,
            HALFVEC(3072)
        )

        distance = half_embedding.cosine_distance(
            question_embedding
        ).label("distance")

        query = (
            select(DocumentChunk, distance)
            .where(DocumentChunk.course_id == course_id)
        )

        query = query.where(
            DocumentChunk.user_id == user_id
        )

        results = session.execute(
            query
            .order_by(distance)
            .limit(top_k)
        ).all()

        documents = []
        metadatas = []
        distances = []
        ids = []

        for chunk, cosine_distance in results:

            ids.append(chunk.id)
            documents.append(chunk.content)

            metadatas.append({
                "user_id": chunk.user_id,
                "course_id": chunk.course_id,
                "document_id": chunk.document_id,
                "page": chunk.page,
                "content_hash": chunk.content_hash,
                "topic": chunk.topic,
                "concept": chunk.concept
            })

            distances.append(float(cosine_distance))

        return {
            "ids": [ids],
            "documents": [documents],
            "metadatas": [metadatas],
            "distances": [distances]
        }
