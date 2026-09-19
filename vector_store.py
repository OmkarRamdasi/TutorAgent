import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="data_science_course"
)

print("Collection created!")
print("Number of documents:", collection.count())