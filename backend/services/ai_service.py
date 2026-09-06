import random
import time
from services.risk_engine import evaluate_risk

VEHICLE_TYPES = ["Car", "Bike", "Bus", "Truck", "Auto-rickshaw"]

class AISimulationService:
    """
    Simulation service for AI Computer Vision Pipeline:
    YOLOv8 Detection -> DeepSORT Tracking -> Feature Extraction -> Risk Prediction
    Designed to easily plug in real PyTorch/Ultralytics models later.
    """
    def __init__(self):
        self.model_loaded = True
        self.version = "SafeNet-YOLOv8-DeepSORT-Hybrid-v2.1"
        self.framework = "Ultralytics YOLOv8 Simulation Runtime"

    def analyze_frame_or_video(self, media_name: str = "Live Feed", preset: str = "default") -> dict:
        start_time = time.time()
        
        # Determine scenario parameters based on preset
        if preset == "wrong_way":
            vehicle_scenarios = [
                {"id": "V-108", "type": "Car", "speed": 74.0, "lane": 2, "dir": "wrong-way", "dist": 4.2, "sudden": False, "erratic": True},
                {"id": "V-102", "type": "Bus", "speed": 42.0, "lane": 1, "dir": "north", "dist": 14.5, "sudden": False, "erratic": False},
                {"id": "V-115", "type": "Bike", "speed": 48.0, "lane": 3, "dir": "north", "dist": 18.2, "sudden": False, "erratic": False},
                {"id": "V-120", "type": "Auto-rickshaw", "speed": 35.0, "lane": 2, "dir": "north", "dist": 5.1, "sudden": True, "erratic": False}
            ]
            density = 76
        elif preset == "overspeeding":
            vehicle_scenarios = [
                {"id": "V-204", "type": "Car", "speed": 98.0, "lane": 1, "dir": "north", "dist": 6.8, "sudden": False, "erratic": True},
                {"id": "V-205", "type": "Bike", "speed": 82.0, "lane": 2, "dir": "north", "dist": 7.4, "sudden": False, "erratic": False},
                {"id": "V-206", "type": "Truck", "speed": 55.0, "lane": 1, "dir": "north", "dist": 16.0, "sudden": False, "erratic": False}
            ]
            density = 64
        elif preset == "sudden_stop":
            vehicle_scenarios = [
                {"id": "V-301", "type": "Truck", "speed": 12.0, "lane": 2, "dir": "east", "dist": 3.2, "sudden": True, "erratic": False},
                {"id": "V-302", "type": "Car", "speed": 45.0, "lane": 2, "dir": "east", "dist": 3.8, "sudden": True, "erratic": True},
                {"id": "V-303", "type": "Auto-rickshaw", "speed": 38.0, "lane": 1, "dir": "east", "dist": 15.0, "sudden": False, "erratic": False}
            ]
            density = 82
        else:
            # Standard mixed traffic scenario
            vehicle_scenarios = [
                {"id": "V-101", "type": "Car", "speed": 52.0, "lane": 1, "dir": "north", "dist": 18.5, "sudden": False, "erratic": False},
                {"id": "V-104", "type": "Car", "speed": 68.0, "lane": 2, "dir": "north", "dist": 8.4, "sudden": False, "erratic": False},
                {"id": "V-109", "type": "Bike", "speed": 44.0, "lane": 3, "dir": "north", "dist": 16.2, "sudden": False, "erratic": False},
                {"id": "V-112", "type": "Auto-rickshaw", "speed": 38.0, "lane": 1, "dir": "north", "dist": 12.0, "sudden": False, "erratic": False},
                {"id": "V-118", "type": "Bus", "speed": 41.0, "lane": 2, "dir": "north", "dist": 22.0, "sudden": False, "erratic": False}
            ]
            density = 58

        detected_vehicles = []
        highest_risk = 0
        primary_alert = None

        # Generate realistic bounding box coordinates [x, y, w, h] normalized 0-100%
        box_coords = [
            {"x": 18, "y": 45, "w": 18, "h": 24},
            {"x": 48, "y": 38, "w": 22, "h": 30},
            {"x": 75, "y": 55, "w": 14, "h": 22},
            {"x": 28, "y": 68, "w": 15, "h": 20},
            {"x": 62, "y": 62, "w": 20, "h": 28}
        ]

        for i, v in enumerate(vehicle_scenarios):
            coords = box_coords[i % len(box_coords)]
            eval_res = evaluate_risk({
                "speed": v["speed"],
                "distance": v["dist"],
                "direction": v["dir"],
                "lane": v["lane"],
                "density": density,
                "sudden_stop": v["sudden"],
                "erratic_behavior": v["erratic"]
            })

            risk_score = eval_res["risk_score"]
            if risk_score > highest_risk:
                highest_risk = risk_score
                if risk_score > 60:
                    primary_alert = {
                        "vehicle_id": v["id"],
                        "risk_type": eval_res["risk_type"],
                        "risk_score": risk_score,
                        "risk_level": eval_res["risk_level"],
                        "explanation": eval_res["explanation"]
                    }

            detected_vehicles.append({
                "vehicleId": v["id"],
                "type": v["type"],
                "confidence": round(random.uniform(0.89, 0.98), 2),
                "speed": v["speed"],
                "lane": v["lane"],
                "direction": v["dir"].capitalize(),
                "distance": v["dist"],
                "suddenStop": v["sudden"],
                "erraticBehaviour": v["erratic"],
                "riskScore": risk_score,
                "riskLevel": eval_res["risk_level"],
                "riskType": eval_res["risk_type"],
                "explanation": eval_res["explanation"],
                "bbox": coords,
                "trackingStatus": "HAZARD" if risk_score > 60 else "ACTIVE",
                "trajectory": [
                    {"x": coords["x"] - 5, "y": coords["y"] - 10},
                    {"x": coords["x"] - 2, "y": coords["y"] - 4},
                    {"x": coords["x"], "y": coords["y"]}
                ]
            })

        processing_time_ms = int((time.time() - start_time) * 1000) + random.randint(120, 160)

        return {
            "media_name": media_name,
            "pipeline": [
                {"step": 1, "name": "Video Input", "status": "COMPLETED", "details": f"Ingested {media_name} at 30 FPS"},
                {"step": 2, "name": "Vehicle Detection", "status": "COMPLETED", "details": f"YOLOv8 detected {len(detected_vehicles)} vehicles"},
                {"step": 3, "name": "Object Tracking", "status": "COMPLETED", "details": "DeepSORT tracking IDs assigned with Kalman filtering"},
                {"step": 4, "name": "Feature Extraction", "status": "COMPLETED", "details": "Extracted velocity vectors, headway gaps, lane adherence"},
                {"step": 5, "name": "Risk Prediction", "status": "COMPLETED", "details": f"Max risk evaluated: {highest_risk}%"},
                {"step": 6, "name": "Alert Generation", "status": "COMPLETED" if primary_alert else "SKIPPED", "details": "High risk alert broadcasted" if primary_alert else "All parameters within safety thresholds"}
            ],
            "processing_time_ms": processing_time_ms,
            "vehicle_count": len(detected_vehicles),
            "traffic_density": density,
            "max_risk_score": highest_risk,
            "overall_risk_level": "HIGH" if highest_risk > 60 else ("MEDIUM" if highest_risk > 30 else "LOW"),
            "detected_vehicles": detected_vehicles,
            "primary_alert": primary_alert
        }

ai_service = AISimulationService()
