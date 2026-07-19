import { NextResponse } from "next/server";
import { getUserFromSession, createApiKey, listApiKeys } from "@/lib/db-store";

export async function GET(request: Request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await listApiKeys(user.id);
    return NextResponse.json({ keys });
  } catch (error) {
    console.error("GET /api/me/keys failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const key = await createApiKey(user.id, name);
    return NextResponse.json({ key }, { status: 201 });
  } catch (error) {
    console.error("POST /api/me/keys failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
