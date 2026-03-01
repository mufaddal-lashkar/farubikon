import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Ticket System",
  description: "Multi-tenant AI-powered support tickets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 mb-2">
          <a href="/tickets" className="text-blue-600 font-medium text-sm">
            Support Tickets
          </a>
        </nav>
        {children}
      </body>
    </html>
  );
}