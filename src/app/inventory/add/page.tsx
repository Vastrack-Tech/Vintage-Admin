"use client";

import { ProductForm } from "@/components/admin/Inventory/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddItemPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/inventory"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-black">Add New Item</h1>
      </div>

      <ProductForm />
    </div>
  );
}
