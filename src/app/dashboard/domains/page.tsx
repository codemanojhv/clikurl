"use client";

import { Card } from "@/components/ui/card";

export default function DomainsDashboard() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Custom Domains</h1>
        <p className="text-xs text-slate-400 mt-1">Connect your own domain to shorten links (e.g., brand.co/link).</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 bg-white border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-700">Active Domains</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
              <div>
                <p className="text-xs font-bold text-slate-800">clikurl.vercel.app</p>
                <p className="text-[10px] text-slate-400">System default domain</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700">Connect Domain</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed">Connecting custom domains is available on the Pro and Enterprise plans. Configure DNS CNAME records pointing to Vercel.</p>
          <button
            onClick={() => window.location.href = "/pricing"}
            className="w-full h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Upgrade Plan
          </button>
        </Card>
      </div>
    </div>
  );
}
