"use client";

import { useEffect } from "react";
import { useTicketStore } from "@/store/ticketStore";
import { TicketCard } from "./TicketCard";
import { FilterBar } from "./FilterBar";
import Link from "next/link";

export function TicketList() {
    const {
        tickets,
        isLoading,
        error,
        pagination,
        fetchTickets,
        setPage,
        clearError,
    } = useTicketStore();

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
                <Link
                    href="/tickets/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                    + New Ticket
                </Link>
            </div>

            <FilterBar />

            {/* ── Loading state ───────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="border border-gray-100 rounded-lg p-4 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Error state ─────────────────────────────────────── */}
            {!isLoading && error && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <button
                        onClick={() => { clearError(); fetchTickets(); }}
                        className="text-sm text-red-600 underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* ── Empty state ─────────────────────────────────────── */}
            {!isLoading && !error && tickets.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg mb-2">No tickets found</p>
                    <p className="text-sm mb-4">Try adjusting your filters or create a new ticket.</p>
                    <Link
                        href="/tickets/new"
                        className="text-blue-600 text-sm underline hover:no-underline"
                    >
                        Create your first ticket
                    </Link>
                </div>
            )}

            {/* ── Success state ───────────────────────────────────── */}
            {!isLoading && !error && tickets.length > 0 && (
                <>
                    <div className="space-y-3">
                        {tickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
                        <span>
                            Showing {tickets.length} of {pagination.total} tickets
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPage(pagination.page - 1)}
                                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1">Page {pagination.page}</span>
                            <button
                                disabled={tickets.length < pagination.limit}
                                onClick={() => setPage(pagination.page + 1)}
                                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}