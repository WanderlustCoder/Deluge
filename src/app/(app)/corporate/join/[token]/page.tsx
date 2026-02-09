'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface InviteInfo {
  id: string;
  email: string;
  department: string | null;
  account: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
  };
}

export default function JoinCorporatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      const res = await fetch(`/api/corporate/join/${token}`);
      if (res.ok) {
        const data = await res.json();
        setInvite(data.invite);
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid or expired invite');
      }
    } catch (err) {
      setError('Failed to validate invite');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/corporate/join/${token}`, {
        method: 'POST',
      });

      if (res.ok) {
        setSuccess(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join');
      }
    } catch (err) {
      setError('Failed to join corporate account');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-storm-light dark:text-dark-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          Validating invite...
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-elevated rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal" />
          </div>
          <h1 className="text-2xl font-bold text-ocean dark:text-sky mb-2">
            Welcome!
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary mb-4">
            You've successfully joined {invite?.account.name}'s giving program.
          </p>
          <p className="text-sm text-storm-light dark:text-dark-text-secondary">
            Redirecting to dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-elevated rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-storm dark:text-dark-text mb-2">
            Invalid Invite
          </h1>
          <p className="text-storm-light dark:text-dark-text-secondary mb-6">
            {error}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-elevated rounded-2xl p-8 max-w-md w-full shadow-lg"
      >
        {/* Company Logo */}
        <div className="flex justify-center mb-6">
          {invite?.account.logoUrl ? (
            <img
              src={invite.account.logoUrl}
              alt={invite.account.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: invite?.account.primaryColor || '#0D47A1' }}
            >
              <Building2 className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-ocean dark:text-sky text-center mb-2">
          You're Invited!
        </h1>
        <p className="text-storm-light dark:text-dark-text-secondary text-center mb-6">
          <span className="font-medium text-storm dark:text-dark-text">
            {invite?.account.name}
          </span>{' '}
          has invited you to join their employee giving program.
        </p>

        {invite?.department && (
          <div className="bg-gray-50 dark:bg-foam/5 rounded-lg p-3 mb-6 text-center">
            <p className="text-sm text-storm-light dark:text-dark-text-secondary">
              Department: <span className="font-medium">{invite.department}</span>
            </p>
          </div>
        )}

        <div className="bg-ocean/5 dark:bg-sky/10 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-ocean dark:text-sky mb-2">
            Benefits
          </h3>
          <ul className="text-sm text-storm-light dark:text-dark-text-secondary space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
              Corporate matching on your contributions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
              Access to company giving campaigns
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal flex-shrink-0" />
              Track your collective team impact
            </li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-3 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {joining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Joining...
            </>
          ) : (
            'Accept Invitation'
          )}
        </button>

        <p className="text-xs text-storm-light dark:text-dark-text-secondary text-center mt-4">
          By joining, you agree to share your giving activity with your employer's portal.
        </p>
      </motion.div>
    </div>
  );
}
