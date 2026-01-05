"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axiosInstance";

// Types
export interface InventoryStat {
  label: string;
  value: number;
  trend: number;
  trendDirection: "up" | "down";
}

export interface InventoryStatsData {
  totalProducts: InventoryStat;
  newProducts: InventoryStat;
  productsSold: InventoryStat;
  emptyProducts: InventoryStat;
}

export const useInventory = (
  params: { page: number; limit?: number; search?: string; status?: string } = {
    page: 1,
  }
) => {
  return useQuery({
    queryKey: ["admin-inventory", params],
    queryFn: async () => {
      const { data } = await api.get("/admin/inventory", { params });
      return data;
    },
  });
};

export const useAdminProduct = (id: string | null) => {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/inventory/${id}`);
      return data;
    },
    enabled: !!id, // Only run if ID exists
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete(`/admin/inventory/${productId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ["admin-inventory-stats"],
    queryFn: async () => {
      // Mocking the response structure based on your design
      // You would implement GET /admin/inventory/stats on backend
      return {
        totalProducts: {
          label: "Total Products",
          value: 25049,
          trend: 2.5,
          trendDirection: "up",
        },
        newProducts: {
          label: "New Products",
          value: 5049,
          trend: 2.5,
          trendDirection: "up",
        },
        productsSold: {
          label: "Product Sold",
          value: 5,
          trend: 1.5,
          trendDirection: "up",
        },
        emptyProducts: {
          label: "Empty Products",
          value: 323,
          trend: 7.5,
          trendDirection: "up",
        },
      } as InventoryStatsData;
    },
  });
};

// export const useDeleteProduct = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (productId: string) => {
//       const { data } = await api.delete(`/admin/inventory/${productId}`);
//       return data;
//     },
//     onSuccess: () => {
//       toast.success("Product deleted successfully");
//       queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || "Failed to delete product");
//     },
//   });
// };
