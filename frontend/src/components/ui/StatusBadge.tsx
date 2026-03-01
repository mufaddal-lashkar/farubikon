import { cn } from "@/lib/utils";
import type { TicketStatus, TicketPriority } from "@/types";

const statusStyles: Record<TicketStatus, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-600",
};

const priorityStyles: Record<TicketPriority, string> = {
    low: "bg-gray-100 text-gray-500",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
    critical: "bg-red-200 text-red-900 font-bold",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
    return (
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusStyles[status])}>
            {status.replace("_", " ")}
        </span>
    );
}

export function PriorityBadge({ priority }: { priority: TicketPriority | null }) {
    if (!priority) {
        return (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-400">
                unclassified
            </span>
        );
    }

    return (
        <span className={cn("px-2 py-1 rounded-full text-xs", priorityStyles[priority])}>
            {priority}
        </span>
    );
}