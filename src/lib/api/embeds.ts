// Embeddable widgets and buttons

import { prisma } from '@/lib/prisma';

export type EmbedType = 'donate-button' | 'project-card' | 'progress-bar' | 'impact-badge';

export interface EmbedConfig {
  type: EmbedType;
  projectId?: string;
  communityId?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'small' | 'medium' | 'large';
  showAmount?: boolean;
  showProgress?: boolean;
  primaryColor?: string;
  borderRadius?: number;
}

// Generate embed code for a widget
export function generateEmbedCode(config: EmbedConfig, baseUrl: string): string {
  const params = new URLSearchParams();

  if (config.projectId) params.set('project', config.projectId);
  if (config.communityId) params.set('community', config.communityId);
  if (config.theme) params.set('theme', config.theme);
  if (config.size) params.set('size', config.size);
  if (config.showAmount !== undefined) params.set('amount', String(config.showAmount));
  if (config.showProgress !== undefined) params.set('progress', String(config.showProgress));
  if (config.primaryColor) params.set('color', config.primaryColor.replace('#', ''));
  if (config.borderRadius !== undefined) params.set('radius', String(config.borderRadius));

  const embedUrl = `${baseUrl}/embed/${config.type}?${params.toString()}`;

  const dimensions = getEmbedDimensions(config.type, config.size || 'medium');

  return `<iframe
  src="${embedUrl}"
  width="${dimensions.width}"
  height="${dimensions.height}"
  frameborder="0"
  style="border: none; overflow: hidden;"
  title="Deluge ${config.type.replace('-', ' ')}"
  loading="lazy"
></iframe>`;
}

// Get dimensions for embed type
function getEmbedDimensions(
  type: EmbedType,
  size: 'small' | 'medium' | 'large'
): { width: string; height: string } {
  const dimensions: Record<EmbedType, Record<string, { width: string; height: string }>> = {
    'donate-button': {
      small: { width: '120', height: '36' },
      medium: { width: '180', height: '44' },
      large: { width: '240', height: '52' },
    },
    'project-card': {
      small: { width: '280', height: '200' },
      medium: { width: '350', height: '280' },
      large: { width: '450', height: '360' },
    },
    'progress-bar': {
      small: { width: '200', height: '24' },
      medium: { width: '300', height: '32' },
      large: { width: '400', height: '40' },
    },
    'impact-badge': {
      small: { width: '120', height: '120' },
      medium: { width: '160', height: '160' },
      large: { width: '200', height: '200' },
    },
  };

  return dimensions[type][size];
}

// Generate donate button HTML (standalone, no iframe)
export function generateDonateButtonHtml(
  projectId: string,
  baseUrl: string,
  options?: {
    text?: string;
    primaryColor?: string;
    textColor?: string;
    borderRadius?: number;
  }
): string {
  const {
    text = 'Support on Deluge',
    primaryColor = '#0D47A1',
    textColor = '#FFFFFF',
    borderRadius = 8,
  } = options || {};

  return `<a
  href="${baseUrl}/fund?project=${projectId}"
  target="_blank"
  rel="noopener noreferrer"
  style="
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background-color: ${primaryColor};
    color: ${textColor};
    text-decoration: none;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    border-radius: ${borderRadius}px;
    transition: opacity 0.2s;
  "
  onmouseover="this.style.opacity='0.9'"
  onmouseout="this.style.opacity='1'"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
  ${text}
</a>`;
}

// Generate project data for embed
export async function getProjectEmbedData(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      fundingGoal: true,
      fundingRaised: true,
      status: true,
      imageUrl: true,
      _count: {
        select: { allocations: true },
      },
    },
  });

  if (!project) return null;

  return {
    id: project.id,
    title: project.title,
    description: project.description?.substring(0, 150) + (project.description && project.description.length > 150 ? '...' : ''),
    category: project.category,
    fundingGoal: project.fundingGoal,
    fundingRaised: project.fundingRaised,
    progress: Math.round((project.fundingRaised / project.fundingGoal) * 100),
    status: project.status,
    imageUrl: project.imageUrl,
    backerCount: project._count.allocations,
  };
}

// Generate impact badge data
export async function getImpactBadgeData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      allocations: {
        select: { amount: true },
      },
      contributions: {
        select: { amount: true },
      },
    },
  });

  if (!user) return null;

  const totalFunded = user.allocations.reduce((sum, a) => sum + a.amount, 0);
  const totalContributed = user.contributions.reduce((sum, c) => sum + c.amount, 0);

  return {
    name: user.name,
    totalGiven: totalFunded + totalContributed,
    projectsFunded: user.allocations.length,
    contributionsMade: user.contributions.length,
  };
}

// CSS styles for embeds
export const EMBED_STYLES = `
  :root {
    --embed-primary: #0D47A1;
    --embed-secondary: #00897B;
    --embed-text: #1a1a1a;
    --embed-text-muted: #666;
    --embed-bg: #ffffff;
    --embed-border: #e5e7eb;
    --embed-success: #10b981;
  }

  [data-theme="dark"] {
    --embed-text: #ffffff;
    --embed-text-muted: #9ca3af;
    --embed-bg: #1f2937;
    --embed-border: #374151;
  }

  .deluge-embed {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--embed-text);
    background: var(--embed-bg);
    border: 1px solid var(--embed-border);
    border-radius: 8px;
    overflow: hidden;
  }

  .deluge-embed * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .deluge-progress-bar {
    width: 100%;
    height: 8px;
    background: var(--embed-border);
    border-radius: 4px;
    overflow: hidden;
  }

  .deluge-progress-fill {
    height: 100%;
    background: var(--embed-primary);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .deluge-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--embed-primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .deluge-button:hover {
    opacity: 0.9;
  }
`;
