"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTicketStore } from "@/store/ticketStore";
import type { Ticket } from "@/types";

interface TicketFormProps {
    existingTicket?: Ticket;
}

export function TicketForm({ existingTicket }: TicketFormProps) {
    const router = useRouter();
    const { createTicket, updateTicket, isLoading, error, clearError } = useTicketStore();

    const [form, setForm] = useState({
        title: existingTicket?.title ?? "",
        description: existingTicket?.description ?? "",
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (form.title.length < 5)
            errs.title = "Title must be at least 5 characters";
        if (form.title.length > 255)
            errs.title = "Title must be at most 255 characters";
        if (form.description.length < 10)
            errs.description = "Description must be at least 10 characters";

        setValidationErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        clearError();
        if (!validate()) return;

        if (existingTicket) {
            await updateTicket(existingTicket.id, form);
            router.push(`/tickets/${existingTicket.id}`);
        } else {
            const created = await createTicket(form);
            if (created) router.push(`/tickets/${created.id}`);
        }
    };

    const field = (
        label: string,
        key: keyof typeof form,
        type: string = "text",
        multiline = false
    ) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
            </label>
            {multiline ? (
                <textarea
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    rows={5}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm"
                />
            ) : (
                <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm"
                />
            )}
            {validationErrors[key] && (
                <p className="text-red-500 text-xs mt-1.5">{validationErrors[key]}</p>
            )}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-6 py-8">
            {/* Back link */}
            <button
                onClick={() => router.back()}
                className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                {existingTicket ? "Edit Ticket" : "Create New Ticket"}
            </h1>

            <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm space-y-5">
                {field("Title", "title")}
                {field("Description", "description", "text", true)}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3.5">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-3 pt-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                    >
                        {isLoading ? "Saving..." : existingTicket ? "Save Changes" : "Create Ticket"}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}