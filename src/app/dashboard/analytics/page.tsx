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

interface AnalyticsReport {
  totalClicks: number;
  activeChannels: number;
  topLink: { code: string; clicks: number } | null;
  referrers: { name: string; clicks: number; percent: number }[];
  dailyClicks: { date: string; count: number }[];
}

export default function AnalyticsDashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const linksRes = await fetch("/api/me/links");
        const linksData = await linksRes.json();
        if (linksData.links) setLinks(linksData.links);

        const reportRes = await fetch("/api/me/analytics");
        const reportData = await reportRes.json();
        setReport(reportData);
      } catch {} finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeLinks = links.filter((l) => !l.isArchived);

  // Generate SVG path for actual daily counts
  const generatePath = (daily: { date: string; count: number }[]) => {
    if (!daily || daily.length === 0) return "M0,35 L100,35";
    const maxVal = Math.max(...daily.map((d) => d.count), 4); // avoid division by 0 and scale nicely
    const width = 100;
    const height = 45;
    const paddingBottom = 5;

    const points = daily.map((d, index) => {
      const x = (index / (daily.length - 1)) * width;
      // Invert Y axis for SVG (0 is top)
      const y = height - (d.count / maxVal) * (height - 15) - paddingBottom;
      return { x, y };
    });

    let dAttr = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Quadratic bezier curves for smooth lines
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      dAttr += ` Q${prev.x},${prev.y} ${cx},${(prev.y + curr.y) / 2}`;
    }
    dAttr += ` L${points[points.length - 1].x},${points[points.length - 1].y}`;
    return dAttr;
  };

  const generateFillPath = (daily: { date: string; count: number }[]) => {
    const linePath = generatePath(daily);
    return `${linePath} L100,45 L0,45 Z`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Link Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">Deep-dive visitor metrics and overall click distribution.</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-24">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Click Events</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">
            {report ? report.totalClicks.toLocaleString() : 0}
          </p>
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-24">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Channels</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">
            {activeLinks.length}
          </p>
        </Card>
        <Card className="p-5 bg-white border border-slate-100 shadow-sm flex flex-col justify-between h-24">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Performing Shortcode</p>
          <p className="text-sm font-extrabold text-slate-800 mt-2 truncate">
            {report?.topLink ? `/${report.topLink.code} (${report.topLink.clicks} clicks)` : "None"}
          </p>
        </Card>
      </div>

      {/* Sparkline & Charts grid */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
          <p className="text-xs font-bold text-slate-700">7-Day Volume Trend</p>
          <div className="h-40 w-full relative flex flex-col justify-end">
            {report && report.dailyClicks.length > 0 ? (
              <>
                <svg className="w-full h-28" viewBox="0 0 100 45" preserveAspectRatio="none">
                  <path
                    d={generatePath(report.dailyClicks)}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={generateFillPath(report.dailyClicks)}
                    fill="url(#gradient)"
                    stroke="none"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-between text-[9px] font-semibold text-slate-400 border-t border-slate-50 pt-2.5">
                  {report.dailyClicks.map((d, i) => {
                    const dateObj = new Date(d.date);
                    const label = dateObj.toLocaleDateString(undefined, { weekday: "short" });
                    return <span key={i}>{label}</span>;
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center pb-12">No recent click activities found.</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-100 shadow-sm space-y-4">
          <p className="text-xs font-bold text-slate-700">Top Referrer Channels</p>
          {report && report.referrers.length > 0 ? (
            <div className="space-y-3">
              {report.referrers.map((ref, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                    <span className="truncate max-w-[150px]">{ref.name}</span>
                    <span>{ref.clicks} ({ref.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${ref.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center pt-8">No referrer records found.</p>
          )}
        </Card>
      </div>

      {/* Top Links table list */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm">
        <p className="text-xs font-bold text-slate-700 mb-4">Link Performance Breakdown</p>
        {loading ? (
          <p className="text-xs text-slate-500">Loading details...</p>
        ) : activeLinks.length === 0 ? (
          <p className="text-xs text-slate-500">No active links yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-2.5">Short URL</th>
                  <th className="pb-2.5">Destination URL</th>
                  <th className="pb-2.5 text-right">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeLinks.map((link) => (
                  <tr key={link.code} className="text-slate-700">
                    <td className="py-3 font-bold text-blue-600">/{link.code}</td>
                    <td className="py-3 font-mono text-[10px] text-slate-400 max-w-xs truncate">{link.url}</td>
                    <td className="py-3 text-right font-bold text-slate-800">{link.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
