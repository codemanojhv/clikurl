---
id: pat-001
type: convention
title: API Route Patterns
description: "Cookie-based auth, Next.js 16 async params, consistent error format"
tags:
  - api
  - patterns
  - nextjs
files:
  - src/app/api/
status: active
timestamp: 2026-07-17T14:00:00Z
---

# API Route Patterns

## Auth Pattern
```typescript
import { getUserFromSession } from "@/lib/db-store";

export async function GET(request: Request) {
  const user = await getUserFromSession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ...
}
```

## Async Params (Next.js 16)
```typescript
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
}
```

## Response Format
- Success: `NextResponse.json(data)`
- Error: `NextResponse.json({ error: "message" }, { status: XXX })`
- Redirect: `NextResponse.redirect(url, { status: 302 })`

## Cookie Session
- auth_token cookie (httpOnly, secure in prod, sameSite lax)
- Set on login/register, cleared on logout
- Read via getUserFromSession() which decodes userId from token
