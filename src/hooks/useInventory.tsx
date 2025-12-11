"use client";

import { useQuery } from "@tanstack/react-query";
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
  params: { page: number; limit?: number; search?: string; status?: string } = { page: 1 }
) => {
  return useQuery({
    queryKey: ["admin-inventory", params],
    queryFn: async () => {
      // In real app: GET /admin/inventory?page=1&search=...
      const { data } = await api.get("/admin/inventory", { params });
      return data;
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
