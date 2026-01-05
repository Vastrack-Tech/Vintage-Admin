"use client";
import { useOrderStats } from "@/hooks/useAdminOrders";
import { ShoppingCart, DollarSign, Clock, CheckCircle } from "lucide-react";

export function OrderStats() {
  const { data: stats, isLoading } = useOrderStats();

  if (isLoading)
    return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-[20px] border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium">{c.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {c.value || 0}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${c.color} text-white`}>
            <c.icon size={20} />
          </div>
        </div>
      ))}
    </div>
  );
}
