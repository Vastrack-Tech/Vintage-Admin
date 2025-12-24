"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  // Image as ImageIcon,
  // Gift,
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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col lg:flex">
      <div className="p-8">
        <Logo className="w-32" />
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#FFF8E6] text-[#DC8404]"
                  : "text-black hover:bg-gray-50 hover:text-black"
              }`}
            >
              <link.icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
