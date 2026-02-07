// Metro 2 Format Constants and Status Codes

// Account Status Codes (two-character)
export const ACCOUNT_STATUS = {
  CURRENT: '11',           // Account is current
  CURRENT_PD30: '13',      // Current, was 30-60 days past due
  PD_30_59: '71',          // 30-59 days past due
  PD_60_89: '78',          // 60-89 days past due
  PD_90_119: '80',         // 90-119 days past due
  PD_120_149: '82',        // 120-149 days past due
  PD_150_179: '83',        // 150-179 days past due
  PD_180_PLUS: '84',       // 180+ days past due
  PAID_CLOSED: '13',       // Paid in full, closed
  CHARGED_OFF: '97',       // Unpaid balance charged off
  FORECLOSURE: '94',       // Foreclosure
  VOLUNTARY_SURRENDER: '93', // Voluntary surrender
  REPOSSESSION: '95',      // Repossession
  COLLECTION: '96',        // Account in collection
} as const;

// Payment Rating Codes (single-character for 24-month history)
export const PAYMENT_RATING = {
  CURRENT: '0',            // Current
  PD_30_59: '1',           // 30-59 days past due
  PD_60_89: '2',           // 60-89 days past due
  PD_90_119: '3',          // 90-119 days past due
  PD_120_149: '4',         // 120-149 days past due
  PD_150_179: '5',         // 150-179 days past due
  PD_180_PLUS: '6',        // 180+ days past due
  NO_PAYMENT_DUE: 'B',     // No payment history available this month
  COLLECTION: 'G',         // Collection
  TOO_NEW: '0',            // Account too new to rate
} as const;

// Account Type Codes
export const ACCOUNT_TYPE = {
  INSTALLMENT: '48',       // Installment (fixed payments)
  REVOLVING: '18',         // Revolving (credit card)
  MORTGAGE: '26',          // Mortgage
  LINE_OF_CREDIT: '89',    // Line of credit
  FLEXIBLE: '90',          // Flexible spending
} as const;

// Terms Duration Codes
export const TERMS_DURATION = {
  MONTHLY: 'M',            // Monthly payments
  WEEKLY: 'W',             // Weekly payments
  BIWEEKLY: 'B',           // Bi-weekly payments
  DAILY: 'D',              // Daily payments
  DEFERRED: 'P',           // Deferred payments
} as const;

// Consumer Information Indicator Codes
export const CONSUMER_INDICATOR = {
  CURRENT: '',             // No special comment
  DISPUTE: 'Q',            // Account disputed
  INQUIRY: 'A',            // Consumer inquiry
} as const;

// Record Identifiers
export const RECORD_IDENTIFIER = {
  HEADER: 'HEADER',
  BASE: 'BASE',
  J1: 'J1',                // Associated consumer segment
  J2: 'J2',                // Secondary consumer segment
  K1: 'K1',                // Original creditor name
  K2: 'K2',                // Purchased from
  K3: 'K3',                // Sold to
  K4: 'K4',                // Specialized comment
  TRAILER: 'TRAILER',
} as const;

// Portfolio Type
export const PORTFOLIO_TYPE = {
  INSTALLMENT: 'I',
  LINE_OF_CREDIT: 'C',
  MORTGAGE: 'M',
  OPEN: 'O',
  REVOLVING: 'R',
} as const;

// Interest Type Indicator
export const INTEREST_TYPE = {
  FIXED: 'F',
  VARIABLE: 'V',
} as const;

// Field lengths for Metro 2 format
export const FIELD_LENGTHS = {
  RECORD_IDENTIFIER: 4,
  CYCLE_IDENTIFIER: 2,
  EQUIFAX_ID: 10,
  EXPERIAN_ID: 5,
  TRANSUNION_ID: 9,
  ACCOUNT_NUMBER: 30,
  CONSUMER_ACCOUNT: 20,
  SURNAME: 25,
  FIRST_NAME: 20,
  MIDDLE_NAME: 20,
  GENERATION_CODE: 1,
  SSN: 9,
  DATE_OF_BIRTH: 8,
  TELEPHONE: 10,
  COUNTRY_CODE: 2,
  ADDRESS: 32,
  CITY: 20,
  STATE: 2,
  ZIP_CODE: 9,
  ADDRESS_INDICATOR: 1,
  RESIDENCE_CODE: 1,
  DATE_OPENED: 8,
  DATE_CLOSED: 8,
  CREDIT_LIMIT: 9,
  HIGHEST_CREDIT: 9,
  TERMS_DURATION: 1,
  TERMS_FREQUENCY: 3,
  SCHEDULED_PAYMENT: 9,
  ACTUAL_PAYMENT: 9,
  ACCOUNT_STATUS: 2,
  PAYMENT_RATING: 1,
  PAYMENT_HISTORY: 24,
  CURRENT_BALANCE: 9,
  AMOUNT_PAST_DUE: 9,
  ORIGINAL_CHARGE_OFF: 9,
  DATE_FIRST_DELINQUENCY: 8,
  DATE_LAST_PAYMENT: 8,
  DATE_ACCOUNT_INFORMATION: 8,
  CONSUMER_INFO_INDICATOR: 2,
  COMPLIANCE_CONDITION: 2,
  CONSUMER_ID: 20,
} as const;

// Map loan status to Metro 2 account status
export function mapLoanStatusToAccountStatus(
  loanStatus: string,
  daysDelinquent: number
): string {
  // If loan is completed/paid
  if (loanStatus === 'completed') {
    return ACCOUNT_STATUS.PAID_CLOSED;
  }

  // If loan is defaulted/charged off
  if (loanStatus === 'defaulted') {
    return ACCOUNT_STATUS.CHARGED_OFF;
  }

  // Check delinquency
  if (daysDelinquent >= 180) return ACCOUNT_STATUS.PD_180_PLUS;
  if (daysDelinquent >= 150) return ACCOUNT_STATUS.PD_150_179;
  if (daysDelinquent >= 120) return ACCOUNT_STATUS.PD_120_149;
  if (daysDelinquent >= 90) return ACCOUNT_STATUS.PD_90_119;
  if (daysDelinquent >= 60) return ACCOUNT_STATUS.PD_60_89;
  if (daysDelinquent >= 30) return ACCOUNT_STATUS.PD_30_59;

  return ACCOUNT_STATUS.CURRENT;
}

// Map days delinquent to payment rating
export function mapDaysToPaymentRating(daysDelinquent: number): string {
  if (daysDelinquent >= 180) return PAYMENT_RATING.PD_180_PLUS;
  if (daysDelinquent >= 150) return PAYMENT_RATING.PD_150_179;
  if (daysDelinquent >= 120) return PAYMENT_RATING.PD_120_149;
  if (daysDelinquent >= 90) return PAYMENT_RATING.PD_90_119;
  if (daysDelinquent >= 60) return PAYMENT_RATING.PD_60_89;
  if (daysDelinquent >= 30) return PAYMENT_RATING.PD_30_59;
  return PAYMENT_RATING.CURRENT;
}
