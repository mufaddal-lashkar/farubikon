"use client";

import { useEffect } from "react";
import { useTicketStore } from "@/store/ticketStore";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { CommentSection } from "./CommentSection";
import { AiResponseStream } from "@/components/ai/AiResponseStream";
import Link from "next/link";

export function TicketDetail({ id }: { id: string }) {
    const { selectedTicket, isLoading, error, fetchTicketById, clearError } =
        useTicketStore();

    useEffect(() => {
        fetchTicketById(id);
    }, [id]);

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="max-w-3xl mx-auto text-center py-16">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => { clearError(); fetchTicketById(id); }}
                    className="text-blue-600 underline text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    // ── Empty / Not found state ────────────────────────────────────────────
    if (!selectedTicket) {
        return (
            <div className="max-w-3xl mx-auto text-center py-16 text-gray-400">
                <p>Ticket not found.</p>
                <Link href="/tickets" className="text-blue-600 underline text-sm mt-2 block">
                    Back to tickets
                </Link>
            </div>
        );
    }

    // ── Success state ──────────────────────────────────────────────────────
    const ticket = selectedTicket;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <Link href="/tickets" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
                        ← Back to tickets
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">{ticket.title}</h1>
                </div>
                <Link
                    href={`/tickets/${ticket.id}/edit`}
                    className="text-sm border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50"
                >
                    Edit
                </Link>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 mb-4">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                {ticket.category && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                        {ticket.category}
                    </span>
                )}
            </div>

            {/* Ticket body */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex gap-6">
                    <span>Reporter: {ticket.reporterName} ({ticket.reporterEmail})</span>
                    <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
            </div>

            {/* AI Response Suggestion */}
            <AiResponseStream ticketId={ticket.id} />

            {/* Comments */}
            <CommentSection ticketId={ticket.id} />
        </div>
    );
}