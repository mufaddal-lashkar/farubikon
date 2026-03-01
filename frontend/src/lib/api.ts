const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
        get: (id: string) =>
            request<import("@/types").Ticket>(`/tickets/${id}`),
        create: (data: unknown) =>
            request<import("@/types").Ticket>("/tickets", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        update: (id: string, data: unknown) =>
            request<import("@/types").Ticket>(`/tickets/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            request<{ success: boolean }>(`/tickets/${id}`, { method: "DELETE" }),
        updateStatus: (id: string, status: string) =>
            request<import("@/types").Ticket>(`/tickets/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            }),
        classify: (id: string) =>
            request<{ ticket: import("@/types").Ticket; classification: unknown }>(
                `/tickets/${id}/classify`,
                { method: "POST" }
            ),
    },
    comments: {
        list: (ticketId: string) =>
            request<import("@/types").Comment[]>(`/tickets/${ticketId}/comments`),
        create: (ticketId: string, content: string) =>
            request<import("@/types").Comment>(`/tickets/${ticketId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content }),
            }),
    },
};