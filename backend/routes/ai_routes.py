from flask import Blueprint, request, jsonify, Response
import json
import time
from services.ai_service import ai_service
from services.simulation_service import simulation_service

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

@ai_bp.route("/analyze", methods=["POST"])
def analyze_feed():
    data = request.get_json() or {}
    media_name = data.get("media_name", "Traffic CCTV Feed #01")
    preset = data.get("preset", "default")
    
    result = ai_service.analyze_frame_or_video(media_name=media_name, preset=preset)
    return jsonify({
        "success": True,
        **result
    })

@ai_bp.route("/upload", methods=["POST"])
def upload_traffic_media():
    # Handle both multipart and JSON simulation
    file = request.files.get("file")
    preset = request.form.get("preset", "wrong_way" if file and "wrong" in file.filename.lower() else "default")
    filename = file.filename if file else "sample_traffic_feed.mp4"

    result = ai_service.analyze_frame_or_video(media_name=filename, preset=preset)
    return jsonify({
        "success": True,
        "message": f"Successfully ingested and analyzed {filename}",
        **result
    })

@ai_bp.route("/simulate-incident", methods=["POST"])
def simulate_incident():
    data = request.get_json() or {}
    risk_type = data.get("risk_type", "WRONG_WAY_DRIVING")
    camera_id = data.get("camera_id")

    incident = simulation_service.trigger_incident(risk_type=risk_type, camera_id=camera_id)
    return jsonify({
        "success": True,
        "message": f"Simulated {risk_type} incident dispatched across AI pipeline",
        "incident": incident
    })

@ai_bp.route("/stream", methods=["GET"])
def event_stream():
    """
    Server-Sent Events endpoint for real-time traffic updates and critical alerts.
    """
    def generate():
        while True:
            # Yield latest event if available
            if simulation_service.recent_events:
                event = simulation_service.recent_events[-1]
                yield f"data: {json.dumps(event)}\n\n"
            time.sleep(3)
            
    return Response(generate(), mimetype="text/event-stream")
