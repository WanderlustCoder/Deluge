import { getRegionFromTimezone } from './index';

export interface GeoInfo {
  countryCode: string;
  regionCode: string;
  city?: string;
  timezone?: string;
  confidence: number;
}

// Detect region from request headers (Cloudflare, Vercel, etc.)
export function detectRegionFromHeaders(
  headers: Headers
): GeoInfo | null {
  // Cloudflare headers
  const cfCountry = headers.get('cf-ipcountry');
  if (cfCountry) {
    return {
      countryCode: cfCountry,
      regionCode: mapCountryToRegion(cfCountry),
      city: headers.get('cf-ipcity') || undefined,
      timezone: headers.get('cf-timezone') || undefined,
      confidence: 0.9,
    };
  }

  // Vercel geo headers
  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return {
      countryCode: vercelCountry,
      regionCode: mapCountryToRegion(vercelCountry),
      city: headers.get('x-vercel-ip-city') || undefined,
      timezone: headers.get('x-vercel-ip-timezone') || undefined,
      confidence: 0.85,
    };
  }

  return null;
}

// Detect region from Accept-Language header
export function detectRegionFromLanguage(acceptLanguage: string): GeoInfo | null {
  if (!acceptLanguage) {
    return null;
  }

  // Parse first language preference
  const firstLang = acceptLanguage.split(',')[0].trim();
  const [language, country] = firstLang.split('-');

  if (country) {
    return {
      countryCode: country.toUpperCase(),
      regionCode: mapCountryToRegion(country.toUpperCase()),
      confidence: 0.5,
    };
  }

  // Map language to likely region
  const languageToRegion: Record<string, string> = {
    en: 'US',
    fr: 'EU',
    de: 'EU',
    es: 'US', // Could be US or EU, default to US
    it: 'EU',
    pt: 'EU',
    nl: 'EU',
  };

  return {
    countryCode: languageToRegion[language] || 'US',
    regionCode: languageToRegion[language] || 'US',
    confidence: 0.3,
  };
}

// Detect region from timezone (client-side)
export function detectRegionFromClientTimezone(timezone: string): GeoInfo {
  const regionCode = getRegionFromTimezone(timezone);

  return {
    countryCode: regionCode,
    regionCode,
    timezone,
    confidence: 0.7,
  };
}

// Map country code to our region codes
export function mapCountryToRegion(countryCode: string): string {
  const code = countryCode.toUpperCase();

  const countryToRegion: Record<string, string> = {
    // United States
    US: 'US',
    // Canada
    CA: 'CA',
    // United Kingdom
    GB: 'GB',
    UK: 'GB',
    // European Union members
    AT: 'EU', // Austria
    BE: 'EU', // Belgium
    BG: 'EU', // Bulgaria
    HR: 'EU', // Croatia
    CY: 'EU', // Cyprus
    CZ: 'EU', // Czech Republic
    DK: 'EU', // Denmark
    EE: 'EU', // Estonia
    FI: 'EU', // Finland
    FR: 'EU', // France
    DE: 'EU', // Germany
    GR: 'EU', // Greece
    HU: 'EU', // Hungary
    IE: 'EU', // Ireland
    IT: 'EU', // Italy
    LV: 'EU', // Latvia
    LT: 'EU', // Lithuania
    LU: 'EU', // Luxembourg
    MT: 'EU', // Malta
    NL: 'EU', // Netherlands
    PL: 'EU', // Poland
    PT: 'EU', // Portugal
    RO: 'EU', // Romania
    SK: 'EU', // Slovakia
    SI: 'EU', // Slovenia
    ES: 'EU', // Spain
    SE: 'EU', // Sweden
    // Australia
    AU: 'AU',
    // New Zealand
    NZ: 'NZ',
  };

  return countryToRegion[code] || 'US';
}

// Combined detection with priority
export async function detectUserRegion(
  headers: Headers,
  clientTimezone?: string
): Promise<GeoInfo> {
  // Priority 1: Request headers (most accurate)
  const headerGeo = detectRegionFromHeaders(headers);
  if (headerGeo && headerGeo.confidence >= 0.8) {
    return headerGeo;
  }

  // Priority 2: Client timezone
  if (clientTimezone) {
    const timezoneGeo = detectRegionFromClientTimezone(clientTimezone);
    if (timezoneGeo.confidence >= 0.7) {
      return timezoneGeo;
    }
  }

  // Priority 3: Accept-Language header
  const acceptLanguage = headers.get('accept-language');
  if (acceptLanguage) {
    const languageGeo = detectRegionFromLanguage(acceptLanguage);
    if (languageGeo) {
      return languageGeo;
    }
  }

  // Default to US
  return {
    countryCode: 'US',
    regionCode: 'US',
    confidence: 0.1,
  };
}
