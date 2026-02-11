"use client";
// import { Bell, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useForm } from "react-hook-form";

export function AdminHeader() {
  // Simple RHF setup for the date filter
  // const { register, watch } = useForm({
  //   defaultValues: { dateRange: "7" },
  // });

  return (
    <header className="flex items-center justify-between mb-8">
      
      <div className="flex items-baseline gap-4">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>

        {/* Date Filter via RHF */}
        {/* <select
          {...register("dateRange")}
          className="bg-transparent text-sm text-black font-medium outline-none cursor-pointer hover:text-black"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
        </select> */}
      </div>

      {/* <div className="flex items-center gap-4">
        <Button className="bg-[#DC8404] hover:bg-[#b86e03] text-black gap-2 rounded-xl h-10 px-6">
          <Plus size={18} /> Add Item
        </Button>
        <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 relative">
          <Bell size={20} className="text-black" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div> */}
    </header>
  );
}
