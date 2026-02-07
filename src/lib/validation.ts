import { z } from "zod";
import { sanitizeText } from "./sanitize";
import {
  MIN_FUNDING_AMOUNT,
  PROJECT_CATEGORIES,
  LOAN_CATEGORIES,
  LOAN_QA_QUESTION_MAX_CHARS,
  COMMUNITY_TYPES,
  COMMUNITY_LEVELS,
} from "./constants";

// Reusable sanitized string fields
const sanitized = (maxLen: number) =>
  z.string().max(maxLen).transform(sanitizeText);

// --- Auth schemas ---
export const registerSchema = z.object({
  name: sanitized(100).pipe(z.string().min(1, "Name is required")),
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  referralCode: z.string().max(50).optional(),
});

// --- Account schemas ---
export const updateNameSchema = z.object({
  name: sanitized(100).pipe(z.string().min(1, "Name is required")),
});

// --- Project schemas ---
export const createProjectSchema = z.object({
  title: sanitized(200).pipe(z.string().min(1, "Title is required")),
  description: sanitized(2000).pipe(z.string().min(1, "Description is required")),
  category: z.enum(PROJECT_CATEGORIES as unknown as [string, ...string[]]),
  fundingGoal: z.number().positive("Funding goal must be positive"),
  location: sanitized(200).pipe(z.string().min(1, "Location is required")),
  imageUrl: z.string().max(500).nullable().optional(),
});

export const updateProjectSchema = z.object({
  title: sanitized(200).pipe(z.string().min(1)).optional(),
  description: sanitized(2000).pipe(z.string().min(1)).optional(),
  category: z.enum(PROJECT_CATEGORIES as unknown as [string, ...string[]]).optional(),
  fundingGoal: z.number().positive().optional(),
  location: sanitized(200).pipe(z.string().min(1)).optional(),
  status: z.enum(["active", "funded", "completed"]).optional(),
  imageUrl: z.string().max(500).nullable().optional(),
});

// --- Funding schemas ---
export const fundProjectSchema = z.object({
  projectId: z.string().min(1),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(MIN_FUNDING_AMOUNT, `Minimum funding amount is $${MIN_FUNDING_AMOUNT.toFixed(2)}`),
});

// --- Contribution schemas ---
export const contributeSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(100000),
  type: z.enum(["cash", "simulated"]).default("simulated"),
});

// --- Loan schemas ---
export const loanFundSchema = z.object({
  shares: z.number().int().positive("Must buy at least 1 share"),
});

// --- Community schemas ---
export const createCommunitySchema = z.object({
  name: sanitized(100).pipe(z.string().min(1, "Name is required")),
  description: sanitized(2000).pipe(z.string().min(1, "Description is required")),
  location: sanitized(200).optional(),
  category: sanitized(100).optional(),
  // Hierarchy fields
  type: z.enum(COMMUNITY_TYPES as unknown as [string, ...string[]]).default("geographic"),
  parentId: z.string().optional(),
  level: z.enum(COMMUNITY_LEVELS as unknown as [string, ...string[]]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const addCommunityProjectSchema = z.object({
  projectId: z.string().min(1),
});

// --- Bulk admin schemas ---
export const bulkNotifySchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, "At least one user required"),
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(1000),
  type: z.string().min(1).max(50),
});

// --- Loan Stretch Goals ---
export const stretchGoalSchema = z.object({
  priority: z.number().int().min(1).max(3),
  amount: z.number().positive("Amount must be positive"),
  purpose: sanitized(500).pipe(z.string().min(1, "Purpose is required")),
});

export const loanApplySchema = z.object({
  amount: z.number().positive(),
  purpose: z.string().min(1, "Purpose is required"),
  purposeCategory: z.enum(LOAN_CATEGORIES as unknown as [string, ...string[]]),
  story: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  repaymentMonths: z.number().int().min(1),
  stretchGoals: z.array(stretchGoalSchema).max(3).optional(),
});

// --- Loan Q&A ---
export const loanQuestionSchema = z.object({
  question: sanitized(LOAN_QA_QUESTION_MAX_CHARS).pipe(
    z.string().min(1, "Question is required")
  ),
});

export const loanAnswerSchema = z.object({
  answer: sanitized(1000).pipe(z.string().min(1, "Answer is required")),
});

// --- Goal Verification ---
export const goalVerificationSchema = z.object({
  photoUrls: z.array(z.string().url()).min(1, "At least one photo is required"),
  receiptUrls: z.array(z.string().url()).optional(),
  description: sanitized(1000).optional(),
});

// --- Refinancing ---
export const refinanceSchema = z.object({
  newTerm: z.number().int().positive("Term must be positive"),
  reason: sanitized(500).optional(),
});

// --- Project Updates ---
export const projectUpdateSchema = z.object({
  title: sanitized(200).pipe(z.string().min(1, "Title is required")),
  body: sanitized(5000).pipe(z.string().min(1, "Body is required")),
  imageUrls: z.array(z.string().url()).optional(),
});

// --- Business Directory ---
export const businessListingSchema = z.object({
  name: sanitized(100).pipe(z.string().min(1, "Name is required")),
  category: sanitized(50).pipe(z.string().min(1, "Category is required")),
  description: sanitized(300).pipe(z.string().min(1, "Description is required")), // ~50 words
  location: sanitized(100).pipe(z.string().min(1, "Location is required")),
  address: sanitized(200).optional(),
  phone: sanitized(20).optional(),
  website: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional(),
});

// --- Matching Campaigns ---
export const matchingCampaignSchema = z.object({
  name: sanitized(100).pipe(z.string().min(1, "Name is required")),
  corporateName: sanitized(100).pipe(z.string().min(1, "Corporate name is required")),
  description: sanitized(1000).pipe(z.string().min(1, "Description is required")),
  logoUrl: z.string().url().optional(),
  matchRatio: z.number().positive().max(10),
  totalBudget: z.number().positive("Budget must be positive"),
  targetType: z.enum(["all", "category", "project"]),
  targetValue: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

// --- Public Profile ---
export const profileUpdateSchema = z.object({
  bio: sanitized(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  profileVisibility: z.enum(["private", "community", "public"]).optional(),
});

// --- Community Grants ---
export const communityGrantSchema = z.object({
  volunteerSlots: z.number().int().positive("Must have at least 1 slot"),
  watershedCredit: z.number().positive("Credit must be positive"),
  requirements: sanitized(2000).pipe(z.string().min(1, "Requirements are required")),
});

// --- Notification Preferences ---
export const notificationPreferencesSchema = z.object({
  cascades: z.enum(["all", "push", "in_app", "none"]).optional(),
  loanUpdates: z.enum(["all", "push", "in_app", "none"]).optional(),
  referrals: z.enum(["all", "push", "in_app", "none"]).optional(),
  communityNews: z.enum(["all", "push", "in_app", "none"]).optional(),
  weeklyDigest: z.boolean().optional(),
  pushToken: z.string().optional(),
});
