
import os
import pymupdf
import chromadb
import uuid
import hashlib
import re
import json
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

    try:
        pages = []

        for page_number, page in enumerate(document):
            text = page.get_text()

            pages.append({
                "page_number": page_number + 1,
                "text": text
            })

        return pages

    finally:
        document.close()


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

            if chunk_text.strip():
                chunks.append({
                    "page_number": page["page_number"],
                    "text": chunk_text
                })

            start += CHUNK_SIZE - CHUNK_OVERLAP

    return chunks


# -----------------------------
# Text normalization and hashing
# -----------------------------
def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    return re.sub(r"\s+", " ", text).strip().casefold()


def create_text_hash(text: str) -> str:
    """Create a stable hash of normalized text."""
    normalized = normalize_text(text)

    return hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()


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
# Identify concept in a chunk
# -----------------------------

def identify_chunk_concept(text: str) -> dict:
    prompt = f"""
You are an expert learning-content analyst.

Identify ALL distinct, meaningful educational concepts explained
in the source text.

Return valid JSON in exactly this format:
{{
    "concepts": [
        {{
            "topic": "Broad subject",
            "concept": "Specific concept name"
        }}
    ]
}}

Rules:
- Extract multiple concepts when the text covers multiple concepts.
- Include only concepts supported by the source text.
- Prefer specific, independently learnable concepts.
- Do not create duplicate concepts.
- Ignore page numbers, introductions, references, and filler text.
- Do not treat every heading as a concept unless it contains
  meaningful educational content.
- Keep topic names broad and concept names concise.
- If no meaningful educational concept is present, return:
  {{"concepts": []}}

Source text:
{text[:10000]}
"""

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json"
        }
    )

    data = json.loads(response.text)

    concepts = []

    for item in data.get("concepts", []):
        topic = str(item.get("topic", "")).strip()
        concept = str(item.get("concept", "")).strip()

        if topic and concept:
            concepts.append({
                "topic": topic,
                "concept": concept
            })

    return {"concepts": concepts}


# -----------------------------
# Ingest PDF and collect roadmap concepts
# -----------------------------

def ingest_pdf(pdf_path, user_id, course_id, document_id):
    print(f"\nIngesting: {pdf_path}")

    # 1. Extract PDF text
    pages = extract_text(pdf_path)
    print("Pages:", len(pages))

    # 2. Split text into chunks
    chunks = create_chunks(pages)
    print("Chunks:", len(chunks))

    # 3. Load existing user chunks for duplicate detection
    existing = collection.get(
        where={"user_id": user_id},
        include=["documents"]
    )

    existing_hashes = {
        create_text_hash(text)
        for text in (existing.get("documents") or [])
        if text
    }

    stored_chunks = 0
    skipped_chunks = 0

    # Unique concepts identified in this PDF
    roadmap_concepts = {}

    # 4. Process each chunk
    for index, chunk in enumerate(chunks):
        chunk_text = chunk["text"]
        chunk_hash = create_text_hash(chunk_text)

        try:
            # Extract all concepts from this chunk
            concept_info = identify_chunk_concept(chunk_text)
            concepts = concept_info.get("concepts", [])

            # Collect and deduplicate concepts
            for item in concepts:
                topic = item["topic"].strip()
                concept = item["concept"].strip()

                if not topic or not concept:
                    continue

                key = (
                    normalize_text(topic),
                    normalize_text(concept)
                )

                if key not in roadmap_concepts:
                    roadmap_concepts[key] = {
                        "topic": topic,
                        "concept": concept
                    }

            # Avoid storing duplicate text chunks
            if chunk_hash in existing_hashes:
                skipped_chunks += 1
                print(
                    f"Skipped duplicate chunk "
                    f"{index + 1}/{len(chunks)}"
                )
                continue

            # Generate embedding for the chunk
            embedding = create_embedding(chunk_text)

            # Keep the first concept in metadata for compatibility
            # with the existing retrieval system.
            primary_concept = (
                concepts[0]
                if concepts
                else {
                    "topic": "General",
                    "concept": "Unclassified content"
                }
            )

            collection.add(
                ids=[str(uuid.uuid4())],
                documents=[chunk_text],
                embeddings=[embedding],
                metadatas=[{
                    "user_id": user_id,
                    "course_id": course_id,
                    "document_id": document_id,
                    "page": chunk["page_number"],
                    "source": pdf_path,
                    "content_hash": chunk_hash,
                    "topic": primary_concept["topic"],
                    "concept": primary_concept["concept"]
                }]
            )

            existing_hashes.add(chunk_hash)
            stored_chunks += 1

            print(
                f"Processed chunk {index + 1}/{len(chunks)} "
                f"| Concepts found: {len(concepts)}"
            )

        except Exception as e:
            print(
                f"Failed to process chunk "
                f"{index + 1}/{len(chunks)}: {e}"
            )
            raise

    # 5. Build the unique concept list
    concepts = list(roadmap_concepts.values())

    print("\nIngestion finished!")
    print("New chunks stored:", stored_chunks)
    print("Duplicate chunks skipped:", skipped_chunks)
    print("Unique concepts identified:", len(concepts))

    for item in concepts:
        print(
            f"Topic: {item['topic']} "
            f"| Concept: {item['concept']}"
        )

    return {
        "pages": len(pages),
        "chunks": stored_chunks,
        "duplicate_chunks_skipped": skipped_chunks,
        "total_documents": collection.count(),
        "concepts": concepts
    }


# -----------------------------
# Find existing concepts
# -----------------------------
def find_existing_concept(user_id: str, topic: str, concept: str):
    """Find chunks for this user with the same topic and concept."""

    results = collection.get(
        where={"user_id": user_id},
        include=["metadatas"]
    )

    normalized_topic = normalize_text(topic)
    normalized_concept = normalize_text(concept)

    matches = []

    for metadata in results.get("metadatas") or []:
        existing_topic = normalize_text(
            metadata.get("topic", "")
        )
        existing_concept = normalize_text(
            metadata.get("concept", "")
        )

        if (
            existing_topic == normalized_topic
            and existing_concept == normalized_concept
        ):
            matches.append({
                "course_id": metadata.get("course_id"),
                "document_id": metadata.get("document_id"),
                "topic": metadata.get("topic"),
                "concept": metadata.get("concept")
            })

    return matches
