/**
 * AI Content Assistant
 * Plan 28: AI-Powered Platform Features
 *
 * Helps users write better project descriptions, grant applications, and stories.
 * Uses local analysis for suggestions, with optional AI API integration.
 */

import { prisma } from '@/lib/prisma';

export type AssistType = 'description' | 'grant' | 'story';

export interface ContentSuggestion {
  type: 'clarity' | 'impact' | 'completeness' | 'grammar' | 'length';
  severity: 'info' | 'warning' | 'suggestion';
  message: string;
  original?: string;
  suggestion?: string;
}

export interface ContentAnalysis {
  score: number; // 0-100
  suggestions: ContentSuggestion[];
  metrics: {
    wordCount: number;
    sentenceCount: number;
    readability: number;
    impactScore: number;
  };
}

// Impact words that make descriptions more compelling
const IMPACT_WORDS = [
  'help', 'support', 'benefit', 'improve', 'transform', 'empower',
  'community', 'together', 'families', 'children', 'seniors',
  'environment', 'sustainable', 'healthy', 'safe', 'accessible',
];

// Words that weaken descriptions
const WEAK_WORDS = [
  'maybe', 'possibly', 'hopefully', 'try', 'might', 'could',
  'sort of', 'kind of', 'a little', 'somewhat',
];

/**
 * Analyze project description
 */
