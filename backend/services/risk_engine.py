"""
SafeNet AI - Risk Prediction Engine
Calculates dynamic road risk based on multi-parameter telemetry:
- Speed (km/h) vs lane limit
- Proximity / headway distance to nearest vehicle (m)
- Direction alignment with assigned lane (Wrong-way indicator)
- Traffic density (%)
- Sudden deceleration / emergency braking
- Erratic swerving / abnormal lane changing

Classifications:
- 0 to 30: LOW RISK
- 31 to 60: MEDIUM RISK
- 61 to 100: HIGH RISK
"""

def evaluate_risk(data: dict) -> dict:
    speed = float(data.get("speed", 45))
    distance = float(data.get("distance", 15))
    direction = str(data.get("direction", "normal")).lower()
    lane = int(data.get("lane", 1))
    density = float(data.get("density", 40))
    sudden_stop = bool(data.get("sudden_stop", False) or data.get("suddenStop", False))
    erratic_behavior = bool(data.get("erratic_behavior", False) or data.get("erraticBehaviour", False))
    speed_limit = float(data.get("speed_limit", 60))

    base_score = 10.0
    detected_factors = []
    primary_risk_type = "NORMAL"

    # 1. Wrong-Way Movement (Critical Hazard)
    is_wrong_way = "wrong" in direction or direction == "opposite" or direction == "reverse"
    if is_wrong_way:
        base_score += 48.0
        detected_factors.append("Wrong-way vehicular movement against designated lane traffic")
        primary_risk_type = "WRONG_WAY_DRIVING"

    # 2. Overspeeding
    speed_excess = max(0.0, speed - speed_limit)
    if speed_excess > 0:
        # Scale up to 35 points based on excess
        overspeed_penalty = min(35.0, (speed_excess / 30.0) * 35.0)
        base_score += overspeed_penalty
        detected_factors.append(f"Overspeeding ({int(speed)} km/h in {int(speed_limit)} km/h zone)")
        if primary_risk_type == "NORMAL" or (overspeed_penalty > 25 and not is_wrong_way):
            primary_risk_type = "OVERSPEEDING"

    # 3. Close Proximity / Tailgating
    if distance < 12.0:
        if distance <= 4.0:
            base_score += 32.0
            detected_factors.append(f"Critical tailgating proximity ({distance:.1f}m)")
            if primary_risk_type == "NORMAL":
                primary_risk_type = "CLOSE_PROXIMITY"
        elif distance <= 8.0:
            base_score += 20.0
            detected_factors.append(f"Dangerous close proximity ({distance:.1f}m)")
            if primary_risk_type == "NORMAL":
                primary_risk_type = "CLOSE_PROXIMITY"
        else:
            base_score += 10.0

    # 4. Sudden Stop / Hard Deceleration
    if sudden_stop:
        base_score += 28.0
        detected_factors.append("Abrupt emergency deceleration / sudden stop detected")
        if primary_risk_type in ["NORMAL", "CLOSE_PROXIMITY"]:
            primary_risk_type = "SUDDEN_STOP"

    # 5. Erratic Behavior / Dangerous Swerving
    if erratic_behavior:
        base_score += 26.0
        detected_factors.append("Erratic swerving across lane boundaries")
        if primary_risk_type == "NORMAL":
            primary_risk_type = "ERRATIC_BEHAVIOUR"

    # 6. High Traffic Density Congestion
    if density > 65.0:
        density_penalty = min(20.0, ((density - 65.0) / 35.0) * 20.0)
        base_score += density_penalty
        if density > 80.0:
            detected_factors.append(f"High traffic density ({int(density)}%) bottleneck")
            if primary_risk_type == "NORMAL":
                primary_risk_type = "HIGH_TRAFFIC_DENSITY"

    # Clamp total score between 5 and 99
    risk_score = int(round(max(5.0, min(99.0, base_score))))

    # Classification
    if risk_score <= 30:
        risk_level = "LOW"
    elif risk_score <= 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    # Build human explanation
    if not detected_factors:
        explanation = "Traffic flow is smooth and within safe operational parameters."
        primary_risk_type = "NORMAL"
    else:
        explanation = " + ".join(detected_factors)

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_type": primary_risk_type,
        "explanation": explanation,
        "factors": detected_factors,
        "parameters": {
            "speed": speed,
            "distance": distance,
            "density": density,
            "direction": direction,
            "lane": lane,
            "sudden_stop": sudden_stop,
            "erratic_behavior": erratic_behavior
        }
    }
