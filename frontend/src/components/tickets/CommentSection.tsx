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
            await fetchTicketById(ticketId); // refresh comments
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
            <h3 className="font-medium text-gray-900 mb-3">
                Comments ({comments.length})
            </h3>

            {/* ── Empty state ─────────────────────────── */}
            {comments.length === 0 && (
                <p className="text-sm text-gray-400 italic mb-4">
                    No comments yet. Be the first to respond.
                </p>
            )}

            {/* ── Comment list ────────────────────────── */}
            <div className="space-y-3 mb-4">
                {comments.map((comment: Comment) => (
                    <div
                        key={comment.id}
                        className={`rounded-lg p-3 text-sm ${comment.isAiGenerated
                                ? "bg-purple-50 border border-purple-100"
                                : "bg-gray-50 border border-gray-100"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1 text-xs text-gray-400">
                            <span>
                                {comment.isAiGenerated ? "🤖 AI Generated" : `User ${comment.authorId.slice(0, 8)}`}
                            </span>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}
            </div>

            {/* ── Add comment ─────────────────────────── */}
            <div className="border border-gray-200 rounded-lg p-3">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full text-sm focus:outline-none resize-none"
                />
                {submitError && (
                    <p className="text-red-500 text-xs mb-2">{submitError}</p>
                )}
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                </div>
            </div>
        </div>
    );
}