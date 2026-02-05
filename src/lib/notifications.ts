import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    },
  });
}

export async function notifyLoanFunded(
  borrowerId: string,
  loanPurpose: string
) {
  return createNotification(
    borrowerId,
    "loan_funded",
    "Loan Fully Funded!",
    `Your loan "${loanPurpose}" has been fully funded.`,
    { link: "/loans/my" }
  );
}

export async function notifyLoanPaymentReceived(
  funderId: string,
  amount: number,
  loanPurpose: string
) {
  return createNotification(
    funderId,
    "loan_payment_received",
    "Repayment Received",
    `You received $${amount.toFixed(2)} from loan "${loanPurpose}".`,
    { link: "/dashboard" }
  );
}

export async function notifyBadgeEarned(userId: string, badgeName: string) {
  return createNotification(
    userId,
    "badge_earned",
    "Badge Earned!",
    `You earned the "${badgeName}" badge.`,
    { link: "/account/badges" }
  );
}

export async function notifyProjectMilestone(
  userId: string,
  projectTitle: string,
  stageName: string
) {
  return createNotification(
    userId,
    "project_milestone",
    "Project Milestone!",
    `"${projectTitle}" reached the ${stageName} stage!`,
    { link: "/projects" }
  );
}

export async function notifyReferralSignup(
  referrerId: string,
  referredName: string
) {
  return createNotification(
    referrerId,
    "referral_signup",
    "Friend Joined!",
    `${referredName} signed up using your referral link.`,
    { link: "/account/referrals" }
  );
}

export async function notifyReferralActivated(referrerId: string) {
  return createNotification(
    referrerId,
    "referral_activated",
    "Referral Activated!",
    "Your referred friend completed their first action. You earned a bonus!",
    { link: "/account/referrals" }
  );
}
