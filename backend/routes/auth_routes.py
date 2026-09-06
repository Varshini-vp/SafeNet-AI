from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
import uuid
from database import get_db
from middleware.auth import hash_password, verify_password, generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required", "success": False}), 400

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid email or password", "success": False}), 401

    if not verify_password(password, user.get("passwordHash", "")):
        return jsonify({"error": "Invalid email or password", "success": False}), 401

    token = generate_token(
        user_id=user.get("_id"),
        email=user.get("email"),
        role=user.get("role", "authority"),
        name=user.get("name", "User")
    )

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user.get("_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "department": user.get("department", "")
        }
    })

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "authority")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required", "success": False}), 400

    if role not in ["authority", "admin"]:
        role = "authority"

    db = get_db()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists", "success": False}), 409

    new_user = {
        "_id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "passwordHash": hash_password(password),
        "role": role,
        "department": data.get("department", "Traffic Safety Monitoring"),
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    db.users.insert_one(new_user)

    token = generate_token(new_user["_id"], email, role, name)

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": new_user["_id"],
            "name": name,
            "email": email,
            "role": role,
            "department": new_user["department"]
        }
    }), 201

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    user_payload = request.current_user
    db = get_db()
    user = db.users.find_one({"email": user_payload.get("email")})
    if not user:
        return jsonify({"error": "User not found", "success": False}), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user.get("_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "department": user.get("department", "")
        }
    })

@auth_bp.route("/users", methods=["GET"])
@token_required
def list_users():
    if request.current_user.get("role") != "admin":
        return jsonify({"error": "Admin access required", "success": False}), 403

    db = get_db()
    users = db.users.find()
    sanitized = [{
        "id": u.get("_id"),
        "name": u.get("name"),
        "email": u.get("email"),
        "role": u.get("role"),
        "department": u.get("department", ""),
        "createdAt": u.get("createdAt")
    } for u in users]

    return jsonify({"success": True, "users": sanitized})
