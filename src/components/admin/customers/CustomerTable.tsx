"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerFilter, CustomerFilterValues } from "./CustomerFilter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// REMOVED: import Image from "next/image";  <-- No longer needed

// Simple Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function CustomerTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CustomerFilterValues>({});

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useCustomers({
    page,
    limit: 10,
    search: debouncedSearch,
    ...filters,
  });

  console.log(data);
  

  const handleApplyFilter = (newFilters: CustomerFilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const customers = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">Customers List</h3>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#DC8404] outline-none"
            />
          </div>

          {/* FILTER */}
          <CustomerFilter onApply={handleApplyFilter} />

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
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#DC8404] focus:ring-[#DC8404]"
                />
              </th>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone No</th>
              <th className="p-4">Delivery Address</th>
              <th className="p-4">DOB</th>
              <th className="p-4">Total Order Value</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((user: any) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#DC8404] focus:ring-[#DC8404]"
                    />
                  </td>
                  <td className="p-4">
                    {/* REMOVED AVATAR IMAGE HERE */}
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        User Account {user.id.slice(0, 6)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">
                    {user.email}
                  </td>
                  <td className="p-4 text-gray-600 font-bold">
                    {user.phone || "N/A"}
                  </td>
                  <td
                    className="p-4 text-gray-500 text-xs max-w-[300px] whitespace-normal leading-relaxed"
                    title={user.address}
                  >
                    {user.address || "No Address Provided"}
                  </td>
                  <td className="p-4 text-gray-900 font-medium">
                    {user.birthday
                      ? new Date(user.birthday).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    ₦{Number(user.totalOrderValue || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                      <Mail size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="p-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>Total Items {meta.total}</span>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs font-medium bg-[#DC8404] text-white px-3 py-1.5 rounded-lg shadow-sm">
            {page}
          </span>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
