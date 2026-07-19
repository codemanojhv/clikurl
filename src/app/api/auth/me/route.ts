import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/db-store";

export async function GET(request: Request) {
  try {
    const user = await getUserFromSession(request);
    return NextResponse.json({ user: user ? { id: user.id, email: user.email } : null });
  } catch (error) {
    console.error("/api/auth/me failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
