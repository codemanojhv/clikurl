import { NextResponse } from "next/server";
import { createLink, findLinkByCode, getUserFromSession, getUserIdFromToken, findApiKeyByKey, checkLinkLimit } from "@/lib/db-store";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://clikurl.vercel.app";

async function getAuthUserId(request: Request): Promise<string | null> {
  const sessionUser = await getUserFromSession(request);
  if (sessionUser) return sessionUser.id;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    const tokenUserId = getUserIdFromToken(token);
    if (tokenUserId) return tokenUserId;

    const apiKeyUser = await findApiKeyByKey(token);
    if (apiKeyUser) return apiKeyUser.userId;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const url = typeof body?.destination === "string" ? body.destination.trim() : 
                typeof body?.url === "string" ? body.url.trim() : "";
                
    const customAlias = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : 
                        typeof body?.customAlias === "string" ? body.customAlias.trim().toLowerCase() : "";

    const expiresAt = typeof body?.expiresAt === "string" ? body.expiresAt.trim() : null;
    const clickLimit = typeof body?.clickLimit === "number" ? body.clickLimit : null;
    
    const customDomain = typeof body?.domain === "string" ? body.domain.trim().toLowerCase() : 
                         typeof body?.customDomain === "string" ? body.customDomain.trim().toLowerCase() : null;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
    }

    if (customAlias) {
      if (!/^[a-z0-9-]+$/.test(customAlias) || customAlias.length < 2 || customAlias.length > 30) {
        return NextResponse.json({ error: "Custom alias must be 2-30 characters, only lowercase letters, numbers, and hyphens" }, { status: 400 });
      }

      const existing = await findLinkByCode(customAlias);
      if (existing) {
        return NextResponse.json({ error: "Alias already taken" }, { status: 409 });
      }
    }

    const limitCheck = await checkLinkLimit(userId, customDomain);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error }, { status: 403 });
    }

    const result = await createLink(url, customAlias || undefined, userId, {
      expiresAt,
      clickLimit,
      customDomain,
    });

    return NextResponse.json({
      shortUrl: customDomain ? `https://${customDomain}/${result.shortCode}` : `${BASE}/${result.shortCode}`,
      originalUrl: result.originalUrl,
      shortCode: result.shortCode,
      createdAt: result.createdAt,
    });
  } catch (error) {
    console.error("/api/links failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
