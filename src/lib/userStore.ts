import fs from "node:fs/promises";
import path from "node:path";
import * as bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "users.json");

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf-8");
  }
}

async function readAll(): Promise<UserRow[]> {
  await ensureFile();
  const content = await fs.readFile(FILE, "utf-8");
  try {
    return JSON.parse(content) as UserRow[];
  } catch {
    return [];
  }
}

async function writeAll(users: UserRow[]) {
  await ensureFile();
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(users, null, 2), "utf-8");
  await fs.rename(tmp, FILE);
}

export async function createUser(email: string, password: string): Promise<UserRow> {
  const users = await readAll();
  const normalized = email.toLowerCase().trim();
  const exists = users.find((u) => u.email.toLowerCase() === normalized);
  if (exists) throw new Error("User already exists");

  const user: UserRow = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeAll(users);
  return user;
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const users = await readAll();
  const normalized = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export async function verifyUser(email: string, password: string): Promise<UserRow | undefined> {
  const user = await findUserByEmail(email);
  if (!user) return undefined;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return undefined;
  return user;
}
