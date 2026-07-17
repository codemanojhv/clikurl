"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Link {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
  clickLimit: number | null;
  customDomain: string | null;
  isArchived: boolean;
}

export default function DashboardLinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/me/links");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load links");
        return;
      }
      setLinks(data.links || []);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleDelete(code: string) {
    if (!confirm("Delete this link? It cannot be undone.")) return;

    try {
      const res = await fetch(`/api/me/links/${code}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete");
        return;
      }
      setLinks((prev) => prev.filter((l) => l.code !== code));
    } catch {
      alert("Something went wrong");
    }
  }

  async function handleArchive(code: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/me/links/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !currentStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update archive status");
        return;
      }
      setLinks((prev) =>
        prev.map((l) => (l.code === code ? { ...l, isArchived: !currentStatus } : l))
      );
    } catch {
      alert("Something went wrong");
    }
  }

  async function handleCopy(code: string) {
    const link = links.find((l) => l.code === code);
    const url = link?.customDomain
      ? `https://${link.customDomain}/${code}`
      : `${window.location.origin}/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopiedIdx(code);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <p className="text-slate-500 font-semibold animate-pulse">Loading links...</p>
      </div>
    );
  }

  const activeLinks = links.filter((l) => !l.isArchived);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Your Active Links</h1>
          <p className="text-xs text-slate-400 mt-1">Manage and track your active campaigns.</p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {activeLinks.length === 0 ? (
        <Card className="p-12 text-center border-slate-100 bg-white">
          <p className="text-slate-500 text-sm mb-2">No active links yet</p>
          <p className="text-xs text-slate-400">
            Go to the homepage to shorten your first link!
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-100 shadow-sm rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3.5 px-5">Short URL</th>
                <th className="py-3.5 px-5">Original URL</th>
                <th className="py-3.5 px-5 text-center">Clicks</th>
                <th className="py-3.5 px-5">Limits</th>
                <th className="py-3.5 px-5">Created</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeLinks.map((link) => {
                const displayUrl = link.customDomain
                  ? `https://${link.customDomain}/${link.code}`
                  : `${window.location.origin}/${link.code}`;
                return (
                  <tr key={link.code} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-600 hover:underline"
                      >
                        /{link.code}
                      </a>
                      {link.customDomain && (
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{link.customDomain}</p>
                      )}
                    </td>
                    <td className="py-4 px-5 max-w-[200px]">
                      <span className="text-slate-600 truncate block font-mono text-[10px]" title={link.url}>
                        {link.url}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center font-bold text-slate-800">
                      {link.clicks}
                    </td>
                    <td className="py-4 px-5 space-y-0.5 text-[10px]">
                      {link.clickLimit && (
                        <p className="text-slate-500 font-medium">Limit: {link.clickLimit} clicks</p>
                      )}
                      {link.expiresAt && (
                        <p className="text-slate-500 font-medium">
                          Expires: {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      {!link.clickLimit && !link.expiresAt && (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-400 font-medium">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(link.code)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          {copiedIdx === link.code ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleArchive(link.code, link.isArchived)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
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
