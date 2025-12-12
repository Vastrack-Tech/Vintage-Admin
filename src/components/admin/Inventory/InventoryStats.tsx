"use client";

import { useInventoryStats } from "@/hooks/useInventory";
import { Box, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function InventoryStats() {
  const { data: stats, isLoading } = useInventoryStats();

  if (isLoading) return <StatsSkeleton />;

  const cards = [
    { ...stats?.totalProducts, icon: Box, color: "bg-[#DC8404] text-black" },
    {
      ...stats?.newProducts,
      icon: ArrowRight,
      color: "bg-[#FFF8E6] text-[#DC8404]",
    },
    {
      ...stats?.productsSold,
      icon: ArrowRight,
      color: "bg-[#FFF8E6] text-[#DC8404]",
    },
    {
      ...stats?.emptyProducts,
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
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-black">
                {card.label}
              </span>
              <h3 className="text-3xl font-bold text-black">
                {card.value?.toLocaleString()}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
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
            <span className="text-black">Since Last week</span>
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
