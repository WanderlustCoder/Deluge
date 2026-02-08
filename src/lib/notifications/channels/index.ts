import { NotificationChannel } from '../types';

export interface ChannelProvider {
  channel: NotificationChannel;
  send(
    userId: string,
    notificationId: string,
    title: string,
    body: string,
    options?: Record<string, unknown>
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

// In-app notifications are stored directly in DB, no external delivery needed
export const inAppChannel: ChannelProvider = {
  channel: 'in_app',
  async send() {
    // In-app notifications are already created in the database
    return { success: true };
  },
};

// Email channel (stub - would integrate with SendGrid, Resend, etc.)
export const emailChannel: ChannelProvider = {
  channel: 'email',
  async send(userId, notificationId, title, body, options) {
    // TODO: Integrate with email provider
    console.log(`[Email] Sending to user ${userId}: ${title}`);

    // Simulate sending
    return {
      success: true,
      messageId: `email-${notificationId}-${Date.now()}`,
    };
  },
};

// Push notification channel (stub - would integrate with Firebase, OneSignal, etc.)
export const pushChannel: ChannelProvider = {
  channel: 'push',
  async send(userId, notificationId, title, body, options) {
    // TODO: Integrate with push notification provider
    console.log(`[Push] Sending to user ${userId}: ${title}`);

    return {
      success: true,
      messageId: `push-${notificationId}-${Date.now()}`,
    };
  },
};

// SMS channel (stub - would integrate with Twilio, etc.)
export const smsChannel: ChannelProvider = {
  channel: 'sms',
  async send(userId, notificationId, title, body, options) {
    // TODO: Integrate with SMS provider
    console.log(`[SMS] Sending to user ${userId}: ${body}`);

    return {
      success: true,
      messageId: `sms-${notificationId}-${Date.now()}`,
    };
  },
};

// Get channel provider
export function getChannelProvider(channel: NotificationChannel): ChannelProvider {
  switch (channel) {
    case 'in_app':
      return inAppChannel;
    case 'email':
      return emailChannel;
    case 'push':
      return pushChannel;
    case 'sms':
      return smsChannel;
    default:
      return inAppChannel;
  }
}
