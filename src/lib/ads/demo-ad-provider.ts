import { simulateAdRevenue } from "@/lib/constants";
import type { AdProvider, AdImpression } from "./ad-provider.interface";

export class DemoAdProvider implements AdProvider {
  name = "demo";

  async getAd(format = "video") {
    return {
      adUnitId: `demo-${Date.now()}`,
      content: { format, duration: 15 },
    };
  }

  async reportView(adUnitId: string): Promise<AdImpression> {
    const revenue = simulateAdRevenue();
    return {
      adUnitId,
      provider: "demo",
      format: "video",
      estimatedRevenue: revenue.grossRevenue,
      impressionId: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  getEstimatedRevenue() {
    return 0.015; // avg of range
  }
}
