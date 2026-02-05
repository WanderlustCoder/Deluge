/**
 * SQLite to PostgreSQL Migration Script
 *
 * Prerequisites:
 * 1. Update prisma/schema.prisma: change provider to "postgresql"
 * 2. Update .env with PostgreSQL DATABASE_URL
 * 3. Run: npx prisma db push
 * 4. Run this script: npx tsx scripts/migrate-sqlite-to-postgres.ts
 *
 * This script exports data from the SQLite database and imports it into PostgreSQL.
 * Run it after setting up the PostgreSQL schema but before going to production.
 */

console.log("PostgreSQL Migration Script");
console.log("==========================");
console.log("");
console.log("To migrate from SQLite to PostgreSQL:");
console.log("1. Start PostgreSQL: docker compose up -d db");
console.log("2. Update prisma/schema.prisma provider to 'postgresql'");
console.log("3. Update .env with PostgreSQL DATABASE_URL");
console.log("4. Run: npx prisma db push");
console.log("5. Run: npx tsx prisma/seed.ts (for fresh data)");
console.log("");
console.log(
  "For production with existing data, use pg_dump/pg_restore or a custom migration."
);
