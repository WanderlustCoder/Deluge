'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import Link from 'next/link';
import { formatDate } from '@/lib/i18n/formatting';

interface CreditBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

interface CreditTransaction {
  id: string;
  type: string;
  source: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  reference: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface GiftCard {
  id: string;
  code: string;
  balance: number;
  amount: number;
  status: string;
  expiresAt: string | null;
  design?: {
    name: string;
    imageUrl: string;
  };
}

export default function StoreCreditPage() {
  const { toast } = useToast();
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [activeTab, setActiveTab] = useState<'balance' | 'giftcards'>('balance');
  const [loading, setLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [balanceRes, historyRes, cardsRes] = await Promise.all([
        fetch('/api/credits'),
        fetch('/api/credits?view=history'),
        fetch('/api/giftcards'),
      ]);

      if (balanceRes.ok) {
        const balance = await balanceRes.json();
        setCreditBalance(balance);
      }

      if (historyRes.ok) {
        const history = await historyRes.json();
        setTransactions(history.transactions || []);
      }

      if (cardsRes.ok) {
        const cards = await cardsRes.json();
        setGiftCards(cards.received || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('Failed to load credit data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeemCode() {
    if (!redeemCode.trim()) {
      toast('Please enter a gift card code', 'error');
      return;
    }

    setRedeeming(true);
    try {
      const res = await fetch('/api/giftcards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || 'Failed to redeem code', 'error');
        return;
      }

      toast(data.message, 'success');
      setRedeemCode('');
      fetchData();
    } catch (error) {
      toast('Failed to redeem gift card', 'error');
    } finally {
      setRedeeming(false);
    }
  }

  function formatAmount(amount: number) {
    const prefix = amount >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalAvailable = (creditBalance?.balance || 0) +
    giftCards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-storm dark:text-white mb-2">Store Credit</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your store credit and gift cards
          </p>
        </div>
        <Link
          href="/give/giftcards"
          className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90"
        >
          Buy Gift Cards
        </Link>
      </div>

      {/* Balance Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal to-ocean p-6 rounded-xl text-white"
        >
          <p className="text-sm opacity-80">Total Available</p>
          <p className="text-4xl font-bold">${totalAvailable.toFixed(2)}</p>
          <p className="text-sm opacity-80 mt-2">
            Credit + Gift Cards
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Store Credit</p>
          <p className="text-3xl font-bold text-storm dark:text-white">
            ${creditBalance?.balance.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Lifetime earned: ${creditBalance?.lifetimeEarned.toFixed(2) || '0.00'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">Gift Card Balance</p>
          <p className="text-3xl font-bold text-storm dark:text-white">
            ${giftCards.reduce((sum, card) => sum + card.balance, 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {giftCards.length} active card{giftCards.length !== 1 ? 's' : ''}
          </p>
        </motion.div>
      </div>

      {/* Redeem Code */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <h2 className="font-semibold text-lg mb-4 dark:text-white">Redeem a Gift Card</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter gift card code (e.g., XXXX-XXXX-XXXX-XXXX)"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleRedeemCode}
            loading={redeeming}
          >
            Redeem
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'balance', label: 'Credit History' },
          { id: 'giftcards', label: `Gift Cards (${giftCards.length})` },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'balance' | 'giftcards')}
      />

      {/* Content */}
      <TabPanel id="balance" activeTab={activeTab}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-6">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No credit transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          tx.type === 'earned' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          tx.type === 'spent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          tx.type === 'adjusted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {tx.description || tx.source}
                      </td>
                      <td className={`px-6 py-4 text-sm text-right font-medium ${
                        tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                        ${tx.balanceAfter.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabPanel>

      <TabPanel id="giftcards" activeTab={activeTab}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {giftCards.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              <p>No gift cards yet</p>
              <p className="text-sm mt-2">Redeem a gift card code above to add it to your account</p>
            </div>
          ) : (
            giftCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{card.code}</p>
                    <p className="text-2xl font-bold text-storm dark:text-white mt-1">
                      ${card.balance.toFixed(2)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    card.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    card.status === 'redeemed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {card.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Original value: ${card.amount.toFixed(2)}</p>
                  {card.expiresAt && (
                    <p className="mt-1">
                      Expires: {formatDate(card.expiresAt)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </TabPanel>
    </div>
  );
}
