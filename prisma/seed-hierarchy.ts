import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to create URL-friendly slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// County data for Idaho Treasure Valley region
const idahoCounties = [
  {
    name: "Ada County",
    description: "The most populous county in Idaho, home to Boise, the state capital. A vibrant hub of culture, business, and outdoor recreation.",
    latitude: 43.4527,
    longitude: -116.2413,
    cities: ["Boise", "Meridian", "Eagle", "Garden City", "Kuna", "Star"],
  },
  {
    name: "Canyon County",
    description: "Idaho's second-most populous county with rich agricultural heritage. Home to Nampa, Caldwell, and the wine-growing region.",
    latitude: 43.6261,
    longitude: -116.6959,
    cities: ["Nampa", "Caldwell", "Middleton", "Parma", "Wilder", "Greenleaf", "Notus", "Melba"],
  },
  {
    name: "Gem County",
    description: "A scenic county known as the 'Gem of the Valley' with orchards, small towns, and the Payette River running through it.",
    latitude: 44.0541,
    longitude: -116.4113,
    cities: ["Emmett"],
  },
  {
    name: "Payette County",
    description: "A rural county along the Idaho-Oregon border, known for its orchards, agriculture, and the Payette River.",
    latitude: 44.0143,
    longitude: -116.7580,
    cities: ["Payette", "Fruitland", "New Plymouth"],
  },
  {
    name: "Washington County",
    description: "Home to Weiser, the 'Fiddle Capital of the World', with a strong sense of community and rich musical heritage.",
    latitude: 44.4273,
    longitude: -116.8446,
    cities: ["Weiser"],
  },
  {
    name: "Owyhee County",
    description: "Idaho's second-largest county by area, featuring stunning high desert landscapes, ranching heritage, and the Owyhee Mountains.",
    latitude: 42.5821,
    longitude: -116.7532,
    cities: ["Marsing", "Homedale", "Murphy", "Grand View"],
  },
  {
    name: "Elmore County",
    description: "Home to Mountain Home Air Force Base and surrounded by dramatic desert and mountain scenery.",
    latitude: 43.1869,
    longitude: -115.6927,
    cities: ["Mountain Home"],
  },
];

// Boise neighborhoods (districts/neighborhoods)
const boiseNeighborhoods = [
  { name: "North End", description: "Historic neighborhood with tree-lined streets, local shops on Hyde Park, and the foothills for hiking.", lat: 43.6250, lng: -116.2025 },
  { name: "Downtown", description: "The heart of Boise with restaurants, nightlife, the Capitol, and JUMP center.", lat: 43.6150, lng: -116.2023 },
  { name: "Boise Bench", description: "Elevated neighborhood with great views, established homes, and access to the foothills.", lat: 43.5850, lng: -116.2150 },
  { name: "Southeast Boise", description: "Growing area with new developments, parks, and family-friendly neighborhoods.", lat: 43.5800, lng: -116.1550 },
  { name: "West Boise", description: "Established neighborhood with access to the greenbelt and proximity to downtown.", lat: 43.6250, lng: -116.2700 },
  { name: "Harris Ranch", description: "Master-planned community with parks, trails, and the Harris Ranch Golf Course.", lat: 43.5975, lng: -116.1325 },
  { name: "Warm Springs", description: "Historic neighborhood along the foothills with access to hot springs and trails.", lat: 43.6250, lng: -116.1475 },
  { name: "Hyde Park", description: "Charming neighborhood with local businesses, restaurants, and historic homes.", lat: 43.6500, lng: -116.2050 },
  { name: "Vista", description: "Central neighborhood with easy access to downtown and the Boise River.", lat: 43.6000, lng: -116.2200 },
  { name: "Depot Bench", description: "Growing area near the airport with new housing and commercial development.", lat: 43.5650, lng: -116.2300 },
];

// City coordinates (approximate centers)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Ada County
  "Boise": { lat: 43.6150, lng: -116.2023 },
  "Meridian": { lat: 43.6121, lng: -116.3915 },
  "Eagle": { lat: 43.6955, lng: -116.3538 },
  "Garden City": { lat: 43.6524, lng: -116.2743 },
  "Kuna": { lat: 43.4918, lng: -116.4201 },
  "Star": { lat: 43.6924, lng: -116.4934 },
  // Canyon County
  "Nampa": { lat: 43.5407, lng: -116.5635 },
  "Caldwell": { lat: 43.6629, lng: -116.6874 },
  "Middleton": { lat: 43.7068, lng: -116.6201 },
  "Parma": { lat: 43.7854, lng: -116.9432 },
  "Wilder": { lat: 43.6765, lng: -116.9115 },
  "Greenleaf": { lat: 43.6718, lng: -116.8318 },
  "Notus": { lat: 43.7268, lng: -116.7990 },
  "Melba": { lat: 43.3793, lng: -116.5318 },
  // Gem County
  "Emmett": { lat: 43.8735, lng: -116.4996 },
  // Payette County
  "Payette": { lat: 44.0782, lng: -116.9335 },
  "Fruitland": { lat: 44.0076, lng: -116.9154 },
  "New Plymouth": { lat: 43.9701, lng: -116.8190 },
  // Washington County
  "Weiser": { lat: 44.2510, lng: -116.9690 },
  // Owyhee County
  "Marsing": { lat: 43.5449, lng: -116.8115 },
  "Homedale": { lat: 43.6176, lng: -116.9340 },
  "Murphy": { lat: 43.2182, lng: -116.5513 },
  "Grand View": { lat: 42.9868, lng: -116.0968 },
  // Elmore County
  "Mountain Home": { lat: 43.1329, lng: -115.6912 },
};

