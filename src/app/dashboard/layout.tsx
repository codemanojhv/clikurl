"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
  ) },
  { href: "/dashboard/qr", label: "QR Codes", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
  ) },
  { href: "/dashboard/analytics", label: "Analytics", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  ) },
];

const linkNavItems = [
  { href: "/dashboard/links", label: "Links", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
  ) },
  { href: "/dashboard/archived", label: "Archived Links", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
  ) },
  { href: "/dashboard/expired", label: "Expired Links", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
];

const sharingNavItems = [
  { href: "/dashboard/text", label: "Text", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
  ) },
  { href: "/dashboard/file", label: "File", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ) },
];

const toolsNavItems = [
  { href: "/dashboard/keys", label: "Developer API", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
  ) },
  { href: "/dashboard/domains", label: "Domains", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
  ) },
  { href: "/pricing", label: "Pricing", icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1" /></svg>
  ) },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [email, setEmail] = useState("name@example.com");
  const [userName, setUserName] = useState("Sam Lee");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user?.email) {
          setEmail(data.user.email);
          const namePart = data.user.email.split("@")[0];
          setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      } catch {}
    }
    loadUser();
  }, []);

  const renderLink = (item: { href: string; label: string; icon: React.ReactNode }) => {
    const isActive = pathname === item.href;

    return (
      <a
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 h-9 px-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer",
          isActive
            ? "bg-blue-50 text-blue-600 font-bold border-l-2 border-blue-600 rounded-l-none pl-2.5"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        )}
      >
        <span className={cn("shrink-0", isActive ? "text-blue-600" : "text-slate-400")}>
          {item.icon}
        </span>
        {item.label}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-60 flex flex-col bg-white border-r border-slate-100 shrink-0">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-0.5">
          <a href="/" className="flex items-center gap-2 text-sm font-extrabold text-blue-600">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            clikurl
          </a>
          <span className="text-[10px] text-slate-400 font-medium">Premium URL Shortener</span>
        </div>

        {/* Workspace Droplist */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-[9px] text-white">C</div>
              <span>Workspace</span>
            </div>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" /></svg>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {/* Main items */}
          <div className="space-y-0.5">
            {mainNavItems.map(renderLink)}
          </div>

          {/* Link Management */}
          <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Link Management</p>
            {linkNavItems.map(renderLink)}
          </div>

          {/* Sharing */}
          <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sharing</p>
            {sharingNavItems.map(renderLink)}
          </div>

          {/* Tools */}
          <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tools</p>
            {toolsNavItems.map(renderLink)}
          </div>
        </nav>

        {/* Profile widget */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-200">
              {userName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top-bar */}
        <header className="md:hidden flex items-center justify-between h-14 bg-white border-b border-slate-100 px-4">
          <span className="text-sm font-extrabold text-blue-600">clikurl</span>
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="text-xs font-bold text-slate-600 px-2 py-1 rounded bg-slate-100">Overview</a>
            <a href="/dashboard/links" className="text-xs font-bold text-slate-600 px-2 py-1 rounded bg-slate-100">Links</a>
            <a href="/dashboard/keys" className="text-xs font-bold text-slate-600 px-2 py-1 rounded bg-slate-100">Keys</a>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
