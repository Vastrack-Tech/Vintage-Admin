"use client";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>
      <CustomerTable />
    </div>
  );
}
