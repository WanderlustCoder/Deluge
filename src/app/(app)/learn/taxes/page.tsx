'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calculator, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'Are my contributions tax-deductible?',
    answer: 'Contributions to qualified 501(c)(3) nonprofit organizations are generally tax-deductible. On Deluge, projects run by verified nonprofits are marked with a "Tax-Deductible" badge. However, not all projects on the platform are tax-deductible.',
  },
  {
    question: 'What records do I need for tax purposes?',
    answer: 'For donations under $250, a bank statement or receipt is typically sufficient. For donations of $250 or more, you need a written acknowledgment from the charity. Deluge provides contribution receipts in your account that you can download for your records.',
  },
  {
    question: 'Is there a limit to how much I can deduct?',
    answer: 'Generally, you can deduct charitable contributions up to 60% of your adjusted gross income (AGI) for cash donations to public charities. Different limits may apply for other types of donations.',
  },
  {
    question: 'Do I need to itemize deductions?',
    answer: 'To claim charitable deductions, you typically need to itemize deductions on your tax return rather than taking the standard deduction. This makes sense when your total itemized deductions exceed the standard deduction.',
  },
  {
    question: 'What about donations to non-501(c)(3) organizations?',
    answer: 'Donations to organizations that are not 501(c)(3) nonprofits are generally not tax-deductible. This includes donations to individuals, political organizations, and many community groups.',
  },
];

export default function TaxInfoPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [income, setIncome] = useState('');
  const [donations, setDonations] = useState('');

  const incomeNum = parseFloat(income) || 0;
  const donationsNum = parseFloat(donations) || 0;

  // Simple tax savings estimate (assumes 22% marginal rate and itemizing)
  const estimatedSavings = donationsNum * 0.22;
  const effectiveCost = donationsNum - estimatedSavings;

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
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Tax Information</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Learn about the tax benefits of charitable giving.
            This is educational information, not tax advice.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Disclaimer */}
          <div className="p-4 bg-gold/10 border border-gold/30 rounded-xl">
            <p className="text-sm">
              <strong>Disclaimer:</strong> This page provides general educational information
              about charitable giving and taxes. It is not tax, legal, or financial advice.
              Please consult with a qualified tax professional for advice specific to your situation.
            </p>
          </div>

          {/* Simple Estimator */}
          <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-ocean" />
              Simple Tax Savings Estimator
            </h2>
            <p className="text-sm text-storm/60 mb-4">
              This is a simplified estimate. Actual savings depend on your tax situation.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Annual Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-storm/40">$</span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="75,000"
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Donations</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-storm/40">$</span>
                  <input
                    type="number"
                    value={donations}
                    onChange={(e) => setDonations(e.target.value)}
                    placeholder="1,000"
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean focus:border-transparent dark:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {donationsNum > 0 && (
              <div className="p-4 bg-ocean/10 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Your donation:</span>
                  <span className="font-medium">${donationsNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal">
                  <span>Estimated tax savings*:</span>
                  <span className="font-medium">−${estimatedSavings.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-semibold">
                  <span>Effective cost to you:</span>
                  <span>${effectiveCost.toFixed(2)}</span>
                </div>
                <p className="text-xs text-storm/50 mt-2">
                  *Assumes 22% marginal tax rate and that you itemize deductions
                </p>
              </div>
            )}
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl overflow-hidden">
            <h2 className="font-semibold p-6 pb-0 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-ocean" />
              Common Questions
            </h2>

            <div className="divide-y divide-gray-200">
              {FAQS.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-storm/40 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-storm/40 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 text-storm/70">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white dark:bg-dark-border/50 border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Additional Resources</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contribution-deductions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean hover:underline"
                >
                  IRS: Charitable Contribution Deductions →
                </a>
              </li>
              <li>
                <a
                  href="https://www.irs.gov/publications/p526"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean hover:underline"
                >
                  IRS Publication 526: Charitable Contributions →
                </a>
              </li>
              <li>
                <Link href="/account/giving-history" className="text-ocean hover:underline">
                  Your Deluge Giving History & Receipts →
                </Link>
              </li>
            </ul>
          </div>

          {/* Consult Professional */}
          <div className="p-6 bg-sky/10 rounded-xl">
            <h3 className="font-semibold mb-2">When to Consult a Professional</h3>
            <p className="text-sm text-storm/70">
              Consider consulting a tax professional if you:
            </p>
            <ul className="text-sm text-storm/70 mt-2 space-y-1">
              <li>• Plan to make significant charitable donations</li>
              <li>• Are considering donating appreciated assets</li>
              <li>• Want to set up a donor-advised fund</li>
              <li>• Have complex tax situations</li>
              <li>• Are unsure about deduction limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
