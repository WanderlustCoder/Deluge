# Plan 41: Watershed Loans

## Overview

Givers who build up watershed balances through donations (cash, ad watching, referrals, browsing) can borrow against those balances when life demands it. This is Deluge extending credit back to the people who've been helping the community — recognition that those who give may also need to receive.

A Watershed Loan is not a withdrawal. The funds were donated. Deluge loans them back as an act of respect, and when the borrower repays, their watershed is restored and they can continue giving.

**Unified flow:** If the user's watershed covers the full loan amount, the loan is auto-approved and disbursed immediately. If they need more than their watershed balance, their watershed auto-contributes as the first contribution and the remainder enters community funding — becoming a Watershed-Backed Loan with their lending portfolio as a trust signal for funders.

---

## Principles

1. **Respect over restriction.** The giver built this balance through genuine contribution. They should not be penalized for needing it back.
2. **No artificial caps.** The borrower's available watershed balance is not limited by the tier system. The watershed portion is always available. For amounts exceeding the watershed, the community decides.
3. **Standard accountability.** Favorable terms, but the same repayment expectations and default consequences as any borrower. Respect goes both ways.
4. **Watershed restoration on repayment.** Repaid funds flow back to the watershed, restoring the giver's ability to fund community projects.
5. **All funds are donations.** The watershed balance is a giving allocation, not a savings account. A Watershed Loan is Deluge extending credit against donated funds, not the user "withdrawing their money."
6. **Radical transparency.** Every money movement — watershed deduction, funder repayment, watershed restoration — is visible and explained to all parties.

---

## Eligibility

**Who can take a Watershed Loan:**
- Any user with a watershed balance of at least $100
- No tier requirements — Watershed Loans operate outside the microloan credit progression system entirely
- Eligibility comes from demonstrated giving and lending history, not borrowing history

**What they can borrow:**
- **Up to their available watershed balance:** Auto-approved, no community funding needed
- **More than their watershed balance:** Watershed auto-contributes, remainder enters community funding as a Watershed-Backed Loan

**Available balance** means: total watershed balance minus any funds already earmarked for projects or active loan contributions.

---

## Loan Minimum

**$100 minimum for all loans on the platform.** This applies to Watershed Loans, Watershed-Backed Loans, and standard microloans (Tier 1 minimum is now $100). Loans under $100 cost the platform more to administer than they deliver in impact.

---

## Loan Terms

### Origination Fee
- **1% upfront origination fee on the community-funded portion only** (reduced from the standard 2% servicing fee for microloans)
- For Pure Watershed Loans: no fee. The borrower is deploying their own giving allocation — Deluge does not charge for this act of respect.
- For Watershed-Backed Loans: 1% of the community-funded amount, collected at loan creation. The borrower's total repayment obligation is the loan amount plus this fee. Deluge's revenue is recognized immediately, fully removing platform risk.
- No fee on the self-funded (watershed) portion — a sign of respect to the borrower's giving history
- Example: $2,000 loan with $800 watershed + $1,200 community. Fee = 1% of $1,200 = $12. Borrower receives $2,000, total obligation is $2,012.

### Interest Rate
- 0% — same as all Deluge microloans

### Repayment Period
Repayment term limits scale with the total borrowed amount, matching the standard microloan structure:

| Total Loan Amount | Max Repayment Term |
|-------------------|-------------------|
| $100 – $500 | 12 months |
| $501 – $1,000 | 18 months |
| $1,001 – $5,000 | 24 months |
| $5,001+ | 24 months |

Borrower chooses their repayment schedule within these limits at application time.

---

## The Unified Flow

A single application flow handles both cases. The system determines the path based on available watershed balance vs. requested amount.

### Path A: Pure Watershed Loan (watershed covers full amount)

User needs $500. Has $800 available in watershed.

1. User applies for $500
2. Auto-approved — no admin review, no community funding needed
3. Watershed balance: $800 → $300
4. $500 disbursed to borrower's bank account
5. Borrower makes standard repayments; each payment restores watershed balance
6. On completion: watershed balance fully restored

### Path B: Watershed-Backed Loan (need exceeds watershed)

User needs $2,000. Has $800 available in watershed. Has $3,000 in outstanding loans to others.

