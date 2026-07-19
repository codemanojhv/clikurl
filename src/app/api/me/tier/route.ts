import { NextResponse } from "next/server";
import { getUserFromSession, updateUserTier } from "@/lib/db-store";

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tier = typeof body?.tier === "string" ? body.tier.toLowerCase().trim() : "free";

    if (tier !== "free" && tier !== "pro" && tier !== "enterprise") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    await updateUserTier(user.id, tier);
    return NextResponse.json({ ok: true, tier });
  } catch (error) {
    console.error("POST /api/me/tier failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
