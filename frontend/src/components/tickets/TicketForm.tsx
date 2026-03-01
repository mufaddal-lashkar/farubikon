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
        reporterName: existingTicket?.reporterName ?? "",
        reporterEmail: existingTicket?.reporterEmail ?? "",
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
        if (!form.reporterName.trim())
            errs.reporterName = "Reporter name is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporterEmail))
            errs.reporterEmail = "Enter a valid email address";

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            {multiline ? (
                <textarea
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    rows={5}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
            ) : (
                <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
            )}
            {validationErrors[key] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors[key]}</p>
            )}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {existingTicket ? "Edit Ticket" : "Create New Ticket"}
            </h1>

            <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
                {field("Title", "title")}
                {field("Description", "description", "text", true)}
                {field("Reporter Name", "reporterName")}
                {field("Reporter Email", "reporterEmail", "email")}

                {error && (
                    <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
                        {error}
                    </p>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? "Saving..." : existingTicket ? "Save Changes" : "Create Ticket"}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}