"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/links", label: "Links" },
  { href: "/dashboard/keys", label: "API Keys" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
        <div className="p-6">
          <a href="/" className="text-lg font-bold text-white tracking-tight">
            clikurl
          </a>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-3">
          <a
            href="/"
            className="flex items-center h-10 px-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            ← Back to site
          </a>
        </div>
      </aside>

      <nav className="md:hidden w-full bg-white border-b border-slate-200 px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                pathname === item.href
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
