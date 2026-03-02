"use client";

import { useTicketStore } from "@/store/ticketStore";

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"];

export function FilterBar() {
    const { filters, setFilters } = useTicketStore();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        value={filters.search}
                        onChange={(e) => setFilters({ search: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                    />
                </div>

                {/* Status filter */}
                <select
                    value={filters.status ?? ""}
                    onChange={(e) => setFilters({ status: e.target.value || null })}
                    className="px-3 py-2 rounded-lg text-sm min-w-[140px]"
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
                    className="px-3 py-2 rounded-lg text-sm min-w-[140px]"
                >
                    <option value="">All Priorities</option>
                    {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}