import { prisma } from '@/lib/prisma';

export type DocumentType = 'ein_letter' | '501c3_determination' | 'bylaws' | 'annual_report' | 'audit' | 'other';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface UploadDocumentInput {
  organizationId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  expiresAt?: Date;
}

// Upload document
export async function uploadDocument(input: UploadDocumentInput) {
  return prisma.organizationDocument.create({
    data: {
      organizationId: input.organizationId,
      type: input.type,
      name: input.name,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      uploadedBy: input.uploadedBy,
      expiresAt: input.expiresAt,
      status: 'pending',
    },
  });
}

// Get documents for organization
export async function getDocuments(
  organizationId: string,
  options?: { type?: DocumentType; status?: DocumentStatus }
) {
  const where: Record<string, unknown> = { organizationId };
  if (options?.type) where.type = options.type;
  if (options?.status) where.status = options.status;

  return prisma.organizationDocument.findMany({
    where,
    orderBy: { uploadedAt: 'desc' },
  });
}

// Get document by ID
export async function getDocument(id: string) {
  return prisma.organizationDocument.findUnique({
    where: { id },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

// Review document (admin)
export async function reviewDocument(
  id: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  reviewNotes?: string
) {
  return prisma.organizationDocument.update({
    where: { id },
    data: {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    },
  });
}

// Delete document
export async function deleteDocument(id: string) {
  return prisma.organizationDocument.delete({
    where: { id },
  });
}

// Check if organization has required documents
export async function checkRequiredDocuments(organizationId: string) {
  const requiredTypes: DocumentType[] = ['ein_letter', '501c3_determination'];

  const documents = await prisma.organizationDocument.findMany({
    where: {
      organizationId,
      type: { in: requiredTypes },
      status: 'approved',
    },
    select: { type: true },
  });

  const approvedTypes = new Set(documents.map((d) => d.type));
  const missing = requiredTypes.filter((t) => !approvedTypes.has(t));

  return {
    complete: missing.length === 0,
    missing,
    approved: Array.from(approvedTypes),
  };
}

// Get expiring documents
export async function getExpiringDocuments(
  organizationId: string,
  withinDays: number = 30
) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + withinDays);

  return prisma.organizationDocument.findMany({
    where: {
      organizationId,
      status: 'approved',
      expiresAt: {
        not: null,
        lte: expirationDate,
        gt: new Date(),
      },
    },
    orderBy: { expiresAt: 'asc' },
  });
}

// Get all pending documents for review (admin)
export async function getPendingDocuments(limit: number = 50) {
  return prisma.organizationDocument.findMany({
    where: { status: 'pending' },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { uploadedAt: 'asc' },
    take: limit,
  });
}
