export interface AdImpression {
  adUnitId: string;
  provider: string;
  format: string;
  estimatedRevenue: number;
  impressionId: string;
}

export interface AdProvider {
  name: string;
  getAd(format?: string): Promise<{ adUnitId: string; content: unknown }>;
  reportView(adUnitId: string): Promise<AdImpression>;
  getEstimatedRevenue(): number;
}