1. User applies for $2,000
2. Watershed auto-contributes $800 — the borrower becomes the first funder of their own loan (3,200 shares at $0.25/share)
3. Remaining $1,200 enters community funding
4. 1% origination fee on community portion: $12, collected at loan creation
5. Loan request displays trust signals (see Loan Request Display below)
6. Community funders contribute the remaining $1,200 (4,800 shares)
7. Standard funding deadline applies (scaled by total amount, same as standard microloans)
8. Once fully funded: borrower accepts loan agreement ($2,012 total obligation), funds disbursed
9. Borrower makes standard repayments; shares are interleaved across all holders including the borrower
10. Funding lock active: borrower cannot deploy watershed funds to new projects or loans until community funders are fully repaid (see Funding Lock below)

---

## Loan Request Display

When a Watershed-Backed Loan enters community funding, the loan request shows:

### Self-Funding Signal

Prominently displayed:
- **"Self-funded: $800 from watershed"** — the borrower put their own giving history on the line
- This is a powerful trust signal: they're not just asking for help, they've committed their own donated funds first
- Shown as a distinct visual element (e.g., a filled portion of the funding bar in a different color)

### Lending Portfolio Signal

The borrower's active lending portfolio is disclosed as an informational trust signal:
- **"This user has $3,000 in active loans to others"** — they've been helping the community
- Number of loans funded and repayment status of those loans (on time, etc.)
- This demonstrates the borrower's engagement with the platform and history of supporting others
- Note: the lending portfolio is not collateral. It is context for funders making a decision.

---

## Funding Lock & Voluntary Acceleration

This is the mechanism that protects community funders and encourages faster repayment — through borrower agency, not automated redirection.

### Funding Lock

While a Watershed-Backed Loan has an outstanding community-funded balance, the borrower **cannot deploy watershed funds to new projects or loans**. Repayments from the borrower's existing lending portfolio still flow into their watershed as normal, but those funds — and any other watershed income — cannot be allocated elsewhere until community funders are fully repaid.

**What the lock means:**
- The borrower can still watch ads, receive referral credits, and accumulate watershed balance
- The borrower can still make their scheduled loan payments
- The borrower **cannot** fund new microloans, contribute to projects, or allocate watershed funds to any purpose other than their Watershed-Backed Loan's community repayment
- The lock applies only to new deployments — existing funded loans and project contributions are not affected

**What the lock does not mean:**
- The borrower is not banned or restricted from using the platform
- The borrower can still browse, participate in communities, vote, discuss
- The borrower's existing lending portfolio continues generating repayments into their watershed

### Voluntary Acceleration

At any time during the funding lock, the borrower can **voluntarily direct accumulated watershed funds toward repaying the community-funded portion** of their loan early. This is an active choice, not an automatic process.

**How it works:**
1. Borrower's watershed accumulates funds from portfolio repayments, ad revenue, etc.
2. Borrower sees a prominent "Accelerate community repayment" action on their loan dashboard
3. Borrower chooses an amount (up to their available watershed balance) to direct toward community repayment
4. Each voluntary acceleration moves the Community Repayment Progress bar forward
5. Borrower is celebrated for the choice: *"You directed $200 from your watershed toward your community funders. Thank you for honoring their trust."*

**Why voluntary, not automatic:**
- Preserves borrower agency — they see funds arrive and consciously choose to act
- Each acceleration is a gratitude moment, not a background ledger operation
- The borrower understands exactly what's happening with their money at every step
- Simpler to implement — no interception of repayment flows, no complex routing logic

### Funding Lock Lifecycle

```
Loan active, community funders not yet repaid:
  - Borrower's scheduled payments → interleaved across ALL shares (standard FIFO)
  - Borrower's watershed accumulates but cannot be deployed to new projects/loans
  - Borrower may voluntarily accelerate community repayment from watershed balance

Community funders fully repaid:
  - Funding lock lifts — borrower can deploy watershed funds again
  - Borrower's scheduled payments → interleaved across remaining shares (self-funded portion)
  - Loan status visual: "Fully self-funded"
  - Celebration: borrower and community funders notified

Loan completed:
  - All shares repaid
  - Watershed fully restored (self-funded portion)
  - Full platform participation restored
```

---

## Community Repayment Progress Bar

A visual progress indicator shows how much of the community-funded portion has been repaid. This is the central transparency element of a Watershed-Backed Loan.

### What the Borrower Sees

```
Community Repayment Progress
[████████████░░░░░░░░░░░░] $720 / $1,200 repaid to contributors

Sources:
  Your scheduled payments:      $480 returned to contributors
  Your voluntary accelerations: $240 directed to contributors

Watershed balance: $185 available
[Accelerate Community Repayment →]

When complete → This loan becomes fully self-funded.
Your funding lock lifts and you can give again.
```

### What Community Funders See

