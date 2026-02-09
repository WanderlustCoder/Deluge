'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, Download } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  pdfUrl: string | null;
  generatedAt: string;
}

interface ReportCardProps {
  report: Report;
  onDownload?: () => void;
}

export function ReportCard({ report, onDownload }: ReportCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'Monthly Report';
      case 'quarterly':
        return 'Quarterly Report';
      case 'annual':
        return 'Annual Report';
      case 'custom':
        return 'Custom Report';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'bg-sky/10 text-sky';
      case 'quarterly':
        return 'bg-teal/10 text-teal';
      case 'annual':
        return 'bg-gold/10 text-gold';
      default:
        return 'bg-gray-100 text-storm/70';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-border/50 rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-ocean/10 dark:bg-sky/10 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-ocean dark:text-sky" />
        </div>
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(report.type)}`}>
            {getTypeLabel(report.type)}
          </span>
          <div className="flex items-center gap-2 mt-1 text-sm text-storm-light dark:text-dark-text-secondary">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </span>
          </div>
          <p className="text-xs text-storm-light dark:text-dark-text-secondary mt-1">
            Generated {formatDate(report.generatedAt)}
          </p>
        </div>
      </div>

      {onDownload && (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          View
        </button>
      )}
    </motion.div>
  );
}
