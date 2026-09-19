import os

import chromadb
from dotenv import load_dotenv, main
from google import genai


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = chroma_client.get_collection(
    name="data_science_course"
)


# ============================================================
# 1. RETRIEVE
# ============================================================

def retrieve(question, number_of_chunks=2):
    """
    Find the most relevant course material for the question.
    """

    result = client.models.embed_content(
        model="gemini-embedding-2",
        contents=question
    )

    question_embedding = result.embeddings[0].values

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=number_of_chunks
    )

    return results["documents"][0]


# ============================================================
# 2. GENERATE
# ============================================================

def generate(question, retrieved_chunks):
    """
    Ask Gemini to generate an answer using the retrieved
    course material.
    """

    context = "\n\n".join(retrieved_chunks)

    prompt = f"""
You are a Data Science tutor.

Your job is to teach the student, not simply give an answer.

Use ONLY the course material provided below.

COURSE MATERIAL
---------------
{context}
---------------

STUDENT QUESTION
----------------
{question}
----------------

Teaching rules:

1. Explain the concept as if teaching a 5-year-old.
2. Use a simple real-world analogy.
3. Then explain the technical meaning.
4. Give one simple example.
5. End with one short question to check whether
   the student understood.
6. Do not invent information that isn't supported
   by the course material.

If the answer cannot be found in the course material,
say:

"I couldn't find this in your course material."

Do not make up information.
"""

    response = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt
    )

    return response.output_text



# ============================================================
# 3. EVALUATE STUDENT ANSWER
# ============================================================

def evaluate_answer(question, student_answer, retrieved_chunks):
    """
    Evaluate the student's answer by first determining
    the expected answer from the course material.
    """

    context = "\n\n".join(retrieved_chunks)

    # --------------------------------------------------------
    # Step 1: Find the expected answer
    # --------------------------------------------------------

    expected_prompt = f"""
You are creating an answer key for a Data Science quiz.

Use ONLY the course material below.

COURSE MATERIAL
---------------
{context}
---------------

QUESTION
--------
{question}
--------

What is the correct answer to this question?

Give ONLY the expected answer.
Keep it short and clear.
"""

    expected_response = client.interactions.create(
        model="gemini-3.6-flash",
        input=expected_prompt
    )

    expected_answer = expected_response.output_text.strip()

    # --------------------------------------------------------
    # Step 2: Compare student's answer with expected answer
    # --------------------------------------------------------

    evaluation_prompt = f"""
You are a strict but fair quiz evaluator.

QUESTION:
{question}

EXPECTED ANSWER:
{expected_answer}

STUDENT ANSWER:
{student_answer}

Determine whether the student's answer means the same
thing as the expected answer.

IMPORTANT:

- Judge meaning, NOT exact wording.
- A short answer can be correct.
- "No" and "No, special permission is not required"
  mean the same thing.
- "Yes" and "No" are opposite answers.
- Do not require an explanation unless the question
  asks for one.

Return ONLY one word:

CORRECT

or

INCORRECT
"""

    evaluation_response = client.interactions.create(
        model="gemini-3.6-flash",
        input=evaluation_prompt
    )

    result = evaluation_response.output_text.strip().upper()

    # --------------------------------------------------------
    # Step 3: Give feedback
    # --------------------------------------------------------

    if "CORRECT" in result and "INCORRECT" not in result:

        return f"""
RESULT: CORRECT

🎉 Great job!

Your answer:
{student_answer}

Expected answer:
{expected_answer}

You understood the concept correctly.
"""

    else:

        return f"""
RESULT: INCORRECT

Your answer:
{student_answer}

Expected answer:
{expected_answer}

Think about the course material again and try to explain
why the expected answer is correct.
"""

# ============================================================
# 4. TEACH
# ============================================================

def teach(question):
    """
    Complete teaching + evaluation pipeline.
    """

    # Retrieve relevant course material
    retrieved_chunks = retrieve(question)

    # Generate explanation + quiz
    answer = generate(
        question,
        retrieved_chunks
    )

    print("\n" + "=" * 60)
    print("TUTOR")
    print("=" * 60)

    print(answer)

    # Ask student for their answer
    student_answer = input("\nYour answer: ")

    # Evaluate answer
    evaluation = evaluate_answer(
        question,
        student_answer,
        retrieved_chunks
    )

    print("\n" + "=" * 60)
    print("FEEDBACK")
    print("=" * 60)

    print(evaluation)


# ============================================================
# MAIN PROGRAM
# ============================================================

question = input("\nAsk your Data Science Tutor: ")

teach(question)



