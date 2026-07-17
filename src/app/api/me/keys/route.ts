import { NextResponse } from "next/server";
import { getUserFromSession, createApiKey, listApiKeys } from "@/lib/db-store";

export async function GET(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await listApiKeys(user.id);
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const key = await createApiKey(user.id, name);
  return NextResponse.json({ key }, { status: 201 });
}