On the loan detail page:
```
Your Contribution: $150 (600 shares)
Repaid to you: $90 of $150

Community progress: $720 / $1,200 repaid to all contributors
```

### "Fully Self-Funded" Milestone

When the community repayment bar hits 100%:
- Loan status changes to "Fully self-funded"
- Funding lock lifts — borrower can deploy watershed funds to projects and loans again
- Celebration moment (warm, not flashy): *"Your contributors have been repaid. Thank you for honoring their trust. Your remaining payments will restore your watershed — and you can give again."*
- Community funders are notified: *"You've been fully repaid on [Borrower]'s loan. Thank you for being there when it mattered."*

---

## Tier Independence

Watershed Loans and Watershed-Backed Loans operate **outside the microloan credit progression tier system**.

**Why:** The tier system was designed for borrowers who need the community to fund their entire loan with no track record. A user requesting a Watershed-Backed Loan has demonstrated trust through a different mechanism — their giving history (watershed balance) and lending history (portfolio). This is analogous to how sponsorship already bypasses tier limits: sponsors extend a borrower's credit ceiling based on the sponsor's contribution track record. Here, the borrower extends their own ceiling based on their own track record.

**What this means:**
- A Tier 1 borrower with a $800 watershed and $3,000 lending portfolio can apply for a $2,000 Watershed-Backed Loan
- The tier system does not gate Watershed Loan applications
- The community still decides whether to fund the community-funded portion — this is the natural check
- Taking and repaying a Watershed Loan does not advance or reduce the borrower's standard microloan credit progression

**What still applies:**
- Standard prohibited purpose categories
- Standard funding deadlines (for the community-funded portion)
- Standard default handling and recovery paths
- Standard repayment mechanics (interleaved FIFO)

---

## Default Handling

Standard default timeline applies to all Watershed Loans and Watershed-Backed Loans:

**Late (1-30 days overdue):**
- Gentle reminders. Status: "Late." No additional fees.

**At risk (31-90 days overdue):**
- Prominent notifications. Status: "At risk." Deluge may reach out directly.

**Default (90+ days overdue, no communication):**
- Status: "Defaulted"
- Watershed balance remains at zero (already depleted)
- For Watershed-Backed Loans: funding lock remains in place
- Credit bureau reporting updated (if borrower consented)
- Borrower is not banned — recovery path exists

### Default Recovery

Same paths as standard loans:
- **Path 1:** Three consecutive on-time payments → loan reactivates
- **Path 2:** Full payoff of remaining balance → immediate exit from default

### What Default Means

**Pure Watershed Loan:** The watershed balance that backed the loan is lost to the community pool. Those donated funds will never be deployed to projects.

**Watershed-Backed Loan:** The borrower's self-funded watershed portion is lost. The funding lock remains in place — the borrower cannot deploy any watershed income to new projects or loans. If the borrower's lending portfolio continues generating repayments into their watershed, those funds remain locked and available only for voluntary acceleration toward community repayment or recovery payments.

---

## Interaction with Standard Microloans

### One Active Watershed Loan at a Time
A user may only have one active Watershed Loan (pure or backed) at any given time.

### Can Coexist with Standard Microloans
A Watershed Loan and a standard microloan are independent:
- A user can have one active Watershed Loan AND one active standard microloan simultaneously
- Default on one does not affect the other

### Available Balance Considerations
When a user has active loan funding commitments:
- Available watershed balance accounts for all earmarked funds and existing watershed loan deductions
- A user cannot take a Watershed Loan for more than what's actually available after all commitments

---

## Credit Bureau Reporting

If the borrower has opted into credit bureau reporting (per Plan 16), Watershed Loan repayments are reported the same as standard microloans. On-time payments build credit. This is a benefit to the borrower — their community giving history now also supports their personal financial health.

---

## Economics

### Risk Profile

**Pure Watershed Loans:** Natural risk ceiling — the loan can never exceed the borrower's donated balance. If a user defaults on a $500 Watershed Loan, the community lost giving capacity, not new capital. Expected default rate: 3-5%.

**Watershed-Backed Loans:** Lower risk for community funders than standard microloans because:
1. The borrower has skin in the game (self-funded portion)
2. The funding lock prevents watershed leakage — accumulated funds can only go toward community repayment or scheduled payments
3. Community funders are repaid first (before watershed restoration)
4. The borrower's giving/lending history signals engagement and responsibility
5. Voluntary acceleration gives the borrower a path to repay faster when portfolio income arrives

Expected default rate for community-funded portion: 5-8% (vs. 10% for standard microloans).

### Revenue Impact

