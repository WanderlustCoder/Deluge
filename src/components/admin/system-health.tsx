import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { formatDate } from "@/lib/i18n/formatting";
import fs from "fs";
import path from "path";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function SystemHealthCard() {
  const [
    userCount,
    adViewCount,
    projectCount,
    loanCount,
    communityCount,
    referralCount,
    notificationCount,
    oldestUser,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.adView.count(),
    prisma.project.count(),
    prisma.loan.count(),
    prisma.community.count(),
    prisma.referral.count(),
    prisma.notification.count(),
    prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);

  const totalRecords =
    userCount +
    adViewCount +
    projectCount +
    loanCount +
    communityCount +
    referralCount +
    notificationCount;

  // Get DB file size
  let dbSize = "Unknown";
  try {
    const dbUrl = process.env.DATABASE_URL || "";
    const dbPath = dbUrl.replace("file:", "").replace("./", "");
    const fullPath = path.join(process.cwd(), "prisma", dbPath);
    const stats = fs.statSync(fullPath);
    dbSize = formatBytes(stats.size);
  } catch {
    // Fall through with "Unknown"
  }

  const seedDate = oldestUser?.createdAt
    ? formatDate(oldestUser.createdAt)
    : "N/A";

  const tables = [
    { name: "Users", count: userCount },
    { name: "Ad Views", count: adViewCount },
    { name: "Projects", count: projectCount },
    { name: "Loans", count: loanCount },
    { name: "Communities", count: communityCount },
    { name: "Referrals", count: referralCount },
    { name: "Notifications", count: notificationCount },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="font-heading font-semibold text-lg text-storm">
          System Health
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 mb-4">
          <div>
            <p className="text-xs text-storm-light">DB Size</p>
            <p className="text-lg font-bold font-heading text-storm">
              {dbSize}
            </p>
          </div>
          <div>
            <p className="text-xs text-storm-light">Total Records</p>
            <p className="text-lg font-bold font-heading text-storm">
              {totalRecords.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tables.map((t) => (
            <div
              key={t.name}
              className="flex items-center justify-between bg-gray-50 dark:bg-dark-border/30 rounded-lg px-3 py-2"
            >
              <span className="text-xs text-storm-light">{t.name}</span>
              <span className="text-sm font-semibold text-storm">
                {t.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-storm-light">DB seeded: {seedDate}</p>
      </CardFooter>
    </Card>
  );
}
