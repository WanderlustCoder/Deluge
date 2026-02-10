# Legal Concerns — Idaho / Treasure Valley Launch

Last updated: 2026-02-10

This document identifies Idaho-specific legal and regulatory concerns relevant to Deluge's Treasure Valley launch. It is not legal advice. Engage an Idaho fintech attorney before going live.

---

## Priority Summary

| # | Area | Risk Level | Blocks Launch? |
|---|------|-----------|----------------|
| 1 | Money Transmission | High | Potentially |
| 2 | Lending License | Medium | Yes (Deluge needs one as lender of record) |
| 3 | Securities Classification | Low | No (loan shares are donation allocations, not securities) |
| 4 | Consumer Protection | Medium | No, but exposure is real |
| 5 | Charitable Solicitation | Low | No |
| 6 | Data Privacy | Low | No |

---

## 1. Money Transmission

**Statute:** Idaho Money Transmitters Act, Idaho Code Title 26, Chapter 29
**Regulator:** Idaho Department of Finance, Securities Bureau
**Reference:** https://www.finance.idaho.gov/securities-bureau/money-transmitters/

### The Concern

Deluge moves money through the platform: ad revenue flows into user watersheds, users allocate funds to projects, loans are funded via shares. The Idaho DOF may classify this as money transmission.

### License Requirements

- $50,000–$250,000 minimum net worth (sliding scale)
- $10,000–$500,000 surety bond
- Background investigation of all principals
- Annual license renewal
- Must identify all Idaho business locations

### Key Questions for Counsel

- Does Deluge's "watershed as ledger entry" model (platform controls all funds, users direct allocations but never hold balances) qualify for an exemption?
- Does the fact that ad revenue is earned by Deluge (not the user) and then allocated change the analysis?
- If Deluge is the lender of record (not a marketplace), does that simplify the money transmission question?
- Would using a licensed payment processor (Stripe) as the actual fund holder shift the licensing burden?

### Possible Exemptions to Explore

- Agent of payee exemption (if Deluge acts as agent for the project receiving funds)
- Payment processor exemption (if a licensed processor holds all funds)

---

## 2. Lending License

**Statute:** Idaho Credit Code, Idaho Code Title 28, Chapter 46, Part 3 (§28-46-302)
**Regulator:** Idaho Department of Finance, Consumer Finance Bureau
**Reference:** https://law.justia.com/codes/idaho/title-28/chapter-46/part-3/section-28-46-302/

### Deluge's Position: Deluge Is the Lender of Record

This question is settled by the platform's architecture (see `docs/fund-flow.md`):

- **Single Pool Model:** All user funds are held in a single Deluge-controlled pool. Watershed balances are ledger entries, not segregated accounts. When a loan is funded, Deluge disburses from the master pool.
- **All Funds Are Donations:** Every dollar entering Deluge is a donation. Users don't "own" their watershed balance — they have directed control over where donated funds go. Users who "fund loan shares" are directing their donation allocation toward a loan, not lending their own money.
- **Deluge controls disbursement:** Deluge decides when to release funds to borrowers, collects repayments, and distributes returns to watersheds. Users never interact directly with borrowers financially.

**Conclusion:** Deluge is the lender. Individual users are donors directing allocations. There is no peer-to-peer lending — there is one lender (Deluge) funded by a pool of community donations. This means **Deluge needs a Regulated Lender License**, but individual users do not.

### License Requirements

- $30,000 minimum liquid assets
- $350 application fee, $150/year renewal per location
- Must submit all loan forms and documents used
- Register with Idaho Secretary of State

### Remaining Questions for Counsel

- The 2% servicing fee — confirm it satisfies Idaho's fee disclosure requirements as a finance charge.
- Watershed Loans (1% origination fee on community-funded portion) — confirm same license covers this structure.
- Confirm that the "donation allocation" framing holds up under Idaho Credit Code definitions.

### Idaho Interest Rate Context

Idaho has no general usury cap for consumer loans made by licensed lenders under the Idaho Credit Code. However, disclosure requirements still apply. The 2% servicing fee and any origination fees must be clearly disclosed as finance charges.

---

## 3. Securities Classification — Loan Shares

**Statute:** Idaho Uniform Securities Act, Idaho Code Title 30, Chapter 14
**Regulator:** Idaho Department of Finance, Securities Bureau
**Reference:** https://hawleytroxell.com/insights/crowdfunding-and-other-options-for-idaho-entrepreneurs/

