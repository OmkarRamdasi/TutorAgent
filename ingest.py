import os
import pymupdf
import chromadb
import uuid

from dotenv import load_dotenv
from google import genai


# -----------------------------
# Configuration
# -----------------------------
CHUNK_SIZE = 700
CHUNK_OVERLAP = 100


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
# Extract PDF text
# -----------------------------
def extract_text(pdf_path):

    document = pymupdf.open(pdf_path)

    pages = []

    for page_number, page in enumerate(document):

        text = page.get_text()

        pages.append({
            "page_number": page_number + 1,
            "text": text
        })

    document.close()

    return pages


# -----------------------------
# Create chunks
# -----------------------------
def create_chunks(pages):

    chunks = []

    for page in pages:

        words = page["text"].split()

        start = 0

        while start < len(words):

            end = start + CHUNK_SIZE

            chunk_words = words[start:end]

            chunk_text = " ".join(chunk_words)

            chunks.append({
                "page_number": page["page_number"],
                "text": chunk_text
            })

            start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


# -----------------------------
# Generate embedding
# -----------------------------
def create_embedding(text):

    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text
    )

    return result.embeddings[0].values


# -----------------------------
# Ingest PDF
# -----------------------------
def ingest_pdf(pdf_path):

    print(f"\nIngesting: {pdf_path}")

    # Extract text
    pages = extract_text(pdf_path)

    print("Pages:", len(pages))

    # Create chunks
    chunks = create_chunks(pages)

    print("Chunks:", len(chunks))

    # Store embeddings
    for index, chunk in enumerate(chunks):

        embedding = create_embedding(chunk["text"])

        collection.add(
            ids=[str(uuid.uuid4())],
            documents=[chunk["text"]],
            embeddings=[embedding],
            metadatas=[{
                "page": chunk["page_number"],
                "source": pdf_path
            }]
        )

        print(
            f"Stored chunk {index + 1}/{len(chunks)}"
        )

    print("\nFinished!")

    print(
        "Documents in ChromaDB:",
        collection.count()
    )

    return {
        "pages": len(pages),
        "chunks": len(chunks),
        "total_documents": collection.count()
    }