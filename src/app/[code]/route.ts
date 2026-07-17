import { NextResponse } from "next/server";
import { findLinkByCode, recordClick } from "@/lib/db-store";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const link = await findLinkByCode(code);

    if (!link) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
