"""Firebase Admin SDK – Firestore and Authentication."""

import os
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import auth, credentials, firestore

_db = None


def init_firebase(credentials_path: str):
    global _db
    if not firebase_admin._apps:
        if os.path.exists(credentials_path):
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
    _db = firestore.client()
    return _db


def get_db():
    if _db is None:
        raise RuntimeError("Firebase not initialized. Call init_firebase first.")
    return _db


def verify_id_token(id_token: str) -> dict:
    return auth.verify_id_token(id_token)


def create_user(email: str, password: str, display_name: str) -> dict:
    user = auth.create_user(email=email, password=password, display_name=display_name)
    return {"uid": user.uid, "email": user.email, "name": display_name}


def get_user_by_email(email: str):
    try:
        return auth.get_user_by_email(email)
    except auth.UserNotFoundError:
        return None


def save_user_profile(uid: str, name: str, email: str, is_admin: bool = False):
    db = get_db()
    db.collection("users").document(uid).set(
        {
            "uid": uid,
            "name": name,
            "email": email,
            "isAdmin": is_admin,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        },
        merge=True,
    )


def get_user_profile(uid: str):
    doc = get_db().collection("users").document(uid).get()
    return doc.to_dict() if doc.exists else None


def save_assessment(uid: str, assessment_data: dict, prediction: str, confidence: float) -> str:
    db = get_db()
    doc_ref = db.collection("assessments").document()
    payload = {
        "uid": uid,
        "sleep_score": assessment_data.get("sleep_score"),
        "sleep_variance": assessment_data.get("sleep_variance"),
        "stress_score": assessment_data.get("stress_score"),
        "stress_variance": assessment_data.get("stress_variance"),
        "walking_pct": assessment_data.get("walking_pct"),
        "running_pct": assessment_data.get("running_pct"),
        "stationary_pct": assessment_data.get("stationary_pct"),
        "activity_level": assessment_data.get("activity_level"),
        "prediction": prediction,
        "confidence": confidence,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    doc_ref.set(payload)
    return doc_ref.id


def get_assessment_history(uid: str, limit: int = 50):
    db = get_db()
    query = (
        db.collection("assessments")
        .where("uid", "==", uid)
        .order_by("createdAt", direction=firestore.Query.DESCENDING)
        .limit(limit)
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in query.stream()]


def save_recommendations(uid: str, risk_level: str, recommendations: list):
    db = get_db()
    batch = db.batch()
    for text in recommendations:
        doc_ref = db.collection("recommendations").document()
        batch.set(
            doc_ref,
            {
                "uid": uid,
                "risk_level": risk_level,
                "recommendation_text": text,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            },
        )
    batch.commit()


def get_recommendations(uid: str, limit: int = 20):
    db = get_db()
    query = (
        db.collection("recommendations")
        .where("uid", "==", uid)
        .order_by("createdAt", direction=firestore.Query.DESCENDING)
        .limit(limit)
    )
    return [{"id": doc.id, **doc.to_dict()} for doc in query.stream()]


def get_all_users():
    return [{"id": doc.id, **doc.to_dict()} for doc in get_db().collection("users").stream()]


def get_all_assessments(limit: int = 500):
    db = get_db()
    query = db.collection("assessments").order_by("createdAt", direction=firestore.Query.DESCENDING).limit(limit)
    return [{"id": doc.id, **doc.to_dict()} for doc in query.stream()]


def delete_user(uid: str):
    get_db().collection("users").document(uid).delete()
    try:
        auth.delete_user(uid)
    except Exception:
        pass
