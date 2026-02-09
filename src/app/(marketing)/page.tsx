import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Categories } from "@/components/marketing/categories";
import { Manifesto } from "@/components/marketing/manifesto";
import { CTA } from "@/components/marketing/cta";
import { getPublicTransparencyMetrics } from "@/lib/revenue-tracking";

export default async function HomePage() {
  const metrics = await getPublicTransparencyMetrics();

  const stats = {
    totalFunded: metrics.totalFunded,
    totalLoansIssued: metrics.totalLoansIssued,
    activeUsers: metrics.activeUsers,
  };

  return (
    <div>
      <Hero stats={stats} />
      <HowItWorks />
      <Categories />
      <Manifesto />
      <CTA stats={stats} />
    </div>
  );
}
