"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession().then(({ data }) => {
            if (data?.user) {
                setUser({ name: data.user.name, email: data.user.email });
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await authClient.signOut();
        setUser(null);
        router.push("/login");
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <a href="/tickets" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-800 text-sm tracking-tight">Farubikon</span>
                </a>

                <div className="flex items-center gap-4">

                    {loading ? (
                        <div className="w-16 h-8 bg-gray-100 rounded-lg animate-pulse" />
                    ) : user ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-indigo-700">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-600 font-medium hidden sm:inline">
                                    {user.name}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-400 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Login
                        </a>
                    )}
                </div>
            </div>
        </nav>
    );
}
