
import os
import json
import firebase_admin
from firebase_admin import credentials, auth

firebase_credentials = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if not firebase_credentials:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT is not configured")

firebase_credentials_dict = json.loads(firebase_credentials)

cred = credentials.Certificate(firebase_credentials_dict)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


def verify_token(id_token: str):
    return auth.verify_id_token(id_token)
