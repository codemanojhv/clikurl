import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/db-store";

export async function GET(request: Request) {
  const user = await getUserFromSession(request);
  return NextResponse.json({ user: user ? { id: user.id, email: user.email } : null });
}
