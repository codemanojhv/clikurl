"use client";

import { Card } from "@/components/ui/card";

export default function ExpiredLinksDashboard() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Expired Links</h1>
        <p className="text-xs text-slate-400 mt-1">Links with set expiration limits that have timed out and are no longer active.</p>
      </div>

      <Card className="p-12 border-slate-100 bg-white text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="font-bold text-sm text-slate-700">No expired links</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Configure expiry thresholds on Pro links. Once expired, they will appear here and return a 404 to visitors.</p>
      </Card>
    </div>
  );
}