Origination fee is 1% of the community-funded portion only, collected upfront at loan creation. Pure Watershed Loans generate no fee revenue — they are an act of respect, not a revenue center.

| Loan Size | Self-Funded | Community | Fee (1% of Community) |
|-----------|-----------|-----------|----------------------|
| $100 | $100 | $0 | $0 |
| $500 | $500 | $0 | $0 |
| $500 | $200 | $300 | $3.00 |
| $2,000 | $800 | $1,200 | $12.00 |
| $5,000 | $1,500 | $3,500 | $35.00 |

Revenue is collected at origination — Deluge carries zero risk on the fee. Revenue is not the point — mission alignment is.

### Impact on Community Pool

While a Watershed Loan is active, the self-funded portion cannot be deployed to projects. Float income on that portion is lost (cash leaves Deluge's custody at disbursement). Both are restored upon full repayment.

For Watershed-Backed Loans, community funders' capital is also temporarily deployed — same as any standard microloan.

---

## User Experience

### Accessing Watershed Loans

A "Need help?" or "Borrow from your watershed" option appears on the user's dashboard or watershed balance view when they have at least $100 available. This is not prominently marketed — it's a quiet safety net, not a feature to drive engagement.

### Unified Application Flow

1. User taps "Borrow from your watershed"
2. Sees their available watershed balance and lending portfolio summary
3. Enters desired loan amount (slider or input)
4. **If amount ≤ available balance:** System shows "Auto-approved. Funds from your watershed."
5. **If amount > available balance:** System shows "Your watershed will contribute $X. The remaining $Y will be funded by the community." Also shows lending portfolio as backing signal.
6. Enters purpose description
7. Chooses repayment schedule (monthly amount + duration within limits)
8. Reviews terms: total amount, watershed contribution, community-funded portion (if any), 1% origination fee on community portion (if applicable), total repayment obligation, repayment schedule, funding lock explanation (if applicable), credit bureau reporting status
9. Accepts loan agreement
10. **Pure Watershed Loan:** Funds disbursed immediately to verified bank account
11. **Watershed-Backed Loan:** Watershed contribution locked, loan enters community funding with trust signals displayed

### During Repayment — Pure Watershed Loan

Dashboard card:
- Remaining balance
- Next payment date and amount
- Watershed restoration progress: "You've restored $X of $Y to your watershed"
- Repayment status (on time / late)

### During Repayment — Watershed-Backed Loan

Dashboard card:
- Remaining balance
- Next payment date and amount
- **Community Repayment Progress bar** (the central element)
- Breakdown: scheduled payments vs. voluntary accelerations applied to community repayment
- Funding lock status: "Your watershed is building but locked until community funders are repaid"
- **"Accelerate Community Repayment"** button when watershed balance > $0
- Repayment status (on time / late)
- Once community funders are repaid: "Fully self-funded" status + funding lock lifted + watershed restoration progress

### Messaging

The tone should be warm and non-judgmental:
- "Your giving has made a difference. Now let us help you."
- "Borrow from what you've built. Repay when you can. Give again when you're ready."
- For Watershed-Backed: "You've contributed $800 of your own watershed. The community is behind you for the rest."
- On full community repayment: "Your contributors have been repaid. Your remaining payments will restore your watershed."
- Avoid clinical financial language. This is community support, not a bank product.

---

## Data Model

### New Model: WatershedLoan

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| userId | String | FK to User |
| amount | Float | Total loan amount |
| selfFundedAmount | Float | Portion from user's watershed |
| communityFundedAmount | Float | Portion needing community funding (0 for pure watershed loans) |
| remainingBalance | Float | Outstanding principal |
| communityRemainingBalance | Float | Outstanding principal owed to community funders |
| purpose | String | Borrower's stated purpose |
| status | Enum | pending, funding, active, late, at_risk, defaulted, recovering, completed |
| type | Enum | pure, backed |
| originationFee | Float | 1% of communityFundedAmount, collected at creation (0 for pure) |
| monthlyPayment | Float | Scheduled monthly payment amount |
| termMonths | Int | Total repayment term |
| paymentsRemaining | Int | Payments left |
| nextPaymentDate | DateTime | Next scheduled payment |
| fundingDeadline | DateTime? | Community funding deadline (null for pure) |
| portfolioValueAtOrigination | Float? | User's outstanding lending portfolio at time of application (informational) |
| fundingLockActive | Boolean | Whether the borrower is locked from deploying watershed funds |
| communityRepaidAt | DateTime? | When community funders were fully repaid |
| disbursedAt | DateTime? | When funds were sent |
| completedAt | DateTime? | When fully repaid |
| defaultedAt | DateTime? | When default status triggered |
| createdAt | DateTime | Application timestamp |
| updatedAt | DateTime | Last update |

### New Model: WatershedLoanPayment

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| watershedLoanId | String | FK to WatershedLoan |
| amount | Float | Principal paid |
| type | Enum | scheduled, acceleration, payoff |
| appliedToCommunity | Float | Portion of this payment applied to community-funded shares |
| appliedToSelf | Float | Portion of this payment applied to self-funded shares |
| paidAt | DateTime | Payment timestamp |

**Note:** The `acceleration` type tracks voluntary accelerations where the borrower directs watershed funds toward community repayment. These are distinct from scheduled payments — they represent an active choice by the borrower.

### Existing Model Changes

**LoanShare / Loan funding:** Watershed-Backed Loans use the existing share system. The borrower's self-funded shares are tracked the same as any funder's shares, with a flag or the userId matching the borrower to identify them as self-funded.

---

## Implementation Phases

### Phase 1: Core Watershed Loan (Pure Path)
- WatershedLoan, WatershedLoanPayment Prisma models
- Available balance calculation (watershed minus earmarks minus existing watershed loan)
- API routes: apply, auto-approve, disburse, make payment, check status
- Watershed balance deduction on disbursement
- Watershed balance restoration on repayment (interleaved FIFO including self-funded shares)
- $100 minimum enforcement across all loan types

### Phase 2: Watershed-Backed Loan (Community Path)
- Self-funding mechanism: watershed auto-contributes as first funder
- Integration with existing loan funding/share system for community-funded portion
- Origination fee: 1% of community-funded portion, collected at loan creation
- Loan request display: self-funded amount, lending portfolio signal (informational)
- Standard funding deadline and resolution logic

### Phase 3: Funding Lock & Voluntary Acceleration
- Funding lock enforcement: block watershed deployment to new projects/loans during active community balance
- Lock check on all fund/allocate actions
- Voluntary acceleration API: borrower directs watershed funds toward community repayment
- Acceleration tracking in WatershedLoanPayment (type: acceleration)
- Lock release when community funders are fully repaid

### Phase 4: Transparency UI
- Community Repayment Progress bar (borrower view)
- "Accelerate Community Repayment" action button
- Funder repayment status (funder view)
- Funding lock status indicator on borrower dashboard
- "Fully self-funded" milestone celebration
- Loan request trust signal display (self-funded badge, portfolio summary)

### Phase 5: Default & Recovery
- Standard escalation (late → at-risk → default) reusing existing logic
- Funding lock persists during default
- Recovery paths (3 consecutive payments or full payoff)
- Admin visibility: active Watershed Loans overview, funding lock status

### Phase 6: Credit Bureau Integration
- Report Watershed Loan repayments via existing Metro 2 infrastructure (Plan 16)
- Same consent model — opt-in only

---

## Decisions Made

1. **$100 minimum** for all loans platform-wide. Loans under $100 cost more to administer than they deliver.
2. **Unified flow** — one application, system determines pure vs. backed based on amount vs. available balance.
3. **Auto-approve** for pure Watershed Loans. No admin queue, no waiting.
4. **Standard repayment and default handling** — same timeline, same escalation, same recovery paths as standard microloans.
5. **Notifications mirror standard users** — same cadence, same escalation.
6. **No admin override** for amounts exceeding watershed balance. Instead, the user applies through the platform with watershed auto-contributing and the community funding the rest.
7. **Tier-independent** — Watershed Loans bypass the credit progression system. Eligibility comes from giving/lending history, not borrowing history. Analogous to sponsorship bypassing tiers.
8. **1% upfront origination fee on community-funded portion only** — no fee on the self-funded watershed portion (respect for the borrower's giving history). No fee on Pure Watershed Loans. Fee collected at loan creation — Deluge carries zero risk. Borrower's total obligation is loan amount + fee.
9. **Funding lock + voluntary acceleration replaces portfolio redirection** — simpler, preserves borrower agency, no complex payment rerouting. Borrower cannot deploy watershed funds to new projects/loans until community funders are repaid. Voluntary acceleration lets borrower direct accumulated watershed funds toward community repayment as an active, celebrated choice.
10. **Interleaved repayment** including borrower's self-funded shares — watershed rebuilds during repayment, consistent with standard share mechanics.
11. **Lending portfolio is informational, not collateral** — disclosed to community funders as a trust signal, but not functionally tied to the loan via redirection or assignment.
