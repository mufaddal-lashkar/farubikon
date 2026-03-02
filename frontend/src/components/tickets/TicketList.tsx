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
        <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Tickets</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all support requests</p>
                </div>
                <Link
                    href="/tickets/new"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Ticket
                </Link>
            </div>

            {/* Filters */}
            <FilterBar />

            {/* ── Loading state ───────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Error state ─────────────────────────────────────── */}
            {!isLoading && error && (
                <div className="bg-white border border-red-200 rounded-xl p-6 text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                    </div>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <button
                        onClick={() => { clearError(); fetchTickets(); }}
                        className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* ── Empty state ─────────────────────────────────────── */}
            {!isLoading && !error && tickets.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                        </svg>
                    </div>
                    <p className="text-gray-900 font-medium mb-1">No tickets yet</p>
                    <p className="text-sm text-gray-500 mb-5">Get started by creating your first ticket</p>
                    <Link
                        href="/tickets/new"
                        className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create a ticket
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
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                            Showing <strong className="text-gray-900">{tickets.length}</strong> of <strong className="text-gray-900">{pagination.total}</strong> tickets
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPage(pagination.page - 1)}
                                className="px-3.5 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700"
                            >
                                Previous
                            </button>
                            <span className="px-3.5 py-1.5 text-sm text-gray-500">Page {pagination.page}</span>
                            <button
                                disabled={tickets.length < pagination.limit}
                                onClick={() => setPage(pagination.page + 1)}
                                className="px-3.5 py-1.5 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700"
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