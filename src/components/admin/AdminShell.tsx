"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSideBar";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react"; // Or use your own spinner

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Auth Protection Logic
  useEffect(() => {
    if (pathname === "/login") return;

    if (!isLoading) {
      if (!user || user.role !== "admin") {
        // router.push('/login');
        console.warn("Access Denied: Not an admin");
      }
    }
  }, [user, isLoading, router, pathname]);

  // 2. Hide Sidebar completely on Login Page
  if (pathname === "/login") {
    return <main className="min-h-screen bg-[#F3F4F6]">{children}</main>;
  }

  // 3. Main Admin Layout (Sidebar is ALWAYS rendered here)
  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Sidebar stays visible/stagnant */}
      <AdminSidebar />

      {/* Content Area */}
      <main className="flex-1 p-8 lg:p-2 overflow-auto h-screen">
        {isLoading ? (
          // Spinner shows ONLY inside the content area
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#DC8404]" />
            <p className="text-sm font-medium">Loading ...</p>
          </div>
        ) : (
          // Actual Page Content
          children
        )}
      </main>
    </div>
  );
}
