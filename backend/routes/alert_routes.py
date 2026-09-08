from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from database import get_db
from middleware.auth import token_required
from bson import ObjectId

alert_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")


def serialize_mongo(obj):
    """Convert MongoDB ObjectId values into JSON-serializable strings."""
    if isinstance(obj, ObjectId):
        return str(obj)

    if isinstance(obj, dict):
        return {
            key: serialize_mongo(value)
            for key, value in obj.items()
        }

    if isinstance(obj, list):
        return [serialize_mongo(item) for item in obj]

    return obj


@alert_bp.route("", methods=["GET"])
def get_alerts():
    db = get_db()
    severity = request.args.get("severity")
    status = request.args.get("status")
    risk_type = request.args.get("riskType")
    camera_id = request.args.get("cameraId")
    limit = int(request.args.get("limit", 50))

    query = {}

    if severity and severity.upper() != "ALL":
        query["severity"] = severity.upper()

    if status and status.upper() != "ALL":
        query["status"] = status.upper()

    if risk_type and risk_type.upper() != "ALL":
        query["riskType"] = risk_type.upper()

    if camera_id and camera_id.upper() != "ALL":
        query["cameraId"] = camera_id

    alerts = list(
        db.alerts.find(
            query,
            sort=[("timestamp", -1)],
            limit=limit
        )
    )

    alerts = serialize_mongo(alerts)

    return jsonify({
        "success": True,
        "count": len(alerts),
        "alerts": alerts
    })


@alert_bp.route("/active", methods=["GET"])
def get_active_alerts():
    db = get_db()

    alerts = list(
        db.alerts.find(
            {"status": "ACTIVE"},
            sort=[("timestamp", -1)],
            limit=10
        )
    )

    alerts = serialize_mongo(alerts)

    return jsonify({
        "success": True,
        "activeCount": len(alerts),
        "alerts": alerts
    })


@alert_bp.route("/<alert_id>/acknowledge", methods=["PUT"])
@token_required
def acknowledge_alert(alert_id):
    db = get_db()

    target = db.alerts.find_one({
        "$or": [
            {"alertId": alert_id},
            {"_id": alert_id}
        ]
    })

    if not target:
        return jsonify({
            "error": "Alert not found",
            "success": False
        }), 404

    now_iso = datetime.now(timezone.utc).isoformat()

    db.alerts.update_one(
        {"_id": target["_id"]},
        {
            "$set": {
                "status": "ACKNOWLEDGED",
                "acknowledgedBy": request.current_user.get(
                    "name",
                    "Authority"
                ),
                "acknowledgedAt": now_iso
            }
        }
    )

    updated = db.alerts.find_one({
        "_id": target["_id"]
    })

    updated = serialize_mongo(updated)

    return jsonify({
        "success": True,
        "message": f"Alert {alert_id} acknowledged",
        "alert": updated
    })


@alert_bp.route("/<alert_id>/resolve", methods=["PUT"])
@token_required
def resolve_alert(alert_id):
    db = get_db()

    target = db.alerts.find_one({
        "$or": [
            {"alertId": alert_id},
            {"_id": alert_id}
        ]
    })

    if not target:
        return jsonify({
            "error": "Alert not found",
            "success": False
        }), 404

    now_iso = datetime.now(timezone.utc).isoformat()

    db.alerts.update_one(
        {"_id": target["_id"]},
        {
            "$set": {
                "status": "RESOLVED",
                "resolvedBy": request.current_user.get(
                    "name",
                    "Authority"
                ),
                "resolvedAt": now_iso
            }
        }
    )

    updated = db.alerts.find_one({
        "_id": target["_id"]
    })

    updated = serialize_mongo(updated)

    return jsonify({
        "success": True,
        "message": f"Alert {alert_id} resolved",
        "alert": updated
    })


@alert_bp.route("", methods=["POST"])
@token_required
def create_alert():
    data = request.get_json() or {}
    db = get_db()

    count = db.alerts.count_documents({})
    alert_id = f"ALERT #A{1000 + count + 1}"
    now_iso = datetime.now(timezone.utc).isoformat()

    new_alert = {
        "_id": str(uuid.uuid4()),
        "alertId": alert_id,
        "vehicleId": data.get("vehicleId", "V-199"),
        "cameraId": data.get("cameraId", "CAM-01"),
        "location": data.get("location", "Main Junction"),
        "riskType": data.get("riskType", "OVERSPEEDING"),
        "severity": data.get("severity", "HIGH"),
        "riskScore": int(data.get("riskScore", 85)),
        "explanation": data.get(
            "explanation",
            "Manual incident logged by authority"
        ),
        "status": "ACTIVE",
        "timestamp": now_iso
    }

    db.alerts.insert_one(new_alert)

    return jsonify({
        "success": True,
        "alert": new_alert
    }), 201
