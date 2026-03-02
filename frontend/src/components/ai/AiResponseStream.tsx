"use client";

import { useSSEStream } from "@/hooks/useSSEStream";
import { useState } from "react";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface AiResponseStreamProps {
    ticketId: string;
}

export function AiResponseStream({ ticketId }: AiResponseStreamProps) {
    const { data, isStreaming, error, startStream, stopStream, reset } = useSSEStream();
    const [tone, setTone] = useState<"professional" | "friendly" | "formal">("professional");
    const [isPosting, setIsPosting] = useState(false);
    const [postSuccess, setPostSuccess] = useState(false);

    const handleStart = () => {
        reset();
        setPostSuccess(false);
        startStream(`${API_BASE}/tickets/${ticketId}/suggest-response?tone=${tone}`);
    };

    const handlePostAsComment = async () => {
        if (!data) return;
        setIsPosting(true);
        try {
            await api.comments.create(ticketId, data);
            setPostSuccess(true);
        } catch (err) {
            console.error("Failed to post AI response as comment:", err);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
                AI Response Suggestion
            </h3>

            <div className="flex flex-wrap gap-3 mb-4">
                <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as typeof tone)}
                    disabled={isStreaming}
                    className="rounded-lg px-3 py-2 text-sm min-w-[130px]"
                >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                </select>

                {!isStreaming ? (
                    <button
                        onClick={handleStart}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all"
                    >
                        Suggest Response
                    </button>
                ) : (
                    <button
                        onClick={stopStream}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                    >
                        Stop
                    </button>
                )}

                {data && !isStreaming && (
                    <button
                        onClick={reset}
                        className="text-sm text-gray-400 hover:text-gray-600 font-medium"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* ── Error state ───────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 text-sm text-red-700">
                    {error}
                    <button onClick={reset} className="ml-2 underline font-medium">Retry</button>
                </div>
            )}

            {/* ── Streaming / Success state ─────────── */}
            {(data || isStreaming) && !error && (
                <>
                    <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed min-h-20 border border-gray-100">
                        {data}
                        {isStreaming && (
                            <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-0.5 animate-pulse align-middle rounded-sm" />
                        )}
                    </div>

                    {/* Post as comment button */}
                    {data && !isStreaming && (
                        <div className="mt-3 flex items-center gap-3">
                            {postSuccess ? (
                                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    Posted as comment!
                                </span>
                            ) : (
                                <button
                                    onClick={handlePostAsComment}
                                    disabled={isPosting}
                                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                    </svg>
                                    {isPosting ? "Posting..." : "Post as Comment"}
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── Empty state ───────────────────────── */}
            {!data && !isStreaming && !error && (
                <p className="text-sm text-gray-400">
                    Click &ldquo;Suggest Response&rdquo; to generate an AI-drafted reply.
                </p>
            )}
        </div>
    );
}