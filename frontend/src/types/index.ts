export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type CommentTone = "professional" | "friendly" | "formal";

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority | null;
    category: string | null;
    reporterName: string;
    reporterEmail: string;
    reporterId: string | null;
    assigneeId: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    ticketId: string;
    content: string;
    authorId: string;
    isAiGenerated: boolean;
    organizationId: string;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface ApiError {
    message: string;
}