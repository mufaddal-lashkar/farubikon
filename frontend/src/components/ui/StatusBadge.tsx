import { cn } from "@/lib/utils";
import type { TicketStatus, TicketPriority } from "@/types";

const statusStyles: Record<TicketStatus, string> = {
    open: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    in_progress: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    closed: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
};

const priorityStyles: Record<TicketPriority, string> = {
    low: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200",
    medium: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    high: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    critical: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-300 font-bold",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium capitalize", statusStyles[status])}>
            {status.replace("_", " ")}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority: TicketPriority | null }) {
    if (!priority) {
        return (
            <span className="px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-400 ring-1 ring-inset ring-gray-200">
                unclassified
            </span>
        );
    }

    return (
        <span className={cn("px-2.5 py-1 rounded-full text-xs capitalize", priorityStyles[priority])}>
            {priority}
        </span>
    );
}