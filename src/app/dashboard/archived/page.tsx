"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Link {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  isArchived: boolean;
}

export default function ArchivedLinksDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLinks() {
    try {
      const res = await fetch("/api/me/links");
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function handleUnarchive(code: string) {
    try {
      const res = await fetch(`/api/me/links/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to unarchive");
        return;
      }
      setLinks((prev) =>
        prev.map((l) => (l.code === code ? { ...l, isArchived: false } : l))
      );
    } catch {
      alert("Something went wrong");
    }
  }

  const archivedLinks = links.filter((l) => l.isArchived);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Archived Links</h1>
        <p className="text-xs text-slate-400 mt-1">Archived links do not appear in your main active links list but remain working.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 animate-pulse">Loading links...</p>
      ) : archivedLinks.length === 0 ? (
        <Card className="p-12 border-slate-100 bg-white text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <h3 className="font-bold text-sm text-slate-700">No archived links</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">Archive links from your active links list to hide them while preserving their redirect functionality.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 shadow-sm rounded-2xl animate-fade-up">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3.5 px-5">Short URL</th>
                <th className="py-3.5 px-5">Original URL</th>
                <th className="py-3.5 px-5 text-center">Clicks</th>
                <th className="py-3.5 px-5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {archivedLinks.map((link) => (
                <tr key={link.code} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <a
                      href={`${window.location.origin}/${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      /{link.code}
                    </a>
                  </td>
                  <td className="py-4 px-5 max-w-[250px]">
                    <span className="text-slate-600 truncate block font-mono text-[10px]" title={link.url}>
                      {link.url}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center font-bold text-slate-800">
                    {link.clicks}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleUnarchive(link.code)}
                      className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Restore Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
