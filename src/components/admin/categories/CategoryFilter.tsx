"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";

export interface CategoryFilterValues {
  minQuantity?: string;
  maxQuantity?: string;
  minValue?: string; // Inventory Value
  maxValue?: string;
  minSales?: string; // Sales Value
  maxSales?: string;
}

interface CategoryFilterProps {
  onApply: (filters: CategoryFilterValues) => void;
}

export function CategoryFilter({ onApply }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<CategoryFilterValues>({});

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleChange = (key: keyof CategoryFilterValues, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-[#DC8404] text-white border-none hover:bg-[#b86e03]"
        >
          <Filter size={16} /> Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0 bg-[#F9F9F9] border-none shadow-xl rounded-xl"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Filter</h4>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Quantity Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Quantity
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Select Start Quantity"
                className="bg-white border-orange-200 text-sm h-11"
                onChange={(e) => handleChange("minQuantity", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Select End Quantity"
                className="bg-white border-orange-200 text-sm h-11"
                onChange={(e) => handleChange("maxQuantity", e.target.value)}
              />
            </div>
          </div>

          {/* Category Value (Inventory Worth) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Category Value
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Select Start Price"
                className="bg-white border-orange-200 text-sm h-11"
                onChange={(e) => handleChange("minValue", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Select End Price"
                className="bg-white border-orange-200 text-sm h-11"
                onChange={(e) => handleChange("maxValue", e.target.value)}
              />
            </div>
          </div>

          {/* Category Sale (Revenue) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-800">
              Category Sale
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Select Start Price"
                className="bg-white border-orange-200 text-sm h-11"
                onChange={(e) => handleChange("minSales", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Select End Price"
                className="bg-white border-orange-200 text-sm h-11"
                onChange={(e) => handleChange("maxSales", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <Button
            onClick={handleApply}
            className="w-full bg-[#DC8404] hover:bg-[#b86e03] text-white rounded-lg h-12 text-sm font-bold"
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
