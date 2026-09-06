import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"
    JWT_SECRET = os.getenv("JWT_SECRET", "safenet-ai-default-sih2026-secret-key")
    MONGO_URI = os.getenv("MONGO_URI", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    AI_PROCESSING_LATENCY_MS = int(os.getenv("AI_PROCESSING_LATENCY_MS", 142))
    
    # Risk calculation thresholds
    OVERSPEED_THRESHOLD = 60  # km/h
    PROXIMITY_THRESHOLD = 5.0  # meters
    DENSITY_HIGH_THRESHOLD = 70  # percent
