import chromadb

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_collection(
    name="data_science_course"
)

result = collection.get(
    include=["metadatas", "documents"]
)

for i in range(len(result["ids"])):
    print("\nID:", result["ids"][i])
    print("Metadata:", result["metadatas"][i])
    print("Document:", result["documents"][i][:100])