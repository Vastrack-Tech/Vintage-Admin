"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";
import { Box, ArrowRight, Ban, TrendingUp } from "lucide-react"; // Import Ban icon
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface InventoryStatsProps {
  currentView: InventoryView;
  onViewChange: (view: InventoryView) => void;
}

export type InventoryView = 'all' | 'sold' | 'empty';

const useInventoryStats = () => {
  return useQuery({
    queryKey: ["admin-inventory-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/inventory/stats");
      return data;
    },
  });
};

export function InventoryStats({ currentView, onViewChange }: InventoryStatsProps) {
  const { data: stats, isLoading } = useInventoryStats();

  if (isLoading) return <StatsSkeleton />;

  const cards = [
    {
      id: 'all',
      label: "Total Products",
      value: stats?.totalProducts?.value || 0,
      icon: Box,
      // Default color logic
      activeColor: "border-[#DC8404] bg-orange-50/50 ring-1 ring-[#DC8404]",
      iconBg: "bg-[#DC8404] text-white",
    },
    {
      id: 'sold',
      label: "Products Sold",
      value: stats?.productsSold?.value || 0,
      icon: TrendingUp,
      activeColor: "border-[#DC8404] bg-orange-50/50 ring-1 ring-[#DC8404]",
      iconBg: "bg-[#FFF8E6] text-[#DC8404]",
    },
    {
      id: 'empty',
      label: "Empty Products",
      value: stats?.emptyProducts?.value || 0,
      icon: Ban,
      activeColor: "border-[#DC8404] bg-orange-50/50 ring-1 ring-[#DC8404]",
      iconBg: "bg-[#FFF8E6] text-[#DC8404]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => {
        const isActive = currentView === card.id;

        return (
          <div
            key={i}
            onClick={() => onViewChange(card.id as InventoryView)}
            className={cn(
              "bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 relative overflow-hidden cursor-pointer transition-all hover:shadow-md",
              isActive ? card.activeColor : "hover:border-orange-200"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1 min-w-0 flex-1 mr-2">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                  {card.label}
                </span>
                <h3
                  className="text-2xl xl:text-3xl font-bold text-gray-900 truncate w-full"
                  title={card.value?.toLocaleString()}
                >
                  {card.value?.toLocaleString()}
                </h3>
              </div>
              <div className={cn("p-3 rounded-full shrink-0", card.iconBg)}>
                <card.icon size={20} />
              </div>
            </div>

            {/* Visual Indicator for Active View */}
            {isActive && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#DC8404]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ... skeleton remains same
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