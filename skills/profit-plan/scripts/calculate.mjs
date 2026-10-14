import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Arithmetic over normalized evidence. No fetching, writes or business actions.
const KINDS = ['acquisition', 'direct-service', 'allocated-overhead'];
const COVERAGE = ['complete', 'partial', 'unavailable'];
function requireValue(ok, message) { if (!ok) throw new Error(message); }
function text(value, label) {
  requireValue(typeof value === 'string' && value.trim().length > 0, `${label} is required`);
  return value;
}
function integer(value, label) {
  requireValue(Number.isSafeInteger(value), `${label} must be integer cents/count, not null or a numeric string`);
  return value;
}
function sum(values) {
  return values.reduce((a, b) => integer(a + b, 'sum'), 0);
}
function month(value, label) {
  requireValue(typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value), `${label} must be YYYY-MM`);
}
function date(value, label) {
  requireValue(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value), `${label} must be YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00Z`);
  requireValue(Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, `${label} is invalid`);
}
function rows(value, label) {
  requireValue(Array.isArray(value), `${label} must be an array`);
  return value;
}
function unique(records, key, label) {
  const seen = new Set();
  for (const row of records) {
    const id = text(row[key], `${label}.${key}`);
    requireValue(!seen.has(id), `${label} contains a duplicate ID`);
    seen.add(id);
  }
  return seen;
}
function scoped(record, scope, label) {
  requireValue(record.scope === scope, `${label} entity scope mismatch`);
  text(record.sourceRef, `${label}.sourceRef`);
}
function coverage(value, label) {
  requireValue(COVERAGE.includes(value), `${label} must be complete, partial or unavailable`);
  return value === 'complete';
}
function ratio(numerator, denominator) {
  return numerator === null || denominator === 0 ? null : numerator / denominator;
}

