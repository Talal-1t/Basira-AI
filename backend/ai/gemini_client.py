from __future__ import annotations

import json
import re
import os

from config import config


class GroqNotConfigured(RuntimeError):
    """Raised when GROQ_API_KEY isn't set."""


# توافقية مع الكود القديم لتفادي ImportError في chat_routes.py
GeminiNotConfigured = GroqNotConfigured


_client = None


def _get_client():
    """Lazily configures and caches the Groq client."""
    global _client
    if _client is not None:
        return _client

    groq_key = getattr(config, "GROQ_API_KEY", None) or os.getenv("GROQ_API_KEY")

    if not groq_key:
        raise GroqNotConfigured(
            "GROQ_API_KEY is not set. Add it to backend/.env to enable AI features."
        )

    from groq import Groq

    _client = Groq(api_key=groq_key)
    return _client


def _extract_json(text: str) -> dict:
    """Strips markdown fences before parsing JSON."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def generate_text(prompt: str, temperature: float = 0.4) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=temperature,
    )
    return (response.choices[0].message.content or "").strip()


def generate_json(prompt: str, temperature: float = 0.3) -> dict:
    client = _get_client()
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        temperature=temperature,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or "{}"
    return _extract_json(content)