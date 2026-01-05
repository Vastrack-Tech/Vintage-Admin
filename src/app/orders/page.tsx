"use client";
import { OrderStats } from "@/components/admin/orders/OrderStats";
import { OrderTable } from "@/components/admin/orders/OrderTable";

export default function OrdersPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </header>

      <OrderStats />
      <OrderTable />
    </div>
  );
}
