import random
import uuid
from datetime import datetime, timezone
from database import get_db
from services.risk_engine import evaluate_risk

class SimulationService:
    def __init__(self):
        self.is_active = True
        self.recent_events = []
        self.vehicle_counter = 150
        self.alert_counter = 1050

    def trigger_incident(self, risk_type="WRONG_WAY_DRIVING", camera_id=None):
        db = get_db()
        self.vehicle_counter += 1
        self.alert_counter += 1
        vehicle_id = f"V-{self.vehicle_counter}"
        alert_id = f"ALERT #A{self.alert_counter}"

        # Fetch random or specified camera
        cameras = db.cameras.find()
        if not cameras:
            cam_obj = {"cameraId": "CAM-01", "name": "Camera 01 – Main Junction", "location": "Main Junction Outer Ring"}
        else:
            if camera_id:
                cam_obj = next((c for c in cameras if c.get("cameraId") == camera_id or str(c.get("_id")) == camera_id), cameras[0])
            else:
                cam_obj = random.choice(cameras)

        cam_code = cam_obj.get("cameraId", "CAM-01")
        cam_loc = cam_obj.get("location", "Main Junction Outer Ring")

        # Configure parameters based on requested risk type
        if risk_type == "WRONG_WAY_DRIVING":
            speed = random.uniform(62, 78)
            dist = random.uniform(3.5, 6.0)
            direction = "wrong-way"
            lane = 2
            v_type = "Car"
            sudden = False
            erratic = True
            density = random.uniform(68, 85)
        elif risk_type == "OVERSPEEDING":
            speed = random.uniform(88, 115)
            dist = random.uniform(5.5, 9.0)
            direction = "north"
            lane = 1
            v_type = "Bike"
            sudden = False
            erratic = True
            density = random.uniform(50, 70)
        elif risk_type == "CLOSE_PROXIMITY":
            speed = random.uniform(55, 68)
            dist = random.uniform(2.1, 4.0)
            direction = "north"
            lane = 2
            v_type = "Car"
            sudden = False
            erratic = False
            density = random.uniform(75, 90)
        elif risk_type == "SUDDEN_STOP":
            speed = random.uniform(10, 20)
            dist = random.uniform(3.0, 5.0)
            direction = "east"
            lane = 1
            v_type = "Truck"
            sudden = True
            erratic = False
            density = random.uniform(70, 85)
        elif risk_type == "ERRATIC_BEHAVIOUR":
            speed = random.uniform(65, 82)
            dist = random.uniform(5.0, 8.0)
            direction = "north"
            lane = 3
            v_type = "Auto-rickshaw"
            sudden = False
            erratic = True
            density = random.uniform(60, 75)
        else: # High traffic density
            speed = random.uniform(15, 25)
            dist = random.uniform(3.0, 4.5)
            direction = "north"
            lane = 2
            v_type = "Bus"
            sudden = False
            erratic = False
            density = random.uniform(88, 96)

        eval_res = evaluate_risk({
            "speed": speed,
            "distance": dist,
            "direction": direction,
            "lane": lane,
            "density": density,
            "sudden_stop": sudden,
            "erratic_behavior": erratic
        })

        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Insert vehicle into live vehicles
        vehicle_record = {
            "vehicleId": vehicle_id,
            "type": v_type,
            "speed": round(speed, 1),
            "lane": lane,
            "direction": direction.capitalize(),
            "cameraId": cam_code,
            "distance": round(dist, 1),
            "riskScore": eval_res["risk_score"],
            "riskLevel": eval_res["risk_level"],
            "timestamp": now_iso
        }
        db.vehicles.insert_one(vehicle_record)

        # 2. Insert Risk Prediction
        risk_prediction = {
            "predictionId": str(uuid.uuid4())[:8],
            "vehicleId": vehicle_id,
            "cameraId": cam_code,
            "speed": round(speed, 1),
            "distance": round(dist, 1),
            "direction": direction,
            "density": round(density, 1),
            "suddenStop": sudden,
            "erraticBehaviour": erratic,
            "riskScore": eval_res["risk_score"],
            "riskLevel": eval_res["risk_level"],
            "riskType": eval_res["risk_type"],
            "explanation": eval_res["explanation"],
            "timestamp": now_iso
        }
        db.risk_predictions.insert_one(risk_prediction)

        # 3. If Risk is HIGH or MEDIUM, generate alert
        created_alert = None
        if eval_res["risk_level"] in ["HIGH", "MEDIUM"]:
            created_alert = {
                "alertId": alert_id,
                "vehicleId": vehicle_id,
                "cameraId": cam_code,
                "location": cam_loc,
                "riskType": eval_res["risk_type"],
                "severity": eval_res["risk_level"],
                "riskScore": eval_res["risk_score"],
                "explanation": eval_res["explanation"],
                "timestamp": now_iso,
                "status": "ACTIVE"
            }
            db.alerts.insert_one(created_alert)

            # Update camera risk status
            db.cameras.update_one(
                {"cameraId": cam_code},
                {"$set": {"riskLevel": eval_res["risk_level"], "lastActive": now_iso}}
            )

        # 4. Update traffic density record
        db.traffic_records.insert_one({
            "cameraId": cam_code,
            "vehicleCount": random.randint(30, 80),
            "density": round(density, 1),
            "timestamp": now_iso
        })

        event_payload = {
            "event_type": "HIGH_RISK_INCIDENT" if eval_res["risk_level"] == "HIGH" else "TRAFFIC_UPDATE",
            "vehicle": vehicle_record,
            "prediction": risk_prediction,
            "alert": created_alert,
            "camera": cam_obj
        }

        self.recent_events.append(event_payload)
        if len(self.recent_events) > 50:
            self.recent_events.pop(0)

        return event_payload

simulation_service = SimulationService()
