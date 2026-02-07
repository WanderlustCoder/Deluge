import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { BirthdayFundraiserView } from '@/components/birthday/birthday-fundraiser-view';

interface Props {
  params: Promise<{ shareUrl: string }>;
}

export default async function BirthdaySharePage({ params }: Props) {
  const { shareUrl } = await params;

  const fundraiser = await prisma.birthdayFundraiser.findUnique({
    where: { shareUrl },
    include: {
      user: {
        select: { id: true, name: true },
      },
      project: {
        select: { id: true, title: true, description: true, imageUrl: true },
      },
    },
  });

  if (!fundraiser || fundraiser.status === 'cancelled') {
    notFound();
  }

  return (
    <BirthdayFundraiserView
      fundraiser={{
        id: fundraiser.id,
        title: fundraiser.title,
        description: fundraiser.description,
        birthdayDate: fundraiser.birthdayDate.toISOString(),
        goalAmount: fundraiser.goalAmount,
        currentAmount: fundraiser.currentAmount,
        backerCount: fundraiser.backerCount,
        status: fundraiser.status,
        shareUrl: fundraiser.shareUrl,
        creator: fundraiser.user,
        project: fundraiser.project,
      }}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { shareUrl } = await params;

  const fundraiser = await prisma.birthdayFundraiser.findUnique({
    where: { shareUrl },
    select: { title: true, description: true },
  });

  if (!fundraiser) {
    return { title: 'Fundraiser Not Found' };
  }

  return {
    title: `${fundraiser.title} | Birthday Fundraiser`,
    description: fundraiser.description,
    openGraph: {
      title: fundraiser.title,
      description: fundraiser.description,
      type: 'website',
    },
  };
}
