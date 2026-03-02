const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// The backend always wraps responses in { success, data, message }
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",   // sends session cookie
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(body.message ?? `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const api = {
    tickets: {
        list: (params?: Record<string, string>) => {
            const query = params ? "?" + new URLSearchParams(params).toString() : "";
            return request<{ data: import("@/types").Ticket[]; pagination: { page: number; limit: number; total: number } }>(
                `/tickets${query}`
            );
        },
        get: async (id: string) => {
            const res = await request<ApiResponse<import("@/types").Ticket>>(`/tickets/${id}`);
            return res.data;
        },
        create: async (data: unknown) => {
            const res = await request<ApiResponse<import("@/types").Ticket>>("/tickets", {
                method: "POST",
                body: JSON.stringify(data),
            });
            return res.data;
        },
        update: async (id: string, data: unknown) => {
            const res = await request<ApiResponse<import("@/types").Ticket>>(`/tickets/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            return res.data;
        },
        delete: (id: string) =>
            request<{ success: boolean }>(`/tickets/${id}`, { method: "DELETE" }),
        updateStatus: async (id: string, status: string) => {
            const res = await request<ApiResponse<import("@/types").Ticket>>(`/tickets/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            return res.data;
        },
        classify: (id: string) =>
            request<{ ticket: import("@/types").Ticket; classification: unknown }>(
                `/tickets/${id}/classify`,
                { method: "POST" }
            ),
    },
    comments: {
        list: async (ticketId: string) => {
            const res = await request<ApiResponse<import("@/types").Comment[]>>(`/tickets/${ticketId}/comments`);
            return res.data;
        },
        create: async (ticketId: string, content: string) => {
            const res = await request<ApiResponse<import("@/types").Comment>>(`/tickets/${ticketId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content }),
            });
            return res.data;
        },
    },
};