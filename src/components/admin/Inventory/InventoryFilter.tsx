"use client";

import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

export interface FilterValues {
  minPrice: string;
  maxPrice: string;
  categoryId: string; // Changed from 'category' to 'categoryId' to match backend DTO
}

interface InventoryFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
}

export function InventoryFilter({
  isOpen,
  onClose,
  onApply,
}: InventoryFilterProps) {
  const { register, handleSubmit, reset } = useForm<FilterValues>();

  // Fetch Categories for Filter Dropdown
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/admin/inventory/categories")).data,
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] p-0 bg-white">
        <form
          onSubmit={handleSubmit((data) => {
            onApply(data);
            onClose();
          })}
          className="h-full flex flex-col"
        >
          <SheetHeader className="px-8 py-6 border-b border-gray-100 flex flex-row items-center justify-between">
            <SheetTitle className="text-2xl font-bold text-black">
              Filter Products
            </SheetTitle>
            <SheetClose asChild>
              <button type="button">
                <X size={24} className="text-black hover:text-black" />
              </button>
            </SheetClose>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-base font-bold text-black">
                Price Range (₦)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    {...register("minPrice")}
                    className="w-full h-12 px-4 border border-orange-200 rounded-xl text-black bg-white focus:border-[#DC8404] outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Min Price</option>
                    <option value="1000">1,000</option>
                    <option value="5000">5,000</option>
                    <option value="10000">10,000</option>
                    <option value="50000">50,000</option>
                  </select>
                  <ArrowDownIcon />
                </div>
                <div className="relative">
                  <select
                    {...register("maxPrice")}
                    className="w-full h-12 px-4 border border-orange-200 rounded-xl text-black bg-white focus:border-[#DC8404] outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Max Price</option>
                    <option value="50000">50,000</option>
                    <option value="100000">100,000</option>
                    <option value="500000">500,000</option>
                    <option value="2000000">2,000,000</option>
                  </select>
                  <ArrowDownIcon />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-base font-bold text-black">
                Category
              </label>
              <div className="relative">
                <select
                  {...register("categoryId")}
                  className="w-full h-12 px-4 border border-orange-200 rounded-xl text-black bg-white focus:border-[#DC8404] outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ArrowDownIcon />
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-gray-100 bg-white mt-auto flex gap-4">
            <Button
              type="button"
              onClick={() => reset()}
              variant="outline"
              className="flex-1 h-14 rounded-xl border-gray-200 text-black"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 bg-[#DC8404] hover:bg-[#b86e03] text-black text-lg font-medium rounded-xl shadow-lg shadow-orange-200"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ArrowDownIcon() {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path
          d="M1 1L5 5L9 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}