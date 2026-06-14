from flask import Blueprint, current_app, jsonify, request

from services.auth_middleware import require_auth
from services.data_service import use_local
from services import firebase_service

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    try:
        if use_local():
            from services import local_store

            user = local_store.create_local_user(email, password, name)
            token = f"local:{user['uid']}"
            return jsonify(
                {
                    "message": "Registration successful",
                    "uid": user["uid"],
                    "email": email,
                    "name": name,
                    "token": token,
                    "isAdmin": user.get("isAdmin", False),
                }
            ), 201

        if firebase_service.get_user_by_email(email):
            return jsonify({"error": "Email already registered"}), 409
        user = firebase_service.create_user(email=email, password=password, display_name=name)
        admin_emails = [e.strip().lower() for e in current_app.config.get("ADMIN_EMAILS", [])]
        is_admin = email in admin_emails
        firebase_service.save_user_profile(user["uid"], name, email, is_admin=is_admin)
        return jsonify(
            {"message": "Registration successful", "uid": user["uid"], "email": email, "name": name}
        ), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    if use_local():
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        try:
            from services import local_store

            user = local_store.verify_local_login(email, password)
            token = f"local:{user['uid']}"
            return jsonify(
                {
                    "message": "Login successful",
                    "uid": user["uid"],
                    "email": user["email"],
                    "name": user["name"],
                    "token": token,
                    "isAdmin": user.get("isAdmin", False),
                }
            ), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 401

    id_token = data.get("idToken") or data.get("id_token")
    if not id_token:
        return jsonify({"error": "idToken is required (sign in via Firebase client first)"}), 400

    try:
        decoded = firebase_service.verify_id_token(id_token)
        profile = firebase_service.get_user_profile(decoded["uid"])
        if not profile:
            firebase_service.save_user_profile(
                decoded["uid"],
                decoded.get("name") or decoded.get("email", "").split("@")[0],
                decoded.get("email", ""),
            )
            profile = firebase_service.get_user_profile(decoded["uid"])

        return jsonify(
            {
                "message": "Login successful",
                "uid": decoded["uid"],
                "email": decoded.get("email"),
                "name": profile.get("name") if profile else decoded.get("name"),
                "isAdmin": profile.get("isAdmin", False) if profile else False,
            }
        ), 200
    except Exception as e:
        return jsonify({"error": "Invalid credentials", "detail": str(e)}), 401


@auth_bp.route("/profile", methods=["GET"])
@require_auth
def get_profile():
    uid = request.user["uid"]
    if use_local():
        from services.local_store import get_user_profile as gp
    else:
        from services.firebase_service import get_user_profile as gp

    prof = gp(uid)
    if not prof:
        return jsonify({"error": "Profile not found"}), 404
    prof = {k: v for k, v in prof.items() if k != "password"}
    return jsonify(prof), 200


@auth_bp.route("/profile", methods=["PUT"])
@require_auth
def update_profile():
    uid = request.user["uid"]
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Name is required"}), 400

    if use_local():
        from services.local_store import get_user_profile, save_user_profile
    else:
        from services.firebase_service import get_user_profile, save_user_profile

    prof = get_user_profile(uid) or {}
    email = prof.get("email") or request.user.get("email", "")
    save_user_profile(uid, name, email, is_admin=prof.get("isAdmin", False))
    return jsonify({"message": "Profile updated", "name": name}), 200
