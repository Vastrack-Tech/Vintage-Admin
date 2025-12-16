"use client";

import { CategoryTable } from "@/components/admin/categories/CategoryTable";

export default function CategoriesPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      </div>

      <CategoryTable />
    </div>
  );
}
