// Giving Scenarios
// Exploration, not tests - no right/wrong answers

import { prisma } from '@/lib/prisma';

export interface ScenarioOption {
  id: string;
  title: string;
  description: string;
}

export interface ScenarioConsideration {
  id: string;
  point: string;
}

// Get all scenarios
export async function getScenarios(options?: {
  category?: string;
  limit?: number;
}) {
  const { category, limit = 20 } = options || {};

  const where: Record<string, unknown> = {};
  if (category) {
    where.category = category;
  }

  const scenarios = await prisma.givingScenario.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return scenarios.map((s) => ({
    ...s,
    options: JSON.parse(s.options) as ScenarioOption[],
    considerations: JSON.parse(s.considerations) as ScenarioConsideration[],
  }));
}

// Get a single scenario
export async function getScenarioById(id: string) {
  const scenario = await prisma.givingScenario.findUnique({
    where: { id },
  });

  if (!scenario) return null;

  return {
    ...scenario,
    options: JSON.parse(scenario.options) as ScenarioOption[],
    considerations: JSON.parse(scenario.considerations) as ScenarioConsideration[],
  };
}

// Get scenario categories with counts
export async function getScenarioCategoryCounts() {
  const counts = await prisma.givingScenario.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  const categories = [
    { id: 'local', label: 'Local Giving' },
    { id: 'global', label: 'Global Impact' },
    { id: 'emergency', label: 'Emergency Response' },
    { id: 'recurring', label: 'Recurring Giving' },
    { id: 'matching', label: 'Matching Funds' },
  ];

  return categories.map((cat) => ({
    ...cat,
    count: counts.find((c) => c.category === cat.id)?._count.id || 0,
  }));
}

// Get a random scenario
export async function getRandomScenario(excludeIds?: string[]) {
  const scenarios = await prisma.givingScenario.findMany({
    where: excludeIds?.length ? { id: { notIn: excludeIds } } : undefined,
    take: 10,
  });

  if (scenarios.length === 0) return null;

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  return {
    ...scenario,
    options: JSON.parse(scenario.options) as ScenarioOption[],
    considerations: JSON.parse(scenario.considerations) as ScenarioConsideration[],
  };
}

// Admin: Create scenario
export async function createScenario(data: {
  title: string;
  scenario: string;
  options: ScenarioOption[];
  considerations: ScenarioConsideration[];
  category: string;
}) {
  return prisma.givingScenario.create({
    data: {
      title: data.title,
      scenario: data.scenario,
      options: JSON.stringify(data.options),
      considerations: JSON.stringify(data.considerations),
      category: data.category,
    },
  });
}

// Admin: Update scenario
export async function updateScenario(
  id: string,
  data: Partial<{
    title: string;
    scenario: string;
    options: ScenarioOption[];
    considerations: ScenarioConsideration[];
    category: string;
  }>
) {
  const updateData: Record<string, unknown> = {};

  if (data.title) updateData.title = data.title;
  if (data.scenario) updateData.scenario = data.scenario;
  if (data.options) updateData.options = JSON.stringify(data.options);
  if (data.considerations) updateData.considerations = JSON.stringify(data.considerations);
  if (data.category) updateData.category = data.category;

  return prisma.givingScenario.update({
    where: { id },
    data: updateData,
  });
}

// Sample scenarios for seeding
export const SAMPLE_SCENARIOS = [
  {
    title: 'Local vs. Global Impact',
    scenario: 'You have $100 to give. A local food bank needs immediate help to serve families in your neighborhood, while an international organization can provide meals to many more people in a developing country for the same amount. What considerations might inform your decision?',
    options: [
      { id: 'local', title: 'Give Locally', description: 'Support the food bank in your community' },
      { id: 'global', title: 'Give Globally', description: 'Support the international organization' },
      { id: 'split', title: 'Split It', description: 'Divide between both causes' },
    ],
    considerations: [
      { id: '1', point: 'Local giving lets you see direct impact in your community' },
      { id: '2', point: 'Global giving can sometimes reach more people per dollar' },
      { id: '3', point: 'Your personal connection to a cause matters' },
      { id: '4', point: 'Both types of giving are valuable' },
    ],
    category: 'local',
  },
  {
    title: 'Matching Campaign',
    scenario: 'A project you support has a matching campaign where your donation will be doubled, but only for the next 24 hours. You usually prefer to research before giving. What might you consider?',
    options: [
      { id: 'now', title: 'Give Now', description: 'Take advantage of the matching opportunity' },
      { id: 'wait', title: 'Research First', description: 'Wait and research, even if you miss the match' },
      { id: 'small', title: 'Give Small Now', description: 'Make a smaller gift now and potentially more later' },
    ],
    considerations: [
      { id: '1', point: 'Matching campaigns can double your impact' },
      { id: '2', point: 'Urgency tactics sometimes lead to less thoughtful giving' },
      { id: '3', point: 'Your giving should feel right to you, not pressured' },
      { id: '4', point: 'A smaller thoughtful gift may be better than a larger rushed one' },
    ],
    category: 'matching',
  },
  {
    title: 'Emergency vs. Prevention',
    scenario: 'After a natural disaster, relief organizations need funds urgently. Meanwhile, a local preparedness nonprofit works on preventing future damage through infrastructure and education. How might you balance immediate relief and long-term prevention?',
    options: [
      { id: 'relief', title: 'Emergency Relief', description: 'Help those affected right now' },
      { id: 'prevention', title: 'Prevention Work', description: 'Invest in reducing future disasters' },
      { id: 'both', title: 'Both Are Needed', description: 'Find ways to support both' },
    ],
    considerations: [
      { id: '1', point: 'Emergency relief addresses immediate suffering' },
      { id: '2', point: 'Prevention can reduce future emergencies' },
      { id: '3', point: 'Both approaches serve different but valid purposes' },
      { id: '4', point: 'Your timeline for impact affects your choice' },
    ],
    category: 'emergency',
  },
];
