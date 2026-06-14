from flask import Blueprint, jsonify, request

from services.auth_middleware import require_auth
from services.data_service import use_local

features_bp = Blueprint("features", __name__)


def _store():
    if use_local():
        from services import wellness_data as store
    else:
        from services import wellness_data as store
    return store


@features_bp.route("/mood", methods=["GET"])
@require_auth
def list_moods():
    uid = request.user["uid"]
    return jsonify({"moods": _store().get_moods(uid)}), 200


@features_bp.route("/mood", methods=["POST"])
@require_auth
def add_mood():
    data = request.get_json() or {}
    if "mood_score" not in data:
        return jsonify({"error": "mood_score is required (1-10)"}), 400
    entry = _store().add_mood(
        request.user["uid"],
        data["mood_score"],
        data.get("energy", 5),
        data.get("note", ""),
    )
    return jsonify(entry), 201


@features_bp.route("/goals", methods=["GET"])
@require_auth
def list_goals():
    return jsonify({"goals": _store().get_goals(request.user["uid"])}), 200


@features_bp.route("/goals", methods=["POST"])
@require_auth
def create_goal():
    data = request.get_json() or {}
    if not data.get("title"):
        return jsonify({"error": "title is required"}), 400
    goal = _store().create_goal(request.user["uid"], data)
    return jsonify(goal), 201


@features_bp.route("/goals/<goal_id>", methods=["PUT"])
@require_auth
def update_goal(goal_id):
    goal = _store().update_goal(request.user["uid"], goal_id, request.get_json() or {})
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    return jsonify(goal), 200


@features_bp.route("/goals/<goal_id>", methods=["DELETE"])
@require_auth
def delete_goal(goal_id):
    _store().delete_goal(request.user["uid"], goal_id)
    return jsonify({"message": "Deleted"}), 200


@features_bp.route("/notifications", methods=["GET"])
@require_auth
def notifications():
    items = _store().get_notifications(request.user["uid"])
    unread = sum(1 for n in items if not n.get("read"))
    return jsonify({"notifications": items, "unreadCount": unread}), 200


@features_bp.route("/notifications/read", methods=["POST"])
@require_auth
def mark_read():
    data = request.get_json() or {}
    _store().mark_notification_read(request.user["uid"], data.get("id"))
    return jsonify({"message": "Marked as read"}), 200


@features_bp.route("/settings", methods=["GET", "PUT"])
@require_auth
def settings():
    uid = request.user["uid"]
    if request.method == "GET":
        return jsonify(_store().get_settings(uid)), 200
    return jsonify(_store().save_settings(uid, request.get_json() or {})), 200


@features_bp.route("/weekly-report", methods=["GET"])
@require_auth
def weekly_report():
    return jsonify(_store().generate_weekly_report(request.user["uid"])), 200


@features_bp.route("/achievements", methods=["GET"])
@require_auth
def achievements():
    return jsonify({"achievements": _store().get_achievements(request.user["uid"])}), 200


@features_bp.route("/insights", methods=["GET"])
@require_auth
def insights():
    return jsonify(_store().get_assessment_insights(request.user["uid"])), 200


@features_bp.route("/export/my-data", methods=["GET"])
@require_auth
def export_data():
    return jsonify(_store().export_user_data(request.user["uid"])), 200


@features_bp.route("/achievements/unlock", methods=["POST"])
@require_auth
def unlock():
    data = request.get_json() or {}
    aid = data.get("achievementId")
    if aid:
        _store().unlock_achievement(request.user["uid"], aid)
    return jsonify({"message": "ok"}), 200


@features_bp.route("/wellness-score", methods=["GET"])
@require_auth
def wellness_score():
    return jsonify(_store().calculate_wellness_score(request.user["uid"])), 200


@features_bp.route("/streaks", methods=["GET"])
@require_auth
def streaks():
    return jsonify(_store().get_streaks(request.user["uid"])), 200


@features_bp.route("/calendar", methods=["GET"])
@require_auth
def calendar():
    days = request.args.get("days", 90, type=int)
    return jsonify({"calendar": _store().get_mood_calendar(request.user["uid"], days)}), 200


@features_bp.route("/journal", methods=["GET"])
@require_auth
def list_journal():
    return jsonify({"journals": _store().get_journals(request.user["uid"])}), 200


@features_bp.route("/journal", methods=["POST"])
@require_auth
def add_journal():
    data = request.get_json() or {}
    if not data.get("content"):
        return jsonify({"error": "content is required"}), 400
    entry = _store().add_journal(
        request.user["uid"],
        data.get("title", ""),
        data["content"],
        data.get("moodTag", ""),
    )
    return jsonify(entry), 201


@features_bp.route("/journal/<journal_id>", methods=["DELETE"])
@require_auth
def remove_journal(journal_id):
    _store().delete_journal(request.user["uid"], journal_id)
    return jsonify({"message": "Deleted"}), 200


@features_bp.route("/sleep", methods=["GET"])
@require_auth
def list_sleep():
    return jsonify({"sleepLogs": _store().get_sleep_logs(request.user["uid"])}), 200


@features_bp.route("/sleep", methods=["POST"])
@require_auth
def add_sleep():
    data = request.get_json() or {}
    if "hours" not in data:
        return jsonify({"error": "hours is required"}), 400
    entry = _store().add_sleep_log(
        request.user["uid"],
        data["hours"],
        data.get("quality", 5),
        data.get("note", ""),
    )
    return jsonify(entry), 201


@features_bp.route("/resources", methods=["GET"])
def resources():
    return jsonify({
        "articles": [
            {"id": 1, "title": "Understanding Depression Early Signs", "category": "Education", "readTime": "5 min", "icon": "bi-book"},
            {"id": 2, "title": "Sleep Hygiene for Mental Health", "category": "Sleep", "readTime": "4 min", "icon": "bi-moon"},
            {"id": 3, "title": "Managing Academic Stress", "category": "Stress", "readTime": "6 min", "icon": "bi-mortarboard"},
            {"id": 4, "title": "Benefits of Daily Walking", "category": "Activity", "readTime": "3 min", "icon": "bi-person-walking"},
        ],
        "videos": [
            {"id": 1, "title": "5-Minute Mindfulness Meditation", "duration": "5:00", "icon": "bi-play-circle"},
            {"id": 2, "title": "Progressive Muscle Relaxation", "duration": "12:00", "icon": "bi-play-circle"},
        ],
        "tools": [
            {"id": "breathing", "title": "Breathing Exercise", "path": "/breathing", "icon": "bi-wind"},
            {"id": "mood", "title": "Mood Journal", "path": "/mood", "icon": "bi-emoji-smile"},
            {"id": "chat", "title": "AI Assistant", "path": "/chat", "icon": "bi-robot"},
        ],
    }), 200
