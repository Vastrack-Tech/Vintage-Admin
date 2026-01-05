"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";

export const useAdminOrders = (params?: any) => {
    return useQuery({
        queryKey: ["admin-orders", params],
        queryFn: async () => {
            const { data } = await api.get("/admin/orders", { params });
            return data;
        },
    });
};

export const useOrderStats = () => {
    return useQuery({
        queryKey: ["admin-order-stats"],
        queryFn: async () => (await api.get("/admin/orders/stats")).data,
    });
};

export const useAdminOrder = (id: string | null) => {
    return useQuery({
        queryKey: ["admin-order", id],
        queryFn: async () => {
            const { data } = await api.get(`/admin/orders/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return api.patch(`/admin/orders/${id}/status`, { status });
        },
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
        onError: () => toast.error("Failed to update status"),
    });
};