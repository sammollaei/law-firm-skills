# Calculation input and interpretation

This edition has no executable helper. Apply the checks and formulas below in
the open: list each input row and operation so a person can re-perform it, then
re-add every total in a second pass before reporting. Money inputs are integer
USD cents, never formatted strings or implicit dollars. Ratios may be fractional
cents; round only for display. If a check fails, report it and produce no results
from that input until it is corrected.

Input is normalized evidence, not a substitute for source review. The caller
must substantiate every identity join, ledger coverage assertion, date and
scope. Keep the source manifest beside private working data. Source references
are locators, not copies of client records. Do not put bank/check numbers,
credentials, addresses or names into the working file.

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
Scenarios require a monthly baseline.

## Checks before calculating

Report the failure and stop when any of these is true:

- Currency is not USD. Convert and document other currencies upstream.
- A money value is null, a formatted string or not whole cents. The one exception
  is `monthly.otherIncomeCents`, where null means unknown.
- A row's scope differs from the top-level scope, or it has no `sourceRef`.
- A month is not YYYY-MM, or a date is not a real YYYY-MM-DD date.
- `monthly.basis` is not accrual or cash, or `goalSourceRef` is missing.
- A case, receipt line, cost line or scenario ID is duplicated.
- A case is signed outside `signedMonth` or after `asOfDate`, or its status is not
  open, settled or lost.
- A fee has an unmatched case ID, a kind other than firm-fee, a status other than
  cleared or unconfirmed, or a receipt date after the cutoff.
- A cost has an unsupported kind, a nonblank unmatched case ID, an incurred date
  after the cutoff, or is allocated overhead without `allocationRef`.
- A coverage value is not complete, partial or unavailable, `feeLedgerRef` is
  missing, or complete cost coverage has no ledger reference.
- A scenario's basis differs from the baseline, or it lacks `realizationWindow`
  or `assumptionsRef`.

## Formulas

Monthly:

- Recomputed profit = revenue + other income - expenses. Unknown other income
  makes this unknown and the arithmetic unreconciled.
- Reconciliation difference = reported net income - recomputed profit. It
  reconciles only at exactly zero.
- Reported goal gap = max(0, target profit - reported net income).

Cohort, as of the cutoff:

- Count observed, open and lost cases. Original signed cases and settled share
  (settled / all cases x 100) are reported only with complete census coverage.
- Observed cleared fees = sum of cleared receipt lines, netting cleared reversals.
- Collected fees = observed cleared fees only with complete census coverage,
  complete fee coverage and no unconfirmed lines. Otherwise unknown.
- Observed cost by kind = sum of that kind's cost lines.
- Contribution = collected fees - acquisition - direct service, only when collected
  fees are known and both cost coverages are complete. Otherwise unknown.
- After-overhead contribution = contribution - allocated overhead, only when
  contribution is known and overhead coverage is complete.
- Contribution per original signed case = contribution / all cases. Unknown when
  contribution is unknown or there are no cases.

Scenario, one at a time:

- Monthly profit delta = fee revenue delta - expense delta.
- Modeled monthly profit = reported net income + delta. It builds on reported net
  income even when the baseline does not reconcile; report the two together.
- Modeled goal gap = max(0, target profit - modeled monthly profit).

Label every result as arithmetic only: source verification and independent
review are still required. P&L profit is not cohort contribution or proof of
collected fees, and a zero difference does not certify a closed period. A cohort
result is as-of contribution, not monthly firm profit or a lifetime forecast.
Settled share is not a validated mature-survival forecast. Never sum scenarios
or treat one as realized profit.

## Interpretation

Never substitute zero merely because a summary omits other income. An unsupported
close-evidence reference does not certify closed books. Investigate every nonzero
difference.

The example's monthly profit is $160,000 and its reported goal gap is $40,000.
Its cohort contribution is $7,000 before allocated overhead and $6,500 after it,
or $3,500 per original signed case. The denominator is both original signed
cases, including the lost one. The scenario adds $40,000 per month, reaching
$200,000 with no modeled goal gap, only under its assumptions and realization
window; this is not an observed result.

Complete coverage requires an exhaustive, scoped census/ledger through the
cutoff, including verified absence when there are no rows. Known zero and unknown
are different. Observed subtotals remain labeled observed.

Each fee has a unique **receipt line** ID, stable matched case ID, source,
cleared/unconfirmed status and amount. Cleared negative amounts represent
documented reversals. Valid installments need separate line IDs. For a bank
transaction spanning multiple cases, reconcile the line sum to that transaction
upstream. Reissues with different IDs still require upstream reconciliation;
these checks cannot recognize them by themselves.

Costs carry an `incurredDate` and are the cohort's incurred attributable costs through the cutoff, including
service costs of lost/open cases. Credits may be negative. Shared costs need an
explicit allocation source; avoid counting them both as direct cost and overhead.
An incurred-cost contribution is not a pure cash-flow measure. Payback therefore
requires a separate dated, reconciled cash-flow analysis; it is not calculated
here or inferred from the P&L.

Scenarios use **incremental monthly recognized fee revenue and expenses** on
the baseline's accounting basis. Negative expense delta means savings. They do
not accept sign-ups times an arbitrary fee, re-subtract baseline costs, blend
cash with accrual, or automatically add different scenarios together. Their
economic premises and overlapping outcomes still require human-readable evidence.

## Acceptance check

Apply this contract to `examples/fictional-input.json` and confirm the example
figures above. That check covers arithmetic on fictional input only.
