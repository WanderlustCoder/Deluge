// Translation loading and management

import { prisma } from '@/lib/prisma';
import { DEFAULT_LOCALE, Locale, TranslationNamespace } from './config';

// In-memory cache for translations
const translationCache: Map<string, Map<string, string>> = new Map();

// Get cache key
function getCacheKey(locale: Locale, namespace: TranslationNamespace): string {
  return `${locale}:${namespace}`;
}

// Load translations from database
export async function loadTranslations(
  locale: Locale,
  namespace: TranslationNamespace
): Promise<Record<string, string>> {
  const cacheKey = getCacheKey(locale, namespace);

  // Check cache first
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!;
    return Object.fromEntries(cached);
  }

  // Load from database
  const translations = await prisma.translation.findMany({
    where: { locale, namespace },
    select: { key: true, value: true },
  });

  // Store in cache
  const map = new Map<string, string>();
  translations.forEach((t) => map.set(t.key, t.value));
  translationCache.set(cacheKey, map);

  return Object.fromEntries(map);
}

// Get a specific translation
export async function getTranslation(
  locale: Locale,
  namespace: TranslationNamespace,
  key: string
): Promise<string> {
  const translations = await loadTranslations(locale, namespace);

  // Return translation or fall back to default locale
  if (translations[key]) {
    return translations[key];
  }

  // Try default locale
  if (locale !== DEFAULT_LOCALE) {
    const defaultTranslations = await loadTranslations(DEFAULT_LOCALE, namespace);
    if (defaultTranslations[key]) {
      return defaultTranslations[key];
    }
  }

  // Return the key as fallback
  return key;
}

// Create or update a translation
export async function setTranslation(
  locale: Locale,
  namespace: TranslationNamespace,
  key: string,
  value: string,
  context?: string
): Promise<void> {
  await prisma.translation.upsert({
    where: {
      locale_namespace_key: { locale, namespace, key },
    },
    create: { locale, namespace, key, value, context },
    update: { value, context, updatedAt: new Date() },
  });

  // Invalidate cache
  const cacheKey = getCacheKey(locale, namespace);
  translationCache.delete(cacheKey);
}

// Bulk import translations
export async function importTranslations(
  locale: Locale,
  namespace: TranslationNamespace,
  translations: Record<string, string>
): Promise<number> {
  const entries = Object.entries(translations);

  for (const [key, value] of entries) {
    await setTranslation(locale, namespace, key, value);
  }

  return entries.length;
}

// Clear translation cache
export function clearTranslationCache(
  locale?: Locale,
  namespace?: TranslationNamespace
): void {
  if (locale && namespace) {
    translationCache.delete(getCacheKey(locale, namespace));
  } else if (locale) {
    for (const key of translationCache.keys()) {
      if (key.startsWith(`${locale}:`)) {
        translationCache.delete(key);
      }
    }
  } else {
    translationCache.clear();
  }
}

// Get translation for content (user-generated content)
export async function getContentTranslation(
  entityType: string,
  entityId: string,
  field: string,
  locale: Locale,
  fallbackContent: string
): Promise<string> {
  const translation = await prisma.contentTranslation.findUnique({
    where: {
      entityType_entityId_field_locale: {
        entityType,
        entityId,
        field,
        locale,
      },
    },
  });

  return translation?.content || fallbackContent;
}

// Set content translation
export async function setContentTranslation(
  entityType: string,
  entityId: string,
  field: string,
  locale: Locale,
  content: string,
  translatedBy?: string,
  isVerified: boolean = false
): Promise<void> {
  await prisma.contentTranslation.upsert({
    where: {
      entityType_entityId_field_locale: {
        entityType,
        entityId,
        field,
        locale,
      },
    },
    create: {
      entityType,
      entityId,
      field,
      locale,
      content,
      translatedBy,
      isVerified,
    },
    update: {
      content,
      translatedBy,
      isVerified,
      updatedAt: new Date(),
    },
  });
}
