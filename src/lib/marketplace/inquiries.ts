/**
 * Marketplace Inquiries & Messaging
 * Plan 29: Community Marketplace
 */

import { prisma } from '@/lib/prisma';

/**
 * Create an inquiry on a listing
 */
export async function createInquiry(
  listingId: string,
  senderId: string,
  message: string
): Promise<{ id: string }> {
  // Check if sender already has an open inquiry on this listing
  const existing = await prisma.listingInquiry.findFirst({
    where: {
      listingId,
      senderId,
      status: { in: ['pending', 'replied'] },
    },
  });

  if (existing) {
    // Add message to existing inquiry
    await prisma.inquiryMessage.create({
      data: {
        inquiryId: existing.id,
        senderId,
        content: message,
      },
    });
    return { id: existing.id };
  }

  // Create new inquiry
  const inquiry = await prisma.listingInquiry.create({
    data: {
      listingId,
      senderId,
      message,
      status: 'pending',
    },
    select: { id: true },
  });

  // Create initial message
  await prisma.inquiryMessage.create({
    data: {
      inquiryId: inquiry.id,
      senderId,
      content: message,
    },
  });

  return inquiry;
}

/**
 * Reply to an inquiry
 */
export async function replyToInquiry(
  inquiryId: string,
  senderId: string,
  content: string
): Promise<{ id: string }> {
  // Create the message
  const message = await prisma.inquiryMessage.create({
    data: {
      inquiryId,
      senderId,
      content,
    },
    select: { id: true },
  });

  // Update inquiry status
  await prisma.listingInquiry.update({
    where: { id: inquiryId },
    data: { status: 'replied' },
  });

  return message;
}

/**
 * Get inquiries for a listing (seller view)
 */
export async function getListingInquiries(
  listingId: string,
  sellerId: string
): Promise<
  Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    status: string;
    createdAt: Date;
    messageCount: number;
  }>
> {
  // Verify ownership
  const listing = await prisma.marketplaceListing.findFirst({
    where: { id: listingId, sellerId },
  });

  if (!listing) return [];

  const inquiries = await prisma.listingInquiry.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { messages: true } },
    },
  });

  // Get sender info
  const senderIds = [...new Set(inquiries.map((i) => i.senderId))];
  const senders = await prisma.user.findMany({
    where: { id: { in: senderIds } },
    select: { id: true, name: true },
  });
  const senderMap = Object.fromEntries(senders.map((s) => [s.id, s.name]));

  return inquiries.map((i) => ({
    id: i.id,
    senderId: i.senderId,
    senderName: senderMap[i.senderId] || 'Unknown',
    message: i.message,
    status: i.status,
    createdAt: i.createdAt,
    messageCount: i._count.messages,
  }));
}

/**
 * Get user's inquiries (buyer view)
 */
export async function getUserInquiries(
  userId: string
): Promise<
  Array<{
    id: string;
    listingId: string;
    listingTitle: string;
    sellerId: string;
    sellerName: string;
    status: string;
    createdAt: Date;
    unreadCount: number;
  }>
> {
  const inquiries = await prisma.listingInquiry.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          sellerId: true,
          seller: { select: { name: true } },
        },
      },
      messages: {
        where: { isRead: false, senderId: { not: userId } },
        select: { id: true },
      },
    },
  });

  return inquiries.map((i) => ({
    id: i.id,
    listingId: i.listing.id,
    listingTitle: i.listing.title,
    sellerId: i.listing.sellerId,
    sellerName: i.listing.seller.name,
    status: i.status,
    createdAt: i.createdAt,
    unreadCount: i.messages.length,
  }));
}

/**
 * Get inquiry messages
 */
export async function getInquiryMessages(
  inquiryId: string,
  userId: string
): Promise<
  Array<{
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    isRead: boolean;
    isOwn: boolean;
    createdAt: Date;
  }>
> {
  // Verify access
  const inquiry = await prisma.listingInquiry.findUnique({
    where: { id: inquiryId },
    include: {
      listing: { select: { sellerId: true } },
    },
  });

  if (!inquiry) return [];
  if (inquiry.senderId !== userId && inquiry.listing.sellerId !== userId) {
    return [];
  }

  const messages = await prisma.inquiryMessage.findMany({
    where: { inquiryId },
    orderBy: { createdAt: 'asc' },
  });

  // Mark messages as read
  await prisma.inquiryMessage.updateMany({
    where: {
      inquiryId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  // Get sender names
  const senderIds = [...new Set(messages.map((m) => m.senderId))];
  const senders = await prisma.user.findMany({
    where: { id: { in: senderIds } },
    select: { id: true, name: true },
  });
  const senderMap = Object.fromEntries(senders.map((s) => [s.id, s.name]));

  return messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    senderName: senderMap[m.senderId] || 'Unknown',
    content: m.content,
    isRead: m.isRead,
    isOwn: m.senderId === userId,
    createdAt: m.createdAt,
  }));
}

/**
 * Close an inquiry
 */
export async function closeInquiry(
  inquiryId: string,
  userId: string
): Promise<boolean> {
  const inquiry = await prisma.listingInquiry.findUnique({
    where: { id: inquiryId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!inquiry) return false;
  if (inquiry.senderId !== userId && inquiry.listing.sellerId !== userId) {
    return false;
  }

  await prisma.listingInquiry.update({
    where: { id: inquiryId },
    data: { status: 'closed' },
  });

  return true;
}

/**
 * Get unread message count for user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  // Count unread messages in inquiries where user is either sender or seller
  const asInquirer = await prisma.inquiryMessage.count({
    where: {
      inquiry: { senderId: userId },
      senderId: { not: userId },
      isRead: false,
    },
  });

  const asSeller = await prisma.inquiryMessage.count({
    where: {
      inquiry: { listing: { sellerId: userId } },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return asInquirer + asSeller;
}
