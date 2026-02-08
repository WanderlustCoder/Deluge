"use client";

import { useState, useEffect } from "react";
import { TransparencyHero } from "@/components/transparency/transparency-hero";
import { FloatExplainer } from "@/components/transparency/float-explainer";
import { RevenueBreakdown } from "@/components/transparency/revenue-breakdown";
import { ReportCard } from "@/components/transparency/report-card";

interface Report {
  id: string;
  period: string;
  periodType: string;
  totalRevenue: number;
  totalCosts: number;
  netMargin: number;
  totalFunded: number;
  totalUsersActive: number;
  publishedAt: Date;
  pdfUrl: string | null;
}

export default function TransparencyPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    fetch("/api/transparency/reports")
      .then((res) => res.json())
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <TransparencyHero />

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <FloatExplainer />
        <RevenueBreakdown />
      </div>

      {/* How We Make Money */}
      <section className="mb-12">
        <h2 className="font-heading font-bold text-2xl text-storm mb-6">
          How Deluge Makes Money
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Ad Revenue",
              percent: "40%",
              description:
                "We keep 40% of ad revenue (you get 60%). This funds platform operations.",
            },
            {
              title: "Float Income",
              percent: "Interest",
              description:
                "While funds sit in watersheds, we earn interest on the aggregate balance.",
            },
            {
              title: "Loan Servicing",
              percent: "2%",
              description:
                "We charge a 2% servicing fee on microloans. This covers administration costs.",
            },
            {
              title: "Sponsorships",
              percent: "Varies",
              description:
                "Businesses sponsor cascade celebrations and notifications.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-foam rounded-lg p-5 border border-storm/10"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-semibold text-storm">{item.title}</h3>
                <span className="text-sm font-medium text-ocean">
                  {item.percent}
                </span>
              </div>
              <p className="text-sm text-storm-light">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="mb-12">
        <h2 className="font-heading font-bold text-2xl text-storm mb-6">
          What We Don&apos;t Do
        </h2>

        <div className="bg-foam rounded-lg p-6 border border-storm/10">
          <ul className="space-y-3 text-storm-light">
            <li className="flex items-start gap-3">
              <span className="text-teal mt-0.5">&#10003;</span>
              <span>
                <strong className="text-storm">No hidden fees</strong> —
                Everything you see is what you get.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal mt-0.5">&#10003;</span>
              <span>
                <strong className="text-storm">
                  No selling your data
                </strong>{" "}
                — Your information stays with us, period.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal mt-0.5">&#10003;</span>
              <span>
                <strong className="text-storm">
                  No touching your principal
                </strong>{" "}
                — Your watershed balance is always yours, always available.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal mt-0.5">&#10003;</span>
              <span>
                <strong className="text-storm">No investor pressure</strong> —
                We&apos;re building for sustainability, not a quick exit.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Published Reports */}
      <section>
        <h2 className="font-heading font-bold text-2xl text-storm mb-6">
          Transparency Reports
        </h2>

        {loadingReports ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-storm/10 rounded-lg" />
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-foam rounded-lg">
            <p className="text-storm-light">
              No transparency reports published yet.
            </p>
            <p className="text-sm text-storm-light mt-1">
              Check back after our first quarter!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
