from retrieve import retrieve_chunks


question = "What is data preprocessing?"

course_id = "1c789616-f5c9-4bbe-93eb-ced3361f8919"


results = retrieve_chunks(
    question,
    course_id,
    top_k=2
)


print("\nQUESTION:")
print(question)

print("\nRETRIEVED CHUNKS:\n")

for i, document in enumerate(results["documents"][0]):

    print(f"--- Result {i + 1} ---")
    print(document)
    print()