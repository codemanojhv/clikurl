"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Link {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
  clickLimit: number | null;
}

export default function ExpiredLinksDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLinks() {
      try {
        const res = await fetch("/api/me/links");
        const data = await res.json();
        if (data.links) setLinks(data.links);
      } catch {} finally {
        setLoading(false);
      }
    }
    loadLinks();
  }, []);

  const expiredLinks = links.filter((link) => {
    const clickLimitReached = link.clickLimit !== null && link.clicks >= link.clickLimit;
    const dateExpired = link.expiresAt !== null && new Date() > new Date(link.expiresAt);
    return clickLimitReached || dateExpired;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Expired Links</h1>
        <p className="text-xs text-slate-400 mt-1">Links with set expiration limits that have timed out and are no longer active.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 animate-pulse">Loading links...</p>
      ) : expiredLinks.length === 0 ? (
        <Card className="p-12 border-slate-100 bg-white text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="font-bold text-sm text-slate-700">No expired links</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Configure expiry thresholds on Pro links. Once expired, they will appear here and return a 404 to visitors.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 shadow-sm rounded-2xl animate-fade-up">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3.5 px-5">Short URL</th>
                <th className="py-3.5 px-5">Original URL</th>
                <th className="py-3.5 px-5 text-center">Clicks</th>
                <th className="py-3.5 px-5 font-bold">Expiry Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expiredLinks.map((link) => {
                const dateExpired = link.expiresAt !== null && new Date() > new Date(link.expiresAt);
                const clickLimitReached = link.clickLimit !== null && link.clicks >= link.clickLimit;
                return (
                  <tr key={link.code} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-400 line-through">
                        /{link.code}
                      </span>
                    </td>
                    <td className="py-4 px-5 max-w-[250px]">
                      <span className="text-slate-400 truncate block font-mono text-[10px]" title={link.url}>
                        {link.url}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center font-bold text-slate-500">
                      {link.clicks}
                    </td>
                    <td className="py-4 px-5 text-xs text-red-600 font-semibold">
                      {clickLimitReached && `Click limit reached (${link.clickLimit} max)`}
                      {clickLimitReached && dateExpired && " & "}
                      {dateExpired && `Date expired (was ${new Date(link.expiresAt!).toLocaleDateString()})`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
