import { NextResponse } from "next/server";
import { getUserFromSession, verifyDomain, findApiKeyByKey, getUserIdFromToken } from "@/lib/db-store";

async function getAuthUserId(request: Request): Promise<string | null> {
  const sessionUser = await getUserFromSession(request);
  if (sessionUser) return sessionUser.id;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    const tokenUserId = getUserIdFromToken(token);
    if (tokenUserId) return tokenUserId;

    const apiKeyUser = await findApiKeyByKey(token);
    if (apiKeyUser) return apiKeyUser.userId;
  }
  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyDomain(id, userId);
  if (!verified) {
    return NextResponse.json({ error: "Domain not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({
    id,
    status: "verified",
  });
}
