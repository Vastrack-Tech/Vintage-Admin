"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { Box, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- HOOK ---
const useInventoryStats = () => {
  return useQuery({
    queryKey: ["admin-inventory-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/inventory/stats");
      return data;
    },
  });
};

export function InventoryStats() {
  const { data: stats, isLoading } = useInventoryStats();

  if (isLoading) return <StatsSkeleton />;

  // Map API response to UI Cards
  const cards = [
    {
      label: "Total Products",
      value: stats?.totalProducts?.value || 0,
      trend: stats?.totalProducts?.trend || 0,
      trendDirection: stats?.totalProducts?.trendDirection || "up",
      icon: Box,
      color: "bg-[#DC8404] text-white",
    },
    {
      label: "New Products",
      value: stats?.newProducts?.value || 0,
      trend: stats?.newProducts?.trend || 0,
      trendDirection: stats?.newProducts?.trendDirection || "up",
      icon: ArrowRight,
      color: "bg-[#FFF8E6] text-[#DC8404]",
    },
    {
      label: "Product Sold",
      value: stats?.productsSold?.value || 0,
      trend: stats?.productsSold?.trend || 0,
      trendDirection: stats?.productsSold?.trendDirection || "down",
      icon: ArrowRight,
      color: "bg-[#FFF8E6] text-[#DC8404]",
    },
    {
      label: "Empty Products",
      value: stats?.emptyProducts?.value || 0,
      trend: stats?.emptyProducts?.trend || 0,
      trendDirection: stats?.emptyProducts?.trendDirection || "down",
      icon: ArrowRight,
      color: "bg-[#FFF8E6] text-[#DC8404]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            {/* FIX 1: 'min-w-0' is required for flex children to allow text truncation */}
            <div className="flex flex-col gap-1 min-w-0 flex-1 mr-2">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                {card.label}
              </span>

              {/* FIX 2: 'truncate' cuts off the text with '...' if it gets too long */}
              <h3
                className="text-2xl xl:text-3xl font-bold text-gray-900 truncate w-full"
                title={card.value?.toLocaleString()} // Shows full number on hover
              >
                {card.value?.toLocaleString()}
              </h3>
            </div>

            {/* FIX 3: 'shrink-0' stops the icon from getting squashed */}
            <div className={`p-3 rounded-full shrink-0 ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={
                card.trendDirection === "up" ? "text-green-600" : "text-red-600"
              }
            >
              {card.trendDirection === "up" ? "+" : "-"}
              {card.trend}%
            </span>
            <span className="text-gray-400 whitespace-nowrap">
              Since Last week
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-[20px] h-[140px] border border-gray-100"
        >
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-16 mb-4" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}