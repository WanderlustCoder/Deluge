'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

export default function BudgetPlannerPage() {
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [givingMethod, setGivingMethod] = useState<'percentage' | 'fixed' | 'flexible'>('flexible');
  const [percentage, setPercentage] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Calculate suggested amounts
  const income = parseFloat(monthlyIncome) || 0;
  const suggestions = [
    { label: '1% - Getting Started', amount: income * 0.01, description: 'A gentle start' },
    { label: '3% - Steady Giving', amount: income * 0.03, description: 'Building a habit' },
    { label: '5% - Meaningful Impact', amount: income * 0.05, description: 'Making a difference' },
    { label: '10% - Traditional Tithe', amount: income * 0.10, description: 'Historic standard' },
  ];

  const handleSave = async () => {
    setSaving(true);
    // In a real implementation, this would save to the API
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean to-teal text-white py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Giving Budget Planner</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            A tool to help you plan sustainable giving within your means.
            This is for your reference only - we won&apos;t track or remind you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Income Input */}
          <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-ocean" />
              Monthly Income (optional)
            </h2>
            <p className="text-sm text-storm/60 mb-4">
              Enter your monthly income to see suggested giving amounts.
              This information stays private and is not stored.
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-storm/40">$</span>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
              />
            </div>
          </div>

          {/* Suggestions */}
          {income > 0 && (
            <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-ocean" />
                Suggested Amounts
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => {
                      setGivingMethod('fixed');
                      setFixedAmount(suggestion.amount.toFixed(2));
                    }}
                    className="p-4 border border-gray-200 rounded-lg text-left hover:border-ocean transition-colors"
                  >
                    <div className="text-lg font-semibold text-ocean">
                      ${suggestion.amount.toFixed(2)}/mo
                    </div>
                    <div className="text-sm font-medium">{suggestion.label}</div>
                    <div className="text-xs text-storm/60">{suggestion.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Giving Method */}
          <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-ocean" />
              Your Giving Approach
            </h2>

            <div className="space-y-4">
              {/* Method Selection */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'flexible', label: 'Flexible' },
                  { id: 'percentage', label: 'Percentage' },
                  { id: 'fixed', label: 'Fixed Amount' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setGivingMethod(method.id as typeof givingMethod)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      givingMethod === method.id
                        ? 'bg-ocean text-white'
                        : 'bg-gray-100 text-storm/70 hover:bg-gray-200'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {/* Method-specific inputs */}
              {givingMethod === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Percentage of income
                  </label>
                  <div className="relative w-32">
                    <input
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      placeholder="5"
                      className="w-full pr-8 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-storm/40">%</span>
                  </div>
                  {income > 0 && percentage && (
                    <p className="text-sm text-storm/60 mt-2">
                      = ${((income * parseFloat(percentage)) / 100).toFixed(2)}/month
                    </p>
                  )}
                </div>
              )}

              {givingMethod === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Monthly amount
                  </label>
                  <div className="relative w-40">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-storm/40">$</span>
                    <input
                      type="number"
                      value={fixedAmount}
                      onChange={(e) => setFixedAmount(e.target.value)}
                      placeholder="50.00"
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {givingMethod === 'flexible' && (
                <p className="text-sm text-storm/60">
                  Give what feels right, when it feels right. No set amount or schedule.
                </p>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Personal notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any thoughts about your giving approach..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent resize-none dark:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-ocean text-white rounded-lg hover:bg-ocean/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Plan'}
            </button>
          </div>

          {/* Philosophy Note */}
          <div className="p-6 bg-sky/10 rounded-xl">
            <h3 className="font-semibold mb-2">A Note on Giving</h3>
            <p className="text-sm text-storm/70">
              There&apos;s no &quot;right&quot; amount to give. What matters is that your giving
              is sustainable for you and meaningful to you. We won&apos;t send reminders
              or track whether you meet your goals. This is your plan, for your reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
