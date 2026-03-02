"use client";

import { useEffect, use } from "react";
import { useTicketStore } from "@/store/ticketStore";
import { TicketForm } from "@/components/tickets/TicketForm";

export default function EditTicketPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { selectedTicket, fetchTicketById, isLoading } = useTicketStore();

    useEffect(() => {
        fetchTicketById(id);
    }, [id]);

    if (isLoading) {
        return (
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="animate-pulse h-64 bg-gray-100 rounded" />
            </main>
        );
    }

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            {selectedTicket ? (
                <TicketForm existingTicket={selectedTicket} />
            ) : (
                <p className="text-gray-400">Ticket not found.</p>
            )}
        </main>
    );
}