export function analyzeDescription(text: string): ContentAnalysis {
  const suggestions: ContentSuggestion[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  // Word count analysis
  const wordCount = words.length;
  if (wordCount < 50) {
    suggestions.push({
      type: 'length',
      severity: 'warning',
      message: 'Your description is quite short. Consider adding more details about your project\'s goals and impact.',
    });
  } else if (wordCount > 500) {
    suggestions.push({
      type: 'length',
      severity: 'info',
      message: 'Your description is lengthy. Consider condensing to keep reader attention.',
    });
  }

  // Check for impact language
  const impactWordCount = IMPACT_WORDS.filter(word =>
    text.toLowerCase().includes(word.toLowerCase())
  ).length;

  if (impactWordCount < 2) {
    suggestions.push({
      type: 'impact',
      severity: 'suggestion',
      message: 'Consider using more impact-focused language like "help," "benefit," or "transform" to convey your project\'s importance.',
    });
  }

  // Check for weak language
  const weakWordsFound = WEAK_WORDS.filter(word =>
    text.toLowerCase().includes(word.toLowerCase())
  );

  if (weakWordsFound.length > 0) {
    suggestions.push({
      type: 'clarity',
      severity: 'suggestion',
      message: `Consider replacing tentative language (${weakWordsFound.slice(0, 3).join(', ')}) with more confident statements.`,
    });
  }

  // Check for specific numbers/metrics
  const hasNumbers = /\d+/.test(text);
  if (!hasNumbers) {
    suggestions.push({
      type: 'completeness',
      severity: 'suggestion',
      message: 'Adding specific numbers (e.g., "help 50 families" or "plant 100 trees") makes your impact more concrete.',
    });
  }

  // Check sentence variety
  const avgSentenceLength = wordCount / Math.max(sentences.length, 1);
  if (avgSentenceLength > 25) {
    suggestions.push({
      type: 'clarity',
      severity: 'info',
      message: 'Some sentences are quite long. Breaking them up can improve readability.',
    });
  }

  // Check for call to action
  const hasCallToAction = /join us|help us|support|contribute|together|be part of/i.test(text);
  if (!hasCallToAction) {
    suggestions.push({
      type: 'completeness',
      severity: 'suggestion',
      message: 'Consider adding a clear call to action inviting readers to participate.',
    });
  }

  // Calculate scores
  const readability = Math.max(0, 100 - (avgSentenceLength * 2));
  const impactScore = Math.min(100, impactWordCount * 15 + (hasNumbers ? 20 : 0));
  const score = Math.round(
    (100 - suggestions.filter(s => s.severity === 'warning').length * 15) *
    (1 - weakWordsFound.length * 0.05)
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    suggestions,
    metrics: {
      wordCount,
      sentenceCount: sentences.length,
      readability,
      impactScore,
    },
  };
}

/**
 * Generate improvement suggestions for grants
 */
export function analyzeGrantApplication(
  projectDescription: string,
  budgetDescription: string,
  impactStatement: string
): ContentAnalysis {
  const suggestions: ContentSuggestion[] = [];

  // Analyze project description
  const descAnalysis = analyzeDescription(projectDescription);
  suggestions.push(...descAnalysis.suggestions.map(s => ({
    ...s,
    message: `Project description: ${s.message}`,
  })));

  // Budget specificity
  const hasBudgetItems = /\$[\d,]+/.test(budgetDescription);
  if (!hasBudgetItems) {
    suggestions.push({
      type: 'completeness',
      severity: 'warning',
      message: 'Budget should include specific dollar amounts for each line item.',
    });
  }

  // Impact statement
  if (impactStatement.length < 100) {
    suggestions.push({
      type: 'completeness',
      severity: 'warning',
      message: 'Impact statement is brief. Expand on measurable outcomes and who benefits.',
    });
  }

  const hasMetrics = /\d+\s*(people|families|children|students|trees|meals|hours)/i.test(impactStatement);
  if (!hasMetrics) {
    suggestions.push({
      type: 'impact',
      severity: 'suggestion',
      message: 'Include specific metrics in your impact statement (e.g., "serve 200 meals weekly").',
    });
  }

  return {
    score: Math.max(0, 100 - suggestions.filter(s => s.severity === 'warning').length * 20),
    suggestions,
    metrics: {
      wordCount: projectDescription.split(/\s+/).length +
        budgetDescription.split(/\s+/).length +
        impactStatement.split(/\s+/).length,
      sentenceCount: (projectDescription + budgetDescription + impactStatement)
        .split(/[.!?]+/).filter(Boolean).length,
      readability: descAnalysis.metrics.readability,
      impactScore: descAnalysis.metrics.impactScore,
    },
  };
}

/**
 * Log AI assistance usage
 */
export async function logAssistance(
  userId: string,
  assistType: AssistType,
  inputLength: number,
  outputLength: number,
  latencyMs: number
): Promise<void> {
  await prisma.aIAssistanceLog.create({
    data: {
      userId,
      assistType,
      inputLength,
      outputLength,
      model: 'local-analysis',
      latencyMs,
      tokensUsed: Math.ceil((inputLength + outputLength) / 4),
      costUsd: 0, // Local analysis is free
    },
  });
}

/**
 * Get suggested titles based on description
 */
export function suggestTitles(description: string): string[] {
  const words = description.toLowerCase().split(/\s+/);
  const suggestions: string[] = [];

  // Find key nouns and verbs
  const keyTerms = IMPACT_WORDS.filter(w => words.includes(w));
  const locations = description.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];

  // Generate title patterns
  if (keyTerms.length > 0 && locations.length > 0) {
    suggestions.push(`${keyTerms[0].charAt(0).toUpperCase() + keyTerms[0].slice(1)} ${locations[0]}`);
  }

  // Action-focused titles
  const actionWords = ['Building', 'Creating', 'Supporting', 'Empowering', 'Growing'];
  const randomAction = actionWords[Math.floor(Math.random() * actionWords.length)];
  if (keyTerms.length > 0) {
    suggestions.push(`${randomAction} ${keyTerms[0]} in Our Community`);
  }

  return suggestions.slice(0, 3);
}

/**
 * Check content completeness
 */
export function checkCompleteness(content: {
  title?: string;
  description?: string;
  category?: string;
  fundingGoal?: number;
  timeline?: string;
}): { complete: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!content.title || content.title.length < 5) {
    missing.push('title');
  }
  if (!content.description || content.description.length < 50) {
    missing.push('description (at least 50 characters)');
  }
  if (!content.category) {
    missing.push('category');
  }
  if (!content.fundingGoal || content.fundingGoal <= 0) {
    missing.push('funding goal');
  }
  if (!content.timeline) {
    missing.push('project timeline');
  }

  return {
    complete: missing.length === 0,
    missing,
  };
}
