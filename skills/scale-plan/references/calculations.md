# Scenario calculation contract

This edition has no executable helper. Apply the formulas below in the open,
separately for each scenario: list each input and operation so a person can
re-perform it, then recompute every total in a second pass before reporting.
This does not optimize a plan, fetch private data or certify a business result.

Inputs use one firm/entity scope, one explicit currency and monthly rates. Money
is in integer minor units; `minorUnitsPerMajor` specifies the scale (USD uses
100, JPY 1). Never mix currencies without an evidenced prior conversion. `null`
means unknown and carries through every result that depends on it; report omitted
required numeric fields, numeric strings and nonfinite values as failed checks
instead of calculating. Known zero must have evidence. `sourceRef` values point to
the private evidence manifest; they do not contain credentials or client data.
Every row needs the scenario's scope and a `sourceRef`. Report these as failed
checks, and produce no results from that input until they are corrected: duplicate
IDs; workload that names an unknown resource or a different unit; a segment
repeating a resource; a known goal without `goalSourceRef`; a currency that is not
a three-letter code; `minorUnitsPerMajor` other than 1, 10, 100, 1000 or 10000; a
period unit other than month; and a negative value anywhere except goal profit,
other income, opening cash, collections and outflows.

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
add separately supported other income. Modeled goal gap = max(0, goal - modeled
profit). Do not include the same payroll or
overhead in both variable and fixed cost. Do not replace firm profit with owner
distributions. Cost behavior and fee recognition remain evidenced assumptions.

`monthlyUnits` may be worked billable hours, completed matters, expected
resolved matters, average active clients or paid referrals. Its meaning must
match revenue, cost and workload multipliers. It is not a universal client count.
For a contingency scenario normalized per resolved matter, workload multipliers
must include the upstream work on failures/open matters or additional segments
must represent it. Do not give those extra work segments the same revenue again.

With one segment, required monthly units = (profit goal + fixed cost - other
income) / (fee per unit - variable cost per unit). If that residual is zero or
less, the requirement is zero. If it is positive and unit contribution is zero or
negative, report that no volume reaches it; volume is not a solution. Any unknown
input makes the requirement unknown. This is an **unconstrained
steady-state requirement**. Round indivisible units upward, then recalculate
the scenario's fixed/step costs, shared capacity and cash timing. For multiple
segments there is no unique volume solution: propose an explicit supported mix.
Unknown fee or cost means unknown profit.

## Capacity

Each resource has a capacity unit, such as hours, partner-accepted matters or
review slots. Workload entries must use exactly that unit. Modeled demand = the
sum of each segment's monthly volume times its resource units per planning unit,
plus `otherCommittedUnitsPerMonth`. Shortfall = max(0, demand - net available);
spare = net available - demand; utilization = demand / net available, unknown at
zero capacity. This other load excludes all modeled segments;
include the existing book/backlog and other firms here only if they are not
already represented. Net availability must account for the evidenced schedule,
leave, reserve and skill constraints. Do not invent hours from a vendor's
case-count ceiling: use its actual capacity unit.

`workloadCoverage` is complete, partial or unavailable. Assess capacity as
exceeded, within modeled capacity or unknown. A known shortfall at any resource
means exceeded, even if other inputs are unknown. A resource with an unknown
demand term has unknown demand and shortfall, whatever its known terms add up to. Adequacy is reported only for a
complete modeled workload with known capacities; it does not establish quality,
service levels, legal coverage, funding or deadline attainment. Empty resources
or incomplete workload produce unknown, not unlimited capacity. A `null`
workload multiplier propagates uncertainty. Owner hours over limit = max(0, owner
hours - limit), unknown if either is unknown; include owner effort in resource demands where relevant.

## Flows and time

`flows` is optional. Each flow supports a single contiguous serial chain with
conditional conversion fractions from 0 to 1. Units must connect; report cycles,
duplicate IDs and percentage numbers such as 40 instead of 0.4 as failed checks.
Work backward from the target output: each transition's required input = its
required output / pass rate, and that input is the prior transition's required
output. A zero target requires zero. A zero pass rate with a positive target makes
the flow impossible, and that step's required input and all earlier steps unknown.
A null pass rate makes the flow unknown: that step's required input and all earlier
steps are unknown, while its required output stays as calculated.
One chain does not represent multiple branches, stock/churn dynamics or rework.
Compute those separately from their actual structure. The resulting
flow requirements are not automatically linked to financial units or resource
workloads: reconcile those units and volumes explicitly in the report.

`cash` is optional, but a missing cash projection cannot establish funding
feasibility. Month rows must be consecutive and ordered. Closing cash equals
the prior balance plus evidenced collections and separately approved financing,
minus outflows. `upfrontOutlayMinor` is deducted once from opening cash before the
first month; exclude it from that month's outflows. Reserve shortfall = max(0,
minimum reserve - closing cash). Additional cash lower bound = max(0, minimum
reserve - the lowest balance, counting the balance after the upfront outlay). If
any balance is unknown, the lower bound is unknown. Negative collections allow documented
reversals. Financing is not revenue and unapproved borrowing is not cash available.

Build the timeline from actual stage/collection lags and the existing book.
Do not invent receipt timing from profit. Unknown amounts propagate
through later cash balances. The additional-cash result is a **lower bound**
based on opening/upfront and month-end balances; an intra-month cash model may
show a larger need. It is not a credit recommendation or a commitment to borrow.

## Verification

Retain source locators, input definitions and scenario assumptions in the private
work artifact. Apply this contract to `examples/fictional-input.json` and confirm
the expected arithmetic above: its closing cash is $5,000 in January and $25,000
in February, and review-team utilization is 1.1.

This proves arithmetic on supplied inputs. It does not validate live firm data,
complete coverage, causal lift, legal authority or the final report.
