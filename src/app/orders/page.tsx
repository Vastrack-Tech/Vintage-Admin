"use client";
import { OrderStats } from "@/components/admin/orders/OrderStats";
import { OrderTable } from "@/components/admin/orders/OrderTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Button className="bg-[#DC8404] hover:bg-[#b86e03] text-white rounded-xl gap-2">
          <Plus size={18} /> Create Order
        </Button>
      </header>

      <OrderStats />
      <OrderTable />
    </div>
  );
}
