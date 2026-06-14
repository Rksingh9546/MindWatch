from flask import Blueprint, current_app, jsonify, request

from models.predictor import predict_risk
from services.auth_middleware import require_auth
from services.data_service import use_local

if use_local():
    from services.local_store import (
        get_assessment_history,
        get_recommendations,
        save_assessment,
        save_recommendations,
    )
else:
    from services.firebase_service import (
        get_assessment_history,
        get_recommendations,
        save_assessment,
        save_recommendations,
    )
from services.recommendation_service import get_recommendations_for_risk

assessment_bp = Blueprint("assessment", __name__)

REQUIRED_FIELDS = [
    "sleep_score",
    "sleep_variance",
    "stress_score",
    "stress_variance",
    "walking_pct",
    "running_pct",
    "stationary_pct",
    "activity_level",
]


def validate_assessment(data: dict):
    missing = [f for f in REQUIRED_FIELDS if f not in data or data[f] is None]
    if missing:
        return False, f"Missing fields: {', '.join(missing)}"
    total = float(data["walking_pct"]) + float(data["running_pct"]) + float(data["stationary_pct"])
    if abs(total - 100) > 2:
        return False, "Activity percentages must sum to approximately 100"
    return True, None


@assessment_bp.route("/predict", methods=["POST"])
@require_auth
def predict():
    data = request.get_json() or {}
    valid, err = validate_assessment(data)
    if not valid:
        return jsonify({"error": err}), 400

    ml_data = {
        **data,
        "avg_sleep_score": data["sleep_score"],
        "avg_stress_score": data["stress_score"],
    }
    try:
        result = predict_risk(ml_data, current_app.config["ML_MODEL_PATH"])
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(result), 200


@assessment_bp.route("/assessment", methods=["POST"])
@require_auth
def submit_assessment():
    data = request.get_json() or {}
    valid, err = validate_assessment(data)
    if not valid:
        return jsonify({"error": err}), 400

    ml_data = {**data, "avg_sleep_score": data["sleep_score"], "avg_stress_score": data["stress_score"]}
    try:
        result = predict_risk(ml_data, current_app.config["ML_MODEL_PATH"])
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500

    uid = request.user["uid"]
    assessment_id = save_assessment(
        uid, data, result["prediction"], result["confidence"]
    )

    rec = get_recommendations_for_risk(result["prediction"])
    save_recommendations(uid, result["prediction"], rec["flat_texts"])

    try:
        from services.wellness_data import _check_achievements, _add_notification
        _check_achievements(uid)
        _add_notification(uid, "Assessment complete", f"Your risk level: {result['prediction']} ({result['confidence']}% confidence)")
    except Exception:
        pass

    return jsonify(
        {
            "assessmentId": assessment_id,
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "probabilities": result.get("probabilities"),
            "recommendations": rec,
        }
    ), 201


@assessment_bp.route("/history", methods=["GET"])
@require_auth
def history():
    uid = request.user["uid"]
    limit = request.args.get("limit", 50, type=int)
    records = get_assessment_history(uid, limit=limit)
    return jsonify({"history": records, "count": len(records)}), 200


@assessment_bp.route("/recommendations", methods=["GET"])
@require_auth
def recommendations():
    uid = request.user["uid"]
    risk = request.args.get("risk_level")
    if risk:
        rec = get_recommendations_for_risk(risk)
        return jsonify(rec), 200
    stored = get_recommendations(uid)
    return jsonify({"recommendations": stored}), 200
