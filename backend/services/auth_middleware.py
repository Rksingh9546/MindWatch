"""JWT / Firebase token authentication decorator."""

from functools import wraps

from flask import jsonify, request

from services.data_service import use_local


def _decode_token(token: str) -> dict:
    if token.startswith("local:") and use_local():
        uid = token.split(":", 1)[1]
        from services.local_store import get_user_profile

        prof = get_user_profile(uid) or {}
        return {"uid": uid, "email": prof.get("email"), "name": prof.get("name")}
    from services.firebase_service import verify_id_token

    return verify_id_token(token)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split("Bearer ", 1)[1].strip()
        try:
            request.user = _decode_token(token)
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "detail": str(e)}), 401
        return f(*args, **kwargs)

    return decorated


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask import current_app

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        token = auth_header.split("Bearer ", 1)[1].strip()
        try:
            decoded = _decode_token(token)
            request.user = decoded
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        if use_local():
            from services.local_store import get_user_profile
        else:
            from services.firebase_service import get_user_profile

        admin_emails = [e.strip().lower() for e in current_app.config.get("ADMIN_EMAILS", [])]
        profile = get_user_profile(decoded["uid"]) or {}
        email = (decoded.get("email") or profile.get("email") or "").lower()
        if profile.get("isAdmin") or email in admin_emails:
            return f(*args, **kwargs)
        return jsonify({"error": "Admin access required"}), 403

    return decorated
