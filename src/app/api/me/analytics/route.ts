import { NextResponse } from "next/server";
import { getUserFromSession, listLinksForOwner } from "@/lib/db-store";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/schema";
import { inArray, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const links = await listLinksForOwner(user.id);

  if (links.length === 0) {
    return NextResponse.json({
      totalClicks: 0,
      activeChannels: 0,
      topLink: null,
      referrers: [],
      dailyClicks: [],
    });
  }

  const codes = links.map((l) => l.code);

  const allClicks = await db
    .select()
    .from(schema.clicks)
    .where(inArray(schema.clicks.linkCode, codes))
    .orderBy(desc(schema.clicks.timestamp));

  // Calculate referrers
  const referrerCounts: Record<string, number> = {};
  allClicks.forEach((c) => {
    const ref = c.referrer || "direct";
    // clean up domain from referrer url
    let label = ref;
    try {
      if (ref.startsWith("http")) {
        label = new URL(ref).hostname;
      }
    } catch {}
    referrerCounts[label] = (referrerCounts[label] || 0) + 1;
  });
  const referrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, clicks]) => ({
      name,
      clicks,
      percent: allClicks.length > 0 ? Math.round((clicks / allClicks.length) * 100) : 0,
    }));

  // Calculate daily clicks for the last 7 days
  const dailyCounts: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dailyCounts[dateStr] = 0;
  }

  allClicks.forEach((c) => {
    const dateStr = c.timestamp.split("T")[0];
    if (dateStr in dailyCounts) {
      dailyCounts[dateStr]++;
    }
  });

  const dailyClicks = Object.entries(dailyCounts).map(([date, count]) => ({
    date,
    count,
  }));

  const topLink = [...links].sort((a, b) => b.clicks - a.clicks)[0];

  return NextResponse.json({
    totalClicks: allClicks.length,
    activeChannels: links.length,
    topLink: topLink ? { code: topLink.code, clicks: topLink.clicks } : null,
    referrers,
    dailyClicks,
  });
}
