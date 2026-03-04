/**
 * Seed script to create a demo company and link it to the demo user.
 * Safe to run multiple times - will not duplicate records.
 *
 * Usage: npx tsx scripts/seed-demo-org.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { users, companies } from "../shared/schema";

const DEMO_COMPANY_NAME = "Demo Construction Co.";
const DEMO_USER_EMAIL = "manager@democonstruction.com";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const isLocalhost =
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });

  const db = drizzle({ client: pool });

  try {
    console.log("🔍 Checking for existing demo company...");

    // Check if company already exists
    const existingCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.name, DEMO_COMPANY_NAME));

    let companyId: string;

    if (existingCompanies.length > 0) {
      companyId = existingCompanies[0].id;
      console.log(`✓ Demo company already exists: ${companyId}`);
    } else {
      // Create the company
      const [newCompany] = await db
        .insert(companies)
        .values({
          name: DEMO_COMPANY_NAME,
          plan: "free",
          billingStatus: "trial",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          country: "US",
          onboardingCompleted: "true",
        })
        .returning();

      companyId = newCompany.id;
      console.log(`✓ Created demo company: ${companyId}`);
    }

    // Find the demo user
    console.log(`🔍 Looking for demo user: ${DEMO_USER_EMAIL}`);

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, DEMO_USER_EMAIL));

    if (existingUsers.length === 0) {
      console.log(`⚠ Demo user not found. Creating one...`);

      // Create demo user with a hashed password (this is a bcrypt hash of "demo123")
      const [newUser] = await db
        .insert(users)
        .values({
          username: "demouser",
          fullName: "Demo Manager",
          email: DEMO_USER_EMAIL,
          password: "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u", // "demo123"
          role: "workspace_user",
          companyId: companyId,
        })
        .returning();

      console.log(`✓ Created demo user: ${newUser.id}`);
      console.log(`✓ Linked to company: ${companyId}`);
    } else {
      const demoUser = existingUsers[0];

      if (demoUser.companyId === companyId) {
        console.log(`✓ Demo user already linked to company: ${companyId}`);
      } else {
        // Update the user's companyId
        await db
          .update(users)
          .set({ companyId: companyId })
          .where(eq(users.id, demoUser.id));

        console.log(`✓ Updated demo user ${demoUser.id} to company: ${companyId}`);
      }
    }

    console.log("\n✅ Seed complete!");
    console.log(`   Company ID: ${companyId}`);
    console.log(`   Company Name: ${DEMO_COMPANY_NAME}`);
    console.log(`   User Email: ${DEMO_USER_EMAIL}`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
