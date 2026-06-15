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

export type Analytics = {
  code: string;
  originalUrl: string;
  createdAt: string;
  totalClicks: number;
  clicks24h: number;
  clicks7d: number;
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: Record<string, number>;
  recentClicks: {
    ip: string;
    userAgent: string;
    referrer: string;
    country: string;
    device: string;
    timestamp: string;
  }[];
};

import {
  findByCode as storeFindByCode,
  createLinkRow,
  recordClick as storeRecordClick,
  getAnalytics as storeGetAnalytics,
} from "./store";

export async function createLink(input: { code: string; url: string }): Promise<LinkRow> {
  return createLinkRow(input);
}

export async function findByCode(code: string): Promise<LinkRow | undefined> {
  return storeFindByCode(code);
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
  return storeRecordClick(code, clickData);
}

export async function getAnalytics(code: string): Promise<Analytics | null> {
  const raw = await storeGetAnalytics(code);
  if (!raw) return null;
  return {
    ...raw,
    deviceBreakdown: raw.deviceBreakdown as Analytics["deviceBreakdown"],
  };
}
