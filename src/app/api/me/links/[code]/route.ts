import { NextResponse } from "next/server";
import { getUserFromSession, findLinkByCode, deleteLink, getAnalyticsFor, archiveLink } from "@/lib/db-store";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const link = await findLinkByCode(code);
    if (!link || link.ownerId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const analytics = await getAnalyticsFor(code);
    return NextResponse.json({ link, analytics });
  } catch (error) {
    console.error("GET /api/me/links/[code] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const isArchived = typeof body?.isArchived === "boolean" ? body.isArchived : false;

    const updated = await archiveLink(code, isArchived, user.id);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/me/links/[code] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await deleteLink(code, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/me/links/[code] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
