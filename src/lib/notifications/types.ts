// Notification types
export type NotificationType =
  | 'funding'
  | 'milestone'
  | 'loan'
  | 'community'
  | 'system'
  | 'social'
  | 'celebration';

export type NotificationCategory =
  | 'action_required'
  | 'update'
  | 'celebration'
  | 'reminder';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export type DeliveryStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced';

export interface NotificationPayload {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  richBody?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
  priority?: NotificationPriority;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  channels?: NotificationChannel[];
  expiresAt?: Date;
}

export interface NotificationPreferences {
  globalEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  digestFrequency: 'realtime' | 'daily' | 'weekly' | 'none';
  digestTime: string;
  typePreferences: Record<string, NotificationChannel[]>;
}

// Default preferences
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  globalEnabled: true,
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
  timezone: 'America/Los_Angeles',
  digestFrequency: 'daily',
  digestTime: '09:00',
  typePreferences: {
    funding: ['in_app', 'email', 'push'],
    milestone: ['in_app', 'email', 'push'],
    loan: ['in_app', 'email', 'push', 'sms'],
    community: ['in_app', 'email'],
    system: ['in_app', 'email'],
    social: ['in_app'],
    celebration: ['in_app', 'email', 'push'],
  },
};

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<string, { title: string; body: string }> = {
  project_funded: {
    title: 'Project Funded!',
    body: '{{projectName}} has reached its funding goal.',
  },
  cascade_reached: {
    title: 'Cascade Milestone!',
    body: '{{projectName}} reached {{stage}} stage.',
  },
  loan_approved: {
    title: 'Loan Approved',
    body: 'Your loan for {{amount}} has been approved.',
  },
  loan_funded: {
    title: 'Loan Funded',
    body: 'Your loan has been fully funded!',
  },
  payment_due: {
    title: 'Payment Reminder',
    body: 'Your loan payment of {{amount}} is due on {{dueDate}}.',
  },
  new_follower: {
    title: 'New Follower',
    body: '{{userName}} is now following you.',
  },
  community_update: {
    title: 'Community Update',
    body: '{{communityName}}: {{message}}',
  },
  badge_earned: {
    title: 'Badge Earned!',
    body: 'You earned the {{badgeName}} badge.',
  },
  referral_signup: {
    title: 'Referral Signup',
    body: 'Someone signed up using your referral code!',
  },
};
