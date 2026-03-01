"use client";

import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/ui/StatusBadge";
import type { Ticket } from "@/types";

export function TicketCard({ ticket }: { ticket: Ticket }) {
    const createdAt = new Date(ticket.createdAt).toLocaleDateString();

    return (
        <Link href={`/tickets/${ticket.id}`}>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-sm transition-all bg-white cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {ticket.title}
                    </h3>
                    <div className="flex gap-2">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                </div>

                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                    {ticket.description}
                </p>

                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>{ticket.reporterName}</span>
                    <span>{createdAt}</span>
                </div>

                {ticket.category && (
                    <div className="mt-2">
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                            {ticket.category}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}