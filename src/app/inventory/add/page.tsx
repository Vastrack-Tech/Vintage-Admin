"use client";

import { ProductForm } from "@/components/admin/Inventory/ProductForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

export default function AddItemPage() {
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicateId");

  const { data: duplicateData, isLoading } = useQuery({
    queryKey: ["duplicate-product", duplicateId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/inventory/${duplicateId}`);

      // 🧹 CLEANUP: Strip out unique DB fields so it saves as a brand new product
      const cleaned = { ...data };
      delete cleaned.id;
      delete cleaned.createdAt;
      delete cleaned.updatedAt;
      delete cleaned.averageRating;
      delete cleaned.totalReviews;

      // Append "(Copy)" to the title
      cleaned.title = `${cleaned.title} (Copy)`;

      // Strip variant IDs so the DB generates fresh ones
      if (cleaned.variants) {
        cleaned.variants = cleaned.variants.map((v: any) => {
          const { id, ...rest } = v;
          return rest;
        });
      }
      return cleaned;
    },
    enabled: !!duplicateId, // Only fetch if we are actually duplicating
  });

  if (duplicateId && isLoading) {
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
          href="/inventory"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-black">
          {duplicateId ? "Duplicate Item" : "Add New Item"}
        </h1>
      </div>

      {/* Render form with pre-filled data if duplicating, otherwise render blank form */}
      {duplicateId ? (
        duplicateData && <ProductForm initialData={duplicateData} />
      ) : (
        <ProductForm />
      )}
    </div>
  );
}