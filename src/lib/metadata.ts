import type { Metadata } from "next";

const BASE_URL = "https://deluge.fund";
const DEFAULT_OG_IMAGE = "/og-default.png";
const SITE_NAME = "Deluge";

interface SEOOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function generateSEO({
  title,
  description,
  image,
  url,
}: SEOOptions): Metadata {
  const ogImage = image || `${BASE_URL}${DEFAULT_OG_IMAGE}`;
  const canonical = url ? `${BASE_URL}${url}` : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(canonical && { alternates: { canonical } }),
  };
}
