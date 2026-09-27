import os

import chromadb
from dotenv import load_dotenv
from google import genai


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

collection = chroma_client.get_collection(
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