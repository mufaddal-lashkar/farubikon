import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from src.models import ClassifyRequest, ClassifyResponse, SuggestRequest
from src.classifier import classify_ticket
from src.suggester import stream_suggested_response

app = FastAPI(title="AI Classification Service")


# ── Health check ───────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}


# ── POST /classify ─────────────────────────────────────────────────────────
@app.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    try:
        result = await classify_ticket(request)
        return result
    except RuntimeError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /suggest-response ─────────────────────────────────────────────────
@app.post("/suggest-response")
async def suggest_response(request: SuggestRequest):
    return StreamingResponse(
        stream_suggested_response(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disables nginx buffering if behind proxy
        },
    )


# ── Entry point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)