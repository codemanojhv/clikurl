import { NextResponse } from "next/server";
import { findLinkByCode, recordClick } from "@/lib/db-store";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const hostHeader = _request.headers.get("host") || "";
    const cleanHost = hostHeader.toLowerCase().trim();

    const link = await findLinkByCode(code);

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify custom domain match if configured
    if (link.customDomain) {
      const defaultHosts = ["localhost:3000", "localhost:3001", "clikurl.vercel.app", "clikurl.app"];
      // If request doesn't come from default hosting and doesn't match the mapped domain, block it
      if (!defaultHosts.some(h => cleanHost.includes(h)) && cleanHost !== link.customDomain.toLowerCase().trim()) {
        return NextResponse.json({ error: "Unauthorized domain mapping" }, { status: 403 });
      }
    }

    if (link.clickLimit !== null && link.clicks >= link.clickLimit) {
      return NextResponse.json({ error: "Link click limit reached" }, { status: 410 });
    }

    if (link.expiresAt !== null) {
      const expiresDate = new Date(link.expiresAt);
      if (!isNaN(expiresDate.getTime()) && new Date() > expiresDate) {
        return NextResponse.json({ error: "Link expired" }, { status: 410 });
      }
    }

    await recordClick(code, {
      ip: _request.headers.get("x-forwarded-for") || "unknown",
      userAgent: _request.headers.get("user-agent") || "unknown",
      referrer: _request.headers.get("referer") || "direct",
      country: "unknown",
      device: "unknown",
    });

    return NextResponse.redirect(link.url, { status: 302 });
  } catch (error) {
    console.error("/[code] redirect failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
