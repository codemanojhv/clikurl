import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { listLinksForOwner } from "@/lib/store";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.split("Bearer ")[1]?.split("?")[0] || null;
  const userId = getUserFromToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await listLinksForOwner(userId);
  return NextResponse.json({ links });
}
