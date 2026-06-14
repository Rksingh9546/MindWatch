from flask import Blueprint, jsonify, request

from services.auth_middleware import require_auth
from services.chat_service import generate_chat_response
from services.data_service import use_local

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
@require_auth
def chat():
    data = request.get_json() or {}
    message = data.get("message", "")
    result = generate_chat_response(
        request.user["uid"],
        message,
        use_local=use_local(),
    )
    if use_local():
        try:
            from services.wellness_data import unlock_achievement
            unlock_achievement(request.user["uid"], "chat_buddy")
        except Exception:
            pass
    return jsonify(result), 200


@chat_bp.route("/chat/suggestions", methods=["GET"])
@require_auth
def chat_suggestions():
    return jsonify({
        "suggestions": [
            "How can I improve my sleep?",
            "I'm feeling stressed lately",
            "Explain my latest assessment",
            "Tips for staying active",
            "What does moderate risk mean?",
        ]
    }), 200
