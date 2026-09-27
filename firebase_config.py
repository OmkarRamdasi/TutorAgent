import firebase_config

from firebase_config import credentials, auth


# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    "firebase-service-account.json"
)

firebase_config.initialize_app(cred)


def verify_token(id_token: str):

    decoded_token = auth.verify_id_token(id_token)

    return decoded_token