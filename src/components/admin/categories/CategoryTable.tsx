"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useAdminCategories";
import { CategoryFilter, CategoryFilterValues } from "./CategoryFilter";
import { CategoryModal } from "./CategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { Button } from "@/components/ui/button";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function CategoryTable() {
  // --- STATE ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CategoryFilterValues>({});

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);

  // --- API HOOKS ---
  const debouncedSearch = useDebounce(search, 500);
  const { data, isLoading } = useAdminCategories({
    page,
    limit: 10,
    search: debouncedSearch,
    ...filters,
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // --- HANDLERS ---
  const handleCreate = (formData: any) => {
    createMutation.mutate(formData, { onSuccess: () => setIsAddOpen(false) });
  };

  const handleUpdate = (formData: any) => {
    if (!editingCategory) return;
    updateMutation.mutate(
      { id: editingCategory.id, data: formData },
      {
        onSuccess: () => setEditingCategory(null),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingCategory) return;
    deleteMutation.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  };

  const categories = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-bold text-gray-900">Category List</h3>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#DC8404] outline-none"
            />
          </div>

          {/* ADD BUTTON (Visible here or on Page, kept here for context if needed, but usually on page header) */}
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#DC8404] hover:bg-[#b86e03] text-white gap-2"
          >
            <Plus size={16} /> Add New
          </Button>

          {/* FILTER & EXPORT */}
          <CategoryFilter
            onApply={(f) => {
              setFilters(f);
              setPage(1);
            }}
          />
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
          <thead className="bg-white text-xs text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded text-[#DC8404] focus:ring-[#DC8404]"
                />
              </th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Quantity</th>
              <th className="p-4 font-medium">Category Value</th>
              <th className="p-4 font-medium">Total Sales</th>
              <th className="p-4 font-medium text-right">Last Updated</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat: any) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded text-[#DC8404] focus:ring-[#DC8404]"
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-700">{cat.name}</td>
                  <td className="p-4 text-gray-600">
                    {Number(cat.totalQuantity || 0).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    ₦{Number(cat.totalValue || 0).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    ₦{Number(cat.totalSales || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-gray-500">
                    {cat.updatedAt
                      ? new Date(cat.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">
                        {Number(cat.productsCount || 0).toLocaleString()} Items
                      </span>
                      <span className="text-xs text-gray-500">
                        {Number(cat.totalQuantity || 0).toLocaleString()} in
                        Stock
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="p-2 text-gray-500 hover:text-[#DC8404] hover:bg-orange-50 rounded-full transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
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

      {/* PAGINATION */}
      <div className="p-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>Total Items {meta.total}</span>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium bg-[#DC8404] text-white px-3 py-1.5 rounded-lg shadow-sm">
            {page}
          </span>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MODALS */}
      <CategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onConfirm={handleCreate}
        isLoading={createMutation.isPending}
      />

      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onConfirm={handleUpdate}
        isLoading={updateMutation.isPending}
        initialData={editingCategory}
      />

      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        categoryName={deletingCategory?.name}
      />
    </div>
  );
}
