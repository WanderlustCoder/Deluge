import type { AdProvider, AdImpression } from "./ad-provider.interface";

/**
 * Google AdSense integration stub.
 * To activate: set AD_PROVIDER=google-adsense in .env
 * and configure GOOGLE_ADSENSE_PUB_ID, GOOGLE_ADSENSE_SLOT_ID.
 */
export class GoogleAdSenseProvider implements AdProvider {
  name = "google-adsense";

  async getAd(format = "display") {
    // In production, this would return AdSense ad unit config
    return {
      adUnitId: process.env.GOOGLE_ADSENSE_SLOT_ID || "ca-pub-xxx",
      content: {
        format,
        pubId: process.env.GOOGLE_ADSENSE_PUB_ID || "",
      },
    };
  }

  async reportView(adUnitId: string): Promise<AdImpression> {
    // In production, revenue comes from AdSense API reporting
    // For now, use estimated values
    const estimatedRevenue = 0.015;
    return {
      adUnitId,
      provider: "google-adsense",
      format: "display",
      estimatedRevenue,
      impressionId: `gads-${Date.now()}`,
    };
  }

  getEstimatedRevenue() {
    return 0.015;
  }
}
