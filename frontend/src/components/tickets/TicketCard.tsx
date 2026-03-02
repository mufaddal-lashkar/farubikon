"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTicketStore } from "@/store/ticketStore";
import { useRouter } from "next/navigation";
import type { Ticket } from "@/types";

export function TicketCard({ ticket }: { ticket: Ticket }) {
    const { user } = useCurrentUser();
    const { deleteTicket } = useTicketStore();
    const router = useRouter();
    const isOwner = user && ticket.reporterId === user.id;

    const createdAt = new Date(ticket.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this ticket?")) return;
        await deleteTicket(ticket.id);
    };

    return (
        <Link href={`/tickets/${ticket.id}`}>
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-700 transition-colors">
                            {ticket.title}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                            {ticket.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Delete ticket"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            {ticket.reporterName}
                        </span>
                        <span>{createdAt}</span>
                    </div>
                    {ticket.category && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
                            {ticket.category}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}