export function calculate(input) {
  const scope = text(input.scope, 'scope');
  requireValue(input.currency === 'USD', 'currency must be USD; convert and document other currencies upstream');
  requireValue(input.monthly || input.cohort, 'monthly or cohort is required');
  const output = { scope, currency: 'USD', evidenceStatus: 'arithmetic-only; source verification and independent review still required' };

  if (input.monthly) {
    const m = input.monthly;
    scoped(m, scope, 'monthly');
    month(m.period, 'monthly.period');
    requireValue(['accrual', 'cash'].includes(m.basis), 'monthly.basis must be explicit');
    for (const key of ['revenueCents', 'expensesCents', 'reportedNetIncomeCents', 'targetProfitCents']) integer(m[key], `monthly.${key}`);
    text(m.goalSourceRef, 'monthly.goalSourceRef');
    requireValue(m.otherIncomeCents === null || Number.isSafeInteger(m.otherIncomeCents), 'monthly.otherIncomeCents must be integer cents or null');
    const recomputed = m.otherIncomeCents === null ? null : sum([m.revenueCents, m.otherIncomeCents, -m.expensesCents]);
    const difference = recomputed === null ? null : sum([m.reportedNetIncomeCents, -recomputed]);
    output.monthly = {
      period: m.period, basis: m.basis,
      reportedProfitCents: m.reportedNetIncomeCents,
      recomputedProfitCents: recomputed,
      reconciliationDifferenceCents: difference,
      arithmeticReconciles: difference === 0,
      closeEvidenceRef: m.closeEvidenceRef || null,
      reportedGoalGapCents: Math.max(0, sum([m.targetProfitCents, -m.reportedNetIncomeCents])),
      limitation: 'P&L profit is not cohort contribution or proof of collected fees; a zero arithmetic difference does not certify a closed period',
    };
  }

  if (input.cohort) {
    const c = input.cohort;
    scoped(c, scope, 'cohort');
    month(c.signedMonth, 'cohort.signedMonth');
    date(c.asOfDate, 'cohort.asOfDate');
    const completeCensus = coverage(c.censusCoverage, 'cohort.censusCoverage');
    const completeFees = coverage(c.feeCoverage, 'cohort.feeCoverage');
    text(c.feeLedgerRef, 'cohort.feeLedgerRef');
    const cases = rows(c.cases, 'cohort.cases');
    const caseIds = unique(cases, 'caseId', 'cohort.cases');
    for (const row of cases) {
      scoped(row, scope, 'case');
      date(row.signedDate, 'case.signedDate');
      requireValue(row.signedDate.startsWith(c.signedMonth) && row.signedDate <= c.asOfDate, 'case signed date is outside the cohort/cutoff');
      requireValue(['open', 'settled', 'lost'].includes(row.status), 'case.status must be open, settled or lost');
    }
    const fees = rows(c.fees, 'cohort.fees');
    unique(fees, 'receiptLineId', 'cohort.fees');
    for (const row of fees) {
      scoped(row, scope, 'fee');
      requireValue(caseIds.has(row.caseId), 'fee has an unmatched case ID');
      requireValue(row.kind === 'firm-fee', 'only firm-fee receipts belong in collected fees');
      requireValue(['cleared', 'unconfirmed'].includes(row.status), 'fee.status must be cleared or unconfirmed');
      integer(row.amountCents, 'fee.amountCents');
      date(row.receivedDate, 'fee.receivedDate');
      requireValue(row.receivedDate <= c.asOfDate, 'fee is after the observation cutoff');
    }
    const costs = rows(c.costs, 'cohort.costs');
    unique(costs, 'costLineId', 'cohort.costs');
    for (const row of costs) {
      scoped(row, scope, 'cost');
      requireValue(KINDS.includes(row.kind), 'cost.kind is unsupported');
      integer(row.amountCents, 'cost.amountCents');
      date(row.incurredDate, 'cost.incurredDate');
      requireValue(row.incurredDate <= c.asOfDate, 'cost is after the observation cutoff');
      if (row.caseId != null) requireValue(caseIds.has(row.caseId), 'cost has an unmatched case ID');
      if (row.kind === 'allocated-overhead') text(row.allocationRef, 'cost.allocationRef');
    }
    const costTotals = {}, completeCosts = {};
    for (const kind of KINDS) {
      completeCosts[kind] = coverage(c.costCoverage?.[kind], `cohort.costCoverage.${kind}`);
      if (completeCosts[kind]) text(c.costLedgerRefs?.[kind], `cohort.costLedgerRefs.${kind}`);
      costTotals[kind] = sum(costs.filter(r => r.kind === kind).map(r => r.amountCents));
    }
    const unconfirmed = fees.filter(r => r.status !== 'cleared');
    const observedFees = sum(fees.filter(r => r.status === 'cleared').map(r => r.amountCents));
    const feesUsable = completeCensus && completeFees && unconfirmed.length === 0;
    const contribution = feesUsable && completeCosts.acquisition && completeCosts['direct-service']
      ? sum([observedFees, -costTotals.acquisition, -costTotals['direct-service']]) : null;
    const afterOverhead = contribution !== null && completeCosts['allocated-overhead']
      ? sum([contribution, -costTotals['allocated-overhead']]) : null;
    output.cohort = {
      signedMonth: c.signedMonth, asOfDate: c.asOfDate,
      observedCases: cases.length,
      originalSignedCases: completeCensus ? cases.length : null,
      openCases: cases.filter(r => r.status === 'open').length,
      lostCases: cases.filter(r => r.status === 'lost').length,
      observedSettledSharePct: completeCensus ? ratio(100 * cases.filter(r => r.status === 'settled').length, cases.length) : null,
      observedClearedFeesCents: observedFees,
      cohortCollectedFeesCents: feesUsable ? observedFees : null,
      unconfirmedReceiptLines: unconfirmed.length,
      observedCostsCents: costTotals,
      contributionAfterAcquisitionAndDirectServiceCents: contribution,
      contributionAfterAllocatedOverheadCents: afterOverhead,
      contributionPerOriginalSignedCaseCents: ratio(contribution, cases.length),
      limitation: 'As-of cohort contribution, not monthly firm profit or a lifetime forecast; settled share is not a validated mature-survival forecast',
    };
  }

  if (input.scenarios !== undefined) {
    requireValue(!!input.monthly, 'scenarios require a monthly baseline');
    unique(rows(input.scenarios, 'scenarios'), 'id', 'scenarios');
    output.scenarios = input.scenarios.map(s => {
      scoped(s, scope, 'scenario');
      requireValue(s.basis === input.monthly.basis, 'scenario accounting basis mismatch');
      text(s.realizationWindow, 'scenario.realizationWindow');
      text(s.assumptionsRef, 'scenario.assumptionsRef');
      integer(s.feeRevenueDeltaCents, 'scenario.feeRevenueDeltaCents');
      integer(s.expenseDeltaCents, 'scenario.expenseDeltaCents');
      const delta = sum([s.feeRevenueDeltaCents, -s.expenseDeltaCents]);
      const profit = sum([input.monthly.reportedNetIncomeCents, delta]);
      return { id: s.id, realizationWindow: s.realizationWindow,
        modeledMonthlyProfitDeltaCents: delta, modeledMonthlyProfitCents: profit,
        modeledGoalGapCents: Math.max(0, sum([input.monthly.targetProfitCents, -profit])),
        limitation: 'Individual conditional scenario; do not sum scenarios or treat as realized profit',
      };
    });
  }
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    requireValue(process.argv.length === 3, 'usage: node calculate.mjs <input.json|->');
    const input = JSON.parse(readFileSync(process.argv[2] === '-' ? 0 : process.argv[2], 'utf8'));
    console.log(JSON.stringify(calculate(input), null, 2));
  } catch (error) {
    console.error(`profit-plan: ${error instanceof SyntaxError ? 'invalid JSON input' : error.message}`);
    process.exitCode = 1;
  }
}
