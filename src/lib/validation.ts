import { z } from "zod";
import { sanitizeText } from "./sanitize";
import {
  MIN_FUNDING_AMOUNT,
  PROJECT_CATEGORIES,
  LOAN_CATEGORIES,
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
});

export const addCommunityProjectSchema = z.object({
  projectId: z.string().min(1),
});
