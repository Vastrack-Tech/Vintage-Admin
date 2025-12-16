"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";

export const useAdminCategories = (params?: any) => {
    return useQuery({
        queryKey: ["admin-categories-table", params],
        queryFn: async () => {
            const { data } = await api.get("/admin/categories", { params });
            return data;
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => api.post("/admin/categories", data),
        onSuccess: () => {
            toast.success("Category created successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-categories-table"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create"),
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) =>
            api.patch(`/admin/categories/${id}`, data),
        onSuccess: () => {
            toast.success("Category updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-categories-table"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update"),
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => api.delete(`/admin/categories/${id}`),
        onSuccess: () => {
            toast.success("Category deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-categories-table"] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
    });
};