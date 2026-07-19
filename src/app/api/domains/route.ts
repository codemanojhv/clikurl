import { NextResponse } from "next/server";
import { getUserFromSession, addDomain, listDomainsForUser, findApiKeyByKey, getUserIdFromToken } from "@/lib/db-store";

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

export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const domainsList = await listDomainsForUser(userId);
    return NextResponse.json({ domains: domainsList });
  } catch (error) {
    console.error("GET /api/domains failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const domainName = typeof body?.domain === "string" ? body.domain.trim().toLowerCase() : 
                       typeof body?.domainName === "string" ? body.domainName.trim().toLowerCase() : "";

    if (!domainName) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
    }

    // Basic regex check for domains
    if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}$/.test(domainName)) {
      return NextResponse.json({ error: "Invalid domain format (e.g. brand.com or go.brand.com)" }, { status: 400 });
    }

    const domain = await addDomain(userId, domainName);

    // Extract CNAME name
    const parts = domainName.split(".");
    let cnameName = "@";
    if (parts.length > 2) {
      cnameName = parts.slice(0, parts.length - 2).join(".");
    }

    return NextResponse.json({
      domain: domain.domainName,
      status: domain.status,
      dns: {
        type: "CNAME",
        name: cnameName,
        value: "cname.clikurl.vercel-dns.com",
      },
    });
  } catch (err: any) {
    console.error("POST /api/domains failed", err);
    return NextResponse.json({ error: err.message || "Failed to add domain" }, { status: 500 });
  }
}
