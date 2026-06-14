"""MindWatch AI wellness chatbot – context-aware responses."""

import os
import re
from datetime import datetime, timezone

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self-harm", "hurt myself", "want to die",
]

DISCLAIMER = (
    "I'm MindWatch AI, a wellness assistant — not a licensed therapist. "
    "For emergencies, contact your local emergency services or a crisis helpline immediately."
)


def _detect_intent(message: str) -> str:
    m = message.lower()
    if any(k in m for k in CRISIS_KEYWORDS):
        return "crisis"
    if re.search(r"\b(sleep|insomnia|rest|tired)\b", m):
        return "sleep"
    if re.search(r"\b(stress|anxious|anxiety|overwhelm|panic)\b", m):
        return "stress"
    if re.search(r"\b(depress|sad|hopeless|low mood|empty)\b", m):
        return "depression"
    if re.search(r"\b(walk|run|exercise|activity|workout|move)\b", m):
        return "activity"
    if re.search(r"\b(assessment|risk|prediction|score|result)\b", m):
        return "assessment"
    if re.search(r"\b(hello|hi|hey|good morning|good evening)\b", m):
        return "greeting"
    return "general"


def _build_context(uid: str, use_local: bool) -> dict:
    try:
        if use_local:
            from services.local_store import get_assessment_history, get_user_profile
        else:
            from services.firebase_service import get_assessment_history, get_user_profile

        profile = get_user_profile(uid) or {}
        history = get_assessment_history(uid, limit=3)
        latest = history[0] if history else None
        return {"name": profile.get("name", "there"), "latest": latest, "count": len(history)}
    except Exception:
        return {"name": "there", "latest": None, "count": 0}


def _rule_based_reply(intent: str, message: str, ctx: dict) -> str:
    name = ctx.get("name", "there")
    latest = ctx.get("latest")

    if intent == "crisis":
        return (
            f"{name}, I'm really glad you reached out. What you're feeling matters, and you deserve "
            "immediate support from a trained professional.\n\n"
            "Please contact emergency services or a crisis helpline in your country right now. "
            "In India: Vandrevala Foundation 1860-2662-345. In the US: 988 Suicide & Crisis Lifeline.\n\n"
            f"{DISCLAIMER}"
        )

    if intent == "greeting":
        risk = latest.get("prediction", "not yet assessed") if latest else "not yet assessed"
        return (
            f"Hello {name}! I'm MindWatch AI, your mental wellness companion. "
            f"Your latest risk level is **{risk}**. "
            "Ask me about sleep, stress, activity, your assessment results, or coping strategies."
        )

    if intent == "assessment" and latest:
        return (
            f"Based on your latest assessment ({latest.get('createdAt', '')[:10]}):\n"
            f"• **Risk:** {latest.get('prediction')}\n"
            f"• **Confidence:** {latest.get('confidence')}%\n"
            f"• **Sleep score:** {latest.get('sleep_score')}/10\n"
            f"• **Stress score:** {latest.get('stress_score')}/10\n"
            f"• **Activity mix:** {latest.get('walking_pct')}% walk, {latest.get('running_pct')}% run\n\n"
            "Complete regular assessments to track trends in Analytics."
        )

    if intent == "assessment":
        return "You haven't completed an assessment yet. Go to **Assessment** in the sidebar to get your personalized depression risk prediction."

    replies = {
        "sleep": (
            "Quality sleep is foundational for mental health. Try these evidence-based tips:\n"
            "1. Fixed sleep/wake times (even weekends)\n"
            "2. No screens 60 min before bed\n"
            "3. Cool, dark room (18–20°C)\n"
            "4. Limit caffeine after 2 PM\n"
            "5. 4-7-8 breathing if you can't fall asleep\n\n"
            + (f"Your last sleep score was {latest.get('sleep_score')}/10 — aim for 7+ consistently." if latest else "")
        ),
        "stress": (
            "Stress management techniques that work:\n"
            "• **Box breathing:** inhale 4s, hold 4s, exhale 4s, hold 4s\n"
            "• **5-minute mindfulness** daily\n"
            "• Break tasks into 25-min focus blocks (Pomodoro)\n"
            "• Talk to someone you trust\n\n"
            + (f"Your stress score was {latest.get('stress_score')}/10. Scores above 6 benefit from professional support." if latest else "")
        ),
        "depression": (
            "I'm sorry you're going through this. Depression often improves with support:\n"
            "• Stay connected — isolation worsens symptoms\n"
            "• Gentle daily movement (even 10-min walks)\n"
            "• Sunlight exposure in the morning\n"
            "• Consider speaking with a counselor or psychiatrist\n\n"
            "Our ML model tracks behavioral patterns — complete an assessment for personalized risk insights."
        ),
        "activity": (
            "Physical activity boosts mood via endorphins and better sleep:\n"
            "• **150 min/week** moderate activity (WHO guideline)\n"
            "• Mix walking, running, and strength training\n"
            "• Reduce stationary time with hourly movement breaks\n\n"
            + (
                f"Your activity: {latest.get('walking_pct')}% walking, {latest.get('running_pct')}% running."
                if latest else "Track your movement patterns in the Assessment form."
            )
        ),
        "general": (
            "I'm here to support your mental wellness journey. I can help with:\n"
            "😴 **Sleep** hygiene and routines\n"
            "🧘 **Stress** and anxiety coping\n"
            "🏃 **Physical activity** recommendations\n"
            "📊 **Assessment** results interpretation\n"
            "💚 General **wellness** tips\n\n"
            "What would you like to explore?"
        ),
    }
    return replies.get(intent, replies["general"])


def _openai_reply(message: str, ctx: dict) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        latest = ctx.get("latest")
        context_str = ""
        if latest:
            context_str = (
                f"User's latest assessment: risk={latest.get('prediction')}, "
                f"confidence={latest.get('confidence')}%, sleep={latest.get('sleep_score')}, "
                f"stress={latest.get('stress_score')}."
            )
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are MindWatch AI, a compassionate mental wellness assistant. "
                        "Give practical, empathetic advice. Never diagnose. "
                        "Encourage professional help for severe symptoms. "
                        f"{context_str} {DISCLAIMER}"
                    ),
                },
                {"role": "user", "content": message},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def generate_chat_response(uid: str, message: str, use_local: bool = True) -> dict:
    message = (message or "").strip()
    if not message:
        return {"reply": "Please type a message.", "intent": "empty"}

    ctx = _build_context(uid, use_local)
    intent = _detect_intent(message)

    reply = _openai_reply(message, ctx) if intent != "crisis" else None
    if not reply:
        reply = _rule_based_reply(intent, message, ctx)

    return {
        "reply": reply,
        "intent": intent,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "powered_by": "openai" if os.getenv("OPENAI_API_KEY") and intent != "crisis" else "mindwatch-ai",
    }
