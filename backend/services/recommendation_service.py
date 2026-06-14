"""Personalized wellness recommendations by risk level."""

RECOMMENDATIONS = {
    "Low Risk": {
        "sleep": [
            "Maintain a consistent sleep schedule (7–9 hours).",
            "Limit screen time 1 hour before bed.",
            "Keep your bedroom cool, dark, and quiet.",
        ],
        "stress": [
            "Practice 10 minutes of mindfulness daily.",
            "Take short breaks during work or study.",
            "Stay connected with friends and family.",
        ],
        "activity": [
            "Aim for 150 minutes of moderate activity per week.",
            "Include a mix of walking, running, and light strength training.",
            "Take a 5-minute walk every hour if sedentary.",
        ],
        "wellness": [
            "Journal gratitude three times per week.",
            "Continue healthy routines that support your mood.",
            "Schedule periodic self-check-ins to track trends.",
        ],
    },
    "Moderate Risk": {
        "sleep": [
            "Establish a fixed bedtime and wake time.",
            "Avoid caffeine after 2 PM.",
            "Try relaxation techniques (deep breathing, progressive muscle relaxation).",
            "Track sleep patterns for 2 weeks to identify issues.",
        ],
        "stress": [
            "Practice guided meditation 15 minutes daily.",
            "Use the 4-7-8 breathing technique during stressful moments.",
            "Consider talking to a counselor or trusted mentor.",
            "Reduce multitasking and prioritize one task at a time.",
        ],
        "activity": [
            "Increase daily walking to at least 30 minutes.",
            "Add 2–3 short running or cardio sessions per week.",
            "Reduce stationary time with standing breaks every 30 minutes.",
        ],
        "wellness": [
            "Limit social media to reduce comparison stress.",
            "Engage in hobbies that bring joy and relaxation.",
            "Monitor mood weekly and note triggers.",
        ],
    },
    "High Risk": {
        "sleep": [
            "Consult a healthcare provider about persistent sleep problems.",
            "Create a strict wind-down routine 90 minutes before bed.",
            "Avoid alcohol and heavy meals close to bedtime.",
            "Consider sleep hygiene assessment with a professional.",
        ],
        "stress": [
            "Reach out to a mental health professional promptly.",
            "Use crisis helplines if you feel overwhelmed (e.g., local emergency services).",
            "Practice daily grounding exercises (5-4-3-2-1 sensory technique).",
            "Reduce major commitments temporarily to lower pressure.",
        ],
        "activity": [
            "Start with gentle 10-minute walks; gradually increase duration.",
            "Avoid overexertion; focus on consistent light movement.",
            "Consider group activities for social support and motivation.",
        ],
        "wellness": [
            "Share your feelings with someone you trust.",
            "Avoid isolation; schedule regular check-ins with support people.",
            "Professional therapy is strongly recommended at this risk level.",
            "Remember: seeking help is a sign of strength, not weakness.",
        ],
    },
}


def get_recommendations_for_risk(risk_level: str) -> dict:
    base = RECOMMENDATIONS.get(risk_level, RECOMMENDATIONS["Moderate Risk"])
    flat_list = []
    for category, items in base.items():
        for item in items:
            flat_list.append({"category": category, "text": item})
    return {
        "risk_level": risk_level,
        "categories": base,
        "all": flat_list,
        "flat_texts": [item["text"] for item in flat_list],
    }
