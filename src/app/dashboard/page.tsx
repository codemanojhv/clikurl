"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Link {
  shortCode: string;
  url: string;
  clicks: number;
  createdAt: string;
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

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = links.filter((l) => l.clicks > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome{user ? `, ${user.email}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s your dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Total links</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{links.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Active</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{activeLinks}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-500 font-medium">Total clicks</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{totalClicks}</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800"
        >
          Shorten link
        </a>
        <a
          href="/dashboard/links"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          View links
        </a>
        <a
          href="/dashboard/keys"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          API keys
        </a>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent links</h2>
        {links.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No links yet. Create your first one!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {links.slice(0, 5).map((link) => (
              <Card key={link.shortCode} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    /{link.shortCode}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{link.url}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">{link.clicks}</p>
                  <p className="text-xs text-slate-500">clicks</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
