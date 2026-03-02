"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface CurrentUser {
    id: string;
    name: string;
    email: string;
}

export function useCurrentUser() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession().then(({ data }) => {
            if (data?.user) {
                setUser({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                });
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return { user, loading };
}
