import csv
import io
from collections import Counter

from flask import Blueprint, jsonify, request

from services.auth_middleware import require_admin
from services.data_service import use_local

if use_local():
    from services.local_store import delete_user, get_all_assessments, get_all_users
else:
    from services.firebase_service import delete_user, get_all_assessments, get_all_users

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
@require_admin
def admin_stats():
    users = get_all_users()
    assessments = get_all_assessments()
    predictions = [a.get("prediction") for a in assessments if a.get("prediction")]
    distribution = dict(Counter(predictions))
    confidences = [float(a.get("confidence", 0)) for a in assessments if a.get("confidence") is not None]
    avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0

    return jsonify(
        {
            "totalUsers": len(users),
            "totalAssessments": len(assessments),
            "riskDistribution": distribution,
            "averageConfidence": avg_confidence,
            "recentAssessments": assessments[:10],
        }
    ), 200


@admin_bp.route("/users", methods=["GET"])
@require_admin
def list_users():
    return jsonify({"users": get_all_users()}), 200


@admin_bp.route("/users/<uid>", methods=["DELETE"])
@require_admin
def remove_user(uid):
    delete_user(uid)
    return jsonify({"message": "User deleted"}), 200


@admin_bp.route("/assessments", methods=["GET"])
@require_admin
def list_assessments():
    limit = request.args.get("limit", 500, type=int)
    return jsonify({"assessments": get_all_assessments(limit=limit)}), 200


@admin_bp.route("/export/csv", methods=["GET"])
@require_admin
def export_csv():
    assessments = get_all_assessments()
    output = io.StringIO()
    if not assessments:
        return jsonify({"error": "No data to export"}), 404

    fieldnames = list(assessments[0].keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for row in assessments:
        writer.writerow(row)

    return (
        output.getvalue(),
        200,
        {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=assessments_export.csv",
        },
    )
