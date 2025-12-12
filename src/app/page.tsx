"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { useAdminStats } from "@/hooks/useAdmin";
import { Box, ShoppingCart, Receipt, Wallet } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    // 1. Added p-6 (padding) so content never touches the screen edges
    // 2. Added space-y-8 to handle vertical rhythm between Header and Grid
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <AdminHeader />

      {/* - gap-6: Ensures 18px space between cards horizontally AND vertically
         - w-full: Forces grid to use full container width
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        <StatCard
          label="Total Products"
          value={isLoading ? "..." : stats?.totalProducts || 0}
          trend={25}
          icon={<Box size={18} />}
        />
        <StatCard
          label="Total Sales"
          value={isLoading ? "..." : stats?.totalSales || 0}
          trend={25}
          isCurrency
          trendDirection="down"
          icon={<Receipt size={18} />}
        />
        <StatCard
          label="Total Orders"
          value={isLoading ? "..." : stats?.totalOrders || 0}
          trend={12}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="Inventory Value"
          value={isLoading ? "..." : stats?.inventoryValue || 0}
          trend={8}
          isCurrency
          icon={<Wallet size={18} />}
        />
      </div>

      {/* Placeholder for Charts (spaced automatically by gap-6 if added to grid or margin-top) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[20px] h-[400px] flex items-center justify-center text-black border border-gray-100 shadow-sm">
          Sales Chart Placeholder
        </div>
        <div className="bg-white rounded-[20px] h-[400px] flex items-center justify-center text-black border border-gray-100 shadow-sm">
          Low Stock Placeholder
        </div>
      </div>
    </div>
  );
}
