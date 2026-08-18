from __future__ import annotations

import json
import re

from config import config


class AINotConfigured(RuntimeError):
    """Raised when GROQ_API_KEY isn't set — callers turn this into a
    clean 4xx response instead of a stack trace."""


_client = None


def _get_client():
    """Lazily configures and caches the Groq client so importing this
    module never fails just because a key isn't set yet (dev machines,
    tests, etc.)."""
    global _client
    if _client is not None:
        return _client

    if not config.GROQ_API_KEY:
        raise AINotConfigured(
            "GROQ_API_KEY is not set. Add it to backend/.env to enable AI features."
        )

    from groq import Groq

    _client = Groq(api_key=config.GROQ_API_KEY)
    return _client


def _extract_json(text: str) -> dict:
    """Groq is asked to return raw JSON, but models occasionally wrap it
    in ```json fences anyway — this strips those before parsing."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def generate_text(prompt: str, temperature: float = 0.4) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model=config.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
    )
    return (response.choices[0].message.content or "").strip()


def generate_json(prompt: str, temperature: float = 0.3) -> dict:
    client = _get_client()
    response = client.chat.completions.create(
        model=config.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        response_format={"type": "json_object"},
    )
    text = (response.choices[0].message.content or "{}").strip()
    return _extract_json(text)
