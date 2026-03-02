import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";

export const metadata: Metadata = {
    title: "Farubikon — AI Support Tickets",
    description: "Multi-tenant AI-powered support ticket system",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-[#f8f9fb] text-gray-900 antialiased">
                <Navbar />
                <main className="min-h-[calc(100vh-3.5rem)]">
                    {children}
                </main>
            </body>
        </html>
    );
}