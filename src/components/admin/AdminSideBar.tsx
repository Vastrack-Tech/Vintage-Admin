"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Categories", href: "/categories", icon: FolderTree },
  { name: "Requests", href: "/requests", icon: Users },
  // { name: "Banners", href: "/admin/banners", icon: ImageIcon },
  // { name: "Gift Cards", href: "/admin/gift-cards", icon: Gift },
];

// 👇 1. Extract NavContent OUTSIDE the main component
function NavContent({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
  return (
    <nav className="flex-1 px-4 space-y-2 mt-6">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                ? "bg-[#FFF8E6] text-[#DC8404]"
                : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
          >
            <link.icon size={20} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
        <Logo className="w-24" />
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-6 flex items-center justify-between border-b border-gray-100">
              <Logo className="w-28" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <NavContent pathname={pathname} onLinkClick={() => setIsOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex-col">
        <div className="p-8">
          <Logo className="w-32" />
        </div>

        <NavContent pathname={pathname} />

        <div className="p-4 border-t border-gray-100 mt-auto">
        </div>
      </aside>
    </>
  );
}