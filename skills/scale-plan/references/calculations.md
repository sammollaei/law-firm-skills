# Scenario calculation contract

The helper accepts a private JSON file or `-` for stdin, prints JSON, writes
nothing and uses only Node built-ins. Run it separately for each scenario. It
does not optimize a plan, fetch private data or certify a business result.

Inputs use one firm/entity scope, one explicit currency and monthly rates. Money
is in integer minor units; `minorUnitsPerMajor` specifies the scale (USD uses
100, JPY 1). Never mix currencies without an evidenced prior conversion. `null`
means unknown; omitted required numeric fields, numeric strings and nonfinite
values are rejected. Known zero must have evidence. `sourceRef` values point to
the private evidence manifest; they do not contain credentials or client data.

## Complete synthetic example

This is a fictional flat-fee firm, not a target, benchmark or current business
fact. Its target scenario is deliberately constrained.

```json
{
  "firm": "Example Firm",
  "scope": "example-firm",
  "scenario": "target",
  "currency": "USD",
  "minorUnitsPerMajor": 100,
  "periodUnit": "month",
  "goalProfitMinorPerMonth": 2000000,
  "goalSourceRef": "synthetic-goal",
  "ownerHoursPerMonth": 25,
  "ownerHoursLimitPerMonth": 20,
  "workloadCoverage": "complete",
  "financial": {
    "scope": "example-firm",
    "sourceRef": "synthetic-financial-model",
    "basis": "accrual",
    "fixedCostMinorPerMonth": 1000000,
    "otherIncomeMinorPerMonth": 0,
    "segments": [{
      "id": "projects",
      "scope": "example-firm",
      "sourceRef": "synthetic-segment",
      "unit": "accepted-project",
      "monthlyUnits": 30,
      "recognizedFeeMinorPerUnit": 150000,
      "variableCostMinorPerUnit": 50000,
      "workload": [{
        "resourceId": "review-team",
        "resourceUnit": "hours",
        "unitsPerPlanningUnit": 3,
        "sourceRef": "synthetic-time-sample"
      }]
    }]
  },
  "resources": [{
    "id": "review-team",
    "scope": "example-firm",
    "sourceRef": "synthetic-schedule",
    "capacityUnit": "hours",
    "netAvailableUnitsPerMonth": 100,
    "otherCommittedUnitsPerMonth": 20
  }],
  "flows": [{
    "id": "acquisition",
    "scope": "example-firm",
    "sourceRef": "synthetic-cohort",
    "targetOutputPerMonth": 30,
    "transitions": [
      {"id":"qualify","inputUnit":"lead","outputUnit":"qualified-lead","passRate":0.5,"sourceRef":"synthetic-rate-a"},
      {"id":"retain","inputUnit":"qualified-lead","outputUnit":"accepted-project","passRate":0.3,"sourceRef":"synthetic-rate-b"}
    ]
  }],
  "cash": {
    "scope": "example-firm",
    "sourceRef": "synthetic-cash-model",
    "openingCashMinor": 2000000,
    "minimumReserveMinor": 1000000,
    "upfrontOutlayMinor": 500000,
    "months": [
      {"period":"2027-01","collectionsMinor":0,"approvedFinancingMinor":0,"outflowsMinor":1000000,"sourceRef":"synthetic-cash-jan"},
      {"period":"2027-02","collectionsMinor":3000000,"approvedFinancingMinor":0,"outflowsMinor":1000000,"sourceRef":"synthetic-cash-feb"}
    ]
  }
}
```

Expected arithmetic: $20,000 modeled monthly profit, zero profit-goal gap,
30 unconstrained monthly projects required, 200 leads required, 110 review
hours demanded against 100 available, five owner hours over the limit, and at
least $5,000 additional cash to maintain the reserve across month ends. Profit
arithmetic alone does not make this a feasible plan.

## Economics and required volume

For each segment: recognized fee per planning unit times monthly units, minus
variable cost per unit times monthly units. Round each segment's monetary
subtotal to integer minor units, then sum. Subtract fixed firm cost once and
add separately supported other income. Do not include the same payroll or
overhead in both variable and fixed cost. Do not replace firm profit with owner
distributions. Cost behavior and fee recognition remain evidenced assumptions.

`monthlyUnits` may be worked billable hours, completed matters, expected
resolved matters, average active clients or paid referrals. Its meaning must
match revenue, cost and workload multipliers. It is not a universal client count.
For a contingency scenario normalized per resolved matter, workload multipliers
must include the upstream work on failures/open matters or additional segments
must represent it. Do not give those extra work segments the same revenue again.

With one segment, the helper also divides the profit requirement plus fixed
cost minus other income by unit contribution. This is an **unconstrained
steady-state requirement**. Round indivisible units upward, then recalculate
the scenario's fixed/step costs, shared capacity and cash timing. For multiple
segments there is no unique volume solution: propose an explicit supported mix.
Zero/negative contribution cannot reach a positive residual profit requirement
through volume growth alone. Unknown fee or cost means unknown profit.

## Capacity

Each resource has a capacity unit, such as hours, partner-accepted matters or
review slots. Workload entries must use exactly that unit. The helper adds each
segment's monthly volume times its resource units per planning unit, then adds
`otherCommittedUnitsPerMonth`. This other load excludes all modeled segments;
include the existing book/backlog and other firms here only if they are not
already represented. Net availability must account for the evidenced schedule,
leave, reserve and skill constraints. Do not invent hours from a vendor's
case-count ceiling: use its actual capacity unit.

`workloadCoverage` is complete, partial or unavailable. A known shortfall remains
exceeded even if other inputs are unknown. Adequacy is reported only for a
complete modeled workload with known capacities; it does not establish quality,
service levels, legal coverage, funding or deadline attainment. Empty resources
or incomplete workload produce unknown, not unlimited capacity. A `null`
workload multiplier propagates uncertainty. Owner hours are also checked against
their own explicit limit; include owner effort in resource demands where relevant.

## Flows and time

`flows` is optional. Each flow supports a single contiguous serial chain with
conditional conversion fractions from 0 to 1. Units must connect; cycles,
duplicate IDs and percentage numbers such as 40 instead of 0.4 are rejected.
One chain does not represent multiple branches, stock/churn dynamics or rework.
Compute those from their actual structure outside the helper. The resulting
flow requirements are not automatically linked to financial units or resource
workloads: reconcile those units and volumes explicitly in the report.

`cash` is optional, but a missing cash projection cannot establish funding
feasibility. Month rows must be consecutive and ordered. Closing cash equals
opening cash plus evidenced collections and separately approved financing,
minus outflows. `upfrontOutlayMinor` is deducted once before the first month;
exclude it from that month's outflows. Negative collections allow documented
reversals. Financing is not revenue and unapproved borrowing is not cash available.

Build the timeline from actual stage/collection lags and the existing book.
The helper does not invent receipt timing from profit. Unknown amounts propagate
through later cash balances. The additional-cash result is a **lower bound**
based on opening/upfront and month-end balances; an intra-month cash model may
show a larger need. It is not a credit recommendation or a commitment to borrow.

## Verification

Retain source locators, input definitions and scenario assumptions in the private
work artifact. Verify the documented example and boundary behavior with:

```sh
node --test scripts/calculate.test.mjs
```

These checks prove arithmetic on supplied inputs. They do not validate live
firm data, complete coverage, causal lift, legal authority or the final report.
