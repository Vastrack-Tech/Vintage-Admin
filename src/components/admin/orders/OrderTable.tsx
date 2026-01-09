"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminOrders";
import { StatusModal } from "./StatusModal";
import { OrderFilter, OrderFilterValues } from "./OrderFilters";
import { OrderDetailsModal } from "./OrderDetailsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function OrderTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<OrderFilterValues>({});
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    newStatus: string;
  } | null>(null);


  const { data, isLoading } = useAdminOrders({
    page,
    limit: 10,
    search: debouncedSearch,
    ...filters,
  });
  const updateMutation = useUpdateOrderStatus();

  // Handlers
  const handleStatusClick = (id: string, newStatus: string) =>
    setSelectedOrder({ id, newStatus });

  const confirmUpdate = () => {
    if (!selectedOrder) return;
    updateMutation.mutate(
      { id: selectedOrder.id, status: selectedOrder.newStatus },
      { onSuccess: () => setSelectedOrder(null) }
    );
  };

  const handleApplyFilter = (newFilters: OrderFilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on filter
  };

  const orders = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER: Search & Actions */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">Order Log</h3>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
            <input
              type="text"
              placeholder="Search Order ID or Customer..."
              value={search} // Controlled input uses raw state
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#DC8404] outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* FILTER POPUP */}
          <OrderFilter onApply={handleApplyFilter} />

          {/* EXPORT */}
          <Button
            variant="outline"
            className="gap-2 border-orange-200 text-[#DC8404] hover:bg-orange-50 rounded-lg"
          >
            <Download size={16} /> Download
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto min-h-[400px]">
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setViewOrderId(order.id)}
                >
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
                  <td className="p-6 text-gray-600 font-medium">
                    ₦{Number(order.totalAmountNgn).toLocaleString()}
                  </td>
                  <td className="p-6">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-6 text-gray-600 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusClick(order.id, "paid"); }}>
                           Mark Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusClick(order.id, "shipped")}
                        >
                          Mark Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusClick(order.id, "delivered")
                          }
                        >
                          Mark Delivered
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusClick(order.id, "cancelled")
                          }
                          className="text-red-600"
                        >
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="p-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>Total Items {meta.total}</span>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Simple Page Numbers */}
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-xs font-medium",
                  page === p
                    ? "bg-[#DC8404] text-white shadow-md shadow-orange-200"
                    : "hover:bg-gray-100 text-gray-600"
                )}
              >
                {p}
              </button>
            );
          })}

          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
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

      {viewOrderId && (
        <OrderDetailsModal
          orderId={viewOrderId}
          onClose={() => setViewOrderId(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    paid: "bg-blue-50 text-blue-700 border border-blue-100",
    shipped: "bg-purple-50 text-purple-700 border border-purple-100",
    delivered: "bg-green-50 text-green-700 border border-green-100",
    cancelled: "bg-red-50 text-red-700 border border-red-100",
  };
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
        styles[status] || styles.pending
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}