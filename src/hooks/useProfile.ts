"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type Profile = {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
};

export const useProfile = () => {
    const router = useRouter();

    const query = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data } = await api.get("/auth/profile");
            return data.user as Profile;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: false,
    });

    // Optional: Auto-redirect if not admin (Can also be done in Layout)
    useEffect(() => {
        if (!query.isLoading && !query.data) {
            // Not logged in
            // router.push('/login');
        }
    }, [query.data, query.isLoading, router]);

    return query;
};