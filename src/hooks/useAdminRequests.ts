"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { toast } from "sonner";

export type RequestStatus = 'new' | 'contacted' | 'resolved';

export type ContactRequest = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    request: string;
    status: RequestStatus;
    createdAt: string;
};

interface RequestFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

// 1. GET ALL REQUESTS
export const useAdminRequests = (filters: RequestFilters) => {
    return useQuery({
        queryKey: ["admin-requests", filters],
        queryFn: async () => {
            const { data } = await api.get("/admin/requests", { params: filters });
            return data;
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

// 2. UPDATE STATUS
export const useUpdateRequestStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
            const { data } = await api.patch(`/admin/requests/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
        onError: () => toast.error("Failed to update status"),
    });
};

// 3. DELETE REQUEST
export const useDeleteRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/requests/${id}`);
        },
        onSuccess: () => {
            toast.success("Request deleted");
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
        onError: () => toast.error("Failed to delete request"),
    });
};