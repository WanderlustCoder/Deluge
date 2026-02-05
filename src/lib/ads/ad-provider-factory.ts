import type { AdProvider } from "./ad-provider.interface";
import { DemoAdProvider } from "./demo-ad-provider";
import { GoogleAdSenseProvider } from "./google-adsense-provider";

let providerInstance: AdProvider | null = null;

export function getAdProvider(): AdProvider {
  if (providerInstance) return providerInstance;

  const providerName = process.env.AD_PROVIDER || "demo";

  switch (providerName) {
    case "google-adsense":
      providerInstance = new GoogleAdSenseProvider();
      break;
    default:
      providerInstance = new DemoAdProvider();
  }

  return providerInstance;
}
