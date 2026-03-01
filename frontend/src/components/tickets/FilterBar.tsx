"use client";

import { useTicketStore } from "@/store/ticketStore";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

export function FilterBar() {
    const { filters, setFilters } = useTicketStore();

    return (
        <div className="flex flex-wrap gap-3 mb-6">
            {/* Search */}
            <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-50 focus:outline-none focus:border-blue-400"
            />

            {/* Status filter */}
            <select
                value={filters.status ?? ""}
                onChange={(e) => setFilters({ status: e.target.value || null })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                        {s.replace("_", " ")}
                    </option>
                ))}
            </select>

            {/* Priority filter */}
            <select
                value={filters.priority ?? ""}
                onChange={(e) => setFilters({ priority: e.target.value || null })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
                <option value="">All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>
        </div>
    );
}