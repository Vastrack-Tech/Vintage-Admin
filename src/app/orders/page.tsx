"use client";
import { OrderStats } from "@/components/admin/orders/OrderStats";
import { OrderTable } from "@/components/admin/orders/OrderTable";
import { useDownload } from "@/hooks/useDownload";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const { downloadFile, isDownloading } = useDownload();

  const handleExport = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadFile("/admin/orders/export", `orders_export_${date}.csv`);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Orders</h1>
          
          <Button 
             onClick={handleExport}
             disabled={isDownloading}
             variant="outline"
             className="gap-2 border-gray-300 bg-[#DC8404] text-gray-700 hover:bg-gray-50 rounded-xl h-11"
          >
             <Download size={18} />
             {isDownloading ? "Downloading..." : "Export CSV"}
          </Button>
       </header>

      <OrderStats />
      <OrderTable />
    </div>
  );
}
