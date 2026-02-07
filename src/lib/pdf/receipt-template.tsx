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
    marginBottom: 30,
    borderBottom: '2px solid #0D47A1',
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  receiptInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#666666',
    width: 120,
  },
  value: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D47A1',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#555555',
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
  taxNote: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  taxNoteTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 5,
  },
  taxNoteText: {
    fontSize: 9,
    color: '#1565C0',
    lineHeight: 1.4,
  },
});

interface ReceiptProps {
  receiptNumber: string;
  userName: string;
  userEmail: string;
  type: string;
  typeLabel: string;
  amount: number;
  date: Date;
  projectName?: string | null;
  communityName?: string | null;
  isTaxDeductible?: boolean;
  orgName?: string | null;
  ein?: string | null;
}

export function ReceiptDocument({
  receiptNumber,
  userName,
  userEmail,
  typeLabel,
  amount,
  date,
  projectName,
  communityName,
  isTaxDeductible,
  orgName,
  ein,
}: ReceiptProps) {
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Deluge</Text>
          <Text style={styles.tagline}>Community-Driven Giving</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Contribution Receipt</Text>

        {/* Receipt Info */}
        <View style={styles.receiptInfo}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt Number:</Text>
            <Text style={styles.value}>{receiptNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contributor:</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contribution Type:</Text>
            <Text style={styles.value}>{typeLabel}</Text>
          </View>
          {projectName && (
            <View style={styles.row}>
              <Text style={styles.label}>Project:</Text>
              <Text style={styles.value}>{projectName}</Text>
            </View>
          )}
          {communityName && (
            <View style={styles.row}>
              <Text style={styles.label}>Community:</Text>
              <Text style={styles.value}>{communityName}</Text>
            </View>
          )}
        </View>

        {/* Amount */}
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>

        {/* Tax Deductibility Note */}
        {isTaxDeductible && (
          <View style={styles.taxNote}>
            <Text style={styles.taxNoteTitle}>Tax Deductibility Notice</Text>
            <Text style={styles.taxNoteText}>
              This contribution may be tax-deductible. {orgName && `Organization: ${orgName}. `}
              {ein && `EIN: ${ein}. `}
              No goods or services were provided in exchange for this contribution.
              Please consult with a tax professional regarding your specific tax situation.
            </Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Your Contribution</Text>
          <Text style={styles.paragraph}>
            Thank you for your generous contribution through Deluge. Your support
            helps fund community projects and creates positive change in your
            local area.
            {projectName &&
              ` This contribution was directed to "${projectName}" to help achieve its funding goal.`}
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

export default ReceiptDocument;
