import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Treasure Valley communities - southwestern Idaho
const treasureValleyTowns = [
  // Major cities
  {
    name: "Boise",
    description: "Idaho's capital and largest city. A vibrant community nestled in the foothills with a thriving downtown, extensive greenbelt, and strong local economy.",
    location: "Boise, ID",
  },
  {
    name: "Meridian",
    description: "Idaho's fastest-growing city and second largest. A family-friendly community with excellent schools, parks, and a growing business district.",
    location: "Meridian, ID",
  },
  {
    name: "Nampa",
    description: "The third largest city in Idaho with deep agricultural roots. Home to Northwest Nazarene University and a revitalized downtown.",
    location: "Nampa, ID",
  },
  {
    name: "Caldwell",
    description: "A historic city with strong agricultural heritage. Home to the College of Idaho and Indian Creek Plaza.",
    location: "Caldwell, ID",
  },
  {
    name: "Eagle",
    description: "An affluent foothill community known for outdoor recreation, excellent schools, and a charming downtown district.",
    location: "Eagle, ID",
  },
  {
    name: "Star",
    description: "A rapidly growing community that maintains its small-town charm. Known for friendly neighbors and community events.",
    location: "Star, ID",
  },
  {
    name: "Kuna",
    description: "A thriving community south of Meridian with strong agricultural ties and a welcoming small-town atmosphere.",
    location: "Kuna, ID",
  },
  {
    name: "Middleton",
    description: "A growing community between Star and Caldwell with a tight-knit feel and beautiful farmland surroundings.",
    location: "Middleton, ID",
  },
  {
    name: "Garden City",
    description: "A unique community surrounded by Boise, known for its eclectic character, breweries, and Boise River access.",
    location: "Garden City, ID",
  },
  {
    name: "Emmett",
    description: "The gem of the valley - a charming town known for the Emmett Cherry Festival and strong community spirit.",
    location: "Emmett, ID",
  },
  // Smaller towns
  {
    name: "Parma",
    description: "A small agricultural community in Canyon County known for its tight-knit community and Old Fort Boise Days celebration.",
    location: "Parma, ID",
  },
  {
    name: "Wilder",
    description: "A small farming community with a rich Hispanic heritage and strong community bonds.",
    location: "Wilder, ID",
  },
  {
    name: "Greenleaf",
    description: "A small Quaker community with a peaceful atmosphere and strong faith-based heritage.",
    location: "Greenleaf, ID",
  },
  {
    name: "Notus",
    description: "A small, quiet community along the Boise River with a rural character and friendly residents.",
    location: "Notus, ID",
  },
  {
    name: "Melba",
    description: "A small community south of Nampa surrounded by farmland and known for its annual Melba Valley Days.",
    location: "Melba, ID",
  },
  {
    name: "Marsing",
    description: "A small community at the confluence of the Snake and Owyhee Rivers with a strong agricultural heritage.",
    location: "Marsing, ID",
  },
  {
    name: "Homedale",
    description: "A small farming community along the Snake River known for its annual rodeo and tight-knit atmosphere.",
    location: "Homedale, ID",
  },
  {
    name: "Murphy",
    description: "The county seat of Owyhee County - a small historic community with deep roots in Idaho's ranching heritage.",
    location: "Murphy, ID",
  },
  {
    name: "Grand View",
    description: "A small community in Owyhee County along the Snake River, surrounded by stunning high desert landscapes.",
    location: "Grand View, ID",
  },
  {
    name: "Mountain Home",
    description: "Home to Mountain Home Air Force Base. A community with strong military ties and desert beauty.",
    location: "Mountain Home, ID",
  },
  // Additional smaller communities
  {
    name: "New Plymouth",
    description: "A small agricultural community in Payette County with a quiet, rural character.",
    location: "New Plymouth, ID",
  },
  {
    name: "Fruitland",
    description: "A growing community near the Oregon border known for orchards and a family-friendly atmosphere.",
    location: "Fruitland, ID",
  },
  {
    name: "Payette",
    description: "A charming community at the confluence of the Payette and Snake Rivers with historic downtown and apple orchards.",
    location: "Payette, ID",
  },
  {
    name: "Weiser",
    description: "Known as the Fiddle Capital of the World, home to the National Oldtime Fiddlers' Contest.",
    location: "Weiser, ID",
  },
];

async function main() {
  console.log("Seeding Treasure Valley communities...\n");

  // Get the admin user to be the creator
  const admin = await prisma.user.findFirst({
    where: { accountType: "admin" },
  });

  if (!admin) {
    console.error("No admin user found. Please create an admin user first.");
    process.exit(1);
  }

  console.log(`Using admin user: ${admin.email}\n`);

  let created = 0;
  let skipped = 0;

  for (const town of treasureValleyTowns) {
    // Check if community already exists
    const existing = await prisma.community.findFirst({
      where: { name: town.name, location: town.location },
    });

    if (existing) {
      console.log(`  Skipped: ${town.name} (already exists)`);
      skipped++;
      continue;
    }

    // Create the community
    const community = await prisma.community.create({
      data: {
        name: town.name,
        description: town.description,
        location: town.location,
        category: "local",
        createdBy: admin.id,
        memberCount: 1,
      },
    });

    // Add admin as a member
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: admin.id,
        role: "admin",
      },
    });

    console.log(`  Created: ${town.name}`);
    created++;
  }

  console.log(`\n✓ Done! Created ${created} communities, skipped ${skipped} existing.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
