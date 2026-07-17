import { NextResponse } from "next/server";
import { getUserFromSession, listLinksForOwner } from "@/lib/db-store";

export async function GET(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await listLinksForOwner(user.id);
  return NextResponse.json({ links });
}
