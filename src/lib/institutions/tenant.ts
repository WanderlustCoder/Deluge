// Tenant Resolution
// Resolve institution from request domain/subdomain

import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';

export interface TenantContext {
  institutionId: string;
  institutionSlug: string;
  institutionName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  features: string[];
}

// Resolve tenant from request
export async function resolveTenant(): Promise<TenantContext | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // Check for custom domain first
  const institution = await resolveFromDomain(host);
  if (institution) {
    return createTenantContext(institution);
  }

  // Check for subdomain (e.g., boise.deluge.fund)
  const subdomain = extractSubdomain(host);
  if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
    const inst = await prisma.institution.findUnique({
      where: { slug: subdomain },
    });
    if (inst && inst.status === 'active') {
      return createTenantContext(inst);
    }
  }

  // Check for institution in cookie (for embedded experiences)
  const cookieStore = await cookies();
  const institutionCookie = cookieStore.get('deluge_institution');
  if (institutionCookie?.value) {
    const inst = await prisma.institution.findUnique({
      where: { slug: institutionCookie.value },
    });
    if (inst && inst.status === 'active') {
      return createTenantContext(inst);
    }
  }

  return null;
}

// Resolve from custom domain
async function resolveFromDomain(host: string): Promise<Institution | null> {
  // Remove port if present
  const domain = host.split(':')[0];

  // Skip localhost and main domain
  if (domain === 'localhost' || domain.endsWith('deluge.fund')) {
    return null;
  }

  const institution = await prisma.institution.findUnique({
    where: { customDomain: domain },
  });

  return institution && institution.status === 'active' ? institution : null;
}

// Extract subdomain from host
function extractSubdomain(host: string): string | null {
  const domain = host.split(':')[0];
  const parts = domain.split('.');

  // e.g., boise.deluge.fund -> boise
  // e.g., boise.localhost -> boise
  if (parts.length >= 2) {
    return parts[0];
  }

  return null;
}

// Create tenant context
interface Institution {
  id: string;
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  features: string;
}

function createTenantContext(institution: Institution): TenantContext {
  return {
    institutionId: institution.id,
    institutionSlug: institution.slug,
    institutionName: institution.name,
    primaryColor: institution.primaryColor,
    secondaryColor: institution.secondaryColor,
    logoUrl: institution.logoUrl,
    features: JSON.parse(institution.features) as string[],
  };
}

// Get tenant from slug (for API routes)
export async function getTenantBySlug(slug: string): Promise<TenantContext | null> {
  const institution = await prisma.institution.findUnique({
    where: { slug },
  });

  if (!institution || institution.status !== 'active') {
    return null;
  }

  return createTenantContext(institution);
}

// Check if current request is for a specific institution
export async function isInstitutionRequest(): Promise<boolean> {
  const tenant = await resolveTenant();
  return tenant !== null;
}
