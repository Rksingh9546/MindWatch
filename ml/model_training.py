"""
Train Random Forest Classifier for depression risk prediction.
Generates synthetic behavioral data, trains model, saves rf_model.pkl.
Risk labels: 0=Low Risk, 1=Moderate Risk, 2=High Risk
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

FEATURE_COLUMNS = [
    "stationary_pct",
    "walking_pct",
    "running_pct",
    "avg_sleep_score",
    "sleep_variance",
    "sleep_responses",
    "avg_stress_score",
    "stress_variance",
    "stress_responses",
]

TARGET_COLUMN = "depression"
MODEL_PATH = os.path.join(os.path.dirname(__file__), "rf_model.pkl")


def generate_synthetic_data(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic mental health behavioral dataset."""
    rng = np.random.default_rng(random_state)

    stationary_pct = rng.uniform(20, 80, n_samples)
    walking_pct = rng.uniform(5, 50, n_samples)
    running_pct = rng.uniform(0, 30, n_samples)
    total = stationary_pct + walking_pct + running_pct
    stationary_pct = stationary_pct / total * 100
    walking_pct = walking_pct / total * 100
    running_pct = running_pct / total * 100

    avg_sleep_score = rng.uniform(3, 10, n_samples)
    sleep_variance = rng.uniform(0.5, 4, n_samples)
    sleep_responses = rng.integers(1, 10, n_samples)

    avg_stress_score = rng.uniform(1, 10, n_samples)
    stress_variance = rng.uniform(0.5, 4, n_samples)
    stress_responses = rng.integers(1, 10, n_samples)

    risk_score = (
        (10 - avg_sleep_score) * 0.25
        + avg_stress_score * 0.25
        + stationary_pct * 0.02
        - running_pct * 0.03
        - walking_pct * 0.01
        + sleep_variance * 0.15
        + stress_variance * 0.15
        + rng.normal(0, 0.5, n_samples)
    )

    depression = np.zeros(n_samples, dtype=int)
    depression[risk_score > 4.5] = 1
    depression[risk_score > 7.0] = 2

    return pd.DataFrame(
        {
            "stationary_pct": stationary_pct,
            "walking_pct": walking_pct,
            "running_pct": running_pct,
            "avg_sleep_score": avg_sleep_score,
            "sleep_variance": sleep_variance,
            "sleep_responses": sleep_responses,
            "avg_stress_score": avg_stress_score,
            "stress_variance": stress_variance,
            "stress_responses": stress_responses,
            "depression": depression,
        }
    )


def train_and_save():
    print("Generating synthetic training data...")
    df = generate_synthetic_data()
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(classification_report(y_test, y_pred, labels=[0, 1, 2], target_names=["Low", "Moderate", "High"], zero_division=0))

    joblib.dump({"model": model, "features": FEATURE_COLUMNS}, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return model


if __name__ == "__main__":
    train_and_save()
