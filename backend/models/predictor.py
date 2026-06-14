"""ML prediction service using trained Random Forest model."""

import os
import joblib
import numpy as np

RISK_LABELS = {
    0: "Low Risk",
    1: "Moderate Risk",
    2: "High Risk",
}

_model_bundle = None


def load_model(model_path: str):
    global _model_bundle
    if _model_bundle is None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}. Run ml/model_training.py first.")
        _model_bundle = joblib.load(model_path)
    return _model_bundle


def map_assessment_to_features(data: dict) -> np.ndarray:
    """Map API/frontend assessment fields to ML feature vector."""
    activity_level = float(data.get("activity_level", 5))
    sleep_responses = max(1, min(10, int(round(activity_level))))
    stress_responses = max(1, min(10, int(round(float(data.get("stress_score", 5))))))

    features = [
        float(data["stationary_pct"]),
        float(data["walking_pct"]),
        float(data["running_pct"]),
        float(data.get("avg_sleep_score", data.get("sleep_score", 5))),
        float(data.get("sleep_variance", 1)),
        float(data.get("sleep_responses", sleep_responses)),
        float(data.get("avg_stress_score", data.get("stress_score", 5))),
        float(data.get("stress_variance", 1)),
        float(data.get("stress_responses", stress_responses)),
    ]
    return np.array([features])


def predict_risk(data: dict, model_path: str) -> dict:
    bundle = load_model(model_path)
    model = bundle["model"]
    feature_cols = bundle["features"]

    X = map_assessment_to_features(data)
    prediction = int(model.predict(X)[0])
    probabilities = model.predict_proba(X)[0]
    confidence = float(round(max(probabilities) * 100, 2))

    return {
        "prediction": RISK_LABELS.get(prediction, "Unknown"),
        "prediction_code": prediction,
        "confidence": confidence,
        "probabilities": {
            RISK_LABELS[i]: round(float(probabilities[i]) * 100, 2)
            for i in range(len(probabilities))
        },
        "features_used": dict(zip(feature_cols, X[0].tolist())),
    }
