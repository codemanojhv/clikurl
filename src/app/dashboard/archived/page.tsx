"use client";

import { Card } from "@/components/ui/card";

export default function ArchivedLinksDashboard() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Archived Links</h1>
        <p className="text-xs text-slate-400 mt-1">Archived links do not appear in your main active links list but remain working.</p>
      </div>

      <Card className="p-12 border-slate-100 bg-white text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        </div>
        <h3 className="font-bold text-sm text-slate-700">No archived links</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Archive links from your active links list to hide them while preserving their redirect functionality.</p>
      </Card>
    </div>
  );
}