async function main() {
  console.log("Seeding geographic hierarchy...\n");

  // Get the admin user to be the creator
  const admin = await prisma.user.findFirst({
    where: { accountType: "admin" },
  });

  if (!admin) {
    console.error("No admin user found. Please run the main seed first.");
    process.exit(1);
  }

  console.log(`Using admin user: ${admin.email}\n`);

  // 1. Create USA (country level)
  let usa = await prisma.community.findFirst({
    where: { name: "United States", level: "country" },
  });

  if (!usa) {
    usa = await prisma.community.create({
      data: {
        name: "United States",
        description: "The United States of America - a diverse nation of communities working together to support local projects and initiatives.",
        type: "geographic",
        level: "country",
        slug: "usa",
        latitude: 39.8283,
        longitude: -98.5795,
        createdBy: admin.id,
        memberCount: 0,
      },
    });
    console.log("Created: United States (country)");
  } else {
    console.log("Skipped: United States (already exists)");
  }

  // 2. Create Idaho (state level)
  let idaho = await prisma.community.findFirst({
    where: { name: "Idaho", level: "state" },
  });

  if (!idaho) {
    idaho = await prisma.community.create({
      data: {
        name: "Idaho",
        description: "The Gem State - known for its diverse landscape, from mountains and rivers to high desert, and communities that support each other.",
        type: "geographic",
        level: "state",
        slug: "usa/idaho",
        latitude: 44.0682,
        longitude: -114.7420,
        parentId: usa.id,
        createdBy: admin.id,
        memberCount: 0,
      },
    });
    console.log("Created: Idaho (state)");
  } else {
    console.log("Skipped: Idaho (already exists)");
  }

  // 3. Create counties and update cities
  for (const countyData of idahoCounties) {
    // Create or find county
    let county = await prisma.community.findFirst({
      where: { name: countyData.name, level: "county" },
    });

    if (!county) {
      county = await prisma.community.create({
        data: {
          name: countyData.name,
          description: countyData.description,
          type: "geographic",
          level: "county",
          slug: `usa/idaho/${slugify(countyData.name)}`,
          latitude: countyData.latitude,
          longitude: countyData.longitude,
          location: `${countyData.name}, Idaho`,
          parentId: idaho.id,
          createdBy: admin.id,
          memberCount: 0,
        },
      });
      console.log(`Created: ${countyData.name} (county)`);
    } else {
      console.log(`Skipped: ${countyData.name} (already exists)`);
    }

    // Update existing city communities with hierarchy info
    for (const cityName of countyData.cities) {
      const coords = cityCoordinates[cityName];

      // Find existing community by name and location pattern
      const existingCity = await prisma.community.findFirst({
        where: {
          name: cityName,
          OR: [
            { location: `${cityName}, ID` },
            { location: `${cityName}, Idaho` },
            { location: { contains: cityName } },
          ],
        },
      });

      if (existingCity) {
        // Update with hierarchy info
        await prisma.community.update({
          where: { id: existingCity.id },
          data: {
            type: "geographic",
            level: "city",
            slug: `usa/idaho/${slugify(countyData.name)}/${slugify(cityName)}`,
            parentId: county.id,
            latitude: coords?.lat || null,
            longitude: coords?.lng || null,
          },
        });
        console.log(`  Updated: ${cityName} (city) -> parent: ${countyData.name}`);
      } else {
        // Create new city community if it doesn't exist
        await prisma.community.create({
          data: {
            name: cityName,
            description: `The ${cityName} community in ${countyData.name}, Idaho.`,
            type: "geographic",
            level: "city",
            slug: `usa/idaho/${slugify(countyData.name)}/${slugify(cityName)}`,
            location: `${cityName}, ID`,
            latitude: coords?.lat || null,
            longitude: coords?.lng || null,
            parentId: county.id,
            createdBy: admin.id,
            memberCount: 0,
          },
        });
        console.log(`  Created: ${cityName} (city)`);
      }
    }
  }

  // 4. Create Boise neighborhoods
  console.log("\nCreating Boise neighborhoods...");

  const boise = await prisma.community.findFirst({
    where: { name: "Boise", level: "city" },
  });

  if (boise) {
    for (const neighborhood of boiseNeighborhoods) {
      const existing = await prisma.community.findFirst({
        where: { name: neighborhood.name, level: "neighborhood" },
      });

      if (!existing) {
        await prisma.community.create({
          data: {
            name: neighborhood.name,
            description: neighborhood.description,
            type: "geographic",
            level: "neighborhood",
            slug: `usa/idaho/ada-county/boise/${slugify(neighborhood.name)}`,
            location: `${neighborhood.name}, Boise, ID`,
            latitude: neighborhood.lat,
            longitude: neighborhood.lng,
            parentId: boise.id,
            createdBy: admin.id,
            memberCount: 0,
          },
        });
        console.log(`  Created: ${neighborhood.name} (neighborhood)`);
      } else {
        console.log(`  Skipped: ${neighborhood.name} (already exists)`);
      }
    }
  } else {
    console.log("  Warning: Boise city not found, skipping neighborhoods");
  }

  // 5. Mark any communities without hierarchy info as "interest" type
  const unassignedCommunities = await prisma.community.findMany({
    where: {
      level: null,
      type: "geographic", // Default type
    },
  });

  for (const community of unassignedCommunities) {
    await prisma.community.update({
      where: { id: community.id },
      data: { type: "interest" },
    });
    console.log(`Marked as interest community: ${community.name}`);
  }

  console.log("\n✓ Hierarchy seeding complete!");

  // Print summary
  const counts = await prisma.community.groupBy({
    by: ["level"],
    _count: true,
  });

  console.log("\nCommunity counts by level:");
  for (const c of counts) {
    console.log(`  ${c.level || "interest"}: ${c._count}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
