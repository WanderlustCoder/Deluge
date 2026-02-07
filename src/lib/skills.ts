import { prisma } from './prisma';

// Skill categories and common skills
export const SKILL_CATEGORIES = {
  technical: {
    label: 'Technical',
    skills: [
      'Web Development',
      'Graphic Design',
      'Video Editing',
      'Photography',
      'Mobile App Development',
      'Data Analysis',
      'IT Support',
    ],
  },
  professional: {
    label: 'Professional',
    skills: [
      'Accounting',
      'Legal',
      'Marketing',
      'Writing',
      'Project Management',
      'HR/Recruiting',
      'Public Relations',
    ],
  },
  trade: {
    label: 'Trade',
    skills: [
      'Construction',
      'Plumbing',
      'Electrical',
      'Landscaping',
      'Carpentry',
      'Painting',
      'HVAC',
    ],
  },
  education: {
    label: 'Education',
    skills: [
      'Tutoring',
      'Mentoring',
      'Training',
      'ESL Teaching',
      'Music Instruction',
      'Art Instruction',
      'Coaching',
    ],
  },
  administrative: {
    label: 'Administrative',
    skills: [
      'Data Entry',
      'Organization',
      'Event Planning',
      'Fundraising',
      'Customer Service',
      'Translation',
      'Driving',
    ],
  },
};

export const SKILL_LEVELS = {
  beginner: { label: 'Beginner', description: 'Learning the basics' },
  intermediate: { label: 'Intermediate', description: 'Can work independently' },
  expert: { label: 'Expert', description: 'Professional-level proficiency' },
};

// Add a skill to user profile
export async function addUserSkill(
  userId: string,
  skill: string,
  category: string,
  level: string = 'intermediate',
  description?: string,
  isPublic: boolean = true
) {
  // Check if skill already exists
  const existing = await prisma.userSkill.findUnique({
    where: { userId_skill: { userId, skill } },
  });

  if (existing) {
    throw new Error('You have already added this skill');
  }

  return prisma.userSkill.create({
    data: {
      userId,
      skill,
      category,
      level,
      description,
      isPublic,
    },
  });
}

// Update a user skill
export async function updateUserSkill(
  id: string,
  userId: string,
  updates: {
    level?: string;
    description?: string;
    isPublic?: boolean;
  }
) {
  const skill = await prisma.userSkill.findFirst({
    where: { id, userId },
  });

  if (!skill) {
    throw new Error('Skill not found');
  }

  return prisma.userSkill.update({
    where: { id },
    data: updates,
  });
}

// Remove a user skill
export async function removeUserSkill(id: string, userId: string) {
  const skill = await prisma.userSkill.findFirst({
    where: { id, userId },
  });

  if (!skill) {
    throw new Error('Skill not found');
  }

  return prisma.userSkill.delete({
    where: { id },
  });
}

// Get user's skills
export async function getUserSkills(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    orderBy: [{ category: 'asc' }, { skill: 'asc' }],
  });
}

// Get public skills for a user (for profile display)
export async function getPublicUserSkills(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId, isPublic: true },
    orderBy: [{ category: 'asc' }, { skill: 'asc' }],
  });
}

// Find users with specific skills
export async function findUsersWithSkills(skills: string[], limit: number = 20) {
  return prisma.userSkill.findMany({
    where: {
      skill: { in: skills },
      isPublic: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    take: limit,
  });
}

// Match opportunities to user skills
export async function getMatchingOpportunities(userId: string, limit: number = 10) {
  // Get user's skills
  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    select: { skill: true },
  });

  if (userSkills.length === 0) {
    return [];
  }

  const skillNames = userSkills.map((s) => s.skill.toLowerCase());

  // Get open opportunities and filter by skill match
  const opportunities = await prisma.volunteerOpportunity.findMany({
    where: {
      status: 'open',
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          imageUrl: true,
        },
      },
      _count: {
        select: { signups: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Get more to filter
  });

  // Score and filter opportunities by skill match
  const scoredOpportunities = opportunities
    .map((opp) => {
      const requiredSkills = opp.skillsRequired
        ? JSON.parse(opp.skillsRequired).map((s: string) => s.toLowerCase())
        : [];

      const matchCount = requiredSkills.filter((s: string) =>
        skillNames.some((userSkill) => s.includes(userSkill) || userSkill.includes(s))
      ).length;

      return {
        ...opp,
        matchScore: matchCount,
        matchedSkills: requiredSkills.filter((s: string) =>
          skillNames.some((userSkill) => s.includes(userSkill) || userSkill.includes(s))
        ),
      };
    })
    .filter((opp) => opp.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scoredOpportunities;
}

// Get skill suggestions based on category
export function getSkillSuggestions(category: string): string[] {
  const cat = SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES];
  return cat ? cat.skills : [];
}

// Get all skills flat list
export function getAllSkills(): { skill: string; category: string }[] {
  const allSkills: { skill: string; category: string }[] = [];

  for (const [category, data] of Object.entries(SKILL_CATEGORIES)) {
    for (const skill of data.skills) {
      allSkills.push({ skill, category });
    }
  }

  return allSkills;
}

// Get category for a skill
export function getCategoryForSkill(skillName: string): string | null {
  for (const [category, data] of Object.entries(SKILL_CATEGORIES)) {
    if (data.skills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      return category;
    }
  }
  return null;
}
