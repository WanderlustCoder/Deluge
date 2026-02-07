import { prisma } from "@/lib/prisma";

type NotificationChannel = "all" | "push" | "in_app" | "none";

interface NotificationOptions {
  category: "cascades" | "loanUpdates" | "referrals" | "communityNews";
  forceChannel?: NotificationChannel;
}

async function getUserPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });
  return prefs;
}

function shouldSendNotification(
  preferenceValue: string,
  channel: "in_app" | "push"
): boolean {
  if (preferenceValue === "none") return false;
  if (preferenceValue === "all") return true;
  return preferenceValue === channel;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>,
  options?: NotificationOptions
) {
  // Check user preferences if options provided
  if (options?.category) {
    const prefs = await getUserPreferences(userId);
    if (prefs) {
      const prefValue = prefs[options.category] as string;
      if (!shouldSendNotification(prefValue, "in_app")) {
        // User has opted out of in-app notifications for this category
        return null;
      }
    }
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    },
  });

  // In the future, this is where we'd trigger push notifications
  // if preferences allow and user has a push token
  if (options?.category) {
    const prefs = await getUserPreferences(userId);
    if (prefs?.pushToken && (prefs[options.category] === "all" || prefs[options.category] === "push")) {
      // TODO: Implement actual push notification sending
      // await sendPushNotification(prefs.pushToken, title, message);
    }
  }

  return notification;
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
    { link: "/loans/my" },
    { category: "loanUpdates" }
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
    { link: "/dashboard" },
    { category: "loanUpdates" }
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
    { link: "/projects" },
    { category: "cascades" }
  );
}

export async function notifyCascade(
  userId: string,
  projectTitle: string,
  stageName: string,
  projectId: string
) {
  return createNotification(
    userId,
    "cascade",
    "Cascade!",
    `"${projectTitle}" reached the ${stageName} cascade stage!`,
    { link: `/projects/${projectId}` },
    { category: "cascades" }
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
    { link: "/account/referrals" },
    { category: "referrals" }
  );
}

export async function notifyReferralActivated(referrerId: string) {
  return createNotification(
    referrerId,
    "referral_activated",
    "Referral Activated!",
    "Your referred friend completed their first action. You earned a bonus!",
    { link: "/account/referrals" },
    { category: "referrals" }
  );
}

export async function notifyCommunityJoin(
  userId: string,
  communityName: string,
  communityId: string
) {
  return createNotification(
    userId,
    "community_join",
    "Welcome!",
    `You've joined ${communityName}.`,
    { link: `/communities/${communityId}` },
    { category: "communityNews" }
  );
}

export async function notifyProjectUpdate(
  userId: string,
  projectTitle: string,
  updateTitle: string,
  projectId: string
) {
  return createNotification(
    userId,
    "project_update",
    `Update: ${projectTitle}`,
    updateTitle,
    { link: `/projects/${projectId}` },
    { category: "cascades" }
  );
}

// Bulk notification helper
export async function notifyMultipleUsers(
  userIds: string[],
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  if (userIds.length === 0) return [];

  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    })),
  });

  return notifications;
}
