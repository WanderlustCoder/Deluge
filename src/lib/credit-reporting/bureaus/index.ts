import { prisma } from '../../prisma';

export type BureauName = 'experian' | 'transunion' | 'equifax';
export type BureauStatus = 'pending' | 'active' | 'suspended';

// Bureau connection management

// Get bureau connection status
export async function getBureauConnection(bureau: BureauName) {
  return prisma.bureauConnection.findUnique({
    where: { bureau },
  });
}

// Get all bureau connections
export async function getAllBureauConnections() {
  return prisma.bureauConnection.findMany({
    orderBy: { bureau: 'asc' },
  });
}

// Create or update bureau connection
export async function upsertBureauConnection(
  bureau: BureauName,
  data: {
    furnisherId: string;
    apiEndpoint: string;
    apiKeyEncrypted: string;
  }
) {
  return prisma.bureauConnection.upsert({
    where: { bureau },
    create: {
      bureau,
      furnisherId: data.furnisherId,
      apiEndpoint: data.apiEndpoint,
      apiKeyEncrypted: data.apiKeyEncrypted,
      status: 'pending',
    },
    update: {
      furnisherId: data.furnisherId,
      apiEndpoint: data.apiEndpoint,
      apiKeyEncrypted: data.apiKeyEncrypted,
    },
  });
}

// Update bureau connection status
export async function updateBureauStatus(
  bureau: BureauName,
  status: BureauStatus,
  error?: string
) {
  return prisma.bureauConnection.update({
    where: { bureau },
    data: {
      status,
      lastError: error || null,
    },
  });
}

// Record successful submission
export async function recordBureauSuccess(bureau: BureauName) {
  return prisma.bureauConnection.update({
    where: { bureau },
    data: {
      lastSuccess: new Date(),
      lastSubmission: new Date(),
      lastError: null,
    },
  });
}

// Record submission error
export async function recordBureauError(bureau: BureauName, error: string) {
  return prisma.bureauConnection.update({
    where: { bureau },
    data: {
      lastSubmission: new Date(),
      lastError: error,
    },
  });
}

// Abstract bureau interface
export interface BureauSubmissionResult {
  success: boolean;
  submissionId?: string;
  acceptedCount?: number;
  rejectedCount?: number;
  errors?: string[];
}

// Submit to bureau (interface for actual implementations)
export interface BureauClient {
  submit(fileContent: string): Promise<BureauSubmissionResult>;
  checkStatus(submissionId: string): Promise<BureauSubmissionResult>;
  getSubmissionDetails(submissionId: string): Promise<unknown>;
}

// Factory function to get bureau client
export function getBureauClient(bureau: BureauName): BureauClient {
  // In production, return actual implementations
  // For now, return mock client
  return new MockBureauClient(bureau);
}

// Mock bureau client for development
class MockBureauClient implements BureauClient {
  constructor(private bureau: BureauName) {}

  async submit(fileContent: string): Promise<BureauSubmissionResult> {
    // Simulate API call
    console.log(`[MOCK] Submitting to ${this.bureau}, ${fileContent.length} bytes`);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mock success response
    return {
      success: true,
      submissionId: `MOCK-${this.bureau.toUpperCase()}-${Date.now()}`,
      acceptedCount: 1,
      rejectedCount: 0,
      errors: [],
    };
  }

  async checkStatus(submissionId: string): Promise<BureauSubmissionResult> {
    console.log(`[MOCK] Checking status for ${submissionId}`);

    return {
      success: true,
      submissionId,
      acceptedCount: 1,
      rejectedCount: 0,
    };
  }

  async getSubmissionDetails(submissionId: string): Promise<unknown> {
    return {
      submissionId,
      bureau: this.bureau,
      status: 'accepted',
      timestamp: new Date().toISOString(),
    };
  }
}

// Check if all bureaus are configured
export async function checkBureauConfiguration(): Promise<{
  allConfigured: boolean;
  bureaus: Record<BureauName, { configured: boolean; status: string }>;
}> {
  const connections = await getAllBureauConnections();
  const bureauNames: BureauName[] = ['experian', 'transunion', 'equifax'];

  const bureaus: Record<BureauName, { configured: boolean; status: string }> = {
    experian: { configured: false, status: 'not_configured' },
    transunion: { configured: false, status: 'not_configured' },
    equifax: { configured: false, status: 'not_configured' },
  };

  for (const conn of connections) {
    const name = conn.bureau as BureauName;
    if (bureauNames.includes(name)) {
      bureaus[name] = {
        configured: true,
        status: conn.status,
      };
    }
  }

  const allConfigured = bureauNames.every((b) => bureaus[b].configured);

  return { allConfigured, bureaus };
}
