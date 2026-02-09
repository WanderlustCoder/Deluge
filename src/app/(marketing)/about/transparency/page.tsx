import { getPublicTransparencyMetrics } from "@/lib/revenue-tracking";
import { TransparencyContent } from "./transparency-content";

export default async function TransparencyAboutPage() {
  const metrics = await getPublicTransparencyMetrics();
  return <TransparencyContent metrics={metrics} />;
}
