"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Link {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  isArchived: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const authRes = await fetch("/api/auth/me");
        const authData = await authRes.json();
        if (!authData.user) {
          window.location.href = "/login";
          return;
        }
        setUser(authData.user);

        const linksRes = await fetch("/api/me/links");
        const linksData = await linksRes.json();
        if (linksData.links) setLinks(linksData.links);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeLinks = links.filter((l) => !l.isArchived);
  const totalClicks = activeLinks.reduce((sum, l) => sum + l.clicks, 0);
  const linksCount = activeLinks.length;
  const mockVisitors = Math.round(totalClicks * 0.85);

  const userName = user?.email ? user.email.split("@")[0] : "Showfom";
  const displayUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <p className="text-slate-500 font-semibold animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Good morning, {displayUserName}!
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">Start sharing your first resources!</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Links Card */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
              Links
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">{linksCount}</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 w-max border border-emerald-100">
            ↗ 2.5%
          </span>
        </Card>

        {/* Clicks Card */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
              Clicks
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">{totalClicks.toLocaleString()}</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 w-max border border-rose-100">
            ↘ 8.3%
          </span>
        </Card>

        {/* Visitors Card */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Visitors
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">{mockVisitors.toLocaleString()}</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 w-max border border-emerald-100">
            ↗ 0.7%
          </span>
        </Card>

        {/* Referrers Card */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
              Referrers
            </div>
            <p className="text-2xl font-extrabold text-slate-800 mt-2">1</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 w-max border border-slate-100">
            - 0.0%
          </span>
        </Card>
      </div>

      {/* Visual Action Grid (Middle Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Make it Short Card */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-64 hover:shadow-md transition-shadow relative group">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700">Make it Short</span>
              <a href="/" className="text-xs text-blue-600 font-bold hover:underline">→</a>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Generate short URLs in seconds.</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5 shadow-sm w-44">
              <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">s.ee</div>
              <span className="text-[10px] font-bold text-slate-700">clikurl.vercel.app/link</span>
            </div>
          </div>
        </Card>

        {/* Make it Scannable Card */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-64 hover:shadow-md transition-shadow relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700">Make it Scannable</span>
              <a href="/dashboard/qr" className="text-xs text-blue-600 font-bold hover:underline">→</a>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Get instant vector QR codes.</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-md w-28 h-28 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              {/* Minimalist mock QR code layout */}
              <div className="w-20 h-20 grid grid-cols-3 gap-0.5 opacity-80">
                <div className="border-[3px] border-slate-800 rounded"></div>
                <div className="bg-slate-800 rounded-sm"></div>
                <div className="border-[3px] border-slate-800 rounded"></div>
                <div className="bg-slate-800 rounded-sm"></div>
                <div className="bg-slate-200 rounded-sm"></div>
                <div className="bg-slate-800 rounded-sm"></div>
                <div className="border-[3px] border-slate-800 rounded"></div>
                <div className="bg-slate-800 rounded-sm"></div>
                <div className="bg-slate-800 rounded-sm"></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Link Analytics Card */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-64 hover:shadow-md transition-shadow relative">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700">Link Analytics</span>
              <a href="/dashboard/links" className="text-xs text-blue-600 font-bold hover:underline">→</a>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Detailed visitor statistics.</p>
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="h-28 w-full relative">
              {/* Tooltip */}
              <div className="absolute top-1 left-[55%] -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                534 views
              </div>
              {/* SVG Sparkline Graph */}
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                  d="M0,35 Q15,30 25,28 T50,15 T75,32 T100,20"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <circle cx="58" cy="18" r="3" fill="#2563eb" />
                <circle cx="58" cy="18" r="6" fill="#2563eb" fillOpacity="0.2" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Getting Started Checklist + Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Onboarding Checklist */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-5">Getting started with...</h3>
            <div className="space-y-4">
              {[
                { label: "Make a short link", desc: "Shorten, manage and optimize links.", checked: true },
                { label: "Create QR code", desc: "Generate and customize QR codes.", checked: true },
                { label: "Explore link analytics", desc: "Track your link performance.", checked: false },
                { label: "Create file", desc: "Manage and share files.", checked: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.checked ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 bg-white flex items-center justify-center"></span>
                    )}
                    <div>
                      <p className={cn("text-xs font-bold", item.checked ? "text-slate-800" : "text-slate-700")}>{item.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (idx === 0) window.location.href = "/";
                      else if (idx === 1) alert("QR codes are automatically generated for all shortened links. Try shortening a link on the homepage.");
                      else if (idx === 2) window.location.href = "/dashboard/links";
                      else alert("File sharing is available in Enterprise tier.");
                    }}
                    className="text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Start <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing / Domains Card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-2">Pricing & Domains</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Get a custom domain to create links that represent your brand. Add your own domain or choose a complimentary one when you upgrade.
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = "/pricing"}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
            >
              Learn More →
            </button>
            {/* Visual Tab Mockup */}
            <div className="flex gap-1 py-1 px-1 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-400">
              <span className="flex-1 text-center py-1 rounded-lg hover:bg-white hover:text-slate-800 transition-colors">Trial</span>
              <span className="flex-1 text-center py-1 rounded-lg hover:bg-white hover:text-slate-800 transition-colors">Lite</span>
              <span className="flex-1 text-center py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 shadow-sm">Pro</span>
              <span className="flex-1 text-center py-1 rounded-lg hover:bg-white hover:text-slate-800 transition-colors">Premium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
