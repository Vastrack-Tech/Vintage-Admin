"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axiosInstance";

export interface FilterValues {
  minPrice: string;
  maxPrice: string;
  categoryId: string;
}

// 👇 NEW INTERFACE: No 'isOpen' or 'onClose' needed
interface InventoryFilterProps {
  onApply: (filters: FilterValues) => void;
}

export function InventoryFilter({ onApply }: InventoryFilterProps) {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FilterValues>();

  const selectedCategory = watch("categoryId");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/admin/inventory/categories")).data,
  });

  const onSubmit = (data: FilterValues) => {
    onApply(data);
    setOpen(false);
  };

  const handleReset = () => {
    reset();
    onApply({ minPrice: "", maxPrice: "", categoryId: "" });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-[#DC8404] text-white border-none hover:bg-[#b86e03] rounded-xl h-11 px-4"
        >
          <Filter size={16} /> Filter
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] p-0 bg-[#F9F9F9] border-none shadow-xl rounded-xl"
        align="end"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Filter Products</h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-6">

            {/* Category Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setValue("categoryId", val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-full bg-white border-orange-200 h-11 rounded-lg">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-800">Price Range (₦)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min Price"
                  {...register("minPrice")}
                  className="bg-white border-orange-200 text-sm h-11 rounded-lg focus-visible:ring-[#DC8404]"
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  {...register("maxPrice")}
                  className="bg-white border-orange-200 text-sm h-11 rounded-lg focus-visible:ring-[#DC8404]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-0 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-12 text-gray-600 rounded-lg border-gray-200"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#DC8404] hover:bg-[#b86e03] text-white rounded-lg h-12 text-sm font-bold shadow-md shadow-orange-100"
            >
              Apply
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}