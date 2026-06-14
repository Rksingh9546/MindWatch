"""Mood journal, goals, notifications, settings, achievements – local store."""

import json
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "local_db.json"

_moods = []
_goals = []
_notifications = []
_settings = {}
_achievements_unlocked = {}
_journals = []
_sleep_logs = []


def _save_all():
    from services import local_store

    local_store._moods = _moods
    local_store._goals = _goals
    local_store._notifications = _notifications
    local_store._settings = _settings
    local_store._achievements = _achievements_unlocked
    local_store._journals = _journals
    local_store._sleep_logs = _sleep_logs
    local_store._save()


def _load_all():
    from services import local_store

    local_store._load()
    global _moods, _goals, _notifications, _settings, _achievements_unlocked, _journals, _sleep_logs
    _moods = local_store._moods
    _goals = local_store._goals
    _notifications = local_store._notifications
    _settings = local_store._settings
    _achievements_unlocked = local_store._achievements
    _journals = getattr(local_store, "_journals", [])
    _sleep_logs = getattr(local_store, "_sleep_logs", [])


_load_all()


def _now():
    return datetime.now(timezone.utc).isoformat()


# --- Mood Journal ---
def add_mood(uid: str, mood_score: int, energy: int, note: str = "") -> dict:
    entry = {
        "id": str(uuid.uuid4()),
        "uid": uid,
        "mood_score": max(1, min(10, int(mood_score))),
        "energy": max(1, min(10, int(energy))),
        "note": (note or "")[:500],
        "createdAt": _now(),
    }
    _moods.append(entry)
    _save_all()
    _check_achievements(uid)
    _add_notification(uid, "Mood logged", f"You logged mood {entry['mood_score']}/10. Keep tracking daily!")
    return entry


def get_moods(uid: str, limit: int = 60):
    items = [m for m in _moods if m["uid"] == uid]
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items[:limit]


# --- Goals ---
def create_goal(uid: str, data: dict) -> dict:
    goal = {
        "id": str(uuid.uuid4()),
        "uid": uid,
        "title": data.get("title", "Wellness Goal"),
        "category": data.get("category", "general"),
        "target": int(data.get("target", 7)),
        "progress": int(data.get("progress", 0)),
        "unit": data.get("unit", "days"),
        "createdAt": _now(),
    }
    _goals.append(goal)
    _save_all()
    return goal


def get_goals(uid: str):
    return [g for g in _goals if g["uid"] == uid]


def update_goal(uid: str, goal_id: str, data: dict):
    for g in _goals:
        if g["id"] == goal_id and g["uid"] == uid:
            if "progress" in data:
                g["progress"] = min(int(data["progress"]), g["target"])
            if "title" in data:
                g["title"] = data["title"]
            if g["progress"] >= g["target"]:
                _add_notification(uid, "Goal completed!", f"You completed: {g['title']}")
                _unlock_achievement(uid, "goal_master")
            _save_all()
            return g
    return None


def delete_goal(uid: str, goal_id: str):
    global _goals
    _goals = [g for g in _goals if not (g["id"] == goal_id and g["uid"] == uid)]
    _save_all()


# --- Notifications ---
def _add_notification(uid: str, title: str, message: str):
    _notifications.insert(0, {
        "id": str(uuid.uuid4()),
        "uid": uid,
        "title": title,
        "message": message,
        "read": False,
        "createdAt": _now(),
    })
    _notifications[:] = _notifications[:100]


def get_notifications(uid: str, limit: int = 30):
    items = [n for n in _notifications if n["uid"] == uid]
    return items[:limit]


def mark_notification_read(uid: str, notif_id: str = None):
    for n in _notifications:
        if n["uid"] == uid and (notif_id is None or n["id"] == notif_id):
            n["read"] = True
    _save_all()


# --- Settings ---
DEFAULT_SETTINGS = {
    "dailyReminder": True,
    "reminderTime": "09:00",
    "emailAlerts": False,
    "shareAnalytics": False,
    "crisisQuickAccess": True,
}


def get_settings(uid: str) -> dict:
    return {**DEFAULT_SETTINGS, **_settings.get(uid, {})}


def save_settings(uid: str, data: dict) -> dict:
    current = get_settings(uid)
    current.update({k: v for k, v in data.items() if k in DEFAULT_SETTINGS})
    _settings[uid] = current
    _save_all()
    return current


