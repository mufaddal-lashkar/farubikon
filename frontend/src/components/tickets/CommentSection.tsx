"use client";

import { useState } from "react";
import { useTicketStore } from "@/store/ticketStore";
import { api } from "@/lib/api";
import type { Comment } from "@/types";

export function CommentSection({ ticketId }: { ticketId: string }) {
    const { comments, fetchTicketById } = useTicketStore();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await api.comments.create(ticketId, content);
            setContent("");
            await fetchTicketById(ticketId);
        } catch (err) {
            setSubmitError(
                err instanceof Error ? err.message : "Failed to post comment"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Comments ({comments.length})
            </h3>

            {/* ── Empty state ─────────────────────────── */}
            {comments.length === 0 && (
                <p className="text-sm text-gray-400 mb-4">
                    No comments yet. Be the first to respond.
                </p>
            )}

            {/* ── Comment list ────────────────────────── */}
            <div className="space-y-3 mb-5">
                {comments.map((comment: Comment) => (
                    <div
                        key={comment.id}
                        className={`rounded-xl p-4 text-sm ${comment.isAiGenerated
                            ? "bg-indigo-50 border border-indigo-100"
                            : "bg-white border border-gray-200"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
                            <span className="font-medium">
                                {comment.isAiGenerated ? (
                                    <span className="text-indigo-600">🤖 AI Generated</span>
                                ) : (
                                    `User ${comment.authorId.slice(0, 8)}`
                                )}
                            </span>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    </div>
                ))}
            </div>

            {/* ── Add comment ─────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full text-sm focus:outline-none resize-none bg-transparent"
                />
                {submitError && (
                    <p className="text-red-500 text-xs mb-2">{submitError}</p>
                )}
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="bg-indigo-600 text-white px-5 py-2 text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all"
                    >
                        {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </div>
        </div>
    );
}