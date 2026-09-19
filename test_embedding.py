import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
text = "Data quality is important because better data produces better insights."

result = client.models.embed_content(
    model ="gemini-embedding-2",
    contents = text
)

embedding = result.embeddings[0].values

print("Embedding length:", len(embedding))
print("First 10 values:", embedding[:10])