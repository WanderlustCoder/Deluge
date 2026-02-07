import { Shield, ShieldCheck, Award, Users, FileCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { VERIFICATION_LEVELS, VerificationLevel } from '@/lib/verification/levels';

async function getTrustStats() {
  const [verificationCounts, totalProjects, flagsResolved] = await Promise.all([
    prisma.projectVerification.groupBy({
      by: ['level'],
      _count: { id: true },
    }),
    prisma.project.count(),
    prisma.projectFlag.count({
      where: { status: 'resolved' },
    }),
  ]);

  const byLevel: Record<string, number> = {};
  for (const item of verificationCounts) {
    byLevel[item.level] = item._count.id;
  }

  return {
    totalProjects,
    verified: (byLevel['verified'] || 0) + (byLevel['audited'] || 0),
    audited: byLevel['audited'] || 0,
    flagsResolved,
    byLevel,
  };
}

export default async function TrustPage() {
  const stats = await getTrustStats();

  return (
    <div className="min-h-screen bg-foam dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-b from-ocean to-ocean-dark py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Trust & Verification</h1>
          <p className="text-xl text-ocean-light max-w-2xl mx-auto">
            Every project on Deluge goes through our verification process.
            We believe transparency builds trust.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-3xl font-bold text-ocean">{stats.totalProjects}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Projects</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
              <p className="text-gray-600 dark:text-gray-400">Verified Projects</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-3xl font-bold text-yellow-600">{stats.audited}</p>
              <p className="text-gray-600 dark:text-gray-400">Audited Projects</p>
            </div>
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-3xl font-bold text-teal-600">{stats.flagsResolved}</p>
              <p className="text-gray-600 dark:text-gray-400">Issues Resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Levels */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Verification Levels
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['unverified', 'basic', 'verified', 'audited'] as VerificationLevel[]).map((level) => {
              const def = VERIFICATION_LEVELS[level];
              return (
                <div
                  key={level}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {level === 'unverified' && <Shield className="w-8 h-8 text-gray-400" />}
                    {level === 'basic' && <Shield className="w-8 h-8 text-blue-500" />}
                    {level === 'verified' && <ShieldCheck className="w-8 h-8 text-green-500" />}
                    {level === 'audited' && <Award className="w-8 h-8 text-yellow-500" />}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{def.label}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{def.description}</p>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements:</p>
                    <ul className="text-gray-500 dark:text-gray-400 space-y-1">
                      {def.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Verify */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Our Verification Process
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-ocean/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-ocean" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Identity Verification</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Project proposers verify their identity using government-issued ID.
                  This ensures accountability and builds trust with funders.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Organization Verification</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Nonprofits and organizations submit their EIN and registration documents.
                  We verify 501(c)(3) status to ensure tax-deductible donations are legitimate.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Verification</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Community members can verify project outcomes they've witnessed.
                  This crowdsourced verification adds another layer of accountability.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Third-Party Audits</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For the highest level of trust, projects can undergo professional audits
                  by approved auditors who review financials and impact claims.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            See Something Concerning?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Our community helps keep Deluge safe. If you see a project that seems suspicious
            or misuses funds, you can report it for review. All reports are confidential.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean text-white rounded-lg hover:bg-ocean-dark transition-colors"
          >
            Report a Project
          </Link>
        </div>
      </section>

      {/* Link to Transparency */}
      <section className="py-12 bg-ocean/5 dark:bg-ocean/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to see how we handle platform finances?
          </p>
          <Link
            href="/transparency"
            className="text-ocean hover:underline font-medium"
          >
            View our Transparency Report →
          </Link>
        </div>
      </section>
    </div>
  );
}
