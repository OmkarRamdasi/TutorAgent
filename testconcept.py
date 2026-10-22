
from ingest import find_existing_concept

matches = find_existing_concept(
    user_id="WwH6FQiU0LT3omec216FpEunokd2",
    topic="Artificial Intelligence",
    concept="Machine Learning"
)

print("Existing concept matches:", matches)