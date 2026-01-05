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

export interface CustomerFilterValues {
  minOrderValue?: string;
  maxOrderValue?: string;
  startDate?: string; // DOB Start
  endDate?: string; // DOB End
}

interface CustomerFilterProps {
  onApply: (filters: CustomerFilterValues) => void;
}

export function CustomerFilter({ onApply }: CustomerFilterProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<CustomerFilterValues>({});

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleChange = (key: keyof CustomerFilterValues, value: string) => {
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
                onChange={(e) => handleChange("minOrderValue", e.target.value)}
              />
              <Input
                type="number"
                placeholder="End Price"
                className="bg-white border-orange-200 text-xs h-10"
                onChange={(e) => handleChange("maxOrderValue", e.target.value)}
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">
              Date of Birth
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
