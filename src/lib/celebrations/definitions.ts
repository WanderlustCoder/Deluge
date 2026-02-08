// Milestone definitions - recognition, not gamification

export interface MilestoneDefinition {
  type: string;
  title: string;
  description: string;
  entityType: 'user' | 'community' | 'family' | 'platform';
  check: (value: number) => boolean;
  message: string;
}

// Personal milestones - celebrating individual journeys
export const PERSONAL_MILESTONES: MilestoneDefinition[] = [
  {
    type: 'first_contribution',
    title: 'First Contribution',
    description: 'Made your first contribution to a project',
    entityType: 'user',
    check: (count) => count >= 1,
    message: 'Welcome to the community! Every contribution matters.',
  },
  {
    type: 'first_cascade',
    title: 'First Cascade',
    description: 'Helped a project reach a new cascade stage',
    entityType: 'user',
    check: (count) => count >= 1,
    message: 'You helped make this happen!',
  },
  {
    type: 'projects_5',
    title: 'Five Projects',
    description: 'Supported 5 different projects',
    entityType: 'user',
    check: (count) => count >= 5,
    message: 'Five projects, countless neighbors helped.',
  },
  {
    type: 'projects_10',
    title: 'A Dozen Projects',
    description: 'Supported 10 different projects',
    entityType: 'user',
    check: (count) => count >= 10,
    message: 'A dozen projects, countless neighbors.',
  },
  {
    type: 'projects_25',
    title: 'Community Champion',
    description: 'Supported 25 different projects',
    entityType: 'user',
    check: (count) => count >= 25,
    message: 'Your generosity ripples through the community.',
  },
  {
    type: 'projects_50',
    title: 'Fifty Acts of Giving',
    description: 'Supported 50 different projects',
    entityType: 'user',
    check: (count) => count >= 50,
    message: 'Half a hundred projects, immeasurable impact.',
  },
  {
    type: 'categories_3',
    title: 'Diverse Giving',
    description: 'Gave in 3 different project categories',
    entityType: 'user',
    check: (count) => count >= 3,
    message: 'Your giving reaches across communities.',
  },
  {
    type: 'first_community',
    title: 'Community Member',
    description: 'Joined your first community',
    entityType: 'user',
    check: (count) => count >= 1,
    message: 'Welcome to the neighborhood!',
  },
  {
    type: 'first_completed',
    title: 'Project Complete',
    description: 'A project you supported was completed',
    entityType: 'user',
    check: (count) => count >= 1,
    message: 'See the impact of your giving.',
  },
  {
    type: 'anniversary_1',
    title: 'One Year',
    description: '1 year on Deluge',
    entityType: 'user',
    check: (days) => days >= 365,
    message: 'One year of community impact.',
  },
  {
    type: 'anniversary_2',
    title: 'Two Years',
    description: '2 years on Deluge',
    entityType: 'user',
    check: (days) => days >= 730,
    message: 'Two years of making a difference.',
  },
  {
    type: 'referral_first',
    title: 'Brought a Friend',
    description: 'Introduced a friend who gave',
    entityType: 'user',
    check: (count) => count >= 1,
    message: 'The community grows together.',
  },
];

// Community milestones - collective achievements
export const COMMUNITY_MILESTONES: MilestoneDefinition[] = [
  {
    type: 'first_funded',
    title: 'First Funded',
    description: 'Community\'s first fully funded project',
    entityType: 'community',
    check: (count) => count >= 1,
    message: 'We did it together!',
  },
  {
    type: 'members_10',
    title: '10 Members',
    description: 'Community reached 10 members',
    entityType: 'community',
    check: (count) => count >= 10,
    message: 'Our community is growing.',
  },
  {
    type: 'members_25',
    title: '25 Members',
    description: 'Community reached 25 members',
    entityType: 'community',
    check: (count) => count >= 25,
    message: 'Growing stronger together.',
  },
  {
    type: 'members_50',
    title: '50 Members',
    description: 'Community reached 50 members',
    entityType: 'community',
    check: (count) => count >= 50,
    message: 'A thriving community.',
  },
  {
    type: 'members_100',
    title: '100 Members',
    description: 'Community reached 100 members',
    entityType: 'community',
    check: (count) => count >= 100,
    message: 'A hundred hearts, one community.',
  },
  {
    type: 'funding_1k',
    title: '$1,000 Funded',
    description: 'Community funded $1,000 total',
    entityType: 'community',
    check: (amount) => amount >= 1000,
    message: 'A thousand dollars of impact.',
  },
  {
    type: 'funding_5k',
    title: '$5,000 Funded',
    description: 'Community funded $5,000 total',
    entityType: 'community',
    check: (amount) => amount >= 5000,
    message: 'Five thousand reasons to celebrate.',
  },
  {
    type: 'funding_10k',
    title: '$10,000 Funded',
    description: 'Community funded $10,000 total',
    entityType: 'community',
    check: (amount) => amount >= 10000,
    message: 'Look what we\'ve built together.',
  },
  {
    type: 'funding_25k',
    title: '$25,000 Funded',
    description: 'Community funded $25,000 total',
    entityType: 'community',
    check: (amount) => amount >= 25000,
    message: 'Twenty-five thousand in community impact.',
  },
  {
    type: 'projects_5',
    title: '5 Projects Completed',
    description: '5 projects completed by the community',
    entityType: 'community',
    check: (count) => count >= 5,
    message: 'Five projects, real change.',
  },
  {
    type: 'projects_10',
    title: '10 Projects Completed',
    description: '10 projects completed by the community',
    entityType: 'community',
    check: (count) => count >= 10,
    message: 'Ten projects, lasting impact.',
  },
  {
    type: 'joint_project',
    title: 'Joint Project',
    description: 'First joint project with another community',
    entityType: 'community',
    check: (count) => count >= 1,
    message: 'Communities working together.',
  },
  {
    type: 'anniversary_1',
    title: 'One Year Anniversary',
    description: 'Community is 1 year old',
    entityType: 'community',
    check: (days) => days >= 365,
    message: 'One year of community.',
  },
];

// Get milestone definition by type
export function getMilestoneDefinition(
  milestoneType: string,
  entityType: 'user' | 'community'
): MilestoneDefinition | undefined {
  const milestones = entityType === 'user' ? PERSONAL_MILESTONES : COMMUNITY_MILESTONES;
  return milestones.find((m) => m.type === milestoneType);
}
