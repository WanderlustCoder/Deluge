// Testimonial management

import { prisma } from '@/lib/prisma';

export type TestimonialType = 'platform' | 'project' | 'community' | 'loan';

export interface CreateTestimonialData {
  content: string;
  authorId?: string;
  authorName: string;
  authorTitle?: string;
  authorImageUrl?: string;
  rating?: number;
  type: TestimonialType;
  entityId?: string;
}

// Create a testimonial
export async function createTestimonial(data: CreateTestimonialData) {
  return prisma.testimonial.create({
    data: {
      content: data.content,
      authorId: data.authorId,
      authorName: data.authorName,
      authorTitle: data.authorTitle,
      authorImageUrl: data.authorImageUrl,
      rating: data.rating,
      type: data.type,
      entityId: data.entityId,
      isVerified: !!data.authorId, // Auto-verify if from registered user
    },
  });
}

// List published testimonials
export async function listTestimonials(options?: {
  type?: TestimonialType;
  entityId?: string;
  featured?: boolean;
  limit?: number;
}) {
  const { type, entityId, featured, limit = 10 } = options || {};

  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (type) where.type = type;
  if (entityId) where.entityId = entityId;
  if (featured) where.isFeatured = true;

  return prisma.testimonial.findMany({
    where,
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}

// Get featured testimonials for display
export async function getFeaturedTestimonials(limit = 5) {
  return prisma.testimonial.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    orderBy: { displayOrder: 'asc' },
    take: limit,
  });
}

// Publish testimonial (admin)
export async function publishTestimonial(id: string) {
  return prisma.testimonial.update({
    where: { id },
    data: { isPublished: true },
  });
}

// Feature testimonial (admin)
export async function featureTestimonial(id: string, featured: boolean, order?: number) {
  return prisma.testimonial.update({
    where: { id },
    data: {
      isFeatured: featured,
      displayOrder: order,
    },
  });
}

// Get testimonials pending review (admin)
export async function getPendingTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: false },
    orderBy: { createdAt: 'asc' },
  });
}

// Delete testimonial (admin)
export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({
    where: { id },
  });
}

// Get average rating for an entity
export async function getAverageRating(type: TestimonialType, entityId?: string) {
  const where: Record<string, unknown> = {
    type,
    isPublished: true,
    rating: { not: null },
  };

  if (entityId) where.entityId = entityId;

  const result = await prisma.testimonial.aggregate({
    where,
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating || 0,
    count: result._count.rating,
  };
}
