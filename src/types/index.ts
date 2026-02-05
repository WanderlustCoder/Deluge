import type { User, Watershed, Project, Allocation, AdView, Contribution, WatershedTransaction } from "@prisma/client";

// Re-export Prisma types
export type { User, Watershed, Project, Allocation, AdView, Contribution, WatershedTransaction };

// User with watershed included
export type UserWithWatershed = User & {
  watershed: Watershed | null;
};

// Project with allocations
export type ProjectWithAllocations = Project & {
  allocations: Allocation[];
};

// Watershed with transactions
export type WatershedWithTransactions = Watershed & {
  transactions: WatershedTransaction[];
};

// Session user shape
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

// API response types
export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
