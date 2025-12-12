"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { cn } from "@/lib/utils";
import { FilterValues } from "./InventoryFilter";

interface ProductTableProps {
  onOpenFilter?: () => void;
  filters?: FilterValues;
}

export function ProductTable({ onOpenFilter, filters }: ProductTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Combine all params for the hook
  const { data, isLoading } = useInventory({
    page,
    limit: 10,
    search,
    ...filters, // Spread filter values (minPrice, categoryId, etc.)
  });

  const products = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Controls */}
      <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-black">Product List</h3>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#DC8404] outline-none"
            />
          </div>
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#DC8404] text-black rounded-lg text-sm font-medium hover:bg-[#b86e03] transition-colors"
          >
            <Filter size={16} /> Filter
          </button>
          {/* <button className="flex items-center gap-2 px-4 py-2.5 border border-[#DC8404] text-[#DC8404] rounded-lg text-sm font-medium hover:bg-[#FFF8E6] transition-colors">
            <Download size={16} /> Download
          </button> */}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-xs uppercase text-black font-semibold tracking-wider">
            <tr>
              <th className="p-6 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#DC8404]"
                />
              </th>
              <th className="p-6">Product Name</th>
              <th className="p-6">Sale Price</th>
              <th className="p-6">Quantity</th>
              <th className="p-6">Category</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-black">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#DC8404]" />
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-black">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product: any) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="p-6">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#DC8404]"
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4 min-w-[300px]">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 relative overflow-hidden">
                        <Image
                          src={product.gallery?.[0] || "/placeholder.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-black line-clamp-2">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-semibold">
                    ₦{Number(product.priceNgn).toLocaleString()}
                  </td>
                  <td className="p-6 text-sm text-black">
                    {/* Sum of all variant stocks or base stock if no variants */}
                    {product.variants && product.variants.length > 0
                      ? product.variants.reduce(
                          (acc: number, v: any) => acc + (v.stockQuantity || 0),
                          0
                        )
                      : "0"}
                  </td>
                  <td className="p-6 text-sm text-black">
                    {product.category?.name || "-"}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* EDIT BUTTON LINKING TO EDIT PAGE */}
                      <Link href={`/inventory/${product.id}`}>
                        <button className="p-2 text-black hover:text-[#DC8404] hover:bg-[#FFF8E6] rounded-full transition-colors">
                          <Pencil size={16} />
                        </button>
                      </Link>
                      <button className="p-2 text-black hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-6 border-t border-gray-100 flex items-center justify-between text-sm text-black">
        <span>Total Items {meta.total}</span>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Dynamic Page Numbers */}
          {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
            // Logic to show pages around current page (simplified here to 1-5 or 1-total)
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  page === p ? "bg-[#DC8404] text-black" : "hover:bg-gray-100"
                )}
              >
                {p}
              </button>
            );
          })}

          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
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
