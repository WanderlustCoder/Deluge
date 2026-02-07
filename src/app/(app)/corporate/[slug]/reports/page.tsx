'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Download, Plus } from 'lucide-react';
import { ReportCard } from '@/components/corporate/report-card';
import { SDGBreakdown } from '@/components/corporate/sdg-breakdown';

interface Report {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  pdfUrl: string | null;
  generatedAt: string;
}

interface SDGItem {
  sdgId: number;
  name: string;
  color: string;
  amount: number;
}

export default function ReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [reports, setReports] = useState<Report[]>([]);
  const [sdgData, setSDGData] = useState<SDGItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'custom',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadReports();
  }, [slug]);

  const loadReports = async () => {
    try {
      const res = await fetch(`/api/corporate/${slug}/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setSDGData(data.sdgBreakdown || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/corporate/${slug}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateForm),
      });

      if (res.ok) {
        const data = await res.json();
        setReports([data.report, ...reports]);
        setShowGenerateForm(false);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    // In production, this would download the PDF
    window.open(`/api/corporate/${slug}/reports/${reportId}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-storm/10 rounded w-1/4" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-storm/10 rounded-xl" />
          <div className="h-64 bg-storm/10 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-ocean dark:text-sky">
            Reports
          </h1>
          <p className="text-storm/60 dark:text-foam/60">
            ESG reports and impact analytics
          </p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 transition-opacity w-fit"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </motion.div>

      {/* Generate Form Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-storm rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-semibold text-ocean dark:text-sky mb-4">
              Generate Report
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                  Report Type
                </label>
                <select
                  value={generateForm.type}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      type: e.target.value as typeof generateForm.type,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {generateForm.type === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={generateForm.startDate}
                      onChange={(e) =>
                        setGenerateForm({ ...generateForm, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-storm/80 dark:text-foam/80 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={generateForm.endDate}
                      onChange={(e) =>
                        setGenerateForm({ ...generateForm, endDate: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-storm/20 dark:border-foam/20 bg-white dark:bg-storm/30 text-storm dark:text-foam"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGenerateForm(false)}
                className="px-4 py-2 text-storm/70 dark:text-foam/70 hover:text-storm dark:hover:text-foam"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* SDG Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SDGBreakdown data={sdgData} />
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-ocean dark:text-sky">
            Generated Reports
          </h2>

          {reports.length === 0 ? (
            <div className="bg-white dark:bg-storm/20 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-ocean/10 dark:bg-sky/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-ocean dark:text-sky" />
              </div>
              <p className="text-storm/60 dark:text-foam/60 mb-4">
                No reports generated yet
              </p>
              <button
                onClick={() => setShowGenerateForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ocean dark:bg-sky text-white rounded-lg font-medium hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Generate First Report
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDownload={() => handleDownload(report.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ESG Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-storm/20 rounded-xl p-6"
      >
        <h2 className="font-semibold text-ocean dark:text-sky mb-4">
          ESG Impact Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-teal/10 rounded-lg">
            <p className="text-3xl font-bold text-teal mb-1">E</p>
            <p className="text-sm font-medium text-storm/80 dark:text-foam/80">
              Environmental
            </p>
            <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
              Climate, Conservation, Clean Energy
            </p>
          </div>
          <div className="text-center p-4 bg-ocean/10 dark:bg-sky/10 rounded-lg">
            <p className="text-3xl font-bold text-ocean dark:text-sky mb-1">S</p>
            <p className="text-sm font-medium text-storm/80 dark:text-foam/80">
              Social
            </p>
            <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
              Education, Health, Community
            </p>
          </div>
          <div className="text-center p-4 bg-gold/10 rounded-lg">
            <p className="text-3xl font-bold text-gold mb-1">G</p>
            <p className="text-sm font-medium text-storm/80 dark:text-foam/80">
              Governance
            </p>
            <p className="text-xs text-storm/50 dark:text-foam/50 mt-1">
              Transparency, Ethics, Accountability
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
