"use client";

import { useState } from "react";
import { Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { StatusModal } from "./StatusModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OrderTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminOrders({ page });

  // Status Update State
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    newStatus: string;
  } | null>(null);
  const updateMutation = useUpdateOrderStatus();

  const handleStatusClick = (id: string, newStatus: string) => {
    setSelectedOrder({ id, newStatus });
  };

  const confirmUpdate = () => {
    if (!selectedOrder) return;
    updateMutation.mutate(
      { id: selectedOrder.id, status: selectedOrder.newStatus },
      { onSuccess: () => setSelectedOrder(null) }
    );
  };

  const orders = data?.data || [];

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Order Log</h3>
        <div className="flex gap-3">
          {/* You can reuse your Filter button/component here */}
          <Button variant="outline" className="gap-2">
            <Filter size={16} /> Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="p-6">Order ID</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Date</th>
              <th className="p-6">Items</th>
              <th className="p-6">Total</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50/50">
                <td className="p-6 font-medium text-gray-900">{order.id}</td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {order.user?.firstName} {order.user?.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {order.user?.email}
                    </span>
                  </div>
                </td>
                <td className="p-6 text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-6 text-gray-600">{order.itemCount}</td>
                <td className="p-6 font-medium">
                  ₦{Number(order.totalAmountNgn).toLocaleString()}
                </td>
                <td className="p-6">
                  <StatusBadge status={order.status} />
                </td>
                <td className="p-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleStatusClick(order.id, "paid")}
                      >
                        Mark Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusClick(order.id, "shipped")}
                      >
                        Mark Shipped
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusClick(order.id, "delivered")}
                      >
                        Mark Delivered
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleStatusClick(order.id, "cancelled")}
                        className="text-red-600"
                      >
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedOrder && (
        <StatusModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={confirmUpdate}
          isLoading={updateMutation.isPending}
          status={selectedOrder.newStatus}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    in_transit: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium capitalize",
        styles[status] || styles.pending
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
