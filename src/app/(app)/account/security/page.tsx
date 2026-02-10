'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/i18n/formatting';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

interface Session {
  id: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  location?: string;
  lastActiveAt: string;
  createdAt: string;
}

interface TwoFAStatus {
  enabled: boolean;
  method: string | null;
  hasBackupCodes: boolean;
  backupCodesRemaining?: number;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  severity: string;
  ipAddress?: string;
  createdAt: string;
}

export default function SecurityPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [sessionsRes, twoFARes, eventsRes] = await Promise.all([
        fetch('/api/security/sessions'),
        fetch('/api/security/2fa'),
        fetch('/api/security/events?limit=10'),
      ]);

      if (sessionsRes.ok) {
        setSessions(await sessionsRes.json());
      }

      if (twoFARes.ok) {
        setTwoFAStatus(await twoFARes.json());
      }

      if (eventsRes.ok) {
        setEvents(await eventsRes.json());
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setRevokeSessionId(null);
    try {
      const res = await fetch(`/api/security/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast('Session revoked', 'success');
      } else {
        toast('Failed to revoke session', 'error');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast('Failed to revoke session', 'error');
    }
  }

  async function handleSetup2FA(method: string) {
    try {
      const res = await fetch('/api/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup', method }),
      });

      if (res.ok) {
        const data = await res.json();
        setBackupCodes(data.backupCodes);
        setShowSetup2FA(false);
        toast('Two-factor authentication enabled', 'success');
      } else {
        toast('Failed to set up 2FA', 'error');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast('Failed to set up 2FA', 'error');
    }
  }

  async function handleDisable2FA() {
    setShowDisable2FAConfirm(false);
    try {
      const res = await fetch('/api/security/2fa', {
        method: 'DELETE',
      });

      if (res.ok) {
        setTwoFAStatus({ enabled: false, method: null, hasBackupCodes: false });
        toast('Two-factor authentication disabled', 'success');
      } else {
        toast('Failed to disable 2FA', 'error');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast('Failed to disable 2FA', 'error');
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Security Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage your account security
      </p>

      {/* Backup Codes Display */}
      {backupCodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
            Save Your Backup Codes
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-500 mb-3">
            Store these codes securely. You can use them if you lose access to your authenticator.
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code) => (
              <div key={code} className="px-2 py-1 bg-white dark:bg-gray-800 rounded">
                {code}
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBackupCodes([])}
            className="mt-3 text-yellow-700 dark:text-yellow-400"
          >
            I&apos;ve saved these codes
          </Button>
        </motion.div>
      )}

      {/* Two-Factor Authentication */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h2>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              twoFAStatus?.enabled
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {twoFAStatus?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {twoFAStatus?.enabled ? (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your account is protected with {twoFAStatus.method?.toUpperCase()} authentication.
              {twoFAStatus.backupCodesRemaining !== undefined && (
                <span className="block mt-1 text-sm">
                  {twoFAStatus.backupCodesRemaining} backup codes remaining
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDisable2FAConfirm(true)}
              >
                Disable 2FA
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetup2FA('regenerate')}
              >
                Regenerate Backup Codes
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            {showSetup2FA ? (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => handleSetup2FA('totp')}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Authenticator App</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Use Google Authenticator or similar</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => handleSetup2FA('email')}
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Email</span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">Receive codes via email</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSetup2FA(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setShowSetup2FA(true)}>
                Enable 2FA
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Active Sessions */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Sessions
        </h2>

        {sessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <DeviceIcon type={session.deviceType} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {session.deviceName || session.deviceType || 'Unknown Device'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {session.ipAddress && <span>{session.ipAddress} &middot; </span>}
                    Last active {formatRelativeTime(session.lastActiveAt)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevokeSessionId(session.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Security Events */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No recent security events.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <SeverityIcon severity={event.severity} />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">
                    {formatEventType(event.eventType)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(event.createdAt)}
                    {event.ipAddress && ` from ${event.ipAddress}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Password Change */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Regularly update your password to keep your account secure.
        </p>
        <Button variant="outline">
          Change Password
        </Button>
      </section>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showDisable2FAConfirm}
        onConfirm={handleDisable2FA}
        onCancel={() => setShowDisable2FAConfirm(false)}
        title="Disable Two-Factor Authentication"
        message="Are you sure you want to disable two-factor authentication? This will make your account less secure."
        confirmLabel="Disable 2FA"
        variant="danger"
      />

      <ConfirmDialog
        open={!!revokeSessionId}
        onConfirm={() => revokeSessionId && handleRevokeSession(revokeSessionId)}
        onCancel={() => setRevokeSessionId(null)}
        title="Revoke Session"
        message="Are you sure you want to revoke this session? The device will be signed out."
        confirmLabel="Revoke"
        variant="danger"
      />
    </div>
  );
}

function DeviceIcon({ type }: { type?: string }) {
  const icons: Record<string, string> = {
    desktop: '\ud83d\udcbb',
    mobile: '\ud83d\udcf1',
    tablet: '\ud83d\udcf1',
  };
  return <span aria-hidden="true">{icons[type || ''] || '\ud83d\udcbb'}</span>;
}

function SeverityIcon({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500',
  };
  return (
    <span className={`text-lg ${colors[severity] || 'text-gray-500'}`} aria-hidden="true">
      {severity === 'critical' ? '\u26a0\ufe0f' : severity === 'warning' ? '\u26a1' : '\u2139\ufe0f'}
    </span>
  );
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    login_success: 'Logged in successfully',
    login_failed: 'Failed login attempt',
    password_change: 'Password changed',
    '2fa_enabled': 'Two-factor authentication enabled',
    '2fa_disabled': 'Two-factor authentication disabled',
    session_revoked: 'Session revoked',
    all_sessions_revoked: 'All sessions revoked',
    session_created: 'New session started',
  };
  return labels[type] || type.replace(/_/g, ' ');
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}
