"""In-memory + JSON file store for local development without Firebase."""

import json
import os
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "local_db.json"

_users = {}
_assessments = []
_recommendations = []
_moods = []
_goals = []
_notifications = []
_settings = {}
_achievements = {}
_journals = []
_sleep_logs = []


def _load():
    global _users, _assessments, _recommendations, _moods, _goals, _notifications, _settings, _achievements, _journals, _sleep_logs
    if DATA_FILE.exists():
        with open(DATA_FILE) as f:
            data = json.load(f)
        _users = data.get("users", {})
        _assessments = data.get("assessments", [])
        _recommendations = data.get("recommendations", [])
        _moods = data.get("moods", [])
        _goals = data.get("goals", [])
        _notifications = data.get("notifications", [])
        _settings = data.get("settings", {})
        _achievements = data.get("achievements", {})
        _journals = data.get("journals", [])
        _sleep_logs = data.get("sleep_logs", [])


def _save():
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(
            {
                "users": _users,
                "assessments": _assessments,
                "recommendations": _recommendations,
                "moods": _moods,
                "goals": _goals,
                "notifications": _notifications,
                "settings": _settings,
                "achievements": _achievements,
                "journals": _journals,
                "sleep_logs": _sleep_logs,
            },
            f,
            indent=2,
        )


def _sync_wellness_module():
    """Keep wellness_data module in sync with local_store."""
    try:
        import services.wellness_data as wd
        wd._moods = _moods
        wd._goals = _goals
        wd._notifications = _notifications
        wd._settings = _settings
        wd._achievements_unlocked = _achievements
        wd._journals = _journals
        wd._sleep_logs = _sleep_logs
    except Exception:
        pass


_load()


def create_local_user(email: str, password: str, name: str) -> dict:
    uid = str(uuid.uuid4())
    if any(u.get("email") == email for u in _users.values()):
        raise ValueError("Email already registered")
    _users[uid] = {
        "uid": uid,
        "name": name,
        "email": email,
        "password": password,
        "isAdmin": email == "admin@mindwatch.ai",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    _save()
    return {"uid": uid, "email": email, "name": name}


def verify_local_login(email: str, password: str) -> dict:
    for uid, u in _users.items():
        if u["email"] == email and u["password"] == password:
            return {"uid": uid, "email": email, "name": u["name"], "isAdmin": u.get("isAdmin", False)}
    raise ValueError("Invalid email or password")


def save_user_profile(uid: str, name: str, email: str, is_admin: bool = False):
    _users[uid] = {
        "uid": uid,
        "name": name,
        "email": email,
        "isAdmin": is_admin,
        "createdAt": _users.get(uid, {}).get("createdAt", datetime.now(timezone.utc).isoformat()),
    }
    _save()


def get_user_profile(uid: str):
    return _users.get(uid)


def save_assessment(uid, assessment_data, prediction, confidence):
    doc_id = str(uuid.uuid4())
    _assessments.append(
        {
            "id": doc_id,
            "uid": uid,
            **{k: assessment_data.get(k) for k in assessment_data},
            "prediction": prediction,
            "confidence": confidence,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    )
    _save()
    _sync_wellness_module()
    return doc_id


def get_assessment_history(uid, limit=50):
    items = [a for a in _assessments if a["uid"] == uid]
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items[:limit]


def save_recommendations(uid, risk_level, texts):
    for text in texts:
        _recommendations.append(
            {
                "id": str(uuid.uuid4()),
                "uid": uid,
                "risk_level": risk_level,
                "recommendation_text": text,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            }
        )
    _save()


def get_recommendations(uid, limit=20):
    items = [r for r in _recommendations if r["uid"] == uid]
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items[:limit]


def get_all_users():
    return list(_users.values())


def get_all_assessments(limit=500):
    items = sorted(_assessments, key=lambda x: x.get("createdAt", ""), reverse=True)
    return items[:limit]


def delete_user(uid):
    _users.pop(uid, None)
    global _assessments, _recommendations
    _assessments = [a for a in _assessments if a["uid"] != uid]
    _recommendations = [r for r in _recommendations if r["uid"] != uid]
    _save()