### Deluge's Position: Loan Shares Are Not Securities

Loan shares fail the Howey test at multiple prongs. This is established by the platform's foundational architecture (see `docs/fund-flow.md` and `docs/business-model.md`):

**Howey Test Analysis:**

1. **"Investment of money"** — Fails. Users do not invest money. All funds entering Deluge are donations (see fund-flow.md: "Every dollar that enters Deluge is a donation"). Users direct donation allocations, not personal capital. Watershed balances are not owned by users — they are "giving allocations" with directed control.

2. **"Expectation of profits"** — Fails. Loan repayments return to the user's watershed, which is a non-withdrawable giving allocation (fund-flow.md: "Funds cannot be withdrawn as cash under normal circumstances"). Returned funds can only be re-directed to more projects or loans. There is no profit — only recycled giving capacity.

3. **"Common enterprise"** — Arguably fails. Deluge is the sole lender of record (single pool model). Users don't pool capital into a common venture — they direct Deluge's community fund.

4. **"Efforts of others"** — Moot if prongs 1-2 fail. But even here: the "return" is borrower repayment to Deluge, not entrepreneurial effort generating profit.

**Supporting Documentation:**

- `docs/business-model.md`: "No investment accounts. Deluge does not manage, invest, or custody user funds for wealth-building purposes." / "No securities. Deluge is not a broker-dealer, investment advisor, or securities platform." / "There is no investment component, no portfolio management, no brokerage."
- `docs/fund-flow.md`: "The watershed is not a savings account. It is a giving allocation." / "Users do not 'own' their watershed balance." / "Funds cannot be withdrawn as cash."

**Conclusion:** Loan shares are donation allocation directives within a community giving platform, not investment contracts. No securities registration or exemption order should be required.

### Remaining Question for Counsel

