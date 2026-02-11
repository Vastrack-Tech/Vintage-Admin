"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { useAdminStats } from "@/hooks/useAdmin";
import { Box, ShoppingCart, Receipt, Wallet } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <AdminHeader />

      {/* Grid Logic:
        - grid-cols-1: 1 card per line on mobile
        - md:grid-cols-2: 2 cards per line on medium screens and up
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <StatCard
          label="Total Products"
          value={isLoading ? "..." : stats?.totalProducts || 0}
          icon={<Box size={18} />}
        />
        <StatCard
          label="Total Sales"
          value={isLoading ? "..." : stats?.totalSales || 0}
          isCurrency
          icon={<Receipt size={18} />}
        />
        <StatCard
          label="Total Orders"
          value={isLoading ? "..." : stats?.totalOrders || 0}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="Inventory Value"
          value={isLoading ? "..." : stats?.inventoryValue || 0}
          isCurrency
          icon={<Wallet size={18} />}
        />
      </div>
    </div>
  );
}