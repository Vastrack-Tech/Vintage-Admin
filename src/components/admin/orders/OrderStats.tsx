"use client";

import { useOrderStats } from "@/hooks/useAdminOrders";
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderStats() {
  const { data: stats, isLoading } = useOrderStats();

  if (isLoading) return <StatsSkeleton />;

  const cards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders,
      icon: ShoppingCart,
      color: "bg-[#DC8404]",
    },
    {
      label: "Order Value",
      value: `₦${stats?.totalSales?.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-[#DC8404]",
    },
    {
      label: "Pending",
      value: stats?.pendingOrders,
      icon: Clock,
      color: "bg-[#DC8404]",
    },
    {
      label: "Fulfilled",
      value: stats?.completedOrders,
      icon: CheckCircle,
      color: "bg-[#DC8404]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-[20px] border border-gray-100 flex flex-col"
        >
          {/* Top Row: Label on Left, Icon on Right */}
          <div className="flex justify-between items-start w-full">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mt-1">
              {c.label}
            </p>
            {/* Smaller Icon (p-2, size-16) */}
            <div className={`p-2 rounded-full ${c.color} text-white shrink-0 shadow-sm`}>
              <c.icon size={16} />
            </div>
          </div>

          {/* Bottom Row: Value on new line, smaller text */}
          <h3 className="text-xl font-bold text-gray-900 mt-2">
            {c.value || 0}
          </h3>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-[20px] border border-gray-100 h-[100px]">
          <div className="flex justify-between items-start">
            <Skeleton className="h-3 w-20 mt-1" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-6 w-24 mt-3" />
        </div>
      ))}
    </div>
  );
}