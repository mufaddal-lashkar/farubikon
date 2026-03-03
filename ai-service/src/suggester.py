import json
import asyncio
from typing import AsyncGenerator
from src.models import SuggestRequest
from src.llm import get_llm
from src.prompts import SUGGEST_PROMPT

def _format_comments(comments) -> str:
    """Format existing comments into readable text for the prompt."""
    if not comments:
        return "No existing comments."

    lines = []
    for i, c in enumerate(comments, 1):
        author = "AI" if c.is_ai_generated else f"User ({c.author_id})"
        lines.append(f"{i}. [{author}]: {c.content}")
    return "\n".join(lines)

async def stream_suggested_response(
    request: SuggestRequest,
) -> AsyncGenerator[str, None]:
    """
    Streams an AI-generated response suggestion as SSE chunks.
    Each yielded value is a fully formatted SSE line.
    """
    llm = get_llm(streaming=True)
    chain = SUGGEST_PROMPT | llm

    prompt_input = {
        "title": request.ticket_title,
        "description": request.ticket_description,
        "category": request.ticket_category or "unclassified",
        "priority": request.ticket_priority or "unclassified",
        "comments": _format_comments(request.existing_comments),
        "tone": request.tone,
    }

    try:
        # Set a 30-second timeout on the entire stream
        async with asyncio.timeout(30):
            async for chunk in chain.astream(prompt_input):
                content = chunk.content

                if content:
                    payload = json.dumps({"content": content, "done": False})
                    yield f"data: {payload}\n\n"

        # Send the final done chunk
        payload = json.dumps({"content": "", "done": True, "error": None})
        yield f"data: {payload}\n\n"

    except asyncio.TimeoutError:
        error_payload = json.dumps({
            "content": "",
            "done": True,
            "error": "Request timed out after 30 seconds",
        })
        yield f"data: {error_payload}\n\n"

    except Exception as e:
        error_payload = json.dumps({
            "content": "",
            "done": True,
            "error": f"Stream failed: {str(e)}",
        })
        yield f"data: {error_payload}\n\n"