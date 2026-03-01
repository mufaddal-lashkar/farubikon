const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export interface ClassifyResponse {
    priority: "low" | "medium" | "high" | "critical";
    category: string;
    confidence: number;
    reasoning: string;
}

export interface SuggestRequest {
    ticket_title: string;
    ticket_description: string;
    ticket_category: string | null;
    ticket_priority: string | null;
    existing_comments: { content: string; author_id: string; is_ai_generated: boolean }[];
    tone: "professional" | "friendly" | "formal";
}

// ── Classify a ticket ──────────────────────────────────────────────────────
export async function classifyTicket(
    title: string,
    description: string
): Promise<ClassifyResponse> {
    const response = await fetch(`${AI_SERVICE_URL}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
        throw new Error(`AI service classification failed: ${response.status}`);
    }

    return response.json() as Promise<ClassifyResponse>;
}

// ── Stream a suggested response ────────────────────────────────────────────
export async function streamSuggestedResponse(
    request: SuggestRequest
): Promise<Response> {
    const response = await fetch(`${AI_SERVICE_URL}/suggest-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`AI service suggest-response failed: ${response.status}`);
    }

    return response;
}