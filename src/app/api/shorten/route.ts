import { NextResponse } from "next/server";
import { createLink, findLinkByCode, getUserFromSession, getUserIdFromToken, findApiKeyByKey } from "@/lib/db-store";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://clikurl.vercel.app";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const customAlias =
      typeof body?.customAlias === "string" ? body.customAlias.trim().toLowerCase() : "";

    const expiresAt = typeof body?.expiresAt === "string" ? body.expiresAt.trim() : null;
    const clickLimit = typeof body?.clickLimit === "number" ? body.clickLimit : null;
    const customDomain = typeof body?.customDomain === "string" ? body.customDomain.trim().toLowerCase() : null;

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

    let userId: string | null = null;

    const sessionUser = await getUserFromSession(request);
    if (sessionUser) {
      userId = sessionUser.id;
    } else {
      const auth = request.headers.get("authorization");
      if (auth?.startsWith("Bearer ")) {
        const token = auth.slice(7).trim();
        const tokenUserId = getUserIdFromToken(token);
        if (tokenUserId) {
          userId = tokenUserId;
        } else {
          const apiKeyUser = await findApiKeyByKey(token);
          if (apiKeyUser) {
            userId = apiKeyUser.userId;
          }
        }
      }
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
    console.error("/api/shorten failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
