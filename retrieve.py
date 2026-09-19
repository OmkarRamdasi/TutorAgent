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
# Create query embedding
# -----------------------------

question = "What is data preprocessing?"

result = client.models.embed_content(
    model="gemini-embedding-2",
    contents=question
)

question_embedding = result.embeddings[0].values


# -----------------------------
# Search ChromaDB
# -----------------------------

results = collection.query(
    query_embeddings=[question_embedding],
    n_results=2
)


# -----------------------------
# Display results
# -----------------------------

print("\nQUESTION:")
print(question)

print("\nRETRIEVED CHUNKS:\n")

for i, document in enumerate(results["documents"][0]):

    print(f"--- Result {i + 1} ---")
    print(document)
    print()