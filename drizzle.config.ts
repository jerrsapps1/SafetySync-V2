import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const isLocalhost =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

const dbUrl = isLocalhost
  ? process.env.DATABASE_URL
  : process.env.DATABASE_URL.includes("sslmode=")
    ? process.env.DATABASE_URL
    : `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes("?") ? "&" : "?"}sslmode=require`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
