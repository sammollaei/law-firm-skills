# Calculation input and interpretation

`scripts/calculate.mjs` accepts one UTF-8 JSON file or `-` for stdin. It uses
only Node built-ins, prints JSON, and writes nothing. Money inputs are integer
USD cents, never formatted strings or implicit dollars. Output ratios may be
fractional cents; round only for display. Any error exits nonzero.

Input is normalized evidence, not a substitute for source review. The caller
must substantiate every identity join, ledger coverage assertion, date and
scope. Keep the source manifest beside private working data. Source references
are locators, not copies of client records. Do not put bank/check numbers,
credentials, addresses or names into the calculator.

The synthetic example below shows the schema. All names, dates, amounts, and outcomes are fictional; they are not benchmarks.

```json
{
  "scope": "example-firm",
  "currency": "USD",
  "monthly": {
    "scope": "example-firm",
    "sourceRef": "synthetic-pnl",
    "period": "2026-08",
    "basis": "accrual",
    "revenueCents": 50000000,
    "otherIncomeCents": 1000000,
    "expensesCents": 35000000,
    "reportedNetIncomeCents": 16000000,
    "targetProfitCents": 20000000,
    "goalSourceRef": "synthetic-goal",
    "closeEvidenceRef": "synthetic-reconciliation"
  },
  "cohort": {
    "scope": "example-firm",
    "sourceRef": "synthetic-census",
    "signedMonth": "2025-01",
    "asOfDate": "2026-08-31",
    "censusCoverage": "complete",
    "feeCoverage": "complete",
    "feeLedgerRef": "synthetic-fee-ledger",
    "cases": [
      {"caseId":"case-a","scope":"example-firm","sourceRef":"synthetic-case-a","signedDate":"2025-01-05","status":"settled"},
      {"caseId":"case-b","scope":"example-firm","sourceRef":"synthetic-case-b","signedDate":"2025-01-10","status":"lost"}
    ],
    "fees": [
      {"receiptLineId":"receipt-a","caseId":"case-a","scope":"example-firm","sourceRef":"synthetic-receipt","kind":"firm-fee","status":"cleared","receivedDate":"2026-07-01","amountCents":1000000}
    ],
    "costs": [
      {"costLineId":"cost-a","scope":"example-firm","sourceRef":"synthetic-cost-a","kind":"acquisition","amountCents":200000,"incurredDate":"2025-01-01"},
      {"costLineId":"cost-b","scope":"example-firm","sourceRef":"synthetic-cost-b","kind":"direct-service","amountCents":100000,"incurredDate":"2026-07-01"},
      {"costLineId":"cost-c","scope":"example-firm","sourceRef":"synthetic-cost-c","kind":"allocated-overhead","amountCents":50000,"incurredDate":"2026-07-01","allocationRef":"synthetic-allocation"}
    ],
    "costCoverage": {"acquisition":"complete","direct-service":"complete","allocated-overhead":"complete"},
    "costLedgerRefs": {"acquisition":"synthetic-acquisition-ledger","direct-service":"synthetic-service-ledger","allocated-overhead":"synthetic-overhead-ledger"}
  },
  "scenarios": [
    {"id":"one-change","scope":"example-firm","sourceRef":"synthetic-mechanism","basis":"accrual","feeRevenueDeltaCents":5000000,"expenseDeltaCents":1000000,"realizationWindow":"per month after the evidenced ramp","assumptionsRef":"synthetic-assumptions"}
  ]
}
```

`monthly` and `cohort` are independently optional, but at least one is required.
Scenarios require a monthly baseline. For monthly input, `otherIncomeCents: null`
means the component is unknown: the helper prints reported profit and its
reported goal gap, but cannot reconcile the arithmetic. Never substitute zero
merely because the summary omits other income. An unsupported close-evidence
reference does not certify closed books. Investigate every nonzero difference.

The example's monthly profit is $160,000 and its reported goal gap is $40,000.
Its cohort contribution is $7,000 before allocated overhead and $6,500 after it.
The denominator is both original signed cases, including the lost one. The
scenario adds $40,000 per month only under its assumptions and realization
window; this is not an observed result.

Coverage values are `complete`, `partial`, or `unavailable`. Complete coverage
requires an exhaustive, scoped census/ledger through the cutoff, including
verified absence when there are no rows. With incomplete census, fees,
acquisition cost or direct service cost, headline cohort contribution is null.
Incomplete overhead blocks only the after-overhead measure. Known zero and
unknown are different. Observed subtotals remain labeled observed.

Each fee has a unique **receipt line** ID, stable matched case ID, source,
cleared/unconfirmed status and amount. Cleared negative amounts represent
documented reversals. Valid installments need separate line IDs. For a bank
transaction spanning multiple cases, reconcile the line sum to that transaction
upstream. Duplicate or unmatched IDs, non-firm-fee rows, mismatched scopes,
future receipts and invalid dates are rejected. Reissues with different IDs
still require upstream reconciliation; the helper cannot recognize them by magic.

Costs carry an `incurredDate` and are the cohort's incurred attributable costs through the cutoff, including
service costs of lost/open cases. Credits may be negative. Shared costs need an
explicit allocation source; avoid counting them both as direct cost and overhead.
An incurred-cost contribution is not a pure cash-flow measure. Payback therefore
requires a separate dated, reconciled cash-flow analysis; this helper does not
calculate it or infer it from the P&L.

Scenarios use **incremental monthly recognized fee revenue and expenses** on
the baseline's accounting basis. Negative expense delta means savings. They do
not accept sign-ups times an arbitrary fee, re-subtract baseline costs, blend
cash with accrual, or automatically add different scenarios together. Their
economic premises and overlapping outcomes still require human-readable evidence.

Run the financial boundary checks with:

```sh
node --test scripts/calculate.test.mjs
```
