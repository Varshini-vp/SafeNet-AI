import jwt
import hashlib
from functools import wraps
from datetime import datetime, timezone, timedelta
from flask import request, jsonify
from config import Config

def hash_password(password: str) -> str:
    # Deterministic salted SHA256 for demo simplicity and cross-platform reliability without C-compilation dependencies
    salt = "safenet_sih_2026_salt_"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def generate_token(user_id: str, email: str, role: str, name: str) -> str:
    payload = {
        "user_id": str(user_id),
        "email": email,
        "role": role,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization token is missing", "success": False}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid token header format. Must be Bearer <token>", "success": False}), 401
        
        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            request.current_user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired", "success": False}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token", "success": False}), 401
            
        return f(*args, **kwargs)
    return decorated

def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(request, "current_user", None)
            if not user:
                return jsonify({"error": "Unauthorized", "success": False}), 401
            
            user_role = user.get("role")
            if user_role not in allowed_roles:
                return jsonify({
                    "error": f"Access denied. Requires one of roles: {', '.join(allowed_roles)}",
                    "success": False
                }), 403
                
            return f(*args, **kwargs)
        return decorated
    return decorator
