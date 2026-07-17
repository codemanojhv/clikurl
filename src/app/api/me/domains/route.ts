import { NextResponse } from "next/server";
import { getUserFromSession, addDomain, listDomainsForUser } from "@/lib/db-store";

export async function GET(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domains = await listDomainsForUser(user.id);
  return NextResponse.json({ domains });
}

export async function POST(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const domainName = typeof body?.domainName === "string" ? body.domainName.trim().toLowerCase() : "";

  if (!domainName) {
    return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
  }

  // Basic regex check for domains
  if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}$/.test(domainName)) {
    return NextResponse.json({ error: "Invalid domain format (e.g. brand.com)" }, { status: 400 });
  }

  try {
    const domain = await addDomain(user.id, domainName);
    return NextResponse.json({ domain });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add domain" }, { status: 500 });
  }
}
