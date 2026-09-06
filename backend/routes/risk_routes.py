from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from database import get_db
from services.risk_engine import evaluate_risk

risk_bp = Blueprint("risk", __name__, url_prefix="/api/risk")

@risk_bp.route("/predict", methods=["POST"])
def predict_risk():
    data = request.get_json() or {}
    
    # Calculate risk using modular mathematical engine
    eval_result = evaluate_risk(data)

    # Persist prediction
    db = get_db()
    vehicle_id = data.get("vehicle_id") or data.get("vehicleId") or f"V-{uuid.uuid4().hex[:4].upper()}"
    camera_id = data.get("camera_id") or data.get("cameraId") or "CAM-01"

    prediction_record = {
        "predictionId": str(uuid.uuid4())[:8],
        "vehicleId": vehicle_id,
        "cameraId": camera_id,
        "speed": data.get("speed", 45),
        "distance": data.get("distance", 15),
        "direction": data.get("direction", "normal"),
        "density": data.get("density", 50),
        "suddenStop": bool(data.get("sudden_stop", False) or data.get("suddenStop", False)),
        "erraticBehaviour": bool(data.get("erratic_behavior", False) or data.get("erraticBehaviour", False)),
        "riskScore": eval_result["risk_score"],
        "riskLevel": eval_result["risk_level"],
        "riskType": eval_result["risk_type"],
        "explanation": eval_result["explanation"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    db.risk_predictions.insert_one(prediction_record)

    return jsonify({
        "success": True,
        **eval_result,
        "predictionId": prediction_record["predictionId"],
        "vehicleId": vehicle_id
    })

@risk_bp.route("/recent", methods=["GET"])
def get_recent_predictions():
    db = get_db()
    limit = int(request.args.get("limit", 20))
    predictions = db.risk_predictions.find(sort=[("timestamp", -1)], limit=limit)
    return jsonify({
        "success": True,
        "count": len(predictions),
        "predictions": predictions
    })

@risk_bp.route("/hotspots", methods=["GET"])
def get_risk_hotspots():
    db = get_db()
    risk_filter = request.args.get("filter", "ALL").upper()
    
    cameras = db.cameras.find()
    alerts = db.alerts.find()
    
    hotspots = []
    for c in cameras:
        cam_alerts = [a for a in alerts if a.get("cameraId") == c.get("cameraId")]
        incident_count = len(cam_alerts)
        
        # Calculate average risk score
        scores = [a.get("riskScore", 50) for a in cam_alerts]
        avg_score = int(sum(scores) / len(scores)) if scores else (75 if c.get("riskLevel") == "HIGH" else 35)
        
        # Dominant risk type
        risk_types = [a.get("riskType") for a in cam_alerts if a.get("riskType")]
        dominant_type = max(set(risk_types), key=risk_types.count) if risk_types else "NORMAL"
        
        # Overall risk level
        level = "HIGH" if avg_score > 60 else ("MEDIUM" if avg_score > 30 else "LOW")
        latest_alert = cam_alerts[0] if cam_alerts else None

        # Filter check
        if risk_filter != "ALL":
            if risk_filter in ["HIGH", "MEDIUM", "LOW"] and level != risk_filter:
                continue
            if risk_filter in ["WRONG_WAY", "WRONG_WAY_DRIVING"] and "WRONG" not in dominant_type:
                continue
            if risk_filter == "OVERSPEEDING" and dominant_type != "OVERSPEEDING":
                continue
            if risk_filter in ["PROXIMITY", "CLOSE_PROXIMITY"] and "PROXIMITY" not in dominant_type:
                continue

        hotspots.append({
            "id": c.get("cameraId"),
            "cameraName": c.get("name"),
            "location": c.get("location"),
            "lat": c.get("lat", 28.6139),
            "lng": c.get("lng", 77.2090),
            "incidentCount": incident_count,
            "averageRiskScore": avg_score,
            "riskLevel": level,
            "dominantRiskType": dominant_type,
            "trafficDensity": random_density_for_cam(avg_score),
            "speedLimit": c.get("speedLimit", 60),
            "latestAlert": latest_alert.get("alertId") if latest_alert else "None",
            "latestAlertTime": latest_alert.get("timestamp") if latest_alert else "N/A"
        })

    return jsonify({"success": True, "hotspots": hotspots})

def random_density_for_cam(score):
    if score > 60: return 84
    if score > 30: return 62
    return 41
