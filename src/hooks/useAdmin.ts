"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

export const useAdminStats = () => {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const { data } = await api.get("/admin/dashboard/summary");
            return data;
        },
    });
};