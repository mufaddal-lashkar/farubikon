import Link from "next/link";

export default function Home() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
            <div className="text-center max-w-lg">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                    AI-Powered Ticket System
                </h1>
                <p className="text-gray-500 mb-8 text-base leading-relaxed">
                    Manage support tickets with intelligent classification, priority detection, and AI-suggested responses — all multi-tenant ready.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                    >
                        Get Started
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
