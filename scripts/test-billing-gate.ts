/**
 * Billing Enforcement Test Script
 *
 * Tests that the billing gate correctly blocks protected routes when
 * billingStatus is "past_due" and allows them when "active".
 *
 * Prerequisites:
 * - Server running at http://localhost:5000
 * - NODE_ENV !== "production"
 * - ALLOW_TEST_BILLING_FLIPS=true
 *
 * Run: npx tsx scripts/test-billing-gate.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const ADMIN_TOKEN = "mock-admin-token";

interface TestResult {
  step: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function log(step: string, message: string) {
  console.log(`[${step}] ${message}`);
}

function logResult(step: string, passed: boolean, details?: string) {
  const status = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`[${step}] ${status}${details ? ` - ${details}` : ""}`);
  results.push({ step, passed, details });
}

async function makeRequest(
  method: string,
  path: string,
  token: string,
  body?: object
): Promise<{ status: number; data: any }> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, data };
}

async function runTest() {
  console.log("\n========================================");
  console.log("  BILLING ENFORCEMENT TEST");
  console.log("========================================\n");
  console.log(`Base URL: ${BASE_URL}\n`);

  let companyId: string;
  let testToken: string;

  // Step 1: Get companies
  log("1", "Fetching companies...");
  const companiesRes = await makeRequest("GET", "/api/admin/test/companies", ADMIN_TOKEN);

  if (companiesRes.status !== 200 || !companiesRes.data?.companies?.length) {
    logResult("1", false, `Failed to fetch companies. Status: ${companiesRes.status}`);
    console.log("   Response:", JSON.stringify(companiesRes.data, null, 2));
    console.log("\n   Make sure ALLOW_TEST_BILLING_FLIPS=true is set in your .env");
    process.exit(1);
  }

  companyId = companiesRes.data.companies[0].id;
  const companyName = companiesRes.data.companies[0].name;
  logResult("1", true, `Found ${companiesRes.data.companies.length} companies. Using: ${companyName} (${companyId})`);

  // Step 2: Generate impersonation token
  log("2", "Generating test token for company...");
  const impersonateRes = await makeRequest("POST", "/api/admin/test/impersonate", ADMIN_TOKEN, {
    companyId,
    role: "workspace_user",
  });

  if (impersonateRes.status !== 200 || !impersonateRes.data?.token) {
    logResult("2", false, `Failed to generate token. Status: ${impersonateRes.status}`);
    console.log("   Response:", JSON.stringify(impersonateRes.data, null, 2));
    process.exit(1);
  }

  testToken = impersonateRes.data.token;
  logResult("2", true, `Token generated (${testToken.substring(0, 20)}...)`);

  // Step 3: Set billing status to past_due
  log("3", "Setting billing status to past_due...");
  const setToPastDueRes = await makeRequest("POST", "/api/admin/test/billing-status", ADMIN_TOKEN, {
    orgId: companyId,
    status: "past_due",
  });

  if (setToPastDueRes.status !== 200) {
    logResult("3", false, `Failed to set status. Status: ${setToPastDueRes.status}`);
    console.log("   Response:", JSON.stringify(setToPastDueRes.data, null, 2));
    process.exit(1);
  }

  logResult("3", true, `Billing status set to past_due`);

  // Step 4: Call protected route - expect 402
  log("4", "Calling protected route /api/employees (expecting 402)...");
  const employeesBlockedRes = await makeRequest("GET", "/api/employees", testToken);

  const step4Pass = employeesBlockedRes.status === 402;
  logResult("4", step4Pass, `Status: ${employeesBlockedRes.status} (expected 402)`);
  if (!step4Pass) {
    console.log("   Response:", JSON.stringify(employeesBlockedRes.data, null, 2));
  }

  // Step 5: Call account summary - expect 200 (not gated)
  log("5", "Calling /api/account/summary (expecting 200)...");
  const accountSummaryRes = await makeRequest("GET", "/api/account/summary", testToken);

  const step5Pass = accountSummaryRes.status === 200;
  logResult("5", step5Pass, `Status: ${accountSummaryRes.status} (expected 200)`);
  if (!step5Pass) {
    console.log("   Response:", JSON.stringify(accountSummaryRes.data, null, 2));
  }

  // Step 6: Set billing status back to active
  log("6", "Setting billing status to active...");
  const setToActiveRes = await makeRequest("POST", "/api/admin/test/billing-status", ADMIN_TOKEN, {
    orgId: companyId,
    status: "active",
  });

  if (setToActiveRes.status !== 200) {
    logResult("6", false, `Failed to set status. Status: ${setToActiveRes.status}`);
    console.log("   Response:", JSON.stringify(setToActiveRes.data, null, 2));
    process.exit(1);
  }

  logResult("6", true, `Billing status set to active`);

  // Step 7: Call protected route again - expect 200
  log("7", "Calling protected route /api/employees (expecting 200)...");
  const employeesAllowedRes = await makeRequest("GET", "/api/employees", testToken);

  const step7Pass = employeesAllowedRes.status === 200;
  logResult("7", step7Pass, `Status: ${employeesAllowedRes.status} (expected 200)`);
  if (!step7Pass) {
    console.log("   Response:", JSON.stringify(employeesAllowedRes.data, null, 2));
  }

  // Summary
  console.log("\n========================================");
  console.log("  TEST SUMMARY");
  console.log("========================================\n");

  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;

  console.log(`Results: ${passedCount}/${results.length} passed\n`);

  if (allPassed) {
    console.log("✓ Billing enforcement test PASSED\n");
    process.exit(0);
  } else {
    console.log("✗ Billing enforcement test FAILED\n");
    console.log("Failed steps:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - Step ${r.step}: ${r.details}`);
    });
    console.log("");
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("\nUnexpected error:", err.message);
  console.log("\nMake sure the server is running at", BASE_URL);
  process.exit(1);
});
