export type LinkRow = {
  code: string;
  url: string;
  createdAt: string;
  clicks: number;
  clickHistory: {
    ip: string;
    userAgent: string;
    referrer: string;
    country: string;
    device: string;
    timestamp: string;
  }[];
};

const byCode = new Map<string, LinkRow>();
const byUrl = new Map<string, string>();

export async function findByCode(code: string): Promise<LinkRow | undefined> {
  return byCode.get(code);
}

export async function findByUrl(url: string): Promise<LinkRow | undefined> {
  const code = byUrl.get(url);
  if (!code) return undefined;
  return byCode.get(code);
}

export async function createLinkRow(link: { code: string; url: string }): Promise<LinkRow> {
  const existing = await findByCode(link.code);
  if (existing) return existing;
  const duplicate = await findByUrl(link.url);
  if (duplicate) return duplicate;

  const row: LinkRow = {
    code: link.code,
    url: link.url,
    createdAt: new Date().toISOString(),
    clicks: 0,
    clickHistory: [],
  };

  byCode.set(link.code, row);
  byUrl.set(link.url, link.code);
  return row;
}

export async function recordClick(
  code: string,
  clickData: {
    ip: string;
    userAgent: string;
    referrer: string;
    country: string;
    device: string;
  }
): Promise<LinkRow | undefined> {
  const row = byCode.get(code);
  if (!row) return undefined;

  row.clicks += 1;
  row.clickHistory = [
    ...row.clickHistory,
    {
      ...clickData,
      timestamp: new Date().toISOString(),
    },
  ];

  if (row.clickHistory.length > 1000) {
    row.clickHistory = row.clickHistory.slice(-1000);
  }

  return row;
}

export async function deleteLink(code: string): Promise<boolean> {
  const row = byCode.get(code);
  if (!row) return false;
  byCode.delete(code);
  byUrl.delete(row.url);
  return true;
}

export async function listRecent(limit = 50): Promise<LinkRow[]> {
  return Array.from(byCode.values())
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, limit);
}

export async function getAnalytics(code: string) {
  const link = byCode.get(code);
  if (!link) return null;

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const clicks = link.clickHistory ?? [];

  const clicks24h = clicks.filter(
    (c) => now.getTime() - new Date(c.timestamp).getTime() < oneDay
  ).length;
  const clicks7d = clicks.filter(
    (c) => now.getTime() - new Date(c.timestamp).getTime() < oneWeek
  ).length;

  const referrerCounts: Record<string, number> = {};
  clicks.forEach((c) => {
    const ref = c.referrer || "direct";
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([referrer, count]) => ({ referrer, count }));

  const countryCounts: Record<string, number> = {};
  clicks.forEach((c) => {
    const country = c.country || "unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
  clicks.forEach((c) => {
    const raw = c.device || "other";
    deviceCounts[raw] = (deviceCounts[raw] || 0) + 1;
  });

  return {
    code,
    originalUrl: link.url,
    createdAt: link.createdAt,
    totalClicks: link.clicks,
    clicks24h,
    clicks7d,
    topReferrers,
    topCountries,
    deviceBreakdown: deviceCounts,
    recentClicks: clicks.slice(-10).reverse(),
  };
}
