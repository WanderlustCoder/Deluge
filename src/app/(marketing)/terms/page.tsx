"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScrollText,
  BookOpen,
  UserCheck,
  Droplets,
  Heart,
  RefreshCw,
  Landmark,
  CreditCard,
  Home,
  Users,
  Store,
  Calendar,
  Megaphone,
  Gift,
  Building2,
  HandHeart,
  Code,
  Tv,
  Copyright,
  Ban,
  AlertTriangle,
  ShieldAlert,
  Gavel,
  FileEdit,
  LogOut,
  Mail,
} from "lucide-react";

const sections = [
  { id: "acceptance", title: "Introduction & Acceptance", icon: ScrollText },
  { id: "definitions", title: "Definitions", icon: BookOpen },
  { id: "accounts", title: "Account Registration & Security", icon: UserCheck },
  { id: "watershed", title: "Watershed System", icon: Droplets },
  { id: "giving", title: "Giving & Project Funding", icon: Heart },
  { id: "microloans", title: "Microloans", icon: RefreshCw },
  { id: "watershed-loans", title: "Watershed Loans", icon: Landmark },
  { id: "credit-reporting", title: "Credit Bureau Reporting", icon: CreditCard },
  { id: "home-efficiency", title: "Home Efficiency Program", icon: Home },
  { id: "community", title: "Community Features", icon: Users },
  { id: "marketplace", title: "Marketplace", icon: Store },
  { id: "events", title: "Events & Ticketing", icon: Calendar },
  { id: "pledges", title: "Pledge Campaigns", icon: Megaphone },
  { id: "gift-cards", title: "Gift Cards", icon: Gift },
  { id: "corporate", title: "Corporate Portal", icon: Building2 },
  { id: "nonprofit", title: "Nonprofit Portal", icon: HandHeart },
  { id: "api", title: "Developer API", icon: Code },
  { id: "advertising", title: "Advertising", icon: Tv },
  { id: "ip", title: "Intellectual Property", icon: Copyright },
  { id: "prohibited", title: "Prohibited Conduct", icon: Ban },
  { id: "disclaimers", title: "Disclaimers & Liability", icon: AlertTriangle },
  { id: "indemnification", title: "Indemnification", icon: ShieldAlert },
  { id: "disputes", title: "Dispute Resolution", icon: Gavel },
  { id: "changes", title: "Changes to Terms", icon: FileEdit },
  { id: "termination", title: "Termination", icon: LogOut },
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

export default function TermsOfServicePage() {
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
            <ScrollText className="h-10 w-10 opacity-90" />
            <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-wide">
              Terms of Service
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
            {/* 1. Introduction & Acceptance */}
            <section className="mb-16">
              <SectionHeading id="acceptance" icon={ScrollText} number={1} title="Introduction & Acceptance" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Welcome to Deluge (&ldquo;Platform&rdquo;), operated by Deluge Fund PBC, a Public Benefit Corporation
                  (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). These Terms of Service
                  (&ldquo;Terms&rdquo;) govern your access to and use of the Deluge platform, including our website, mobile
                  applications, APIs, and all related services.
                </p>
                <p>
                  By creating an account or using any part of the Platform, you agree to be bound by these Terms, our{" "}
                  <Link href="/privacy" className="text-ocean dark:text-sky hover:underline">Privacy Policy</Link>, and any
                  additional terms applicable to specific features you use.
                </p>
                <p>
                  <strong className="text-storm">Age requirements:</strong> You must be at least 13 years old to create an account.
                  Users under 18 may access community features, view content, and earn ad credits, but may not access financial
                  features including direct contributions, microloans, watershed loans, marketplace transactions, or credit bureau
                  reporting without parental or guardian consent. Financial features require you to be at least 18 years old.
                </p>
                <p>
                  If you do not agree to these Terms, do not use the Platform.
                </p>
              </div>
            </section>

            {/* 2. Definitions */}
            <section className="mb-16">
              <SectionHeading id="definitions" icon={BookOpen} number={2} title="Definitions" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-3">
                <ul className="list-none pl-0 space-y-3">
                  <li><strong className="text-storm">&ldquo;Watershed&rdquo;</strong> &mdash; Your personal impact fund on the Platform, which accumulates funds from ad credits, direct contributions, and referral bonuses.</li>
                  <li><strong className="text-storm">&ldquo;Cascade&rdquo;</strong> &mdash; The event when a project reaches full funding and allocations are executed, transferring funds from watersheds to the project.</li>
                  <li><strong className="text-storm">&ldquo;Allocation&rdquo;</strong> &mdash; A pledge of funds from your watershed to a specific project, which becomes irrevocable upon cascade.</li>
                  <li><strong className="text-storm">&ldquo;Contribution&rdquo;</strong> &mdash; A direct monetary deposit into your watershed, with a minimum of $0.25 per transaction.</li>
                  <li><strong className="text-storm">&ldquo;Float&rdquo;</strong> &mdash; Interest earned on funds held in aggregate across all watersheds, which constitutes part of the Company&rsquo;s revenue.</li>
                  <li><strong className="text-storm">&ldquo;Microloan&rdquo;</strong> &mdash; A small, community-funded loan available through the Platform, offered at 0% interest with a 2% servicing fee.</li>
                  <li><strong className="text-storm">&ldquo;Ad Credit&rdquo;</strong> &mdash; Funds earned by watching advertisements on the Platform, split 60% to your watershed and 40% to the Company.</li>
                  <li><strong className="text-storm">&ldquo;Community&rdquo;</strong> &mdash; A group of users organized around shared geography, interests, or goals, with collective governance features.</li>
                  <li><strong className="text-storm">&ldquo;Project&rdquo;</strong> &mdash; A verified initiative seeking funding through the Platform, subject to verification and reporting requirements.</li>
                </ul>
              </div>
            </section>

            {/* 3. Account Registration & Security */}
            <section className="mb-16">
              <SectionHeading id="accounts" icon={UserCheck} number={3} title="Account Registration & Security" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  To use most features of the Platform, you must create an account. You agree to:
                </p>
                <ul>
                  <li>Provide accurate, complete, and current information during registration and keep it updated.</li>
                  <li>Maintain only one account per person. Multiple accounts per individual are prohibited.</li>
                  <li>Keep your password secure and not share your credentials with any third party.</li>
                  <li>Notify us immediately of any unauthorized access to your account.</li>
                </ul>
                <p>
                  We offer two-factor authentication (2FA) via TOTP, SMS, and email. We strongly recommend enabling 2FA for
                  accounts accessing financial features. We track active sessions for security purposes and may terminate
                  suspicious sessions automatically.
                </p>
                <p>
                  You are responsible for all activity under your account, whether or not authorized by you.
                </p>
              </div>
            </section>

            {/* 4. Watershed System */}
            <section className="mb-16">
              <SectionHeading id="watershed" icon={Droplets} number={4} title="Watershed System" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The watershed is the core mechanism of the Platform. Your watershed accumulates funds from multiple sources
                  and enables you to allocate those funds to projects you care about.
                </p>
                <h3 className="font-heading font-semibold text-lg text-storm">Ad Credits</h3>
                <p>
                  By watching advertisements on the Platform, you earn ad credits. Revenue from each ad view is split
                  60% to your watershed and 40% to the Company. You may earn ad credits from up to 30 ads per day.
                  eCPM (effective cost per thousand impressions) varies by advertiser, ad category, and market conditions.
                </p>
                <h3 className="font-heading font-semibold text-lg text-storm">Direct Contributions</h3>
                <p>
                  You may deposit funds directly into your watershed. The minimum contribution is $0.25 per transaction.
                  Contributions are processed through our third-party payment processors.
                </p>
                <h3 className="font-heading font-semibold text-lg text-storm">Referral Bonuses</h3>
                <p>
                  When you refer a new user who creates an account and completes their first ad view, you receive a $0.50
                  referral bonus. When your referred user makes their first direct contribution, you receive an additional
                  $1.00 bonus. Referral bonuses are capped at 10 referrals per month.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-storm font-semibold mb-1">Important Disclosures</p>
                  <ul className="mb-0">
                    <li>Your watershed is <strong>NOT</strong> a bank account.</li>
                    <li>Funds in your watershed are <strong>NOT</strong> FDIC insured.</li>
                    <li>The Company earns float (interest) on aggregate watershed balances.</li>
                    <li>Watershed funds may only be used for allocations to projects, microloans, or other Platform-designated purposes.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Giving & Project Funding */}
            <section className="mb-16">
              <SectionHeading id="giving" icon={Heart} number={5} title="Giving & Project Funding" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  You may allocate funds from your watershed to projects listed on the Platform. Allocations represent your
                  intent to fund a project and become irrevocable once the project cascades (reaches full funding and executes).
                </p>
                <ul>
                  <li>Minimum allocation amount: $0.25.</li>
                  <li>Projects undergo verification before listing, with verification levels varying by project size and type.</li>
                  <li>The Platform does not guarantee any specific outcome from funded projects.</li>
                  <li>
                    Tax deductibility of your contributions depends on the recipient organization&rsquo;s status. Allocations to
                    verified 501(c)(3) organizations may be tax-deductible; allocations to other projects generally are not.
                    Consult a tax professional for your specific situation.
                  </li>
                </ul>
                <p>
                  Prior to cascade, you may modify or withdraw allocations. After cascade, all allocations are final.
                </p>
              </div>
            </section>

            {/* 6. Microloans */}
            <section className="mb-16">
              <SectionHeading id="microloans" icon={RefreshCw} number={6} title="Microloans" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform facilitates community-funded microloans at 0% interest. A 2% servicing fee is applied to each
                  microloan to cover administrative costs. Microloans are organized into five tiers:
                </p>
                <ul>
                  <li><strong className="text-storm">Tier 1:</strong> Up to $50 &mdash; minimal verification required.</li>
                  <li><strong className="text-storm">Tier 2:</strong> Up to $200 &mdash; basic identity verification.</li>
                  <li><strong className="text-storm">Tier 3:</strong> Up to $500 &mdash; income verification.</li>
                  <li><strong className="text-storm">Tier 4:</strong> Up to $1,000 &mdash; enhanced verification and community endorsement.</li>
                  <li><strong className="text-storm">Tier 5:</strong> Up to $2,500 &mdash; full underwriting and community vote.</li>
                </ul>
                <p>
                  Repayment terms vary by tier and are established at the time of loan origination. Borrowers agree to
                  repay the full loan amount plus the 2% servicing fee according to the agreed schedule.
                </p>
                <p>
                  In the event of default, the Platform may pursue recovery through reasonable collection efforts. Default
                  may affect the borrower&rsquo;s eligibility for future loans and, if credit bureau reporting has been opted
                  into, may be reported to credit bureaus.
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="mb-0">
                    <strong className="text-storm">For funders:</strong> Community members who fund microloans accept the risk
                    that borrowers may default. The Platform does not guarantee repayment to funders.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Watershed Loans */}
            <section className="mb-16">
              <SectionHeading id="watershed-loans" icon={Landmark} number={7} title="Watershed Loans" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Watershed loans allow eligible users to borrow against their giving history. Two types are available:
                </p>
                <ul>
                  <li>
                    <strong className="text-storm">Pure watershed loans:</strong> Funded entirely from the borrower&rsquo;s own
                    accumulated watershed history, requiring no community funding.
                  </li>
                  <li>
                    <strong className="text-storm">Backed watershed loans:</strong> Partially funded by community members. A 1%
                    origination fee applies to the community-funded portion.
                  </li>
                </ul>
                <p>
                  Eligibility for watershed loans is based on your history of contributions, allocations, and community
                  participation. The Platform determines loan amounts and terms at its sole discretion.
                </p>
              </div>
            </section>

            {/* 8. Credit Bureau Reporting */}
            <section className="mb-16">
              <SectionHeading id="credit-reporting" icon={CreditCard} number={8} title="Credit Bureau Reporting" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform offers opt-in credit bureau reporting for loans. This is an optional feature designed
                  to help borrowers build credit history.
                </p>
                <ul>
                  <li>Credit reporting is <strong>opt-in per loan</strong> and requires explicit consent at the time of loan origination.</li>
                  <li>Consent is versioned (current version: 1.0) and tracked with timestamps, IP addresses, and user agent information.</li>
                  <li>We report to Experian, TransUnion, and Equifax.</li>
                  <li>Both on-time payments and delinquencies are reported when you have opted in.</li>
                  <li>You may withdraw consent for future reporting at any time, but previously reported data cannot be retracted from bureau records.</li>
                </ul>
                <p>
                  In accordance with the Fair Credit Reporting Act (FCRA), you have the right to dispute any inaccurate
                  information reported to credit bureaus. To initiate a dispute, contact us at{" "}
                  <span className="text-ocean dark:text-sky">legal@deluge.fund</span> or through the dispute process in your
                  account settings.
                </p>
              </div>
            </section>

            {/* 9. Home Efficiency Program */}
            <section className="mb-16">
              <SectionHeading id="home-efficiency" icon={Home} number={9} title="Home Efficiency Program" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Home Efficiency Program (also known as &ldquo;Plan 42&rdquo;) helps homeowners improve their home&rsquo;s
                  energy efficiency through assessment, planning, and funded upgrades.
                </p>
                <h3 className="font-heading font-semibold text-lg text-storm">Entry Tracks</h3>
                <ul>
                  <li><strong className="text-storm">Self-assessment:</strong> Complete an online questionnaire about your home.</li>
                  <li><strong className="text-storm">Community nomination:</strong> Be nominated by a community member (requires your consent).</li>
                  <li><strong className="text-storm">Professional referral:</strong> Enter through a partner contractor or utility.</li>
                </ul>
                <h3 className="font-heading font-semibold text-lg text-storm">Upgrade Phases</h3>
                <p>
                  Upgrades proceed through five phases: assessment, planning, procurement, installation, and verification.
                  The Platform coordinates with vetted contractors but does not itself perform any construction or installation work.
                </p>
                <h3 className="font-heading font-semibold text-lg text-storm">Funding Tracks</h3>
                <ul>
                  <li><strong className="text-storm">Community-funded:</strong> Upgrades funded through community watershed allocations.</li>
                  <li><strong className="text-storm">Loan-funded:</strong> Upgrades financed through watershed loans.</li>
                  <li><strong className="text-storm">Hybrid:</strong> A combination of community funding and loans.</li>
                </ul>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="mb-0">
                    The Platform does not guarantee any specific energy savings or cost reductions from home efficiency upgrades.
                    Results depend on home characteristics, local climate, usage patterns, and other factors beyond our control.
                    Nomination of another user for this program requires their explicit consent.
                  </p>
                </div>
              </div>
            </section>

            {/* 10. Community Features */}
            <section className="mb-16">
              <SectionHeading id="community" icon={Users} number={10} title="Community Features" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Communities are user-organized groups with collective governance capabilities. Community features include:
                </p>
                <ul>
                  <li><strong className="text-storm">Membership & Roles:</strong> Communities have structured roles including members, moderators, and administrators with varying permissions.</li>
                  <li><strong className="text-storm">Voting:</strong> Communities may hold votes on project funding, nominations, and governance proposals.</li>
                  <li><strong className="text-storm">Nominations:</strong> Members may nominate others for programs such as the Home Efficiency Program, subject to nominee consent.</li>
                  <li><strong className="text-storm">Proposals:</strong> Members may submit proposals for community action, subject to community-defined thresholds and voting periods.</li>
                  <li><strong className="text-storm">Elections:</strong> Communities may hold elections for leadership roles.</li>
                </ul>
                <p>
                  All community interactions are subject to our moderation policies. Users may opt out of appearing on community
                  leaderboards through their privacy settings.
                </p>
              </div>
            </section>

            {/* 11. Marketplace */}
            <section className="mb-16">
              <SectionHeading id="marketplace" icon={Store} number={11} title="Marketplace" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform provides a peer-to-peer marketplace for goods and services. Marketplace transactions are
                  subject to the following:
                </p>
                <ul>
                  <li>A platform fee is applied to each transaction, a portion of which is donated to community projects.</li>
                  <li>Sellers are responsible for accurately describing items and fulfilling orders.</li>
                  <li>The Platform facilitates dispute resolution between buyers and sellers but is not a party to marketplace transactions.</li>
                  <li>Users may leave reviews for transactions; reviews must be honest and comply with our content policies.</li>
                </ul>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="mb-0">
                    The Platform provides no warranty, express or implied, for goods or services purchased through the marketplace.
                    All marketplace transactions are between the buyer and seller.
                  </p>
                </div>
              </div>
            </section>

            {/* 12. Events & Ticketing */}
            <section className="mb-16">
              <SectionHeading id="events" icon={Calendar} number={12} title="Events & Ticketing" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform supports community event creation and ticketing. Event features include:
                </p>
                <ul>
                  <li><strong className="text-storm">Event creation:</strong> Community members may create events with configurable details, ticket types, and capacity limits.</li>
                  <li><strong className="text-storm">Tickets:</strong> Events may offer free or paid tickets. Ticket purchases are non-refundable unless the event is cancelled by the organizer.</li>
                  <li><strong className="text-storm">Donation matching:</strong> Events may include donation matching features where sponsors match attendee contributions.</li>
                  <li><strong className="text-storm">Auctions:</strong> Events may feature charity auctions. Winning bids are binding commitments.</li>
                  <li><strong className="text-storm">Sponsorships:</strong> Corporate sponsors may support events through the Corporate Portal.</li>
                </ul>
                <p>
                  Event organizers are responsible for delivering the event as described. The Platform is not liable for
                  event cancellations, changes, or the quality of event experiences.
                </p>
              </div>
            </section>

            {/* 13. Pledge Campaigns */}
            <section className="mb-16">
              <SectionHeading id="pledges" icon={Megaphone} number={13} title="Pledge Campaigns" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Users may create pledge campaigns to rally community support for specific goals. Three campaign types
                  are available:
                </p>
                <ul>
                  <li><strong className="text-storm">All-or-nothing:</strong> Funds are only collected if the campaign reaches its full goal. If the goal is not met, all pledges are released.</li>
                  <li><strong className="text-storm">Flexible:</strong> Funds are collected regardless of whether the goal is met.</li>
                  <li><strong className="text-storm">Milestone:</strong> Funds are released in stages as the campaign creator achieves predefined milestones.</li>
                </ul>
                <p>
                  Campaign creators may offer rewards to pledgers. Creators are solely responsible for fulfilling reward
                  obligations. The Platform does not guarantee reward delivery.
                </p>
                <p>
                  Pledge collection occurs according to the campaign type and timeline. By pledging, you authorize the
                  Platform to collect funds from your watershed according to the campaign terms.
                </p>
              </div>
            </section>

            {/* 14. Gift Cards */}
            <section className="mb-16">
              <SectionHeading id="gift-cards" icon={Gift} number={14} title="Gift Cards" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform offers gift cards that can be redeemed for watershed credits.
                </p>
                <ul>
                  <li>Gift cards may be purchased with standard payment methods.</li>
                  <li>Redemption adds the gift card value to the recipient&rsquo;s watershed.</li>
                  <li>Gift cards do not expire unless required by applicable law.</li>
                  <li>Gift cards are non-refundable once redeemed.</li>
                  <li>Promotional codes may be subject to additional terms and expiration dates.</li>
                </ul>
              </div>
            </section>

            {/* 15. Corporate Portal */}
            <section className="mb-16">
              <SectionHeading id="corporate" icon={Building2} number={15} title="Corporate Portal" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Corporate Portal enables businesses to participate in community giving at scale. Features include:
                </p>
                <ul>
                  <li><strong className="text-storm">Account tiers:</strong> Multiple tiers with varying features, employee limits, and reporting capabilities.</li>
                  <li><strong className="text-storm">Matching programs:</strong> Configure employee giving matches with customizable ratios and caps.</li>
                  <li><strong className="text-storm">Campaigns:</strong> Launch corporate giving campaigns with branded pages and progress tracking.</li>
                  <li><strong className="text-storm">Reporting:</strong> Access detailed reports on giving impact, employee participation, and tax documentation.</li>
                </ul>
                <p>
                  Corporate accounts are subject to additional verification requirements and separate billing terms.
                </p>
              </div>
            </section>

            {/* 16. Nonprofit Portal */}
            <section className="mb-16">
              <SectionHeading id="nonprofit" icon={HandHeart} number={16} title="Nonprofit Portal" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Registered nonprofits may access additional features through the Nonprofit Portal:
                </p>
                <ul>
                  <li><strong className="text-storm">EIN verification:</strong> Nonprofits must provide a valid Employer Identification Number (EIN) to access portal features.</li>
                  <li><strong className="text-storm">Fund disbursement:</strong> Verified nonprofits may receive direct disbursement of funds from cascaded projects.</li>
                  <li><strong className="text-storm">Reporting obligations:</strong> Nonprofits receiving funds through the Platform agree to provide project updates, financial transparency reports, and outcome documentation as required by the Platform.</li>
                </ul>
              </div>
            </section>

            {/* 17. Developer API */}
            <section className="mb-16">
              <SectionHeading id="api" icon={Code} number={17} title="Developer API" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  The Platform provides a Developer API for integrating with third-party applications.
                </p>
                <ul>
                  <li><strong className="text-storm">API keys:</strong> Access requires valid API keys, which must be kept confidential and not shared publicly.</li>
                  <li><strong className="text-storm">Rate limits:</strong> Default rate limit is 1,000 requests per hour. Higher limits are available through enterprise agreements.</li>
                  <li><strong className="text-storm">Webhooks:</strong> Real-time event notifications for account activity, project updates, and transaction events.</li>
                  <li><strong className="text-storm">OAuth applications:</strong> Third-party applications may request user authorization through our OAuth 2.0 implementation.</li>
                </ul>
                <p>
                  API usage must comply with our acceptable use policy. We reserve the right to revoke API access for
                  any application that violates these Terms, abuses rate limits, or negatively impacts Platform performance.
                </p>
              </div>
            </section>

            {/* 18. Advertising */}
            <section className="mb-16">
              <SectionHeading id="advertising" icon={Tv} number={18} title="Advertising" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  Advertisements are served through third-party ad providers and are a core revenue mechanism of the Platform.
                </p>
                <ul>
                  <li>Ads must be viewed completely to earn ad credits. Partial views do not qualify.</li>
                  <li>eCPM varies by advertiser, ad category, geographic region, and market conditions. The Platform does not guarantee any minimum earning rate.</li>
                  <li>You may set ad category preferences in your account settings to influence (but not guarantee) the types of ads shown.</li>
                  <li>Display of an advertisement does not constitute endorsement of the advertiser or its products/services by the Platform.</li>
                </ul>
              </div>
            </section>

            {/* 19. Intellectual Property */}
            <section className="mb-16">
              <SectionHeading id="ip" icon={Copyright} number={19} title="Intellectual Property" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  <strong className="text-storm">Platform IP:</strong> The Platform, including its design, code, branding, and all original
                  content, is the intellectual property of Deluge Fund PBC and is protected by applicable copyright, trademark,
                  and other intellectual property laws.
                </p>
                <p>
                  <strong className="text-storm">User content:</strong> By posting content on the Platform (including project descriptions, reviews,
                  community posts, and profile information), you grant the Company a non-exclusive, worldwide, royalty-free license
                  to use, display, reproduce, and distribute that content in connection with operating the Platform. You retain
                  ownership of your content.
                </p>
                <p>
                  <strong className="text-storm">DMCA:</strong> We respect intellectual property rights and respond to valid notices of alleged
                  infringement under the Digital Millennium Copyright Act. To file a DMCA notice, contact{" "}
                  <span className="text-ocean dark:text-sky">legal@deluge.fund</span> with the required statutory information.
                </p>
              </div>
            </section>

            {/* 20. Prohibited Conduct */}
            <section className="mb-16">
              <SectionHeading id="prohibited" icon={Ban} number={20} title="Prohibited Conduct" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  You agree not to engage in any of the following:
                </p>
                <ul>
                  <li><strong className="text-storm">Fraud:</strong> Misrepresenting your identity, project details, or any information to obtain funds, credits, or services.</li>
                  <li><strong className="text-storm">Automated access:</strong> Using bots, scrapers, or automated tools to interact with the Platform, watch ads, or create accounts without authorization.</li>
                  <li><strong className="text-storm">Multiple accounts:</strong> Creating or operating more than one account per person.</li>
                  <li><strong className="text-storm">Harassment:</strong> Threatening, bullying, or harassing other users.</li>
                  <li><strong className="text-storm">Vote manipulation:</strong> Artificially influencing community votes, elections, or proposals through coordinated inauthentic behavior.</li>
                  <li><strong className="text-storm">Money laundering:</strong> Using the Platform to launder money or finance illegal activities.</li>
                  <li><strong className="text-storm">Circumvention:</strong> Attempting to bypass rate limits, security measures, or access controls.</li>
                </ul>
                <p>
                  Violation of these prohibitions may result in immediate account termination, forfeiture of watershed
                  balance, and referral to law enforcement where appropriate.
                </p>
              </div>
            </section>

            {/* 21. Disclaimers & Liability */}
            <section className="mb-16">
              <SectionHeading id="disclaimers" icon={AlertTriangle} number={21} title="Disclaimers & Liability" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                  <p>
                    THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
                    EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                    A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p>
                    DELUGE FUND PBC IS NOT A BANK, LENDER, INVESTMENT ADVISOR, OR FINANCIAL INSTITUTION. WATERSHED BALANCES
                    ARE NOT FDIC INSURED, NOT BANK GUARANTEED, AND MAY LOSE VALUE.
                  </p>
                </div>
                <p>
                  To the maximum extent permitted by applicable law, the Company&rsquo;s total liability for any claims arising
                  from your use of the Platform shall not exceed the greater of (a) the total amount you have contributed to
                  your watershed in the 12 months preceding the claim, or (b) $100.
                </p>
                <p>
                  The Company is not liable for any indirect, incidental, special, consequential, or punitive damages,
                  including lost profits, data loss, or loss of goodwill.
                </p>
              </div>
            </section>

            {/* 22. Indemnification */}
            <section className="mb-16">
              <SectionHeading id="indemnification" icon={ShieldAlert} number={22} title="Indemnification" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  You agree to indemnify, defend, and hold harmless Deluge Fund PBC, its officers, directors, employees,
                  and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable
                  attorney&rsquo;s fees) arising out of or in any way connected with:
                </p>
                <ul>
                  <li>Your violation of these Terms or any applicable law or regulation.</li>
                  <li>Your content posted on the Platform.</li>
                  <li>Your marketplace transactions, including any disputes with other users.</li>
                  <li>Your use of funds obtained through the Platform, including microloans and watershed loans.</li>
                </ul>
              </div>
            </section>

            {/* 23. Dispute Resolution */}
            <section className="mb-16">
              <SectionHeading id="disputes" icon={Gavel} number={23} title="Dispute Resolution" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  <strong className="text-storm">Governing law:</strong> These Terms are governed by the laws of the State of Delaware,
                  without regard to conflict of law principles.
                </p>
                <p>
                  <strong className="text-storm">Informal resolution:</strong> Before initiating formal dispute resolution, you agree to
                  contact us at <span className="text-ocean dark:text-sky">legal@deluge.fund</span> and attempt to resolve
                  the dispute informally for at least 30 days.
                </p>
                <p>
                  <strong className="text-storm">Binding arbitration:</strong> Any dispute not resolved informally shall be resolved through
                  binding arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules.
                  Arbitration will be conducted in the English language.
                </p>
                <p>
                  <strong className="text-storm">Class action waiver:</strong> You agree to resolve disputes with the Company on an
                  individual basis only. You waive any right to participate in a class action, class-wide arbitration,
                  or any other representative proceeding.
                </p>
              </div>
            </section>

            {/* 24. Changes to Terms */}
            <section className="mb-16">
              <SectionHeading id="changes" icon={FileEdit} number={24} title="Changes to Terms" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  We may update these Terms from time to time. When we make material changes, we will:
                </p>
                <ul>
                  <li>Provide at least 30 days&rsquo; advance notice before the new terms take effect.</li>
                  <li>Notify you via email and/or a prominent notice on the Platform.</li>
                  <li>Update the version number and &ldquo;Last updated&rdquo; date at the top of this page.</li>
                </ul>
                <p>
                  Your continued use of the Platform after the effective date of updated Terms constitutes your acceptance
                  of those changes. If you do not agree to the updated Terms, you must stop using the Platform before the
                  effective date. We maintain a version history of all Terms changes.
                </p>
              </div>
            </section>

            {/* 25. Termination */}
            <section className="mb-16">
              <SectionHeading id="termination" icon={LogOut} number={25} title="Termination" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  <strong className="text-storm">By you:</strong> You may terminate your account at any time through your account settings.
                  Upon requesting termination, a 30-day grace period begins during which you may cancel the deletion request
                  and restore your account.
                </p>
                <p>
                  <strong className="text-storm">By us:</strong> We may suspend or terminate your account if you violate these Terms, engage
                  in prohibited conduct, or if required by law. We will provide notice when reasonably possible.
                </p>
                <p>
                  <strong className="text-storm">Effect of termination:</strong> Upon termination:
                </p>
                <ul>
                  <li>Your account data will be anonymized after the 30-day grace period.</li>
                  <li>Pending allocations that have not yet cascaded will be released.</li>
                  <li>Outstanding loan obligations survive termination. You remain responsible for repaying any active microloans or watershed loans.</li>
                  <li>Irrevocable allocations (post-cascade) are not refundable.</li>
                </ul>
              </div>
            </section>

            {/* 26. Contact */}
            <section className="mb-8">
              <SectionHeading id="contact" icon={Mail} number={26} title="Contact" />
              <div className="prose prose-storm dark:prose-invert max-w-none text-storm-light leading-relaxed space-y-4">
                <p>
                  For questions about these Terms of Service, contact us at:
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-storm mb-2">Deluge Fund PBC</p>
                  <p>
                    Email: <span className="text-ocean dark:text-sky">legal@deluge.fund</span>
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
