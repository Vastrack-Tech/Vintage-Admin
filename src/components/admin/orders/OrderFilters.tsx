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
import { cn } from "@/lib/utils";

export interface OrderFilterValues {
  minPrice?: string;
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface OrderFilterProps {
  onApply: (filters: OrderFilterValues) => void;
}

export function OrderFilter({ onApply }: OrderFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilterValues>({});

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleChange = (key: keyof OrderFilterValues, value: string) => {
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
        className="w-[340px] p-0 bg-[#F9F9F9] border-none shadow-xl rounded-xl"
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
        <div className="p-5 space-y-5">
          {/* Order Value */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Order Value
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Start Price"
                className="bg-white border-orange-200 text-xs h-10"
                onChange={(e) => handleChange("minPrice", e.target.value)}
              />
              <Input
                type="number"
                placeholder="End Price"
                className="bg-white border-orange-200 text-xs h-10"
                onChange={(e) => handleChange("maxPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Date of Order */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Date of Order
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                className="bg-white border-orange-200 text-xs h-10"
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
              <Input
                type="date"
                className="bg-white border-orange-200 text-xs h-10"
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Status
            </Label>
            <select
              className="w-full h-10 px-3 bg-white border border-orange-200 rounded-md text-xs text-gray-600 outline-none focus:ring-1 focus:ring-[#DC8404]"
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <Button
            onClick={handleApply}
            className="w-full bg-[#DC8404] hover:bg-[#b86e03] text-white rounded-lg h-10 text-sm font-medium"
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}