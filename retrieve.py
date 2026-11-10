
import os
import json

from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models import DocumentChunk


# -----------------------------
# Gemini
# -----------------------------

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


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
# Identify chunk concept
# -----------------------------

def identify_chunk_concept(text: str) -> dict:

    prompt = f"""
Identify the main educational concept explained in this text.

Return valid JSON with exactly these fields:
- topic: a broad subject
- concept: a short, specific concept name

Rules:
- Use the source text only.
- Do not invent concepts.
- If the text does not explain a meaningful educational concept,
  use "General" for topic and "Unclassified content" for concept.
- Keep the concept name concise.

Source text:
{text[:5000]}
"""

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json"
        }
    )

    data = json.loads(response.text)

    return {
        "topic": data["topic"].strip(),
        "concept": data["concept"].strip()
    }


# -----------------------------
# Retrieve relevant chunks
# -----------------------------


def retrieve_chunks(
    question,
    course_id,
    top_k=3
):
    question_embedding = create_embedding(question)

    with Session(engine) as session:

        distance = DocumentChunk.embedding.cosine_distance(
            question_embedding
        ).label("distance")

        results = session.execute(
            select(DocumentChunk, distance)
            .where(DocumentChunk.course_id == course_id)
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
