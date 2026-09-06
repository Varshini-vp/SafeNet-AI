import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db_manager
from seed_data import seed_database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("safenet.app")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

    # Connect DB and Seed Data
    with app.app_context():
        db_manager.connect()
        seed_database()

    # Register Blueprints
    from routes.auth_routes import auth_bp
    from routes.camera_routes import camera_bp
    from routes.vehicle_routes import vehicle_bp
    from routes.alert_routes import alert_bp
    from routes.risk_routes import risk_bp
    from routes.analytics_routes import analytics_bp
    from routes.ai_routes import ai_bp
    from routes.health_routes import health_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(camera_bp)
    app.register_blueprint(vehicle_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(health_bp)

    @app.route("/")
    def index():
        return jsonify({
            "service": "SafeNet AI – Intelligent Road Risk Prediction System",
            "version": "1.0.0",
            "hackathon": "Smart India Hackathon 2026",
            "problemId": "SIH26202",
            "status": "ONLINE",
            "docs": "/api/health"
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found", "success": False}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Internal server error: {e}")
        return jsonify({"error": "Internal server error", "success": False}), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = Config.PORT
    logger.info(f"Starting SafeNet AI API server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
