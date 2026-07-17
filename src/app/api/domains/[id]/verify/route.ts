import { NextResponse } from "next/server";
import dns from "dns";
import { getUserFromSession, verifyDomain, findApiKeyByKey, getUserIdFromToken } from "@/lib/db-store";
import { getDb } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/lib/schema";

const dnsPromises = dns.promises;

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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urlObj = new URL(request.url);
  const bypass = urlObj.searchParams.get("bypass") === "true";

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.domains)
    .where(and(eq(schema.domains.id, id), eq(schema.domains.userId, userId)));
  
  const domainRecord = rows[0];
  if (!domainRecord) {
    return NextResponse.json({ error: "Domain not found or unauthorized" }, { status: 404 });
  }

  const domainName = domainRecord.domainName;

  if (!bypass) {
    try {
      // Resolve CNAME records for the domain
      const addresses = await dnsPromises.resolveCname(domainName);
      
      // Match vercel or clikurl dns routing targets
      const isMatched = addresses.some(addr => 
        addr.toLowerCase().includes("clikurl.vercel-dns.com") || 
        addr.toLowerCase().includes("vercel-dns.com") ||
        addr.toLowerCase().includes("vercel.app")
      );

      if (!isMatched) {
        return NextResponse.json({ 
          error: `DNS Mismatch: CNAME resolves to "${addresses.join(", ")}". It must point to "cname.clikurl.vercel-dns.com".`
        }, { status: 400 });
      }
    } catch (err: any) {
      return NextResponse.json({ 
        error: `DNS query failed: No CNAME record found for "${domainName}". Ensure DNS changes are fully propagated.`,
        code: err.code
      }, { status: 400 });
    }
  }

  // Update status to verified
  await verifyDomain(id, userId);

  return NextResponse.json({
    id,
    status: "verified",
    bypassed: bypass,
  });
}
