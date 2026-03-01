import json
from src.models import ClassifyRequest, ClassifyResponse
from src.llm import get_llm
from src.prompts import CLASSIFY_PROMPT


async def classify_ticket(request: ClassifyRequest) -> ClassifyResponse:
    """
    Calls the LLM with the classification prompt and parses the JSON response.
    Raises an exception if the LLM response cannot be parsed — caller handles it.
    """
    llm = get_llm(streaming=False)
    chain = CLASSIFY_PROMPT | llm

    try:
        result = await chain.ainvoke({
            "title": request.title,
            "description": request.description,
        })
    except Exception as e:
        raise RuntimeError(f"LLM call failed during classification: {str(e)}")

    # Parse the JSON from the LLM response
    raw_text = result.content.strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        # Sometimes the LLM wraps output in markdown — strip it and retry
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        try:
            data = json.loads(raw_text.strip())
        except json.JSONDecodeError:
            raise RuntimeError(
                f"LLM returned non-JSON response: {result.content[:200]}"
            )

    # Validate required fields exist
    required = {"priority", "category", "confidence", "reasoning"}
    missing = required - set(data.keys())
    if missing:
        raise RuntimeError(f"LLM response missing fields: {missing}")

    # Validate enum values
    valid_priorities = {"low", "medium", "high", "critical"}
    if data["priority"] not in valid_priorities:
        data["priority"] = "medium"  # safe fallback

    return ClassifyResponse(
        priority=data["priority"],
        category=data["category"],
        confidence=float(data["confidence"]),
        reasoning=data["reasoning"],
    )