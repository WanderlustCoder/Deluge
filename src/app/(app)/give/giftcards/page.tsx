'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { calculateBulkDiscount } from '@/lib/giftcards';

interface GiftCardDesign {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

const DENOMINATIONS = [10, 25, 50, 100, 250, 500];

export default function GiftCardsPage() {
  const { toast } = useToast();
  const [designs, setDesigns] = useState<GiftCardDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Single gift card form
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'print'>('email');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Bulk order form
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [bulkDenomination, setBulkDenomination] = useState(25);

  useEffect(() => {
    fetchDesigns();
  }, []);

  async function fetchDesigns() {
    try {
      const res = await fetch('/api/giftcards/designs');
      if (res.ok) {
        const data = await res.json();
        setDesigns(data.designs || []);
        if (data.designs?.length > 0) {
          setSelectedDesign(data.designs[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  }

  function getEffectiveAmount(): number {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return amount;
  }

  async function handlePurchase() {
    const effectiveAmount = getEffectiveAmount();

    if (effectiveAmount < 5 || effectiveAmount > 500) {
      toast('Gift card amount must be between $5 and $500', 'error');
      return;
    }

    if (deliveryMethod === 'email' && !recipientEmail) {
      toast('Please enter recipient email address', 'error');
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch('/api/giftcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveAmount,
          recipientEmail: deliveryMethod === 'email' ? recipientEmail : undefined,
          recipientName,
          designId: selectedDesign,
          personalMessage,
          deliveryMethod,
          deliveryDate: deliveryDate || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || 'Failed to purchase gift card', 'error');
        return;
      }

      toast('Gift card purchased successfully!', 'success');

      // Reset form
      setRecipientEmail('');
      setRecipientName('');
      setPersonalMessage('');
      setDeliveryDate('');
      setCustomAmount('');
    } catch (error) {
      toast('Failed to purchase gift card', 'error');
    } finally {
      setPurchasing(false);
    }
  }

  const bulkDiscount = calculateBulkDiscount(bulkQuantity, bulkDenomination);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-storm dark:text-white mb-2">Gift Cards</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Give the gift of giving. Recipients can use gift cards to fund community projects.
      </p>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-8">
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'single'
              ? 'border-b-2 border-teal text-teal'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Send a Gift Card
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'border-b-2 border-teal text-teal'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Bulk Orders
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Design & Amount */}
          <div className="space-y-8">
            {/* Design Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-lg mb-4 dark:text-white">Choose a Design</h2>
              {designs.length === 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {['General', 'Birthday', 'Thank You', 'Holiday'].map((name, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedDesign(`default-${i}`)}
                      className={`aspect-[1.6] rounded-lg border-2 p-4 flex items-center justify-center ${
                        selectedDesign === `default-${i}`
                          ? 'border-teal bg-teal/5'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {designs.map((design) => (
                    <motion.button
                      key={design.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedDesign(design.id)}
                      className={`aspect-[1.6] rounded-lg border-2 overflow-hidden ${
                        selectedDesign === design.id
                          ? 'border-teal ring-2 ring-teal/30'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={design.imageUrl}
                        alt={design.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Selection */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-lg mb-4 dark:text-white">Select Amount</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {DENOMINATIONS.map((denom) => (
                  <button
                    key={denom}
                    onClick={() => {
                      setAmount(denom);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      amount === denom && !customAmount
                        ? 'border-teal bg-teal text-white'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-teal'
                    }`}
                  >
                    ${denom}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Custom amount ($5-$500)</label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  min="5"
                  max="500"
                  className="w-full mt-1 px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Recipient & Message */}
          <div className="space-y-8">
            {/* Delivery Method */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-lg mb-4 dark:text-white">Delivery Method</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeliveryMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    deliveryMethod === 'email'
                      ? 'border-teal bg-teal/5 text-teal'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="block text-lg mb-1">Email</span>
                  <span className="text-sm opacity-70">Send directly to recipient</span>
                </button>
                <button
                  onClick={() => setDeliveryMethod('print')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    deliveryMethod === 'print'
                      ? 'border-teal bg-teal/5 text-teal'
                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="block text-lg mb-1">Print</span>
                  <span className="text-sm opacity-70">Download to print at home</span>
                </button>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-lg mb-4 dark:text-white">Recipient Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient's name"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  />
                </div>

                {deliveryMethod === 'email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recipient Email *
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="Enter recipient's email"
                        required
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Date (optional)
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Leave blank to send immediately
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Personal Message (optional)
                  </label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                    {personalMessage.length}/200
                  </p>
                </div>
              </div>
            </div>

            {/* Summary & Purchase */}
            <div className="bg-gradient-to-br from-teal to-ocean p-6 rounded-xl text-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Gift Card Amount</span>
                <span className="text-2xl font-bold">${getEffectiveAmount().toFixed(2)}</span>
              </div>
              <button
                onClick={handlePurchase}
                disabled={purchasing || getEffectiveAmount() < 5}
                className="w-full py-3 bg-white text-teal font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {purchasing ? 'Processing...' : 'Purchase Gift Card'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Bulk Orders Tab */
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Corporate Bulk Orders</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Purchase gift cards in bulk for employee rewards, client appreciation, or fundraising events.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                  min="10"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Minimum 10 cards</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Denomination
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {DENOMINATIONS.map((denom) => (
                    <button
                      key={denom}
                      onClick={() => setBulkDenomination(denom)}
                      className={`py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                        bulkDenomination === denom
                          ? 'border-teal bg-teal text-white'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-teal'
                      }`}
                    >
                      ${denom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {bulkQuantity} cards × ${bulkDenomination}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    ${(bulkQuantity * bulkDenomination).toFixed(2)}
                  </span>
                </div>
                {bulkDiscount.discountPercent > 0 && (
                  <div className="flex justify-between text-sm mb-2 text-green-600 dark:text-green-400">
                    <span>Bulk Discount ({bulkDiscount.discountPercent}%)</span>
                    <span>-${bulkDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100 dark:border-gray-600">
                  <span className="dark:text-white">Total</span>
                  <span className="text-teal">${bulkDiscount.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="w-full py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors"
                onClick={() => toast('Please contact sales@deluge.fund for bulk orders', 'info')}
              >
                Request Bulk Order Quote
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                For orders of 100+ cards, contact us at{' '}
                <a href="mailto:sales@deluge.fund" className="text-teal hover:underline">
                  sales@deluge.fund
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Check Balance Section */}
      <div className="mt-12 max-w-md mx-auto">
        <CheckBalanceForm />
      </div>
    </div>
  );
}

function CheckBalanceForm() {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; balance: number; status: string; message?: string } | null>(null);

  async function handleCheck() {
    if (!code.trim()) {
      toast('Please enter a gift card code', 'error');
      return;
    }

    setChecking(true);
    try {
      const res = await fetch('/api/giftcards/check-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      toast('Failed to check balance', 'error');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-4 dark:text-white">Check Gift Card Balance</h3>
      <div className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setResult(null);
          }}
          placeholder="Enter gift card code"
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
        />
        <button
          onClick={handleCheck}
          disabled={checking}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          {checking ? '...' : 'Check'}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg ${
            result.valid
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}
        >
          {result.valid ? (
            <div>
              <p className="font-medium">Balance: ${result.balance.toFixed(2)}</p>
              <p className="text-sm opacity-80 capitalize">Status: {result.status}</p>
            </div>
          ) : (
            <p>{result.message}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
