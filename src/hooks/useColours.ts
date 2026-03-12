"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";

export const useGlobalColors = () => {
    return useQuery({
        queryKey: ["global-colors"],
        queryFn: async () => {
            const { data } = await api.get("/admin/colors");
            return data;
        },
    });
};

export const useAddGlobalColor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { name: string; hexCode?: string; imageUrl?: string }) => {
            const { data } = await api.post("/admin/colors", payload);
            return data;
        },
        onSuccess: () => {
            toast.success("Color added to global palette!");
            queryClient.invalidateQueries({ queryKey: ["global-colors"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add color");
        },
    });
};

export const useDeleteGlobalColor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/admin/colors/${id}`);
            return data;
        },
        onSuccess: () => {
            toast.success("Color removed from palette");
            queryClient.invalidateQueries({ queryKey: ["global-colors"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete color");
        },
    });
};