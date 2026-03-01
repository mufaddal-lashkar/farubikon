import { TicketDetail } from "@/components/tickets/TicketDetail";

export default function TicketDetailPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <TicketDetail id={params.id} />
        </main>
    );
}