import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareUrl: string }> }
) {
  try {
    const { shareUrl } = await params;
    const body = await req.json();
    const { amount, donorName, message } = body;

    if (!amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json(
        { error: 'Minimum donation is $1' },
        { status: 400 }
      );
    }

    // Find the fundraiser
    const fundraiser = await prisma.birthdayFundraiser.findUnique({
      where: { shareUrl },
    });

    if (!fundraiser) {
      return NextResponse.json(
        { error: 'Fundraiser not found' },
        { status: 404 }
      );
    }

    if (fundraiser.status !== 'active') {
      return NextResponse.json(
        { error: 'This fundraiser is no longer accepting donations' },
        { status: 400 }
      );
    }

    // Check if authenticated user
    const session = await auth();
    const userId = session?.user?.id;

    // If authenticated, deduct from watershed
    if (userId) {
      const watershed = await prisma.watershed.findUnique({
        where: { userId },
      });

      if (!watershed || watershed.balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient watershed balance' },
          { status: 400 }
        );
      }

      // Deduct from watershed and update fundraiser
      await prisma.$transaction([
        prisma.watershed.update({
          where: { userId },
          data: { balance: { decrement: amount } },
        }),
        prisma.watershedTransaction.create({
          data: {
            watershedId: watershed.id,
            type: 'birthday_donation',
            amount: -amount,
            description: `Donation to ${fundraiser.title}`,
            balanceAfter: watershed.balance - amount,
          },
        }),
        prisma.birthdayFundraiser.update({
          where: { id: fundraiser.id },
          data: {
            currentAmount: { increment: amount },
            backerCount: { increment: 1 },
          },
        }),
      ]);
    } else {
      // External donation - for now just track it
      // In production, this would integrate with Stripe for external payments
      await prisma.birthdayFundraiser.update({
        where: { id: fundraiser.id },
        data: {
          currentAmount: { increment: amount },
          backerCount: { increment: 1 },
        },
      });
    }

    // TODO: Store donor message/name if needed (would need a BirthdayDonation model)
    // For now, we just update the fundraiser totals

    return NextResponse.json({
      success: true,
      message: 'Thank you for your donation!',
    });
  } catch (error) {
    console.error('Birthday donation error:', error);
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    );
  }
}
