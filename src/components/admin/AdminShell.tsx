"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSideBar";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Auth Protection Logic
  useEffect(() => {
    if (pathname === "/login") return;

    if (!isLoading) {
      if (!user || user.role !== "admin") {
        router.push('/login');
        console.warn("Access Denied: Not an admin");
      }
    }
  }, [user, isLoading, router, pathname]);

  if (pathname === "/login") {
    return <main className="min-h-screen bg-[#F3F4F6]">{children}</main>;
  }

  // 3. Main Admin Layout
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F3F4F6]">
      {/* Sidebar Component handles both Mobile Header and Desktop Sidebar */}
      <AdminSidebar />

      {/* Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto h-[calc(100vh-64px)] lg:h-screen">
        {isLoading ? (
          // Spinner shows ONLY inside the content area
          <div className="h-full flex flex-col items-center justify-center text-black gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#DC8404]" />
            <p className="text-sm font-medium">Loading ...</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}