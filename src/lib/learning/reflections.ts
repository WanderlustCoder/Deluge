// Reflection Prompts and Journal
// Private by default, no streaks or tracking pressure

import { prisma } from '@/lib/prisma';

export const REFLECTION_PROMPTS = [
  {
    id: 'values',
    prompt: 'What causes matter most to you and why?',
    category: 'values',
  },
  {
    id: 'generosity',
    prompt: 'Describe a time generosity made a difference in your life.',
    category: 'experience',
  },
  {
    id: 'hopes',
    prompt: 'What do you hope your giving will accomplish?',
    category: 'goals',
  },
  {
    id: 'decisions',
    prompt: 'How do you decide between competing needs?',
    category: 'decisions',
  },
  {
    id: 'community',
    prompt: 'What does community mean to you?',
    category: 'values',
  },
  {
    id: 'change',
    prompt: 'What change would you most like to see in your neighborhood?',
    category: 'goals',
  },
  {
    id: 'gratitude',
    prompt: 'What are you grateful for today?',
    category: 'gratitude',
  },
  {
    id: 'impact',
    prompt: 'How do you define "impact" in giving?',
    category: 'values',
  },
  {
    id: 'connection',
    prompt: 'How does giving connect you to others?',
    category: 'experience',
  },
  {
    id: 'learning',
    prompt: 'What have you learned about yourself through giving?',
    category: 'experience',
  },
];

// Get user's reflections
export async function getUserReflections(
  userId: string,
  options?: { limit?: number; offset?: number }
) {
  const { limit = 20, offset = 0 } = options || {};

  return prisma.reflectionEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

// Get a random prompt (not one they've recently used)
export async function getRandomPrompt(userId: string) {
  const recentReflections = await prisma.reflectionEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { prompt: true },
  });

  const recentPrompts = new Set(recentReflections.map((r) => r.prompt));
  const availablePrompts = REFLECTION_PROMPTS.filter(
    (p) => !recentPrompts.has(p.prompt)
  );

  if (availablePrompts.length === 0) {
    // All prompts used recently, just pick a random one
    return REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
  }

  return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
}

// Create a reflection entry
export async function createReflection(
  userId: string,
  data: {
    prompt: string;
    response: string;
    isPrivate?: boolean;
  }
) {
  return prisma.reflectionEntry.create({
    data: {
      userId,
      prompt: data.prompt,
      response: data.response,
      isPrivate: data.isPrivate ?? true,
    },
  });
}

// Update a reflection entry
export async function updateReflection(
  id: string,
  userId: string,
  data: {
    response?: string;
    isPrivate?: boolean;
  }
) {
  return prisma.reflectionEntry.updateMany({
    where: { id, userId },
    data,
  });
}

// Delete a reflection entry
export async function deleteReflection(id: string, userId: string) {
  return prisma.reflectionEntry.deleteMany({
    where: { id, userId },
  });
}

// Get reflection count (no pressure, just info)
export async function getReflectionCount(userId: string) {
  return prisma.reflectionEntry.count({
    where: { userId },
  });
}
