from __future__ import annotations

from ai import groq_client, prompts


def answer_question(file_context: str, question: str, history: list[dict] | None = None) -> str:
    prompt = prompts.chat_prompt(file_context, question, history)
    return groq_client.generate_text(prompt, temperature=0.4)


def dataset_insights(dataset_context: str) -> dict:
    prompt = prompts.dataset_insights_prompt(dataset_context)
    data = groq_client.generate_json(prompt, temperature=0.3)
    return {
        "summary": data.get("summary", ""),
        "key_points": data.get("key_points", []),
        "anomalies": data.get("anomalies", []),
        "recommendations": data.get("recommendations", []),
    }


def pdf_insights(document_context: str) -> dict:
    prompt = prompts.pdf_insights_prompt(document_context)
    data = groq_client.generate_json(prompt, temperature=0.3)
    return {
        "summary": data.get("summary", ""),
        "key_points": data.get("key_points", []),
        "important_numbers": data.get("important_numbers", []),
        "faq": data.get("faq", []),
    }
