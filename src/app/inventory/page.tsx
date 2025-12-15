"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryStats } from "@/components/admin/Inventory/InventoryStats";
import { ProductTable } from "@/components/admin/Inventory/ProductTable";
import {
  InventoryFilter,
  FilterValues,
} from "@/components/admin/Inventory/InventoryFilter";
import Link from "next/link";

export default function InventoryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues | undefined>(undefined);

  const handleApplyFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // The ProductTable will react to this 'filters' state change
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-bold text-black">Inventory</h1>
          <select className="bg-transparent text-sm text-black font-medium outline-none cursor-pointer hover:text-black">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/inventory/add">
            <Button className="bg-[#DC8404] hover:bg-[#b86e03] text-black gap-2 rounded-xl h-11 px-6 shadow-sm shadow-orange-200">
              <Plus size={18} /> Add Item
            </Button>
          </Link>
          <button className="p-3 bg-white border border-[#F4A460]/20 rounded-xl hover:bg-[#FFF8E6] transition-colors relative shadow-sm">
            <Bell size={20} className="text-[#DC8404]" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      {/* Stats Section */}
      <InventoryStats />

      {/* Table Section */}
      <ProductTable
        onOpenFilter={() => setIsFilterOpen(true)}
        filters={filters} // Pass active filters
      />

      <InventoryFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilter}
      />
    </div>
  );
}