# --- Achievements ---
ACHIEVEMENT_DEFS = [
    {"id": "first_assessment", "name": "First Step", "icon": "bi-clipboard-check", "desc": "Complete your first assessment"},
    {"id": "mood_week", "name": "Mood Tracker", "icon": "bi-emoji-smile", "desc": "Log mood 7 days in a row"},
    {"id": "goal_master", "name": "Goal Crusher", "icon": "bi-trophy", "desc": "Complete a wellness goal"},
    {"id": "chat_buddy", "name": "AI Companion", "icon": "bi-robot", "desc": "Chat with MindWatch AI"},
    {"id": "low_risk", "name": "Thriving", "icon": "bi-shield-check", "desc": "Achieve Low Risk status"},
]


def _unlock_achievement(uid: str, achievement_id: str):
    if uid not in _achievements_unlocked:
        _achievements_unlocked[uid] = []
    if achievement_id not in _achievements_unlocked[uid]:
        _achievements_unlocked[uid].append(achievement_id)
        name = next((a["name"] for a in ACHIEVEMENT_DEFS if a["id"] == achievement_id), achievement_id)
        _add_notification(uid, "Achievement Unlocked!", f"You earned: {name}")
        _save_all()


def unlock_achievement(uid: str, achievement_id: str):
    _unlock_achievement(uid, achievement_id)


def get_achievements(uid: str):
    unlocked = _achievements_unlocked.get(uid, [])
    return [
        {**a, "unlocked": a["id"] in unlocked, "unlockedAt": _now() if a["id"] in unlocked else None}
        for a in ACHIEVEMENT_DEFS
    ]


def _check_achievements(uid: str):
    from services.local_store import get_assessment_history

    moods = get_moods(uid, 30)
    if len(moods) >= 7:
        dates = {m["createdAt"][:10] for m in moods[:7]}
        if len(dates) >= 7:
            _unlock_achievement(uid, "mood_week")
    assessments = get_assessment_history(uid, 5)
    if assessments:
        _unlock_achievement(uid, "first_assessment")
        if assessments[0].get("prediction") == "Low Risk":
            _unlock_achievement(uid, "low_risk")


# --- Weekly Report ---
def generate_weekly_report(uid: str) -> dict:
    from services.local_store import get_assessment_history

    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    moods = [m for m in _moods if m["uid"] == uid and m["createdAt"] >= week_ago]
    assessments = [a for a in get_assessment_history(uid, 10) if a.get("createdAt", "") >= week_ago]
    goals = get_goals(uid)

    avg_mood = round(sum(m["mood_score"] for m in moods) / len(moods), 1) if moods else None
    avg_energy = round(sum(m["energy"] for m in moods) / len(moods), 1) if moods else None

    tips = []
    if avg_mood and avg_mood < 5:
        tips.append("Your average mood was below 5 — consider speaking with a counselor.")
    if not moods:
        tips.append("Start logging your mood daily for better insights.")
    if not assessments:
        tips.append("Complete a weekly assessment to track depression risk.")
    else:
        tips.append(f"Latest risk: {assessments[0].get('prediction')}.")
    if not tips:
        tips.append("Great week! Keep up your wellness routine.")

    return {
        "period": "Last 7 days",
        "moodEntries": len(moods),
        "avgMood": avg_mood,
        "avgEnergy": avg_energy,
        "assessments": len(assessments),
        "latestRisk": assessments[0].get("prediction") if assessments else None,
        "activeGoals": len([g for g in goals if g["progress"] < g["target"]]),
        "completedGoals": len([g for g in goals if g["progress"] >= g["target"]]),
        "tips": tips,
        "generatedAt": _now(),
    }


# --- Assessment Insights ---
def get_assessment_insights(uid: str) -> dict:
    from services.local_store import get_assessment_history

    history = get_assessment_history(uid, 2)
    if not history:
        return {"hasComparison": False, "message": "Complete at least one assessment for insights."}
    latest = history[0]
    if len(history) < 2:
        return {
            "hasComparison": False,
            "latest": latest,
            "message": "Complete another assessment to see trends.",
        }
    prev = history[1]
    deltas = {}
    for key in ["sleep_score", "stress_score", "walking_pct", "confidence"]:
        if latest.get(key) is not None and prev.get(key) is not None:
            deltas[key] = round(float(latest[key]) - float(prev[key]), 2)
    risk_changed = latest.get("prediction") != prev.get("prediction")
    return {
        "hasComparison": True,
        "latest": latest,
        "previous": prev,
        "deltas": deltas,
        "riskChanged": risk_changed,
        "improved": deltas.get("sleep_score", 0) > 0 and deltas.get("stress_score", 0) < 0,
    }


# --- Journal ---
def add_journal(uid: str, title: str, content: str, mood_tag: str = "") -> dict:
    entry = {
        "id": str(uuid.uuid4()),
        "uid": uid,
        "title": (title or "Journal Entry")[:120],
        "content": (content or "")[:3000],
        "moodTag": mood_tag,
        "createdAt": _now(),
    }
    _journals.append(entry)
    _save_all()
    _add_notification(uid, "Journal saved", "Your reflection has been recorded privately.")
    return entry


