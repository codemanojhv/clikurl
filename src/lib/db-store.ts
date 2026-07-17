import { getDb } from "./db";
import * as schema from "./schema";
import { eq, desc, and, sql, isNull } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;
const CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export type UserRecord = { id: string; email: string; createdAt: string };
export type LinkRecord = { code: string; url: string; createdAt: string; clicks: number; ownerId: string | null };
export type ApiKeyRecord = { id: string; name: string; lastChars: string; createdAt: string; revokedAt: string | null };

export type AnalyticsData = {
  code: string;
  originalUrl: string;
  createdAt: string;
  totalClicks: number;
  clicks24h: number;
  clicks7d: number;
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number; other: number };
  recentClicks: any[];
};

// ─── User operations ────────────────────────────────────────────────

export async function createUser(email: string, password: string): Promise<UserRecord> {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const createdAt = new Date().toISOString();
  await db.insert(schema.users).values({ id, email: normalized, passwordHash, createdAt });
  return { id, email: normalized, createdAt };
}

export async function findUserByEmail(email: string): Promise<any | null> {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, normalized));
  return rows[0] || null;
}

export async function verifyUser(email: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export function createToken(userId: string): string {
  const random = crypto.randomBytes(32).toString("hex");
  return `${userId}.${random}`;
}

export function getUserIdFromToken(token: string | null | undefined): string | null {
  if (!token || typeof token !== "string") return null;
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;
  return token.substring(0, dotIndex);
}

export async function getUserFromSession(request: Request): Promise<UserRecord | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const token = cookies["auth_token"];
  const userId = getUserIdFromToken(token);
  if (!userId) return null;
  const db = getDb();
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, email: row.email, createdAt: row.createdAt };
}

// ─── Link operations ────────────────────────────────────────────────

function generateShortCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
}

export async function createLink(
  url: string,
  customAlias?: string,
  ownerId?: string | null
): Promise<{ shortUrl: string; shortCode: string; originalUrl: string; createdAt: string }> {
  const db = getDb();
  const code = customAlias || generateShortCode();
  const existing = await db.select().from(schema.links).where(eq(schema.links.code, code));
  if (existing.length > 0) {
    if (customAlias) throw new Error("Custom alias already taken");
    return createLink(url, undefined, ownerId);
  }
  const createdAt = new Date().toISOString();
  await db.insert(schema.links).values({ code, url, createdAt, clicks: 0, ownerId: ownerId ?? null });
  return { shortUrl: code, shortCode: code, originalUrl: url, createdAt };
}

export async function findLinkByCode(code: string): Promise<LinkRecord | null> {
  const db = getDb();
  const rows = await db.select().from(schema.links).where(eq(schema.links.code, code));
  const row = rows[0];
  if (!row) return null;
  return { code: row.code, url: row.url, createdAt: row.createdAt, clicks: row.clicks, ownerId: row.ownerId };
}

export async function deleteLink(code: string, userId?: string): Promise<boolean> {
  const db = getDb();
  const rows = await db.select().from(schema.links).where(eq(schema.links.code, code));
  const link = rows[0];
  if (!link) return false;
  if (userId && link.ownerId !== userId) return false;
  await db.delete(schema.clicks).where(eq(schema.clicks.linkCode, code));
  await db.delete(schema.links).where(eq(schema.links.code, code));
  return true;
}

export async function listLinksForOwner(userId: string): Promise<LinkRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.ownerId, userId))
    .orderBy(desc(schema.links.createdAt));
  return rows.map((r) => ({
    code: r.code,
    url: r.url,
    createdAt: r.createdAt,
    clicks: r.clicks,
    ownerId: r.ownerId,
  }));
}

// ─── Click operations ───────────────────────────────────────────────

export async function recordClick(
  code: string,
  clickData: { ip: string; userAgent: string; referrer: string; country: string; device: string }
): Promise<void> {
  const db = getDb();
  const timestamp = new Date().toISOString();
  await db.insert(schema.clicks).values({
    linkCode: code,
    ip: clickData.ip,
    userAgent: clickData.userAgent,
    referrer: clickData.referrer || "direct",
    country: clickData.country || "unknown",
    device: clickData.device || "unknown",
    timestamp,
  });
  await db
    .update(schema.links)
    .set({ clicks: sql`${schema.links.clicks} + 1` })
    .where(eq(schema.links.code, code));
}

export async function getAnalyticsFor(code: string): Promise<AnalyticsData | null> {
  const db = getDb();
  const linkRows = await db.select().from(schema.links).where(eq(schema.links.code, code));
  const link = linkRows[0];
  if (!link) return null;

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const allClicks = await db
    .select()
    .from(schema.clicks)
    .where(eq(schema.clicks.linkCode, code))
    .orderBy(desc(schema.clicks.timestamp));

  const totalClicks = allClicks.length;
  const clicks24h = allClicks.filter((c) => c.timestamp >= dayAgo).length;
  const clicks7d = allClicks.filter((c) => c.timestamp >= weekAgo).length;

  const referrerCounts: Record<string, number> = {};
  allClicks.forEach((c) => {
    const ref = c.referrer || "direct";
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([referrer, count]) => ({ referrer, count }));

  const countryCounts: Record<string, number> = {};
  allClicks.forEach((c) => {
    const country = c.country || "unknown";
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, other: 0 };
  allClicks.forEach((c) => {
    const d = (c.device || "other").toLowerCase();
    if (d in deviceCounts) (deviceCounts as Record<string, number>)[d]++;
    else deviceCounts.other++;
  });

  const recentClicks = allClicks.slice(0, 10);

  return {
    code,
    originalUrl: link.url,
    createdAt: link.createdAt,
    totalClicks,
    clicks24h,
    clicks7d,
    topReferrers,
    topCountries,
    deviceBreakdown: deviceCounts,
    recentClicks,
  };
}

// ─── API key operations ─────────────────────────────────────────────

export async function createApiKey(
  userId: string,
  name: string
): Promise<{ id: string; key: string; name: string; lastChars: string }> {
  const db = getDb();
  const id = crypto.randomUUID();
  const raw = "clk_" + crypto.randomBytes(20).toString("hex");
  const keyHash = crypto.createHash("sha256").update(raw).digest("hex");
  const lastChars = raw.slice(-8);
  const createdAt = new Date().toISOString();
  await db.insert(schema.apiKeys).values({ id, userId, name, keyHash, lastChars, createdAt });
  return { id, key: raw, name, lastChars };
}

export async function listApiKeys(userId: string): Promise<ApiKeyRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.userId, userId), isNull(schema.apiKeys.revokedAt)))
    .orderBy(desc(schema.apiKeys.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    lastChars: r.lastChars,
    createdAt: r.createdAt,
    revokedAt: r.revokedAt,
  }));
}

export async function revokeApiKey(id: string, userId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.id, id), eq(schema.apiKeys.userId, userId)));
  const key = rows[0];
  if (!key) return false;
  await db
    .update(schema.apiKeys)
    .set({ revokedAt: new Date().toISOString() })
    .where(eq(schema.apiKeys.id, id));
  return true;
}

export async function findApiKeyByKey(key: string): Promise<{ userId: string } | null> {
  const db = getDb();
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const rows = await db
    .select()
    .from(schema.apiKeys)
    .where(and(eq(schema.apiKeys.keyHash, keyHash), isNull(schema.apiKeys.revokedAt)));
  const row = rows[0];
  if (!row) return null;
  return { userId: row.userId };
}
