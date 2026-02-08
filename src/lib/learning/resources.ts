// Learning Resources Management
// No progress tracking, no gamification - just helpful content

import { prisma } from '@/lib/prisma';

export type ResourceCategory = 'giving' | 'financial' | 'impact' | 'community';
export type ResourceFormat = 'article' | 'video' | 'guide' | 'tool' | 'worksheet' | 'story';

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'video' | 'callout' | 'quote';
  content: string;
  level?: number; // For headings
  items?: string[]; // For lists
  url?: string; // For images/videos
  style?: 'info' | 'tip' | 'warning'; // For callouts
}

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string; description: string }[] = [
  { id: 'giving', label: 'Giving', description: 'Understanding impact, choosing causes, giving strategies' },
  { id: 'financial', label: 'Financial', description: 'Budgeting for giving, tax benefits, planned giving' },
  { id: 'impact', label: 'Impact', description: 'How projects create change, measuring outcomes' },
  { id: 'community', label: 'Community', description: 'Local organizing, collective action, mutual aid' },
];

export const RESOURCE_FORMATS: { id: ResourceFormat; label: string }[] = [
  { id: 'article', label: 'Article' },
  { id: 'video', label: 'Video' },
  { id: 'guide', label: 'Guide' },
  { id: 'tool', label: 'Tool' },
  { id: 'worksheet', label: 'Worksheet' },
  { id: 'story', label: 'Story' },
];

// Get all published resources
export async function getPublishedResources(options?: {
  category?: ResourceCategory;
  format?: ResourceFormat;
  search?: string;
  limit?: number;
}) {
  const { category, format, search, limit = 50 } = options || {};

  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (category) {
    where.category = category;
  }

  if (format) {
    where.format = format;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const resources = await prisma.learningResource.findMany({
    where,
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return resources.map((r) => ({
    ...r,
    content: JSON.parse(r.content) as ContentBlock[],
  }));
}

// Get a single resource by slug
export async function getResourceBySlug(slug: string) {
  const resource = await prisma.learningResource.findUnique({
    where: { slug },
    include: {
      discussions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          replies: {
            take: 5,
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!resource) return null;

  return {
    ...resource,
    content: JSON.parse(resource.content) as ContentBlock[],
  };
}

// Get resource categories with counts
export async function getResourceCategoryCounts() {
  const counts = await prisma.learningResource.groupBy({
    by: ['category'],
    where: { isPublished: true },
    _count: { id: true },
  });

  return RESOURCE_CATEGORIES.map((cat) => ({
    ...cat,
    count: counts.find((c) => c.category === cat.id)?._count.id || 0,
  }));
}

// Get featured/recommended resources (random selection for variety)
export async function getFeaturedResources(limit = 3) {
  const resources = await prisma.learningResource.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    take: limit * 3, // Get extra for randomization
  });

  // Shuffle and take limit
  const shuffled = resources.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map((r) => ({
    ...r,
    content: JSON.parse(r.content) as ContentBlock[],
  }));
}

// Admin: Create resource
export async function createResource(data: {
  title: string;
  slug: string;
  description: string;
  content: ContentBlock[];
  category: ResourceCategory;
  format: ResourceFormat;
  estimatedMinutes?: number;
  imageUrl?: string;
  order?: number;
}) {
  return prisma.learningResource.create({
    data: {
      ...data,
      content: JSON.stringify(data.content),
      isPublished: false,
    },
  });
}

// Admin: Update resource
export async function updateResource(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    content: ContentBlock[];
    category: ResourceCategory;
    format: ResourceFormat;
    estimatedMinutes: number | null;
    imageUrl: string | null;
    order: number;
    isPublished: boolean;
  }>
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.content) {
    updateData.content = JSON.stringify(data.content);
  }

  return prisma.learningResource.update({
    where: { id },
    data: updateData,
  });
}

// Admin: Delete resource
export async function deleteResource(id: string) {
  return prisma.learningResource.delete({
    where: { id },
  });
}
