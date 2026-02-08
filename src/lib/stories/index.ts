// Impact story management

import { prisma } from '@/lib/prisma';

export type StoryType = 'beneficiary' | 'giver' | 'community' | 'project';
export type StoryStatus = 'draft' | 'review' | 'published' | 'archived';

export interface CreateStoryData {
  title: string;
  summary: string;
  content: object; // Rich content blocks
  type: StoryType;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  projectId?: string;
  communityId?: string;
  loanId?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  quotes?: string[];
  impactMetrics?: Record<string, number>;
  location?: string;
  tags?: string[];
}

// Generate a unique slug
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  return `${base}-${Date.now().toString(36)}`;
}

// Create a new story
export async function createStory(data: CreateStoryData) {
  return prisma.impactStory.create({
    data: {
      title: data.title,
      slug: generateSlug(data.title),
      summary: data.summary.substring(0, 280),
      content: JSON.stringify(data.content),
      type: data.type,
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      projectId: data.projectId,
      communityId: data.communityId,
      loanId: data.loanId,
      mediaUrls: JSON.stringify(data.mediaUrls || []),
      videoUrl: data.videoUrl,
      quotes: data.quotes ? JSON.stringify(data.quotes) : null,
      impactMetrics: data.impactMetrics ? JSON.stringify(data.impactMetrics) : null,
      location: data.location,
      tags: JSON.stringify(data.tags || []),
      status: 'draft',
    },
  });
}

// Get story by slug
export async function getStoryBySlug(slug: string) {
  const story = await prisma.impactStory.findUnique({
    where: { slug },
    include: {
      project: {
        select: { id: true, title: true, category: true },
      },
      community: {
        select: { id: true, name: true },
      },
    },
  });

  if (!story) return null;

  // Increment view count
  await prisma.impactStory.update({
    where: { id: story.id },
    data: { viewCount: { increment: 1 } },
  });

  return {
    ...story,
    content: JSON.parse(story.content),
    mediaUrls: JSON.parse(story.mediaUrls),
    quotes: story.quotes ? JSON.parse(story.quotes) : [],
    impactMetrics: story.impactMetrics ? JSON.parse(story.impactMetrics) : {},
    tags: JSON.parse(story.tags),
  };
}

// List published stories
export async function listStories(options?: {
  type?: StoryType;
  featured?: boolean;
  projectId?: string;
  communityId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { type, featured, projectId, communityId, search, page = 1, limit = 12 } = options || {};

  const where: Record<string, unknown> = {
    status: 'published',
    isPublished: true,
  };

  if (type) where.type = type;
  if (featured) where.isFeatured = true;
  if (projectId) where.projectId = projectId;
  if (communityId) where.communityId = communityId;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
    ];
  }

  const [stories, total] = await Promise.all([
    prisma.impactStory.findMany({
      where,
      include: {
        project: {
          select: { id: true, title: true },
        },
        community: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.impactStory.count({ where }),
  ]);

  return {
    stories: stories.map(s => ({
      ...s,
      mediaUrls: JSON.parse(s.mediaUrls),
      tags: JSON.parse(s.tags),
    })),
    total,
    page,
    limit,
  };
}

// Get featured stories for homepage
export async function getFeaturedStories(limit = 3) {
  const stories = await prisma.impactStory.findMany({
    where: {
      status: 'published',
      isPublished: true,
      isFeatured: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  return stories.map(s => ({
    ...s,
    mediaUrls: JSON.parse(s.mediaUrls),
    tags: JSON.parse(s.tags),
  }));
}

// Update story
export async function updateStory(id: string, data: Partial<CreateStoryData>) {
  const updateData: Record<string, unknown> = {};

  if (data.title) updateData.title = data.title;
  if (data.summary) updateData.summary = data.summary.substring(0, 280);
  if (data.content) updateData.content = JSON.stringify(data.content);
  if (data.type) updateData.type = data.type;
  if (data.authorName !== undefined) updateData.authorName = data.authorName;
  if (data.authorRole !== undefined) updateData.authorRole = data.authorRole;
  if (data.projectId !== undefined) updateData.projectId = data.projectId;
  if (data.communityId !== undefined) updateData.communityId = data.communityId;
  if (data.loanId !== undefined) updateData.loanId = data.loanId;
  if (data.mediaUrls) updateData.mediaUrls = JSON.stringify(data.mediaUrls);
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
  if (data.quotes) updateData.quotes = JSON.stringify(data.quotes);
  if (data.impactMetrics) updateData.impactMetrics = JSON.stringify(data.impactMetrics);
  if (data.location !== undefined) updateData.location = data.location;
  if (data.tags) updateData.tags = JSON.stringify(data.tags);

  return prisma.impactStory.update({
    where: { id },
    data: updateData,
  });
}

// Publish story
export async function publishStory(id: string) {
  return prisma.impactStory.update({
    where: { id },
    data: {
      status: 'published',
      isPublished: true,
      publishedAt: new Date(),
    },
  });
}

// Feature/unfeature story
export async function setFeatured(id: string, featured: boolean) {
  return prisma.impactStory.update({
    where: { id },
    data: { isFeatured: featured },
  });
}

// Archive story
export async function archiveStory(id: string) {
  return prisma.impactStory.update({
    where: { id },
    data: {
      status: 'archived',
      isPublished: false,
    },
  });
}

// Track story view
export async function trackStoryView(storyId: string, userId?: string, source?: string) {
  return prisma.storyView.create({
    data: {
      storyId,
      userId,
      source,
    },
  });
}

// Track story share
export async function trackStoryShare(storyId: string, platform: string, userId?: string) {
  const [share] = await prisma.$transaction([
    prisma.storyShare.create({
      data: {
        storyId,
        platform,
        userId,
      },
    }),
    prisma.impactStory.update({
      where: { id: storyId },
      data: { shareCount: { increment: 1 } },
    }),
  ]);

  return share;
}

// Get stories pending review (admin)
export async function getStoriesForReview() {
  return prisma.impactStory.findMany({
    where: { status: 'review' },
    orderBy: { createdAt: 'asc' },
  });
}
