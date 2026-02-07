import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 25,
    borderBottom: '2px solid #0D47A1',
    paddingBottom: 15,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 10,
    color: '#455A64',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#666666',
    width: 100,
  },
  value: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0D47A1',
    borderBottom: '1px solid #E0E0E0',
    paddingBottom: 5,
  },
  totalBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: '#1565C0',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottom: '1px solid #EEEEEE',
  },
  breakdownLabel: {
    fontSize: 10,
    color: '#555555',
  },
  breakdownValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  statBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
    marginBottom: 8,
    marginRight: '2%',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 9,
    color: '#666666',
  },
  taxSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    borderLeft: '4px solid #FFA000',
  },
  taxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taxLabel: {
    fontSize: 10,
    color: '#555555',
  },
  taxValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  taxNote: {
    fontSize: 8,
    color: '#777777',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1px solid #CCCCCC',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
  disclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#666666',
    lineHeight: 1.4,
  },
});

interface AnnualSummaryProps {
  userName: string;
  userEmail: string;
  year: number;
  totalCashContributed: number;
  totalAdFunded: number;
  totalReferralCredits: number;
  totalMatchingReceived: number;
  totalAllocated: number;
  projectsFunded: number;
  loansFunded: number;
  loansRepaid: number;
  communitiesSupported: number;
  deductibleAmount: number;
  nonDeductibleAmount: number;
}

export function AnnualSummaryDocument({
  userName,
  userEmail,
  year,
  totalCashContributed,
  totalAdFunded,
  totalReferralCredits,
  totalMatchingReceived,
  totalAllocated,
  projectsFunded,
  loansFunded,
  loansRepaid,
  communitiesSupported,
  deductibleAmount,
  nonDeductibleAmount,
}: AnnualSummaryProps) {
  const totalGiving =
    totalCashContributed + totalAdFunded + totalReferralCredits + totalMatchingReceived;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Deluge</Text>
          <Text style={styles.tagline}>Community-Driven Giving</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Annual Giving Summary</Text>
        <Text style={styles.subtitle}>Tax Year {year}</Text>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Generated:</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</Text>
          </View>
        </View>

        {/* Total Giving */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Giving in {year}</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalGiving)}</Text>
        </View>

        {/* Giving Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giving Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Cash Contributions</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(totalCashContributed)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Ad-Supported Giving</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(totalAdFunded)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Referral Credits</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(totalReferralCredits)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Matching Contributions</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(totalMatchingReceived)}</Text>
          </View>
        </View>

        {/* Impact Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{projectsFunded}</Text>
              <Text style={styles.statLabel}>Projects Funded</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{communitiesSupported}</Text>
              <Text style={styles.statLabel}>Communities Supported</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{loansFunded}</Text>
              <Text style={styles.statLabel}>Microloans Funded</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatCurrency(loansRepaid)}</Text>
              <Text style={styles.statLabel}>Loan Repayments Received</Text>
            </View>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Total Allocated to Projects</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(totalAllocated)}</Text>
          </View>
        </View>

        {/* Tax Information */}
        <View style={styles.taxSection}>
          <Text style={styles.taxTitle}>Tax Deductibility Information</Text>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Potentially Deductible</Text>
            <Text style={styles.taxValue}>{formatCurrency(deductibleAmount)}</Text>
          </View>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>Non-Deductible</Text>
            <Text style={styles.taxValue}>{formatCurrency(nonDeductibleAmount)}</Text>
          </View>
          <Text style={styles.taxNote}>
            Tax deductibility depends on the recipient organization&apos;s 501(c)(3) status.
            Consult a tax professional for advice specific to your situation.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This document is provided for informational purposes and to assist with your
            tax preparation. Deluge Fund is not a tax advisor. The deductibility of
            contributions depends on your individual tax situation and the tax-exempt
            status of the recipient organizations. Please consult with a qualified tax
            professional regarding your specific circumstances.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Deluge Fund | www.deluge.fund | support@deluge.fund
          </Text>
          <Text style={styles.footerText}>
            This document was generated on {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default AnnualSummaryDocument;
