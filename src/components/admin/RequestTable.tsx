"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  useAdminRequests,
  useUpdateRequestStatus,
  useDeleteRequest,
  ContactRequest,
} from "@/hooks/useAdminRequests";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Internal Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function RequestsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useAdminRequests({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter,
  });

  const { mutate: updateStatus } = useUpdateRequestStatus();
  const { mutate: deleteRequest } = useDeleteRequest();

  const requests: ContactRequest[] = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER: Search & Actions */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">Contact Requests</h3>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
            <input
              type="text"
              placeholder="Search Name or Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#DC8404] outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* STATUS FILTER (Simple dropdown style to match table feel) */}
          <div className="flex gap-2">
            {["", "new", "contacted", "resolved"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize",
                  statusFilter === status
                    ? "bg-black text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {status || "All"}
              </button>
            ))}
          </div>

          {/* EXPORT */}
          <Button
            variant="outline"
            className="gap-2 border-orange-200 text-[#DC8404] hover:bg-orange-50 rounded-lg"
          >
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="p-6">Customer</th>
              <th className="p-6">Contact Info</th>
              <th className="p-6 w-[350px]">Message</th>
              <th className="p-6">Date</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-500">
                  No requests found matching your criteria.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {req.firstName} {req.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-gray-900">{req.email}</span>
                      <span className="text-xs text-gray-500">{req.phone}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p
                      className="text-gray-600 line-clamp-2 leading-relaxed"
                      title={req.request}
                    >
                      {req.request}
                    </p>
                  </td>
                  <td className="p-6 text-gray-600">
                    {format(new Date(req.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="p-6">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="p-6 text-gray-600 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatus({ id: req.id, status: "new" })
                          }
                        >
                          <Clock className="mr-2 h-4 w-4" /> Mark New
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatus({ id: req.id, status: "contacted" })
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark
                          Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatus({ id: req.id, status: "resolved" })
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteRequest(req.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    new: "bg-blue-50 text-blue-700 border border-blue-100",
    contacted: "bg-yellow-50 text-yellow-700 border border-yellow-100",
    resolved: "bg-green-50 text-green-700 border border-green-100",
  };
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
        styles[status] || styles.new
      )}
    >
      {status}
    </span>
  );
}
