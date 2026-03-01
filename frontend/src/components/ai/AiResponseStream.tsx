"use client";

import { useSSEStream } from "@/hooks/useSSEStream";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface AiResponseStreamProps {
    ticketId: string;
}

export function AiResponseStream({ ticketId }: AiResponseStreamProps) {
    const { data, isStreaming, error, startStream, stopStream, reset } = useSSEStream();

    const [tone, setTone] = useState<"professional" | "friendly" | "formal">("professional");

    const handleStart = () => {
        reset();
        startStream(`${API_BASE}/tickets/${ticketId}/suggest-response?tone=${tone}`);
    };

    return (
        <div className="mt-6 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">AI Response Suggestion</h3>

            <div className="flex gap-3 mb-4">
                <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as typeof tone)}
                    disabled={isStreaming}
                    className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none"
                >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                </select>

                {!isStreaming ? (
                    <button
                        onClick={handleStart}
                        className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                        Suggest Response
                    </button>
                ) : (
                    <button
                        onClick={stopStream}
                        className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300 transition-colors"
                    >
                        Stop
                    </button>
                )}

                {data && !isStreaming && (
                    <button
                        onClick={reset}
                        className="text-sm text-gray-400 underline hover:no-underline"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* ── Error state ───────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                    {error}
                    <button onClick={reset} className="ml-2 underline">Retry</button>
                </div>
            )}

            {/* ── Streaming / Success state ─────────── */}
            {(data || isStreaming) && !error && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-20">
                    {data}
                    {isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle" />
                    )}
                </div>
            )}

            {/* ── Empty state ───────────────────────── */}
            {!data && !isStreaming && !error && (
                <p className="text-sm text-gray-400 italic">
                    Click "Suggest Response" to generate an AI-drafted reply.
                </p>
            )}
        </div>
    );
}