import { TicketDetail } from "@/components/tickets/TicketDetail";

export default async function TicketDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <TicketDetail id={id} />
        </main>
    );
}