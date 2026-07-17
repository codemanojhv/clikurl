"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Link {
  shortCode: string;
  url: string;
  clicks: number;
  createdAt: string;
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
      setLinks((prev) => prev.filter((l) => l.shortCode !== code));
    } catch {
      alert("Something went wrong");
    }
  }

  async function handleCopy(shortCode: string) {
    const url = `${window.location.origin}/${shortCode}`;
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
    setCopiedIdx(shortCode);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your links</h1>
          <p className="text-slate-500 mt-1">Manage all your shortened URLs.</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {links.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No links yet</p>
          <p className="text-sm text-slate-400">
            Shorten your first URL to see it here.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Short URL</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Original URL</th>
                <th className="text-center py-3 px-4 font-medium text-slate-500">Clicks</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Created</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.shortCode} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                  <td className="py-3 px-4">
                    <a
                      href={`${window.location.origin}/${link.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-slate-900 hover:text-slate-600 underline underline-offset-2"
                    >
                      /{link.shortCode}
                    </a>
                  </td>
                  <td className="py-3 px-4 max-w-[260px]">
                    <span className="text-slate-600 truncate block text-xs">{link.url}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-900">
                    {link.clicks}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(link.shortCode)}
                      >
                        {copiedIdx === link.shortCode ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(link.shortCode)}
                      >
                        Delete
                      </Button>
                    </div>
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
