'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { InterestForm } from '@/components/advocates/interest-form';
import { useToast } from '@/components/ui/toast';
import { Spinner } from "@/components/ui/spinner";

export default function JoinAdvocatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'can_join' | 'pending' | 'advocate'>('loading');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      // Check if already an advocate
      const advocateRes = await fetch('/api/advocates/me');
      if (advocateRes.ok) {
        const data = await advocateRes.json();
        if (data.isAdvocate) {
          setStatus('advocate');
          return;
        }
      }

      // Check if already expressed interest
      const interestRes = await fetch('/api/advocates/join');
      if (interestRes.ok) {
        const data = await interestRes.json();
        if (data.interest?.status === 'pending') {
          setStatus('pending');
          return;
        }
      }

      setStatus('can_join');
    } catch (error) {
      console.error('Failed to check status:', error);
      setStatus('can_join');
    }
  };

  const handleSubmit = async (data: {
    motivation: string;
    interests: string[];
    availability?: string;
    region?: string;
  }) => {
    const res = await fetch('/api/advocates/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit');
    }

    toast('Thank you for your interest! We\'ll be in touch soon.', 'success');
    setStatus('pending');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'advocate') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              You're an Advocate!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for being part of our community. Head to your dashboard to see what you can do.
            </p>
            <button
              onClick={() => router.push('/advocates/dashboard')}
              className="px-6 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              We Got Your Interest!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for wanting to help. Someone from our team will be in touch soon to welcome you aboard.
            </p>
            <button
              onClick={() => router.push('/advocates')}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back to Advocates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Join Our Advocates
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We'd love to have you help our community thrive
            </p>
          </div>

          <div className="mb-8 p-4 bg-ocean-50 dark:bg-ocean-900/20 rounded-lg">
            <h3 className="font-medium text-ocean-900 dark:text-ocean-300 mb-2">
              What We Value
            </h3>
            <ul className="text-sm text-ocean-800 dark:text-ocean-400 space-y-1">
              <li>• Genuine desire to help others</li>
              <li>• No quotas or requirements</li>
              <li>• Contribute however fits your life</li>
              <li>• Be yourself, not a "brand ambassador"</li>
            </ul>
          </div>

          <InterestForm onSubmit={handleSubmit} />
        </motion.div>
      </div>
    </div>
  );
}
