import os 
import pymupdf
import chromadb

from dotenv import load_dotenv
from google import genai


# -----------------------------
# Configuration
# -----------------------------
PDF_PATH = "D:/DataScience/TutorAgent/data/DataPreprocessing.pdf"
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
# Main
# -----------------------------

pages = extract_text(PDF_PATH)

chunks = create_chunks(pages)

print("Pages:", len(pages))
print("Chunks:", len(chunks))


for index, chunk in enumerate(chunks):

    embedding = create_embedding(chunk["text"])

    collection.add(
        ids=[f"chunk_{index}"],
        documents=[chunk["text"]],
        embeddings=[embedding],
        metadatas=[{
            "page": chunk["page_number"],
            "source": PDF_PATH
        }]
    )

    print(f"Stored chunk {index + 1}/{len(chunks)}")


print("\nFinished!")
print("Documents in ChromaDB:", collection.count())