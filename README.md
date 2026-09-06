# SafeNet AI – Intelligent Road Risk Prediction System

**Smart India Hackathon 2026**
**Problem Statement ID:** `SIH26202`
**Problem Statement:** AI-powered intelligent road safety system integrating smart devices such as CCTV, sensors and edge devices for real-time traffic monitoring and accident prediction.

---

## System Overview & Architecture Pipeline

SafeNet AI implements the end-to-end intelligent road safety lifecycle:
$$\text{CCTV/Video Input} \longrightarrow \text{YOLOv8 Vehicle Detection} \longrightarrow \text{SORT/DeepSORT Tracking} \longrightarrow \text{Behavior Analysis} \longrightarrow \text{Risk Prediction (0-100)} \longrightarrow \text{Smart Alerts} \longrightarrow \text{Authority Command Center}$$

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts analytics, Leaflet / OpenStreetMap interactive GIS hot-spot visualization, Axios client, Web Audio hazard synthesizer.
- **Backend**: Python 3, Flask, Flask-CORS, PyJWT role-based authentication (`traffic authority`, `administrator`), RESTful APIs, Server-Sent Events (SSE) stream.
- **Database**: MongoDB (supports MongoDB Atlas through `MONGO_URI` with built-in resilient in-memory/JSON fallback for 100% offline hackathon demos).
- **AI/ML Layer**:
  - Vehicle Detection simulation for Cars, Bikes, Buses, Trucks, and Auto-rickshaws.
  - Multi-lane trajectory tracking compatible with SORT/DeepSORT Kalman state vectors.
  - Multi-variable mathematical risk engine evaluating speed excess, headway proximity, lane direction conflict (wrong-way driving), abrupt emergency braking, and erratic lane swerves.

---

## Quick Start (Run Locally)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node.js v20.18 LTS)
- MongoDB Atlas cluster or local MongoDB (optional; runs seamlessly with automatic fallback if offline)

---

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional)
cp .env.example .env

# Run the Flask backend
python app.py
```
The API server will start on `http://localhost:5000`. Database seeding runs automatically on first launch (creates 10 smart cameras, 50 vehicles, 20 realistic alerts, 100 traffic density records, and default credentials).

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Default Demo Credentials

For instant hackathon evaluation, click either quick-demo button on the login screen or enter:

| Role | Email | Password |
|---|---|---|
| **Traffic Authority** | `authority@safenet.ai` | `Authority@123` |
| **Administrator** | `admin@safenet.ai` | `Admin@123` |

---

## SIH 2026 Demonstration Flow (Judge Walkthrough)

To execute the official SIH demonstration sequence:
1. **Login**: Go to `http://localhost:5173/login`, click **Traffic Authority** for one-click authentication.
2. **Command Center Dashboard**: Observe live KPIs: 10 Cameras Connected, 148+ Vehicles Detected, 4 High-Risk Alerts, Traffic Density, and AI Engine: ACTIVE.
3. **Live Traffic Monitoring**: Click **Live Monitoring** on the sidebar. View the multi-camera CCTV wall (Main Junction, Highway Entry, City Center, School Zone) with live bounding boxes, speeds, and Kalman tracking vectors.
4. **AI Computer Vision Pipeline**: Click **AI Analysis**. Choose the "Wrong-Way Driving" scenario preset and click **Start AI Analysis**. Watch the 6-stage pipeline animate (`Input` → `Detection` → `Tracking` → `Features` → `Prediction` → `Alert`) and inspect the detected vehicle telemetry table.
5. **Inject Live Incident**: Click **Simulate SIH Incident** in the top navigation bar. Select **Wrong-Way Vehicle** (`V-108`) at `Main Junction` and click **Trigger Hazard Now**.
6. **Real-Time Alert Notification**:
   - A critical floating banner appears with an audio warning tone: `🚨 HIGH RISK DETECTED: Wrong-way vehicle at Main Junction (Vehicle V-108, Risk 94%)`.
   - Click **Acknowledge** or **View Alert**.
7. **Active Alerts Management**: Inspect the alerts table, examine the causal explanation, and click **Resolve**.
8. **Geographic Risk Hotspot Map**: Navigate to **Risk Hotspots**. View Leaflet interactive pins colored by hazard severity with pulsating radars. Click any pin to view incident counts and dominant risk type.
9. **Analytics & Trends**: Open **Traffic Analytics** to review the Recharts telemetry (Vehicle volume line chart, Risk distribution donut chart, Hazard category bar chart, and Camera-wise risk).
10. **Reports & Export**: Open **Reports & Insights**, filter by camera or hazard, and click **Export CSV** or **Print Dossier** to download the official incident report.

---

## MongoDB Atlas Setup Guide

To connect your own MongoDB Atlas database:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** and create a database user and password.
3. Go to **Network Access** and add `0.0.0.0/0` (allow access from anywhere).
4. Click **Connect** → **Drivers** and copy your connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/safenet_db?retryWrites=true&w=majority
   ```
5. Paste this in `backend/.env`.
6. Restart `python app.py`. SafeNet AI will connect to MongoDB Atlas and populate the collections.

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | JWT authentication |
| `POST` | `/api/auth/register` | Register new authority user |
| `GET` | `/api/auth/me` | Fetch active user session |
| `GET` | `/api/cameras` | List connected CCTV cameras |
| `POST` | `/api/cameras` | Register a new camera node |
| `PUT` | `/api/cameras/<id>` | Update camera parameters |
| `DELETE` | `/api/cameras/<id>` | Remove camera node |
| `POST` | `/api/cameras/<id>/test` | Test RTSP stream latency |
| `GET` | `/api/vehicles` | List detected vehicles |
| `GET` | `/api/vehicles/live` | Stream live lane tracking vectors |
| `GET` | `/api/alerts` | Query alerts by severity/status |
| `PUT` | `/api/alerts/<id>/acknowledge` | Acknowledge alert |
| `PUT` | `/api/alerts/<id>/resolve` | Resolve alert |
| `POST` | `/api/risk/predict` | Calculate multi-factor risk score |
| `GET` | `/api/risk/recent` | Recent risk evaluations |
| `GET` | `/api/risk/hotspots` | Spatial coordinates for Leaflet map |
| `GET` | `/api/analytics/overview` | Command Center KPI metrics |
| `GET` | `/api/analytics/risk-distribution` | Low/Medium/High pie breakdown |
| `GET` | `/api/analytics/risk-types` | Hazard category counts |
| `GET` | `/api/analytics/traffic-density` | 24-hour density trend |
| `GET` | `/api/analytics/hourly-risk` | Hourly risk & prevention index |
| `POST` | `/api/ai/analyze` | Run video/image AI pipeline |
| `POST` | `/api/ai/upload` | Ingest video or image file |
| `POST` | `/api/ai/simulate-incident` | Dispatch simulated SIH hazard |
| `GET` | `/api/ai/stream` | Server-Sent Events (SSE) telemetry |
| `GET` | `/api/health` | Edge AI & system diagnostics |

---

## Future Real ML / Edge Deployment

The modular architecture in `backend/services/` is designed for direct drop-in integration:
- Replace `services/ai_service.py` with `ultralytics.YOLO("yolov8x.pt")` for inference on GPU / TensorRT / ONNX.
- Replace tracking simulator with `deep_sort_realtime.deepsort_tracker.DeepSort`.
- Replace `services/risk_engine.py` with trained scikit-learn `RandomForestClassifier` or PyTorch model weights.
