import random
import uuid
from datetime import datetime, timezone, timedelta
from database import get_db
from middleware.auth import hash_password
from services.risk_engine import evaluate_risk

def seed_database():
    db = get_db()
    
    # Check if already seeded
    if db.users.count_documents({}) > 0:
        return

    print("[SafeNet Seed] Seeding initial dataset for SIH26202 prototype...")

    # 1. Users
    users_data = [
        {
            "_id": "user-auth-01",
            "name": "Inspector Rajesh Sharma",
            "email": "authority@safenet.ai",
            "passwordHash": hash_password("Authority@123"),
            "role": "authority",
            "department": "Traffic Management Division - Command Zone 1",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "_id": "user-admin-01",
            "name": "Dr. Ananya Verma",
            "email": "admin@safenet.ai",
            "passwordHash": hash_password("Admin@123"),
            "role": "admin",
            "department": "Smart City Intelligent Systems Admin",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    for u in users_data:
        db.users.insert_one(u)

    # 2. 10 Realistic Smart City Cameras
    cameras_data = [
        {"cameraId": "CAM-01", "name": "Camera 01 – Main Junction", "location": "Outer Ring Road - Junction 4", "lat": 28.6139, "lng": 77.2090, "streamUrl": "rtsp://safenet.stream/cam01/live", "status": "ONLINE", "vehiclesDetected": 184, "riskLevel": "HIGH", "speedLimit": 60},
        {"cameraId": "CAM-02", "name": "Camera 02 – Highway Entry", "location": "Expressway Toll Plaza Gate A", "lat": 28.5355, "lng": 77.3910, "streamUrl": "rtsp://safenet.stream/cam02/live", "status": "ONLINE", "vehiclesDetected": 242, "riskLevel": "MEDIUM", "speedLimit": 80},
        {"cameraId": "CAM-03", "name": "Camera 03 – City Center", "location": "Central Metro Plaza Intersection", "lat": 28.6304, "lng": 77.2177, "streamUrl": "rtsp://safenet.stream/cam03/live", "status": "ONLINE", "vehiclesDetected": 195, "riskLevel": "LOW", "speedLimit": 50},
        {"cameraId": "CAM-04", "name": "Camera 04 – School Zone", "location": "St. Xavier Road & Sector 14", "lat": 28.5700, "lng": 77.3200, "streamUrl": "rtsp://safenet.stream/cam04/live", "status": "ONLINE", "vehiclesDetected": 92, "riskLevel": "LOW", "speedLimit": 30},
        {"cameraId": "CAM-05", "name": "Camera 05 – Industrial Corridor", "location": "Logistics Hub East Gate Flyover", "lat": 28.6500, "lng": 77.2800, "streamUrl": "rtsp://safenet.stream/cam05/live", "status": "ONLINE", "vehiclesDetected": 160, "riskLevel": "HIGH", "speedLimit": 60},
        {"cameraId": "CAM-06", "name": "Camera 06 – Ring Road Bypass", "location": "Elevated Flyover Ramp West", "lat": 28.5900, "lng": 77.1800, "streamUrl": "rtsp://safenet.stream/cam06/live", "status": "ONLINE", "vehiclesDetected": 210, "riskLevel": "MEDIUM", "speedLimit": 70},
        {"cameraId": "CAM-07", "name": "Camera 07 – Airport Transit", "location": "Terminal 3 Underpass Concourse", "lat": 28.5562, "lng": 77.1000, "streamUrl": "rtsp://safenet.stream/cam07/live", "status": "ONLINE", "vehiclesDetected": 140, "riskLevel": "LOW", "speedLimit": 60},
        {"cameraId": "CAM-08", "name": "Camera 08 – Tech Park Link", "location": "Silicon Boulevard North Crossing", "lat": 28.4595, "lng": 77.0266, "streamUrl": "rtsp://safenet.stream/cam08/live", "status": "ONLINE", "vehiclesDetected": 178, "riskLevel": "LOW", "speedLimit": 50},
        {"cameraId": "CAM-09", "name": "Camera 09 – Old City Market", "location": "Heritage Gate Arterial Road", "lat": 28.6562, "lng": 77.2410, "streamUrl": "rtsp://safenet.stream/cam09/live", "status": "ONLINE", "vehiclesDetected": 230, "riskLevel": "HIGH", "speedLimit": 40},
        {"cameraId": "CAM-10", "name": "Camera 10 – Suburb Connector", "location": "Green Valley Bypass Mile 12", "lat": 28.5000, "lng": 77.0800, "streamUrl": "rtsp://safenet.stream/cam10/live", "status": "ONLINE", "vehiclesDetected": 85, "riskLevel": "LOW", "speedLimit": 60},
    ]
    for c in cameras_data:
        c["createdAt"] = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        c["lastActive"] = datetime.now(timezone.utc).isoformat()
        db.cameras.insert_one(c)

    # 3. 50 Vehicles
    v_types = ["Car", "Bike", "Bus", "Truck", "Auto-rickshaw"]
    now = datetime.now(timezone.utc)
    for i in range(1, 51):
        cam = cameras_data[i % len(cameras_data)]
        speed = round(random.uniform(28.0, 95.0), 1)
        dist = round(random.uniform(3.0, 24.0), 1)
        is_wrong = (i == 4 or i == 18)
        direction = "Wrong-Way" if is_wrong else random.choice(["North", "South", "East", "West"])
        sudden = (i % 9 == 0)
        erratic = (i % 7 == 0)

        eval_res = evaluate_risk({
            "speed": speed,
            "distance": dist,
            "direction": direction,
            "lane": (i % 3) + 1,
            "density": random.randint(45, 85),
            "sudden_stop": sudden,
            "erratic_behavior": erratic,
            "speed_limit": cam.get("speedLimit", 60)
        })

        db.vehicles.insert_one({
            "vehicleId": f"V-{100 + i}",
            "type": random.choice(v_types),
            "speed": speed,
            "lane": (i % 3) + 1,
            "direction": direction,
            "cameraId": cam["cameraId"],
            "distance": dist,
            "riskScore": eval_res["risk_score"],
            "riskLevel": eval_res["risk_level"],
            "suddenStop": sudden,
            "erraticBehaviour": erratic,
            "timestamp": (now - timedelta(minutes=random.randint(1, 180))).isoformat()
        })

    # 4. 20 Realistic Alerts
    risk_catalogs = [
        {"type": "WRONG_WAY_DRIVING", "severity": "HIGH", "desc": "Wrong-way vehicle detected moving against designated flow", "cam": "CAM-01"},
        {"type": "OVERSPEEDING", "severity": "HIGH", "desc": "Vehicle exceeded configured speed limit by +38 km/h", "cam": "CAM-02"},
        {"type": "CLOSE_PROXIMITY", "severity": "MEDIUM", "desc": "Dangerous tailgating observed (headway < 3.2m)", "cam": "CAM-05"},
        {"type": "SUDDEN_STOP", "severity": "HIGH", "desc": "Emergency abrupt braking in fast lane without warning", "cam": "CAM-06"},
        {"type": "ERRATIC_BEHAVIOUR", "severity": "MEDIUM", "desc": "Multiple rapid lane switches without indication", "cam": "CAM-01"},
        {"type": "HIGH_TRAFFIC_DENSITY", "severity": "MEDIUM", "desc": "Traffic density exceeded 88% capacity at intersection bottleneck", "cam": "CAM-09"},
        {"type": "OVERSPEEDING", "severity": "HIGH", "desc": "High velocity speed spike detected near school perimeter", "cam": "CAM-04"},
        {"type": "WRONG_WAY_DRIVING", "severity": "HIGH", "desc": "Opposing vehicle entered one-way flyover exit", "cam": "CAM-05"}
    ]

    for idx in range(1, 21):
        catalog = risk_catalogs[idx % len(risk_catalogs)]
        cam_match = next((c for c in cameras_data if c["cameraId"] == catalog["cam"]), cameras_data[0])
        score = random.randint(75, 96) if catalog["severity"] == "HIGH" else random.randint(45, 60)
        status = "RESOLVED" if idx > 12 else ("ACKNOWLEDGED" if idx > 6 else "ACTIVE")
        
        db.alerts.insert_one({
            "alertId": f"ALERT #A{1000 + idx}",
            "vehicleId": f"V-{100 + (idx * 2)}",
            "cameraId": cam_match["cameraId"],
            "location": cam_match["location"],
            "riskType": catalog["type"],
            "severity": catalog["severity"],
            "riskScore": score,
            "explanation": catalog["desc"],
            "status": status,
            "timestamp": (now - timedelta(minutes=idx * 14)).isoformat()
        })

    # 5. 30 Risk Predictions
    for j in range(1, 31):
        cam = cameras_data[j % len(cameras_data)]
        spd = round(random.uniform(35.0, 92.0), 1)
        dst = round(random.uniform(3.0, 18.0), 1)
        den = round(random.uniform(40.0, 88.0), 1)
        is_wrong = (j % 10 == 0)
        eval_res = evaluate_risk({
            "speed": spd,
            "distance": dst,
            "direction": "wrong-way" if is_wrong else "north",
            "lane": (j % 3) + 1,
            "density": den,
            "sudden_stop": (j % 8 == 0),
            "erratic_behavior": (j % 6 == 0),
            "speed_limit": cam.get("speedLimit", 60)
        })

        db.risk_predictions.insert_one({
            "predictionId": str(uuid.uuid4())[:8],
            "vehicleId": f"V-{120 + j}",
            "cameraId": cam["cameraId"],
            "speed": spd,
            "distance": dst,
            "direction": "Wrong-Way" if is_wrong else "North",
            "density": den,
            "suddenStop": (j % 8 == 0),
            "erraticBehaviour": (j % 6 == 0),
            "riskScore": eval_res["risk_score"],
            "riskLevel": eval_res["risk_level"],
            "riskType": eval_res["risk_type"],
            "explanation": eval_res["explanation"],
            "timestamp": (now - timedelta(minutes=j * 8)).isoformat()
        })

    # 6. 100 Traffic Records (for time-series charts)
    for k in range(100):
        cam = cameras_data[k % len(cameras_data)]
        mins_ago = (99 - k) * 15  # every 15 minutes over the last ~24 hours
        time_point = (now - timedelta(minutes=mins_ago)).isoformat()
        base_v = 40 + int(25 * (1 + random.uniform(-0.3, 0.4)))
        # Peak hours simulation
        hour = (now - timedelta(minutes=mins_ago)).hour
        if 8 <= hour <= 11 or 17 <= hour <= 21:
            base_v += 35
        density_val = min(98, max(25, int((base_v / 120.0) * 100)))

        db.traffic_records.insert_one({
            "cameraId": cam["cameraId"],
            "vehicleCount": base_v,
            "density": density_val,
            "timestamp": time_point
        })

    print("[SafeNet Seed] Successfully seeded demo dataset!")
