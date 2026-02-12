import { prisma } from '@/lib/prisma';
import {
  RESOURCE_CATEGORIES,
  type ResourceCategory,
  type ResourceType,
} from "./resource-constants";
export { RESOURCE_CATEGORIES } from "./resource-constants";
export type { ResourceCategory, ResourceType } from "./resource-constants";

// List all resources (available to all advocates equally)
export async function listResources(options?: {
  category?: ResourceCategory;
  type?: ResourceType;
}) {
  const { category, type } = options || {};

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (type) where.type = type;

  return prisma.advocateResource.findMany({
    where,
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });
}

// Get resource by ID
export async function getResource(id: string) {
  return prisma.advocateResource.findUnique({
    where: { id },
  });
}

// Create resource (admin only)
export async function createResource(data: {
  title: string;
  description?: string;
  type: ResourceType;
  category: ResourceCategory;
  fileUrl?: string;
  content?: string;
}) {
  return prisma.advocateResource.create({
    data,
  });
}

// Update resource (admin only)
export async function updateResource(
  id: string,
  data: {
    title?: string;
    description?: string;
    type?: ResourceType;
    category?: ResourceCategory;
    fileUrl?: string;
    content?: string;
  }
) {
  return prisma.advocateResource.update({
    where: { id },
    data,
  });
}

// Delete resource (admin only)
export async function deleteResource(id: string) {
  return prisma.advocateResource.delete({
    where: { id },
  });
}

// Get resources grouped by category
export async function getResourcesByCategory() {
  const resources = await prisma.advocateResource.findMany({
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });

  const grouped: Record<string, typeof resources> = {};
  for (const category of RESOURCE_CATEGORIES) {
    grouped[category.value] = resources.filter((r) => r.category === category.value);
  }

  return grouped;
}