def get_journals(uid: str, limit: int = 50):
    items = [j for j in _journals if j["uid"] == uid]
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items[:limit]


def delete_journal(uid: str, journal_id: str):
    global _journals
    _journals = [j for j in _journals if not (j["id"] == journal_id and j["uid"] == uid)]
    _save_all()


# --- Sleep Tracker ---
def add_sleep_log(uid: str, hours: float, quality: int, note: str = "") -> dict:
    entry = {
        "id": str(uuid.uuid4()),
        "uid": uid,
        "hours": round(max(0, min(24, float(hours))), 1),
        "quality": max(1, min(10, int(quality))),
        "note": (note or "")[:300],
        "createdAt": _now(),
    }
    _sleep_logs.append(entry)
    _save_all()
    return entry


def get_sleep_logs(uid: str, limit: int = 30):
    items = [s for s in _sleep_logs if s["uid"] == uid]
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return items[:limit]


# --- Streaks ---
def get_streaks(uid: str) -> dict:
    mood_dates = sorted({m["createdAt"][:10] for m in _moods if m["uid"] == uid}, reverse=True)
    mood_streak = 0
    today = datetime.now(timezone.utc).date()
    for i, d in enumerate(mood_dates):
        expected = (today - timedelta(days=i)).isoformat()
        if d == expected:
            mood_streak += 1
        else:
            break
    return {
        "moodStreak": mood_streak,
        "totalMoodLogs": len([m for m in _moods if m["uid"] == uid]),
        "totalJournals": len([j for j in _journals if j["uid"] == uid]),
        "totalSleepLogs": len([s for s in _sleep_logs if s["uid"] == uid]),
    }


# --- Calendar heatmap ---
def get_mood_calendar(uid: str, days: int = 90) -> list:
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    by_date = {}
    for m in _moods:
        if m["uid"] == uid and m["createdAt"] >= cutoff:
            d = m["createdAt"][:10]
            by_date[d] = m["mood_score"]
    return [{"date": d, "mood": by_date[d]} for d in sorted(by_date.keys())]


# --- Wellness Score (0-100) ---
def calculate_wellness_score(uid: str) -> dict:
    from services.local_store import get_assessment_history

    score = 50
    factors = []

    moods = get_moods(uid, 14)
    if moods:
        avg = sum(m["mood_score"] for m in moods) / len(moods)
        mood_pts = int(avg * 4)
        score += mood_pts - 20
        factors.append({"label": "Mood (14d avg)", "value": f"{avg:.1f}/10", "impact": mood_pts - 20})

    assessments = get_assessment_history(uid, 1)
    if assessments:
        risk = assessments[0].get("prediction", "")
        risk_pts = {"Low Risk": 25, "Moderate Risk": 5, "High Risk": -20}.get(risk, 0)
        score += risk_pts
        factors.append({"label": "Depression risk", "value": risk, "impact": risk_pts})

    goals = get_goals(uid)
    if goals:
        completed = sum(1 for g in goals if g["progress"] >= g["target"])
        goal_pts = min(15, completed * 5)
        score += goal_pts
        factors.append({"label": "Goals completed", "value": str(completed), "impact": goal_pts})

    streak = get_streaks(uid)["moodStreak"]
    streak_pts = min(10, streak * 2)
    score += streak_pts
    if streak > 0:
        factors.append({"label": "Mood streak", "value": f"{streak} days", "impact": streak_pts})

    score = max(0, min(100, score))
    grade = "Excellent" if score >= 80 else "Good" if score >= 65 else "Fair" if score >= 45 else "Needs Attention"
    color = "#10b981" if score >= 80 else "#6366f1" if score >= 65 else "#f59e0b" if score >= 45 else "#ef4444"

    return {"score": score, "grade": grade, "color": color, "factors": factors}


# --- Export user data ---
def export_user_data(uid: str) -> dict:
    from services.local_store import get_assessment_history, get_user_profile, get_recommendations

    return {
        "profile": get_user_profile(uid),
        "assessments": get_assessment_history(uid, 100),
        "moods": get_moods(uid, 100),
        "goals": get_goals(uid),
        "recommendations": get_recommendations(uid, 50),
        "settings": get_settings(uid),
        "achievements": get_achievements(uid),
        "journals": get_journals(uid, 100),
        "sleepLogs": get_sleep_logs(uid, 100),
        "wellnessScore": calculate_wellness_score(uid),
        "exportedAt": _now(),
    }
