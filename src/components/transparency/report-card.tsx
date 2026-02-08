"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download, TrendingUp, Users, Wallet } from "lucide-react";

interface ReportCardProps {
  report: {
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
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const isQuarterly = report.periodType === "quarterly";
  const periodLabel = isQuarterly
    ? report.period.replace("-Q", " Q")
    : `Year ${report.period}`;

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ocean/10 rounded-lg">
              <FileText className="h-5 w-5 text-ocean" />
            </div>
            <div>
              <h4 className="font-semibold text-storm">{periodLabel}</h4>
              <p className="text-xs text-storm-light">
                Published{" "}
                {new Date(report.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm text-ocean hover:text-ocean-dark transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-foam rounded-lg">
            <TrendingUp className="h-4 w-4 text-ocean mx-auto mb-1" />
            <p className="text-xs text-storm-light">Revenue</p>
            <p className="font-semibold text-storm">
              {formatCurrency(report.totalRevenue)}
            </p>
          </div>
          <div className="text-center p-3 bg-foam rounded-lg">
            <Wallet className="h-4 w-4 text-teal mx-auto mb-1" />
            <p className="text-xs text-storm-light">Funded</p>
            <p className="font-semibold text-storm">
              {formatCurrency(report.totalFunded)}
            </p>
          </div>
          <div className="text-center p-3 bg-foam rounded-lg">
            <Users className="h-4 w-4 text-gold mx-auto mb-1" />
            <p className="text-xs text-storm-light">Active Users</p>
            <p className="font-semibold text-storm">
              {report.totalUsersActive.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-foam rounded-lg">
            <p className="text-xs text-storm-light">Net Margin</p>
            <p
              className={`font-semibold ${
                report.netMargin >= 0 ? "text-teal" : "text-red-500"
              }`}
            >
              {formatCurrency(report.netMargin)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
