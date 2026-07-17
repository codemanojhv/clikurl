import { NextResponse } from "next/server";
import { findUserByEmail, createUser, verifyUser, createToken } from "@/lib/db-store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = typeof body?.mode === "string" ? body.mode : "login";
    const email = (typeof body?.email === "string" ? body.email : "").trim().toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (mode !== "login" && mode !== "register") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (mode === "register") {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const existing = await findUserByEmail(email);
      if (existing) {
        return NextResponse.json({ error: "Account already exists" }, { status: 409 });
      }

      const user = await createUser(email, password);
      const token = createToken(user.id);

      const response = NextResponse.json({ token, user: { id: user.id, email: user.email } });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    }

    const user = await verifyUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createToken(user.id);

    const response = NextResponse.json({ token, user: { id: user.id, email: user.email } });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("/api/auth failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
