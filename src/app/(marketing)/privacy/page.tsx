"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Database,
  Settings,
  ToggleRight,
  Clock,
  SlidersHorizontal,
  Scale,
  Share2,
  Lock,
  Baby,
  Cookie,
  Globe,
  MapPin,
  FileEdit,
  Mail,
} from "lucide-react";

const sections = [
  { id: "introduction", title: "Introduction", icon: Shield },
  { id: "info-collect", title: "Information We Collect", icon: Database },
  { id: "info-use", title: "How We Use Information", icon: Settings },
  { id: "consent-management", title: "Consent Management", icon: ToggleRight },
  { id: "data-retention", title: "Data Categories & Retention", icon: Clock },
  { id: "privacy-settings", title: "Privacy Settings & Controls", icon: SlidersHorizontal },
  { id: "your-rights", title: "Your Rights", icon: Scale },
  { id: "data-sharing", title: "Data Sharing", icon: Share2 },
  { id: "security", title: "Security Measures", icon: Lock },
  { id: "children", title: "Children's Privacy", icon: Baby },
  { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
  { id: "international", title: "International Transfers", icon: Globe },
  { id: "ccpa", title: "California Privacy (CCPA)", icon: MapPin },
  { id: "policy-changes", title: "Changes to Policy", icon: FileEdit },
  { id: "contact", title: "Contact", icon: Mail },
];

function SectionHeading({
  id,
  icon: Icon,
  number,
  title,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  number: number;
  title: string;
}) {
  return (
    <motion.div
      id={id}
      className="flex items-center gap-3 mb-4 scroll-mt-24"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-10 h-10 rounded-lg bg-ocean/10 dark:bg-sky/20 text-ocean dark:text-sky flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="font-heading font-bold text-2xl text-storm">
        {number}. {title}
      </h2>
    </motion.div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0a3d8f] text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(66,165,245,0.25),transparent)]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Shield className="h-10 w-10 opacity-90" />
            <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-wide">
              Privacy Policy
            </h1>
          </motion.div>
          <motion.p
            className="text-xl opacity-85 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Version 0.1 (Draft) &middot; Last updated: February 9, 2026
          </motion.p>
        </div>
      </section>

      {/* Draft Banner */}
      <div className="bg-[#FFA000] text-white py-3 px-4 text-center font-heading font-semibold text-sm tracking-wide">
        DRAFT &mdash; Subject to attorney review. This document is not yet legally binding.
      </div>

      {/* Content with TOC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex gap-12">
          {/* Sticky TOC - hidden on small screens */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <nav className="sticky top-24">
              <h3 className="font-heading font-semibold text-sm text-storm mb-3">
                Contents
              </h3>
              <ul className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-storm-light hover:text-ocean dark:hover:text-sky transition-colors block py-1"
                    >
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* 1. Introduction */}
            <section className="mb-16">
              <SectionHeading id="introduction" icon={Shield} number={1} title="Introduction" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Deluge Fund PBC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is
                  committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect
                  your personal information when you use the Deluge platform (&ldquo;Platform&rdquo;), including our website,
                  mobile applications, APIs, and all related services.
                </p>
                <p>
                  This Privacy Policy applies to all users of the Platform and should be read in conjunction with our{" "}
                  <Link href="/terms" className="text-ocean dark:text-sky hover:underline">Terms of Service</Link>.
                </p>
                <p>
                  By using the Platform, you consent to the data practices described in this policy. If you do not agree,
                  please do not use the Platform.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section className="mb-16">
              <SectionHeading id="info-collect" icon={Database} number={2} title="Information We Collect" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-6">
                <div className="grid gap-4">
                  {/* Card: You Provide */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-heading font-semibold text-lg text-storm mb-3">Information You Provide</h3>
                    <ul className="space-y-2 mb-0">
                      <li><strong className="text-storm">Account information:</strong> Name, email address, password, profile photo, bio, interests.</li>
                      <li><strong className="text-storm">Financial information:</strong> Payment method details (processed by third-party processors), contribution amounts, watershed balances, loan applications.</li>
                      <li><strong className="text-storm">Home efficiency data:</strong> Home address, property details, energy usage information, utility data (Plan 42 participants only).</li>
                      <li><strong className="text-storm">Marketplace data:</strong> Listing details, transaction records, shipping addresses, reviews.</li>
                      <li><strong className="text-storm">Community content:</strong> Posts, comments, proposals, votes, event details.</li>
                      <li><strong className="text-storm">Credit reporting consent:</strong> Opt-in preferences per loan, consent version acknowledgment.</li>
                      <li><strong className="text-storm">Support communications:</strong> Messages sent to our support team, feedback, and reports.</li>
                    </ul>
                  </div>

                  {/* Card: Automatic */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-heading font-semibold text-lg text-storm mb-3">Information Collected Automatically</h3>
                    <ul className="space-y-2 mb-0">
                      <li><strong className="text-storm">Analytics events:</strong> Page views, feature usage, interaction patterns, and navigation paths.</li>
                      <li><strong className="text-storm">Session data:</strong> Login timestamps, session duration, device information, browser type, operating system.</li>
                      <li><strong className="text-storm">Security data:</strong> IP addresses, failed login attempts, 2FA events, security audit logs.</li>
                      <li><strong className="text-storm">Ad view data:</strong> Advertisement impressions, completion status, impression IDs, ad categories viewed.</li>
                    </ul>
                  </div>

                  {/* Card: Third Parties */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-heading font-semibold text-lg text-storm mb-3">Information from Third Parties</h3>
                    <ul className="space-y-2 mb-0">
                      <li><strong className="text-storm">Payment processors:</strong> Transaction confirmations, payment status, fraud risk assessments.</li>
                      <li><strong className="text-storm">Ad networks:</strong> Aggregate campaign performance data, ad category information.</li>
                      <li><strong className="text-storm">OAuth providers:</strong> Basic profile information when you sign in with a third-party service (e.g., Google, GitHub).</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. How We Use Information */}
            <section className="mb-16">
              <SectionHeading id="info-use" icon={Settings} number={3} title="How We Use Information" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We process your information under the following legal bases:
                </p>
                <h3 className="font-heading font-semibold text-lg text-storm">Contract Performance</h3>
                <ul>
                  <li>Operating your account and watershed.</li>
                  <li>Processing contributions, allocations, and cascades.</li>
                  <li>Facilitating microloans, watershed loans, and repayments.</li>
                  <li>Managing marketplace transactions and event ticketing.</li>
                  <li>Delivering ad credits for completed ad views.</li>
                </ul>
                <h3 className="font-heading font-semibold text-lg text-storm">Consent</h3>
                <ul>
                  <li>Credit bureau reporting (opt-in per loan, consent version 1.0).</li>
                  <li>Marketing communications and newsletters.</li>
                  <li>Third-party data sharing beyond essential service providers.</li>
                  <li>Analytics beyond essential operational metrics.</li>
                </ul>
                <h3 className="font-heading font-semibold text-lg text-storm">Legitimate Interest</h3>
                <ul>
                  <li>Platform analytics to improve features and user experience.</li>
                  <li>Security monitoring, fraud detection, and abuse prevention.</li>
                  <li>Debugging and performance optimization.</li>
                </ul>
                <h3 className="font-heading font-semibold text-lg text-storm">Legal Obligation</h3>
                <ul>
                  <li>Tax reporting and documentation (1099s, donation receipts).</li>
                  <li>FCRA compliance for credit bureau reporting.</li>
                  <li>Responding to valid legal requests and court orders.</li>
                  <li>Anti-money laundering (AML) and Know Your Customer (KYC) requirements.</li>
                </ul>
              </div>
            </section>

            {/* 4. Consent Management */}
            <section className="mb-16">
              <SectionHeading id="consent-management" icon={ToggleRight} number={4} title="Consent Management" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We manage four categories of user consent, each independently controllable:
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <ul className="space-y-3 mb-0">
                    <li><strong className="text-storm"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">marketing</code></strong> &mdash; Email newsletters, promotional content, and product updates.</li>
                    <li><strong className="text-storm"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">analytics</code></strong> &mdash; Usage analytics, feature tracking, and behavioral insights beyond essential operational metrics.</li>
                    <li><strong className="text-storm"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">third_party</code></strong> &mdash; Sharing data with third-party services for enhanced functionality.</li>
                    <li><strong className="text-storm"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">data_sharing</code></strong> &mdash; Sharing aggregate or anonymized data with partners and researchers.</li>
                  </ul>
                </div>
                <p>
                  Each consent is versioned with a policy version string. When we update a consent policy, users who have
                  previously granted consent are prompted to re-consent under the new version. Consent grants and revocations
                  are logged with timestamps, IP addresses, and user agent information.
                </p>
                <p>
                  <strong className="text-storm">Credit bureau reporting consent</strong> is managed separately from the above categories.
                  It is requested per loan at the time of origination through a dedicated consent modal (current consent version: 1.0).
                  You may withdraw credit reporting consent at any time, but previously reported data remains on bureau records
                  per bureau retention policies.
                </p>
                <p>
                  Manage your consent preferences at{" "}
                  <span className="text-ocean dark:text-sky">/account/privacy</span> in your account settings.
                </p>
              </div>
            </section>

            {/* 5. Data Categories & Retention */}
            <section className="mb-16">
              <SectionHeading id="data-retention" icon={Clock} number={5} title="Data Categories & Retention" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We retain different categories of data for different periods, based on legal requirements and operational needs:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 pr-4 font-heading font-semibold text-storm">Data Category</th>
                        <th className="text-left py-3 font-heading font-semibold text-storm">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr><td className="py-3 pr-4">Account data</td><td className="py-3">Until deletion + 30-day grace period</td></tr>
                      <tr><td className="py-3 pr-4">Financial records</td><td className="py-3">7 years (legal requirement)</td></tr>
                      <tr><td className="py-3 pr-4">Loan records</td><td className="py-3">7 years (legal requirement)</td></tr>
                      <tr><td className="py-3 pr-4">Ad view data</td><td className="py-3">3 years</td></tr>
                      <tr><td className="py-3 pr-4">Analytics data</td><td className="py-3">User choice: 1 year, 3 years, 5 years, or indefinite</td></tr>
                      <tr><td className="py-3 pr-4">Security logs</td><td className="py-3">2 years</td></tr>
                      <tr><td className="py-3 pr-4">Credit bureau data</td><td className="py-3">7&ndash;10 years (per bureau retention policy)</td></tr>
                      <tr><td className="py-3 pr-4">Home efficiency data</td><td className="py-3">Program duration + 5 years</td></tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  When data reaches the end of its retention period, it is either permanently deleted or anonymized,
                  depending on whether it is needed for aggregate reporting or legal compliance.
                </p>
              </div>
            </section>

            {/* 6. Privacy Settings & Controls */}
            <section className="mb-16">
              <SectionHeading id="privacy-settings" icon={SlidersHorizontal} number={6} title="Privacy Settings & Controls" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  You have granular control over your privacy through the following settings, available at{" "}
                  <span className="text-ocean dark:text-sky">/account/privacy</span>:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 pr-4 font-heading font-semibold text-storm">Setting</th>
                        <th className="text-left py-3 pr-4 font-heading font-semibold text-storm">Options</th>
                        <th className="text-left py-3 font-heading font-semibold text-storm">Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">profileVisibility</code></td>
                        <td className="py-3 pr-4">public, community, private</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">public</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">showGivingHistory</code></td>
                        <td className="py-3 pr-4">true / false</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">false</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">showBadges</code></td>
                        <td className="py-3 pr-4">true / false</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">true</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">showCommunities</code></td>
                        <td className="py-3 pr-4">true / false</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">true</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">allowTagging</code></td>
                        <td className="py-3 pr-4">true / false</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">true</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">allowMessages</code></td>
                        <td className="py-3 pr-4">anyone, followers, none</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">followers</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">showOnLeaderboards</code></td>
                        <td className="py-3 pr-4">true / false</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">true</code></td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">dataRetention</code></td>
                        <td className="py-3 pr-4">1y, 3y, 5y, indefinite</td>
                        <td className="py-3"><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">indefinite</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  Changes to privacy settings take effect immediately. Reducing visibility does not retroactively remove
                  data already accessed by other users (e.g., cached profile views), but it prevents future access.
                </p>
              </div>
            </section>

            {/* 7. Your Rights */}
            <section className="mb-16">
              <SectionHeading id="your-rights" icon={Scale} number={7} title="Your Rights" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  You have the following rights regarding your personal data:
                </p>
                <ul>
                  <li>
                    <strong className="text-storm">Right to Access:</strong> Request a copy of all personal data we hold about you. Submit
                    a data access request through your account settings or by contacting us.
                  </li>
                  <li>
                    <strong className="text-storm">Right to Export:</strong> Export your data in CSV format. Export files are generated on
                    request and available for download via a secure link that expires after 7 days.
                  </li>
                  <li>
                    <strong className="text-storm">Right to Deletion:</strong> Request deletion of your account and personal data. Upon
                    request, a 30-day grace period begins during which you can cancel. After the grace period, your data is
                    anonymized: your email is replaced with{" "}
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">deleted-&#123;id&#125;@anonymous.local</code>,
                    your name becomes &ldquo;Deleted User&rdquo;, and other personal identifiers are removed. Financial
                    records are retained per legal requirements but disassociated from your identity.
                  </li>
                  <li>
                    <strong className="text-storm">Right to Rectification:</strong> Request correction of inaccurate personal data.
                  </li>
                  <li>
                    <strong className="text-storm">Right to Object / Restrict:</strong> Object to processing based on legitimate interest,
                    or request that we restrict processing of your data in certain circumstances.
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, use the data request features in your account settings or contact{" "}
                  <span className="text-ocean dark:text-sky">privacy@deluge.fund</span>. We will respond to all data
                  requests within 30 days.
                </p>
              </div>
            </section>

            {/* 8. Data Sharing */}
            <section className="mb-16">
              <SectionHeading id="data-sharing" icon={Share2} number={8} title="Data Sharing" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We share your data with the following categories of recipients:
                </p>
                <ul>
                  <li>
                    <strong className="text-storm">Service providers:</strong> Payment processors, cloud hosting providers, email delivery
                    services, and other vendors necessary to operate the Platform. These providers are contractually obligated
                    to protect your data.
                  </li>
                  <li>
                    <strong className="text-storm">Credit bureaus:</strong> Experian, TransUnion, and Equifax &mdash; <strong>only with your
                    explicit opt-in consent</strong> on a per-loan basis. We report payment history, balances, and account status.
                  </li>
                  <li>
                    <strong className="text-storm">Contractors (Plan 42):</strong> Home efficiency program participants&rsquo; property data is
                    shared with vetted contractors as necessary to perform assessments and upgrades.
                  </li>
                  <li>
                    <strong className="text-storm">Corporate partners:</strong> Aggregate, anonymized data may be shared with corporate
                    portal partners for reporting on their matching and campaign programs.
                  </li>
                  <li>
                    <strong className="text-storm">Legal obligations:</strong> We may disclose data when required by law, court order, or
                    governmental authority, or when necessary to protect our rights or the safety of users.
                  </li>
                </ul>
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="font-semibold text-storm mb-1">We do not sell your personal data.</p>
                  <p className="mb-0">
                    Deluge Fund PBC does not sell, rent, or trade your personal information to third parties for their
                    marketing purposes. This applies to all user data without exception.
                  </p>
                </div>
              </div>
            </section>

            {/* 9. Security Measures */}
            <section className="mb-16">
              <SectionHeading id="security" icon={Lock} number={9} title="Security Measures" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We implement comprehensive security measures to protect your data:
                </p>
                <ul>
                  <li><strong className="text-storm">Password security:</strong> Passwords are hashed using industry-standard algorithms. We never store plaintext passwords.</li>
                  <li><strong className="text-storm">Two-factor authentication:</strong> Available via TOTP (authenticator apps), SMS, and email. Strongly recommended for accounts with financial features.</li>
                  <li><strong className="text-storm">Session security:</strong> Active sessions are tracked with device information, IP address, and last activity time. You can view and terminate sessions from your account settings.</li>
                  <li><strong className="text-storm">Audit logging:</strong> Security-relevant actions (login, password changes, consent changes, financial transactions) are logged in immutable audit trails.</li>
                  <li><strong className="text-storm">Rate limiting:</strong> API endpoints and authentication attempts are rate-limited to prevent abuse.</li>
                  <li><strong className="text-storm">Security event monitoring:</strong> Automated detection of suspicious activity including unusual login patterns, excessive failed attempts, and geographic anomalies.</li>
                </ul>
              </div>
            </section>

            {/* 10. Children's Privacy */}
            <section className="mb-16">
              <SectionHeading id="children" icon={Baby} number={10} title="Children's Privacy" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform is designed with age-appropriate access controls in compliance with the Children&rsquo;s Online
                  Privacy Protection Act (COPPA):
                </p>
                <ul>
                  <li><strong className="text-storm">Minimum age:</strong> Users must be at least 13 years old to create an account.</li>
                  <li><strong className="text-storm">Financial features:</strong> Users must be at least 18 years old to access financial features including contributions, loans, and marketplace transactions.</li>
                  <li>
                    <strong className="text-storm">Family accounts:</strong> Parents or guardians may create linked family accounts for
                    minors aged 13&ndash;17 with parental controls including:
                    <ul>
                      <li><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">requireApproval</code> &mdash; Require parental approval for actions.</li>
                      <li><code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">monthlyLimit</code> &mdash; Set monthly spending/allocation limits.</li>
                      <li>Restrict access to specific feature categories.</li>
                    </ul>
                  </li>
                </ul>
                <p>
                  If we learn that we have collected personal information from a child under 13, we will promptly delete
                  the account and associated data.
                </p>
              </div>
            </section>

            {/* 11. Cookies & Tracking */}
            <section className="mb-16">
              <SectionHeading id="cookies" icon={Cookie} number={11} title="Cookies & Tracking" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We use cookies and similar tracking technologies for the following purposes:
                </p>
                <div className="grid gap-3">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-storm mb-1">Essential (always active)</p>
                    <p className="text-sm mb-0">Authentication tokens, session management, security tokens, CSRF protection. These cannot be disabled as they are necessary for the Platform to function.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-storm mb-1">Analytics (consent required)</p>
                    <p className="text-sm mb-0">Page view tracking, feature usage metrics, performance monitoring. Enabled only with your <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">analytics</code> consent.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-storm mb-1">Marketing (consent required)</p>
                    <p className="text-sm mb-0">Email campaign tracking, referral attribution. Enabled only with your <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">marketing</code> consent.</p>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-storm mb-1">Third-party (consent required)</p>
                    <p className="text-sm mb-0">Third-party integrations and enhanced functionality. Enabled only with your <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">third_party</code> consent.</p>
                  </div>
                </div>
                <p>
                  Ad tracking uses unique impression IDs to track ad view completions for watershed credit calculation.
                  These are essential to the ad credit system and are processed under our contractual basis.
                </p>
              </div>
            </section>

            {/* 12. International Transfers */}
            <section className="mb-16">
              <SectionHeading id="international" icon={Globe} number={12} title="International Transfers" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform is operated from the United States. Your data is processed and stored on servers located
                  in the United States.
                </p>
                <p>
                  If you access the Platform from outside the United States, your data will be transferred to and processed
                  in the United States. By using the Platform, you consent to this transfer.
                </p>
                <p>
                  For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR).
                  International data transfers from the EEA are protected by Standard Contractual Clauses (SCCs) as approved
                  by the European Commission. You may request a copy of the applicable SCCs by contacting our Data Protection
                  Officer.
                </p>
              </div>
            </section>

            {/* 13. California Privacy (CCPA) */}
            <section className="mb-16">
              <SectionHeading id="ccpa" icon={MapPin} number={13} title="California Privacy (CCPA)" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  If you are a California resident, you have the following additional rights under the California Consumer
                  Privacy Act (CCPA):
                </p>
                <ul>
                  <li><strong className="text-storm">Right to Know:</strong> You may request information about the categories and specific pieces of personal information we have collected, the categories of sources, the business purposes for collection, and the categories of third parties we share data with.</li>
                  <li><strong className="text-storm">Right to Delete:</strong> You may request deletion of your personal information, subject to certain legal exceptions (e.g., completing a transaction, legal obligations, security).</li>
                  <li><strong className="text-storm">Right to Opt-Out of Sale:</strong> We do not sell your personal information. As such, there is no need to opt out, but we honor this right proactively.</li>
                  <li><strong className="text-storm">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights. You will receive equal service, pricing, and quality regardless of your privacy choices.</li>
                </ul>
                <p>
                  To exercise your CCPA rights, contact <span className="text-ocean dark:text-sky">privacy@deluge.fund</span> or
                  use the data request features in your account settings.
                </p>
              </div>
            </section>

            {/* 14. Changes to Policy */}
            <section className="mb-16">
              <SectionHeading id="policy-changes" icon={FileEdit} number={14} title="Changes to Policy" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. When we make material changes:
                </p>
                <ul>
                  <li>We will provide at least 30 days&rsquo; advance notice via email and/or a prominent notice on the Platform.</li>
                  <li>The policy version number and &ldquo;Last updated&rdquo; date will be updated.</li>
                  <li>Where changes affect consent-based processing, a re-consent flow will be triggered &mdash; you will be prompted to review and accept the updated terms before continuing to use affected features.</li>
                </ul>
                <p>
                  We maintain a complete version history of all Privacy Policy changes. Previous versions are available
                  upon request.
                </p>
              </div>
            </section>

            {/* 15. Contact */}
            <section className="mb-8">
              <SectionHeading id="contact" icon={Mail} number={15} title="Contact" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  For questions about this Privacy Policy or to exercise your data rights, contact us at:
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-2">
                  <p className="font-semibold text-storm mb-2">Deluge Fund PBC</p>
                  <p>
                    Privacy inquiries: <span className="text-ocean dark:text-sky">privacy@deluge.fund</span>
                  </p>
                  <p>
                    Data Protection Officer: <span className="text-ocean dark:text-sky">dpo@deluge.fund</span>
                  </p>
                  <p className="text-sm mt-3 mb-0">
                    We respond to all data requests within 30 days of receipt.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
