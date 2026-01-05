"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

export const useCustomers = (params?: any) => {
    return useQuery({
        queryKey: ["admin-customers", params],
        queryFn: async () => {
            const { data } = await api.get("/admin/customers", { params });
            return data;
        },
    });
};