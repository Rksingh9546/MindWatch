"""
AI-Based Mental Health Monitoring System – Flask REST API
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from routes.admin_routes import admin_bp
from routes.assessment_routes import assessment_bp
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.features_routes import features_bp
from services.data_service import init_data_layer

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    app.config["ML_MODEL_PATH"] = os.getenv(
        "ML_MODEL_PATH", str(ROOT_DIR / "ml" / "rf_model.pkl")
    )
    cred_path = os.getenv(
        "FIREBASE_CREDENTIALS_PATH",
        str(ROOT_DIR / "firebase" / "serviceAccountKey.json"),
    )
    app.config["ADMIN_EMAILS"] = os.getenv("ADMIN_EMAILS", "admin@mindwatch.ai").split(",")

    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    CORS(app, origins=[o.strip() for o in cors_origins.split(",")], supports_credentials=True)

    mode = init_data_layer(cred_path)
    app.config["DATA_MODE"] = mode
    app.logger.info(f"Data layer: {mode}")
    if mode == "local":
        try:
            from services import local_store
            import services.wellness_data as wd
            wd._load_all()
            if not any(u.get("email") == "admin@mindwatch.ai" for u in local_store._users.values()):
                local_store.create_local_user("admin@mindwatch.ai", "admin123", "Admin User")
        except Exception:
            pass

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(assessment_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(features_bp, url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health():
        model_exists = os.path.exists(app.config["ML_MODEL_PATH"])
        return jsonify(
            {
                "status": "ok",
                "service": "MindWatch AI Mental Health API",
                "model_loaded": model_exists,
            }
        )

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "1") == "1")
