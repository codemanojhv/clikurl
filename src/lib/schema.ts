import { pgTable, text, integer, serial, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: text("createdAt").notNull(),
  tier: text("tier").default("free"),
});

export const links = pgTable("links", {
  code: text("code").primaryKey(),
  url: text("url").notNull(),
  createdAt: text("createdAt").notNull(),
  clicks: integer("clicks").notNull().default(0),
  ownerId: text("ownerId").references(() => users.id),
  expiresAt: text("expiresAt"),
  clickLimit: integer("clickLimit"),
  customDomain: text("customDomain"),
  isArchived: boolean("isArchived").default(false),
  textContent: text("textContent"),
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

export const domains = pgTable("domains", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  domainName: text("domainName").notNull(),
  createdAt: text("createdAt").notNull(),
  status: text("status").default("pending"),
});
