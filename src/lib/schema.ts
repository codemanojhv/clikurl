import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: text("createdAt").notNull(),
});

export const links = pgTable("links", {
  code: text("code").primaryKey(),
  url: text("url").notNull(),
  createdAt: text("createdAt").notNull(),
  clicks: integer("clicks").notNull().default(0),
  ownerId: text("ownerId").references(() => users.id),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  linkCode: text("linkCode").notNull().references(() => links.code),
  ip: text("ip").default("unknown"),
  userAgent: text("userAgent").default("unknown"),
  referrer: text("referrer").default("direct"),
  country: text("country").default("unknown"),
  device: text("device").default("unknown"),
  timestamp: text("timestamp").notNull(),
});

export const apiKeys = pgTable("apiKeys", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  name: text("name").notNull(),
  keyHash: text("keyHash").notNull(),
  lastChars: text("lastChars").notNull(),
  createdAt: text("createdAt").notNull(),
  revokedAt: text("revokedAt"),
});
