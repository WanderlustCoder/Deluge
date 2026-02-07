'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, ThumbsUp, ThumbsDown, Minus, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    type: string;
    status: string;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    votingEnds: string;
    projectId?: string | null;
    loanId?: string | null;
  };
  circleSlug: string;
  userVote?: { vote: string } | null;
}

export function ProposalCard({ proposal, circleSlug, userVote }: ProposalCardProps) {
  const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const votingVotes = proposal.yesVotes + proposal.noVotes;
  const approvalPercent = votingVotes > 0 ? (proposal.yesVotes / votingVotes) * 100 : 0;

  const now = new Date();
  const votingEnds = new Date(proposal.votingEnds);
  const isActive = proposal.status === 'voting' && votingEnds > now;
  const daysRemaining = Math.max(0, Math.ceil((votingEnds.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'voting':
        return isActive ? (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-sky/10 text-sky rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            {daysRemaining}d left
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-storm/10 text-storm/70 rounded-full text-xs font-medium">
            Voting ended
          </span>
        );
      case 'approved':
      case 'funded':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-teal/10 text-teal rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            {proposal.status === 'funded' ? 'Funded' : 'Approved'}
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-0.5 bg-storm/10 text-storm/50 rounded-full text-xs font-medium">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (proposal.type) {
      case 'project':
        return 'Project Funding';
      case 'loan':
        return 'Loan Funding';
      case 'custom':
        return 'Custom Proposal';
      default:
        return proposal.type;
    }
  };

  return (
    <Link href={`/circles/${circleSlug}/proposals/${proposal.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-5 border border-storm/10 hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-storm/50 dark:text-foam/50 mb-1">
              {getTypeLabel()}
            </p>
            <h4 className="font-medium text-storm dark:text-foam truncate">
              {proposal.title}
            </h4>
          </div>
          {getStatusBadge()}
        </div>

        {proposal.description && (
          <p className="text-sm text-storm/60 dark:text-foam/60 line-clamp-2 mb-4">
            {proposal.description}
          </p>
        )}

        {/* Amount */}
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-ocean dark:text-sky" />
          <span className="font-semibold text-ocean dark:text-sky">
            {formatCurrency(proposal.amount)}
          </span>
        </div>

        {/* Voting Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-teal">
                <ThumbsUp className="w-4 h-4" />
                {proposal.yesVotes}
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <ThumbsDown className="w-4 h-4" />
                {proposal.noVotes}
              </span>
              <span className="flex items-center gap-1 text-storm/50 dark:text-foam/50">
                <Minus className="w-4 h-4" />
                {proposal.abstainVotes}
              </span>
            </div>
            {userVote && (
              <span className="text-xs text-storm/50 dark:text-foam/50">
                You voted: {userVote.vote}
              </span>
            )}
          </div>

          {/* Approval Bar */}
          <div className="h-2 bg-storm/10 dark:bg-foam/10 rounded-full overflow-hidden flex">
            {votingVotes > 0 && (
              <>
                <div
                  className="h-full bg-teal"
                  style={{ width: `${(proposal.yesVotes / votingVotes) * 100}%` }}
                />
                <div
                  className="h-full bg-red-400"
                  style={{ width: `${(proposal.noVotes / votingVotes) * 100}%` }}
                />
              </>
            )}
          </div>

          <p className="text-xs text-storm/50 dark:text-foam/50 text-center">
            {approvalPercent.toFixed(0)}% approval • {totalVotes} votes
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
