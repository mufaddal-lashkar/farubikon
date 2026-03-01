import { create } from "zustand";
import { api } from "@/lib/api";
import type { Ticket, Comment, TicketStatus } from "@/types";

// ── State interface ────────────────────────────────────────────────────────
interface TicketFilters {
    status: string | null;
    priority: string | null;
    search: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
}

interface TicketState {
    // State
    tickets: Ticket[];
    selectedTicket: Ticket | null;
    comments: Comment[];
    isLoading: boolean;
    error: string | null;
    filters: TicketFilters;
    pagination: Pagination;

    // Actions
    fetchTickets: () => Promise<void>;
    fetchTicketById: (id: string) => Promise<void>;
    createTicket: (data: unknown) => Promise<Ticket | null>;
    updateTicket: (id: string, data: unknown) => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
    updateStatus: (id: string, status: TicketStatus) => Promise<void>;
    setFilters: (filters: Partial<TicketFilters>) => void;
    setPage: (page: number) => void;
    clearError: () => void;
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useTicketStore = create<TicketState>((set, get) => ({
    // ── Initial state ────────────────────────────────────────────────────────
    tickets: [],
    selectedTicket: null,
    comments: [],
    isLoading: false,
    error: null,
    filters: {
        status: null,
        priority: null,
        search: "",
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
    },

    // ── Actions ──────────────────────────────────────────────────────────────

    fetchTickets: async () => {
        set({ isLoading: true, error: null });

        try {
            const { filters, pagination } = get();

            // Build query params — only include non-empty values
            const params: Record<string, string> = {
                page: String(pagination.page),
                limit: String(pagination.limit),
            };
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;

            const result = await api.tickets.list(params);

            set({
                tickets: result.data,
                pagination: { ...pagination, total: result.pagination.total },
                isLoading: false,
            });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to load tickets",
                isLoading: false,
            });
        }
    },

    fetchTicketById: async (id: string) => {
        set({ isLoading: true, error: null, selectedTicket: null, comments: [] });

        try {
            const [ticket, comments] = await Promise.all([
                api.tickets.get(id),
                api.comments.list(id),
            ]);

            set({ selectedTicket: ticket, comments, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to load ticket",
                isLoading: false,
            });
        }
    },

    createTicket: async (data: unknown) => {
        set({ isLoading: true, error: null });

        try {
            const newTicket = await api.tickets.create(data);

            // Add to top of list without refetching
            set((state) => ({
                tickets: [newTicket, ...state.tickets],
                isLoading: false,
            }));

            return newTicket;
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to create ticket",
                isLoading: false,
            });
            return null;
        }
    },

    updateTicket: async (id: string, data: unknown) => {
        set({ isLoading: true, error: null });

        try {
            const updated = await api.tickets.update(id, data);

            // Update in list and selectedTicket if it matches
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
                selectedTicket: state.selectedTicket?.id === id ? updated : state.selectedTicket,
                isLoading: false,
            }));
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to update ticket",
                isLoading: false,
            });
        }
    },

    deleteTicket: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
            await api.tickets.delete(id);

            set((state) => ({
                tickets: state.tickets.filter((t) => t.id !== id),
                isLoading: false,
            }));
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to delete ticket",
                isLoading: false,
            });
        }
    },

    updateStatus: async (id: string, status: TicketStatus) => {
        set({ error: null });

        try {
            const updated = await api.tickets.updateStatus(id, status);

            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
                selectedTicket: state.selectedTicket?.id === id ? updated : state.selectedTicket,
            }));
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : "Failed to update status",
            });
        }
    },

    setFilters: (newFilters: Partial<TicketFilters>) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 }, // reset to page 1 on filter change
        }));
        get().fetchTickets();
    },

    setPage: (page: number) => {
        set((state) => ({
            pagination: { ...state.pagination, page },
        }));
        get().fetchTickets();
    },

    clearError: () => set({ error: null }),
}));