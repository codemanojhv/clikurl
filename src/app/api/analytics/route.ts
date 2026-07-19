import { NextResponse } from "next/server";
import { getAnalyticsFor, findLinkByCode, getUserFromSession, getUserIdFromToken, findApiKeyByKey } from "@/lib/db-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const link = await findLinkByCode(code);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    if (link.ownerId) {
      let userId: string | null = null;
      const sessionUser = await getUserFromSession(request);
      if (sessionUser) {
        userId = sessionUser.id;
      } else {
        const auth = request.headers.get("authorization");
        if (auth?.startsWith("Bearer ")) {
          const token = auth.slice(7).trim();
          const tokenUserId = getUserIdFromToken(token);
          if (tokenUserId) {
            userId = tokenUserId;
          } else {
            const apiKeyUser = await findApiKeyByKey(token);
            if (apiKeyUser) {
              userId = apiKeyUser.userId;
            }
          }
        }
      }

      if (!userId || userId !== link.ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const analytics = await getAnalyticsFor(code);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Failed to fetch analytics", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
