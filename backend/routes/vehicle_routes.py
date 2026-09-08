from flask import Blueprint, request, jsonify
import random
from database import get_db

vehicle_bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")

@vehicle_bp.route("", methods=["GET"])
def get_vehicles():
    db = get_db()
    risk_level = request.args.get("riskLevel")
    v_type = request.args.get("type")
    camera_id = request.args.get("cameraId")
    limit = int(request.args.get("limit", 50))

    query = {}
    if risk_level and risk_level.upper() != "ALL":
        query["riskLevel"] = risk_level.upper()
    if v_type and v_type.upper() != "ALL":
        query["type"] = v_type
    if camera_id and camera_id.upper() != "ALL":
        query["cameraId"] = camera_id

    vehicles = list(db.vehicles.find(query, sort=[("timestamp", -1)], limit=limit))
    return jsonify({
        "success": True,
        "count": len(vehicles),
        "vehicles": vehicles
    })

@vehicle_bp.route("/live", methods=["GET"])
def get_live_vehicles():
    db = get_db()
    camera_id = request.args.get("cameraId", "CAM-01")
    
    # Return 6-8 active tracked vehicles in lanes with positions, velocity vectors, and tracking IDs
    types = ["Car", "Bike", "Bus", "Truck", "Auto-rickshaw"]
    live_tracked = []
    
    # Fetch recent vehicles for this camera or generate dynamic active tracks
    recent = list(db.vehicles.find({"cameraId": camera_id}, limit=8))
    if not recent:
        recent = list(db.vehicles.find({}, limit=8))

    for i, v in enumerate(recent):
        lane = v.get("lane", (i % 3) + 1)
        speed = v.get("speed", 55.0)
        risk_score = v.get("riskScore", 20)
        direction = v.get("direction", "North")
        
        live_tracked.append({
            "vehicleId": v.get("vehicleId", f"V-{100 + i}"),
            "type": v.get("type", types[i % len(types)]),
            "speed": speed,
            "lane": lane,
            "direction": direction,
            "distance": v.get("distance", round(random.uniform(4.0, 20.0), 1)),
            "riskScore": risk_score,
            "riskLevel": v.get("riskLevel", "LOW"),
            "trackingStatus": "HAZARD" if risk_score > 60 else "TRACKING",
            "entryTime": v.get("timestamp", "Just now"),
            "currentPosition": {
                "lane": lane,
                "progressPct": (i * 20 + random.randint(5, 15)) % 100,
                "xOffset": (lane - 1) * 33 + 16
            }
        })

    return jsonify({
        "success": True,
        "cameraId": camera_id,
        "activeCount": len(live_tracked),
        "vehicles": live_tracked
    })
