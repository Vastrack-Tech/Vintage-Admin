import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Toaster } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell"; // We move the logic here

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vintage Admin",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          {/* AdminShell is now a CHILD of the Provider, so it can use hooks! */}
          <AdminShell>{children}</AdminShell>
          <Toaster richColors position="top-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
