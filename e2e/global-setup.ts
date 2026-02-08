/**
 * Global setup for E2E tests.
 *
 * Note: Database seeding should be done manually before running tests:
 *   npm run db:seed
 *
 * The dev server reuses the existing database, so we can't reset it here
 * without stopping the server first.
 */
async function globalSetup() {
  console.log("🌊 E2E Test Setup");
  console.log("   Ensure database is seeded: npm run db:seed");
  console.log("   Tests will use the existing dev database");
}

export default globalSetup;
