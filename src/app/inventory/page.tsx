"use client";

import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryStats } from "@/components/admin/Inventory/InventoryStats";
import { ProductTable } from "@/components/admin/Inventory/ProductTable";
import { useDownload } from "@/hooks/useDownload";
import { InventoryFilter, FilterValues } from "@/components/admin/Inventory/InventoryFilter";
import Link from "next/link";

// Define View Type
export type InventoryView = 'all' | 'sold' | 'empty';

export default function InventoryPage() {
  const [filters, setFilters] = useState<FilterValues | undefined>(undefined);
  
  const [view, setView] = useState<InventoryView>('all');
  const { downloadFile, isDownloading } = useDownload();

  const handleApplyFilter = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadFile("/admin/inventory/export", `inventory_export_${date}.csv`);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-black">Inventory</h1>

        <div className="flex items-center gap-4">
            {/* EXPORT BUTTON */}
            <Button 
                onClick={handleExport}
                disabled={isDownloading}
                variant="outline"
                className="gap-2 bg-[#DC8404] border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl h-11"
            >
                <Download size={18} />
                {isDownloading ? "Downloading..." : "Export CSV"}
            </Button>

            <Link href="/inventory/add">
                <Button className="bg-[#DC8404] hover:bg-[#b86e03] text-black gap-2 rounded-xl h-11 px-6 shadow-sm shadow-orange-200">
                <Plus size={18} /> Add Item
                </Button>
            </Link>
        </div>
      </header>

      {/* 👇 2. Pass view props to Stats */}
      <InventoryStats 
        currentView={view} 
        onViewChange={setView} 
      />

      {/* 👇 3. Pass view prop to Table */}
      <ProductTable
        onFilterChange={handleApplyFilter}
        filters={filters}
        view={view}
      />
    </div>
  );
}