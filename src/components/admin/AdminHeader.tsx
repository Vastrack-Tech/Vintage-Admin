"use client";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

export function AdminHeader() {
  // Simple RHF setup for the date filter
  const { register, watch } = useForm({
    defaultValues: { dateRange: "7" },
  });

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-baseline gap-4">
        <h1 className="text-2xl font-bold text-black">Dashboard</h1>

      </div>
    </header>
  );
}
