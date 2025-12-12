"use client";

import { ProductForm } from "@/components/admin/Inventory/ProductForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

export default function EditItemPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/inventory/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#DC8404]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/inventory"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-black">Edit Item</h1>
      </div>

      {product && <ProductForm initialData={product} />}
    </div>
  );
}