- Confirm the Howey analysis holds under Idaho Uniform Securities Act case law, specifically that the non-withdrawable nature of watershed balances eliminates "expectation of profits."
- If Idaho DOF disagrees, the fallback is the case-by-case exemptive order process (see Idaho's approach below).

### Idaho's Fallback: Exemptive Order Process

If counsel determines loan shares could be classified as securities despite the above analysis, Idaho uses a **case-by-case exemptive order** process (no blanket intrastate crowdfunding exemption):
- Maximum raise: $2,000,000
- Non-accredited investors: limited to $2,500 each
- All investors: limited to 10% of liquid net worth
- Must be Idaho residents (Section 3(a)(11) / Rule 147)
- Must notify Idaho DOF and receive exemption order before offering

### Reference

- NASAA Intrastate Crowdfunding Directory: https://www.nasaa.org/industry-resources/securities-issuers/intrastate-crowdfunding-directory/

---

## 4. Consumer Protection

**Statute:** Idaho Consumer Protection Act, Idaho Code Title 48, Chapter 6 (§48-601 et seq.)
**Regulator:** Idaho Attorney General, Consumer Protection Division
**Reference:** https://legislature.idaho.gov/statutesrules/idstat/title48/t48ch6/

### The Concern

The ICPA prohibits unfair, deceptive, or unconscionable acts in commerce. Deluge makes several claims that must be substantiated:

### Specific Risks

1. **Ad revenue claims:** "Each ad funds about $0.01 to projects" — revenue is variable ($0.008–$0.025 gross, ~60% to watershed). Marketing must not overstate or guarantee amounts.

2. **"100% goes to your watershed"** — must be precisely true. The 60/40 split (60% to watershed, 40% to Deluge) means only cash contributions go 100% to watershed. Ad revenue does not.

3. **Cascade stage descriptions** — must not imply guaranteed matching rates. Cascade multipliers depend on community participation.

4. **Loan funding claims** — "fund a loan" with shares implies an investment. Language must be carefully reviewed.

5. **Impact metrics** — any stats shown (total funded, loans issued, active users) must be accurate and not misleading.

### Enforcement

- Idaho AG can seek injunctions and civil penalties
- **Consumers have a private right of action with mandatory attorney's fees** — this creates real plaintiff-side incentive to sue
- Treble damages available for willful violations

### Action Items

- Audit all marketing copy for accuracy
- Add clear disclosures about variable ad revenue
- Ensure the 60/40 revenue split is visible and not buried
- Review all "100%" and "every dollar" type claims

---

## 5. Charitable Solicitation

**Statute:** Idaho Charitable Solicitation Act, Idaho Code Title 48, Chapter 12
**Reference:** https://legislature.idaho.gov/statutesrules/idstat/title48/t48ch12/

### Good News

Idaho is one of approximately 11 states with **no state-level charitable solicitation registration requirement**. Organizations can solicit contributions without registering with a state agency.

### What Still Applies

- The Idaho Charitable Solicitation Act still prohibits **false, deceptive, misleading, unfair, or unconscionable** practices in charitable solicitation
- The Idaho Telephone Solicitation Act requires registration with the AG **10 days prior** to any telephone solicitation
- Some Idaho cities/counties may require local registration for in-person solicitation

### Key Question

Is Deluge soliciting "charitable contributions" or operating a commercial platform? If users contribute cash expecting it to fund projects (not receive goods/services), that may be charitable solicitation even if Deluge isn't a 501(c)(3). The platform's structure — users direct funds to specific projects — could trigger solicitation rules even without nonprofit status.

---

## 6. Data Privacy and Security

**Reference:** Idaho Code Title 28, Chapter 51, §28-51-105
https://legislature.idaho.gov/statutesrules/idstat/title28/t28ch51/sect28-51-105/

### Current State

Idaho has **no comprehensive state data privacy law** (no Idaho equivalent of CCPA or state privacy act as of 2026). Federal laws apply:

- **GLBA** — if Deluge is classified as a financial institution (lending, fund management)
- **COPPA** — if any users are under 13
- **FCRA/FACTA** — if credit tier system reports to or functions like credit bureaus

### Breach Notification (Required)

Idaho Code §28-51-105 requires that any entity conducting business in Idaho that owns or licenses computerized data containing personal information of Idaho residents must:

- Conduct a prompt investigation upon discovering a breach
- Notify affected Idaho residents **as soon as possible** if misuse has occurred or is reasonably likely
- No specific notification timeline (unlike states with 30/60 day deadlines), but "as soon as possible" is the standard

### Action Items

- Implement breach detection and response procedures
- Document what personal information is collected and stored
- If credit tier data is shared externally (Plan 16: Credit Bureau), FCRA compliance becomes mandatory
- Review whether GLBA applies given the lending and fund management functions

---

## Recommended Legal Counsel

Idaho firms with relevant fintech/securities expertise:

- **Hawley Troxell** — frequently publishes on Idaho crowdfunding, securities, and lending law (https://hawleytroxell.com)
- Idaho Department of Finance general inquiries: 208-332-8002

---

## Decision Points Before Launch

### Can Launch Without (lower risk features only)

- Ad watching + watershed allocation (if money transmission is resolved)
- Cash contributions to projects
- Community features, leaderboards, badges
- Marketing site

### Requires Licensing Before Launch

- **Microloan system** — requires Idaho Regulated Lender License (Deluge is lender of record)
- **Money transmission** — may require MTL depending on counsel's analysis of the ledger-entry model

### Does NOT Require Separate Licensing

- **Loan share funding by users** — not securities (donation allocations into a non-withdrawable giving pool; Howey test fails at multiple prongs)
- **Watershed balances** — not customer deposits (ledger entries for donation direction, not owned by users, not withdrawable as cash)

### Recommended Phased Approach

1. **Phase 1:** Launch with ads + contributions + projects only (resolve money transmission question)
2. **Phase 2:** Add loans (obtain Regulated Lender License; loan shares included — they are donation allocations, not securities)

---

## Sources

- Idaho Money Transmitters Act: https://www.finance.idaho.gov/securities-bureau/money-transmitters/
- Idaho Regulated Lender License: https://law.justia.com/codes/idaho/title-28/chapter-46/part-3/section-28-46-302/
- Idaho Crowdfunding: https://hawleytroxell.com/insights/crowdfunding-and-other-options-for-idaho-entrepreneurs/
- Idaho Charitable Solicitation Act: https://legislature.idaho.gov/statutesrules/idstat/title48/t48ch12/
- Idaho Consumer Protection Act: https://legislature.idaho.gov/statutesrules/idstat/title48/t48ch6/
- Idaho Breach Notification: https://legislature.idaho.gov/statutesrules/idstat/title28/t28ch51/sect28-51-105/
- NASAA Crowdfunding Directory: https://www.nasaa.org/industry-resources/securities-issuers/intrastate-crowdfunding-directory/
