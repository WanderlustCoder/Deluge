// Smart matching algorithm for mentors and mentees

import { prisma } from '@/lib/prisma';

interface MatchScore {
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string | null;
  expertise: string[];
  style: string;
  score: number;
  breakdown: {
    expertiseMatch: number;
    styleMatch: number;
    timezoneMatch: number;
    availabilityScore: number;
    ratingScore: number;
  };
}

// Calculate timezone compatibility (0-1)
function calculateTimezoneScore(mentorTz?: string | null, menteeTz?: string | null): number {
  if (!mentorTz || !menteeTz) return 0.5; // Neutral if unknown

  // Simple heuristic - same timezone = 1, different = lower score based on difference
  // In a real app, you'd calculate actual hour differences
  if (mentorTz === menteeTz) return 1;

  // Check if they're in similar regions
  const mentorRegion = mentorTz.split('/')[0];
  const menteeRegion = menteeTz.split('/')[0];

  if (mentorRegion === menteeRegion) return 0.7;

  return 0.3;
}

// Calculate expertise match (0-1)
function calculateExpertiseMatch(mentorExpertise: string[], menteeGoals: string[]): number {
  if (mentorExpertise.length === 0 || menteeGoals.length === 0) return 0;

  // Map goals to relevant expertise
  const goalToExpertise: Record<string, string[]> = {
    learn_giving: ['giving', 'community'],
    build_budget: ['financial', 'budgeting'],
    understand_loans: ['loans', 'financial'],
    community_impact: ['community', 'giving'],
    effective_giving: ['giving', 'financial'],
    tax_benefits: ['financial', 'giving'],
  };

  let matches = 0;
  let total = 0;

  for (const goal of menteeGoals) {
    const relevantExpertise = goalToExpertise[goal] || [];
    total += relevantExpertise.length || 1;

    for (const exp of relevantExpertise) {
      if (mentorExpertise.includes(exp)) {
        matches++;
      }
    }
  }

  return total > 0 ? matches / total : 0;
}

// Calculate style match (0-1)
function calculateStyleMatch(mentorStyle: string, menteeStyle: string): number {
  if (menteeStyle === 'any') return 1;
  if (mentorStyle === menteeStyle) return 1;

  // Some styles are more compatible than others
  const compatibilityMap: Record<string, Record<string, number>> = {
    async: { scheduled: 0.5, casual: 0.7 },
    scheduled: { async: 0.5, casual: 0.6 },
    casual: { async: 0.7, scheduled: 0.6 },
  };

  return compatibilityMap[mentorStyle]?.[menteeStyle] || 0.5;
}

// Get mentor match suggestions for a mentee
export async function getMentorSuggestions(menteeUserId: string, limit = 5): Promise<MatchScore[]> {
  // Get mentee profile
  const mentee = await prisma.mentee.findUnique({
    where: { userId: menteeUserId },
  });

  if (!mentee) {
    throw new Error('Mentee profile not found');
  }

  const menteeGoals: string[] = JSON.parse(mentee.goals);

  // Get active mentors who are accepting mentees
  const mentors = await prisma.mentor.findMany({
    where: {
      status: 'active',
      isAccepting: true,
    },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  // Calculate scores for each mentor
  const scores: MatchScore[] = mentors.map(mentor => {
    const mentorExpertise: string[] = JSON.parse(mentor.expertise);

    const expertiseMatch = calculateExpertiseMatch(mentorExpertise, menteeGoals);
    const styleMatch = calculateStyleMatch(mentor.preferredStyle, mentee.preferredStyle);
    const timezoneMatch = calculateTimezoneScore(mentor.timezone, mentee.timezone);

    // Availability score - prefer mentors with more capacity
    const capacityRatio = 1 - (mentor.currentMentees / mentor.maxMentees);
    const availabilityScore = Math.min(1, capacityRatio);

    // Rating score - normalize to 0-1
    const ratingScore = mentor.avgRating ? mentor.avgRating / 5 : 0.5;

    // Weighted total score
    const weights = {
      expertise: 0.35,
      style: 0.20,
      timezone: 0.15,
      availability: 0.15,
      rating: 0.15,
    };

    const score =
      expertiseMatch * weights.expertise +
      styleMatch * weights.style +
      timezoneMatch * weights.timezone +
      availabilityScore * weights.availability +
      ratingScore * weights.rating;

    return {
      mentorId: mentor.id,
      mentorName: mentor.user.name,
      mentorAvatar: mentor.user.avatarUrl,
      expertise: mentorExpertise,
      style: mentor.preferredStyle,
      score: Math.round(score * 100),
      breakdown: {
        expertiseMatch: Math.round(expertiseMatch * 100),
        styleMatch: Math.round(styleMatch * 100),
        timezoneMatch: Math.round(timezoneMatch * 100),
        availabilityScore: Math.round(availabilityScore * 100),
        ratingScore: Math.round(ratingScore * 100),
      },
    };
  });

  // Sort by score and return top matches
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get mentee suggestions for a mentor (for proactive outreach)
export async function getMenteeSuggestions(mentorUserId: string, limit = 5) {
  const mentor = await prisma.mentor.findUnique({
    where: { userId: mentorUserId },
  });

  if (!mentor) {
    throw new Error('Mentor profile not found');
  }

  const mentorExpertise: string[] = JSON.parse(mentor.expertise);

  // Get mentees who are seeking mentors
  const mentees = await prisma.mentee.findMany({
    where: { status: 'seeking' },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  // Filter out mentees this mentor already has a relationship with
  const existingMentorships = await prisma.mentorship.findMany({
    where: { mentorId: mentor.id },
    select: { menteeId: true },
  });

  const existingMenteeIds = new Set(existingMentorships.map(m => m.menteeId));

  const availableMentees = mentees.filter(m => !existingMenteeIds.has(m.id));

  // Score each mentee
  const scores = availableMentees.map(mentee => {
    const menteeGoals: string[] = JSON.parse(mentee.goals);

    const expertiseMatch = calculateExpertiseMatch(mentorExpertise, menteeGoals);
    const styleMatch = calculateStyleMatch(mentor.preferredStyle, mentee.preferredStyle);
    const timezoneMatch = calculateTimezoneScore(mentor.timezone, mentee.timezone);

    const score = expertiseMatch * 0.5 + styleMatch * 0.25 + timezoneMatch * 0.25;

    return {
      menteeId: mentee.id,
      menteeName: mentee.user.name,
      menteeAvatar: mentee.user.avatarUrl,
      goals: menteeGoals,
      style: mentee.preferredStyle,
      score: Math.round(score * 100),
    };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
