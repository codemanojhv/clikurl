import * as bcrypt from "bcryptjs";
import { findUserByEmail, type UserRow } from "@/lib/userStore";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserFromToken(token: string | undefined | null): string | null {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1]?.split("?")?.[0] ?? "", "base64").toString());
    return typeof payload?.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}

export async function verifyUser(email: string, password: string): Promise<UserRow | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return user;
}
