"use client";

import { useEffect, useState } from "react";
import { useTicketStore } from "@/store/ticketStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { CommentSection } from "./CommentSection";
import { AiResponseStream } from "@/components/ai/AiResponseStream";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TicketStatus } from "@/types";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
];

export function TicketDetail({ id }: { id: string }) {
    const { selectedTicket, isLoading, error, fetchTicketById, clearError, deleteTicket, updateStatus } =
        useTicketStore();
    const { user } = useCurrentUser();
    const router = useRouter();
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);

    useEffect(() => {
        fetchTicketById(id);
    }, [id]);

    const isOwner = user && selectedTicket?.reporterId === user.id;

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
        await deleteTicket(id);
        router.push("/tickets");
    };

    const handleStatusChange = async (status: TicketStatus) => {
        await updateStatus(id, status);
        setStatusMenuOpen(false);
        // Refresh ticket to get updated data
        fetchTicketById(id);
    };

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-8 animate-pulse space-y-4">
                <div className="h-3 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <p className="text-red-600 mb-4 text-sm">{error}</p>
                <button
                    onClick={() => { clearError(); fetchTicketById(id); }}
                    className="text-indigo-600 font-medium text-sm hover:text-indigo-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────────────────────
    if (!selectedTicket) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">Ticket not found</p>
                <Link href="/tickets" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                    ← Back to tickets
                </Link>
            </div>
        );
    }

    const ticket = selectedTicket;

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Back + Actions */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/tickets" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to tickets
                </Link>
                <div className="flex items-center gap-2">
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="text-sm border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 font-medium transition-all flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Delete
                        </button>
                    )}
                    <Link
                        href={`/tickets/${ticket.id}/edit`}
                        className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 font-medium text-gray-700 transition-all"
                    >
                        Edit
                    </Link>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{ticket.title}</h1>

            {/* Badges + Status Changer */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {isOwner ? (
                    <div className="relative">
                        <button
                            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <StatusBadge status={ticket.status} />
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        {statusMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setStatusMenuOpen(false)} />
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleStatusChange(opt.value)}
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${ticket.status === opt.value ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-gray-700"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <StatusBadge status={ticket.status} />
                )}
                <PriorityBadge priority={ticket.priority} />
                {ticket.category && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                        {ticket.category}
                    </span>
                )}
            </div>

            {/* Ticket body */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {ticket.description}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        {ticket.reporterName} ({ticket.reporterEmail})
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* AI Response Suggestion */}
            <AiResponseStream ticketId={ticket.id} />

            {/* Comments */}
            <CommentSection ticketId={ticket.id} />
        </div>
    );
}