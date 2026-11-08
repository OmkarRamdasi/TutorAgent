import os

import chromadb
from dotenv import load_dotenv
from google import genai
import json


# -----------------------------
# Gemini
# -----------------------------

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# -----------------------------
# ChromaDB
# -----------------------------

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_or_create_collection(
    name="data_science_course"
)


# -----------------------------
# Create embedding
# -----------------------------

def create_embedding(text):

    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )

    return result.embeddings[0].values


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

    question_embedding = create_embedding(
        question
    )

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k,
        where={
            "course_id": course_id
        }
    )

    return results