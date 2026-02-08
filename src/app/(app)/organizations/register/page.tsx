'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';

type OrganizationType = '501c3' | '501c4' | 'fiscal_sponsor' | 'other';

interface FormData {
  name: string;
  legalName: string;
  ein: string;
  type: OrganizationType;
  mission: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  focusAreas: string[];
  geographicScope: string;
  foundedYear: string;
  annualBudget: string;
}

const FOCUS_AREAS = [
  'Education',
  'Health',
  'Environment',
  'Arts & Culture',
  'Housing',
  'Food Security',
  'Youth Development',
  'Senior Services',
  'Animal Welfare',
  'Social Justice',
  'Economic Development',
  'Community Building',
];

const BUDGET_RANGES = [
  { value: '<100k', label: 'Under $100,000' },
  { value: '100k-500k', label: '$100,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1 million' },
  { value: '1m-5m', label: '$1 million - $5 million' },
  { value: '5m+', label: 'Over $5 million' },
];

export default function RegisterOrganizationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    legalName: '',
    ein: '',
    type: '501c3',
    mission: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    focusAreas: [],
    geographicScope: 'local',
    foundedYear: '',
    annualBudget: '',
  });

  function updateFormData(field: keyof FormData, value: string | string[]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFocusArea(area: string) {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || 'Failed to register organization', 'error');
        return;
      }

      toast('Organization registered successfully! Verification pending.', 'success');
      router.push(`/org/${data.organization.slug}`);
    } catch (error) {
      toast('Failed to register organization', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Register Your Organization
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Join Deluge to receive donations and manage your nonprofit presence.
      </p>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step
                  ? 'bg-teal text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-24 h-1 mx-2 ${
                  s < step ? 'bg-teal' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold dark:text-white">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Boise River Foundation"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Legal Name (if different)
              </label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => updateFormData('legalName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  <option value="501c3">501(c)(3)</option>
                  <option value="501c4">501(c)(4)</option>
                  <option value="fiscal_sponsor">Fiscal Sponsor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  EIN (Tax ID)
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => updateFormData('ein', e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mission Statement *
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) => updateFormData('mission', e.target.value)}
                rows={3}
                placeholder="What does your organization do?"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                placeholder="Tell donors more about your work..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold dark:text-white">Contact & Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => updateFormData('street', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  maxLength={2}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => updateFormData('zip', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Geographic Scope
              </label>
              <select
                value={formData.geographicScope}
                onChange={(e) => updateFormData('geographicScope', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              >
                <option value="local">Local</option>
                <option value="regional">Regional</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold dark:text-white">Organization Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Focus Areas (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocusArea(area)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      formData.focusAreas.includes(area)
                        ? 'bg-teal text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year Founded
                </label>
                <input
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => updateFormData('foundedYear', e.target.value)}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Annual Budget
                </label>
                <select
                  value={formData.annualBudget}
                  onChange={(e) => updateFormData('annualBudget', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  <option value="">Select range</option>
                  {BUDGET_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-300">
                Next Steps After Registration
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>1. Upload verification documents (EIN letter, 501(c)(3) determination)</li>
                <li>2. Our team will review your application</li>
                <li>3. Once verified, you can start receiving donations</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!formData.name || !formData.mission || !formData.type)) ||
                (step === 2 && !formData.email)
              }
              className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal/90 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Organization'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
