import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { calculate } from './calculate.mjs';

const scope = 'example-firm';
const ref = { scope, sourceRef: 'synthetic' };
function fixture() {
  return {
    scope, currency: 'USD',
    monthly: { ...ref, period: '2026-08', basis: 'accrual', revenueCents: 50000000,
      otherIncomeCents: 1000000, expensesCents: 35000000, reportedNetIncomeCents: 16000000,
      targetProfitCents: 20000000, goalSourceRef: 'synthetic-goal' },
    cohort: { ...ref, signedMonth: '2025-01', asOfDate: '2026-08-31', censusCoverage: 'complete',
      feeCoverage: 'complete', feeLedgerRef: 'synthetic-fees',
      cases: [
        { ...ref, caseId: 'a', signedDate: '2025-01-05', status: 'settled' },
        { ...ref, caseId: 'b', signedDate: '2025-01-10', status: 'lost' },
        { ...ref, caseId: 'c', signedDate: '2025-01-15', status: 'open' },
      ],
      fees: [{ ...ref, receiptLineId: 'r1', caseId: 'a', kind: 'firm-fee', status: 'cleared',
        receivedDate: '2026-07-01', amountCents: 1000000 }],
      costs: [
        { ...ref, costLineId: 'c1', kind: 'acquisition', amountCents: 200000, incurredDate: '2025-01-01' },
        { ...ref, costLineId: 'c2', kind: 'direct-service', amountCents: 100000, incurredDate: '2026-07-01' },
        { ...ref, costLineId: 'c3', kind: 'allocated-overhead', amountCents: 50000, incurredDate: '2026-07-01', allocationRef: 'synthetic-allocation' },
      ],
      costCoverage: { acquisition: 'complete', 'direct-service': 'complete', 'allocated-overhead': 'complete' },
      costLedgerRefs: { acquisition: 'synthetic-a', 'direct-service': 'synthetic-b', 'allocated-overhead': 'synthetic-c' },
    },
    scenarios: [{ ...ref, id: 's1', basis: 'accrual', feeRevenueDeltaCents: 5000000,
      expenseDeltaCents: 1000000, realizationWindow: 'monthly after ramp', assumptionsRef: 'synthetic-assumptions' }],
  };
}

test('monthly profit includes other income; incremental scenario does not re-subtract baseline expense', () => {
  const r = calculate(fixture());
  assert.equal(r.monthly.recomputedProfitCents, 16000000);
  assert.equal(r.monthly.reconciliationDifferenceCents, 0);
  assert.equal(r.monthly.reportedGoalGapCents, 4000000);
  assert.equal(r.scenarios[0].modeledMonthlyProfitCents, 20000000);
  assert.equal(r.scenarios[0].modeledGoalGapCents, 0);
});

test('unknown other income blocks arithmetic reconciliation, while a discrepancy remains visible', () => {
  const x = fixture(); x.monthly.otherIncomeCents = null;
  assert.equal(calculate(x).monthly.recomputedProfitCents, null);
  assert.equal(calculate(x).monthly.arithmeticReconciles, false);
  x.monthly.otherIncomeCents = 0;
  assert.equal(calculate(x).monthly.reconciliationDifferenceCents, 1000000);
  assert.equal(calculate(x).monthly.reportedProfitCents, 16000000);
});

test('lost and open cases remain in the original acquisition denominator', () => {
  const r = calculate(fixture()).cohort;
  assert.equal(r.originalSignedCases, 3);
  assert.equal(r.openCases, 1);
  assert.equal(r.lostCases, 1);
  assert.equal(r.contributionAfterAcquisitionAndDirectServiceCents, 700000);
  assert.equal(r.contributionAfterAllocatedOverheadCents, 650000);
  assert.equal(r.contributionPerOriginalSignedCaseCents, 700000 / 3);
});

test('valid installments and cleared reversals are netted once', () => {
  const x = fixture();
  x.cohort.fees.push({ ...x.cohort.fees[0], receiptLineId: 'r2', amountCents: 200000 });
  x.cohort.fees.push({ ...x.cohort.fees[0], receiptLineId: 'r3', amountCents: -100000 });
  assert.equal(calculate(x).cohort.cohortCollectedFeesCents, 1100000);
});

test('partial census or fee ledger cannot become a headline cohort contribution', () => {
  for (const key of ['censusCoverage', 'feeCoverage']) {
    const x = fixture(); x.cohort[key] = 'partial';
    const c = calculate(x).cohort;
    assert.equal(c.cohortCollectedFeesCents, null);
    assert.equal(c.contributionAfterAcquisitionAndDirectServiceCents, null);
    assert.equal(c.observedClearedFeesCents, 1000000);
  }
});

test('missing acquisition or service costs stay unknown; incomplete overhead only blocks its own measure', () => {
  for (const kind of ['acquisition', 'direct-service']) {
    const x = fixture(); x.cohort.costCoverage[kind] = 'unavailable';
    assert.equal(calculate(x).cohort.contributionAfterAcquisitionAndDirectServiceCents, null);
  }
  const x = fixture(); x.cohort.costCoverage['allocated-overhead'] = 'partial';
  assert.equal(calculate(x).cohort.contributionAfterAcquisitionAndDirectServiceCents, 700000);
  assert.equal(calculate(x).cohort.contributionAfterAllocatedOverheadCents, null);
});

test('unconfirmed transfer does not count as collected cash', () => {
  const x = fixture(); x.cohort.fees[0].status = 'unconfirmed';
  const c = calculate(x).cohort;
  assert.equal(c.observedClearedFeesCents, 0);
  assert.equal(c.cohortCollectedFeesCents, null);
  assert.equal(c.contributionAfterAcquisitionAndDirectServiceCents, null);
});

test('known zero receipts with a complete ledger produce a real loss, not unknown', () => {
  const x = fixture(); x.cohort.fees = [];
  assert.equal(calculate(x).cohort.cohortCollectedFeesCents, 0);
  assert.equal(calculate(x).cohort.contributionAfterAcquisitionAndDirectServiceCents, -300000);
});

test('empty complete census has no per-case ratio or NaN', () => {
  const x = fixture(); x.cohort.cases = []; x.cohort.fees = []; x.cohort.costs = [];
  const r = calculate(x).cohort;
  assert.equal(r.contributionPerOriginalSignedCaseCents, null);
  assert.equal(r.observedSettledSharePct, null);
});

test('reject duplicates, foreign cases, wrong entity and gross settlement receipts', () => {
  const mutations = [
    x => x.cohort.cases.push({ ...x.cohort.cases[0] }),
    x => x.cohort.fees.push({ ...x.cohort.fees[0] }),
    x => x.cohort.costs.push({ ...x.cohort.costs[0] }),
    x => { x.cohort.fees[0].caseId = 'unmatched'; },
    x => { x.cohort.costs[0].caseId = 'unmatched'; },
    x => { x.cohort.fees[0].scope = 'other-firm'; },
    x => { x.monthly.scope = 'portfolio'; },
    x => { x.cohort.fees[0].kind = 'gross-settlement'; },
  ];
  for (const mutate of mutations) { const x = fixture(); mutate(x); assert.throws(() => calculate(x)); }
});

test('reject future or invalid dates and out-of-cohort signings', () => {
  const mutations = [
    x => { x.cohort.fees[0].receivedDate = '2026-09-01'; },
    x => { x.cohort.fees[0].receivedDate = '2026-02-30'; },
    x => { x.cohort.costs[0].incurredDate = '2026-09-01'; },
    x => { x.cohort.cases[0].signedDate = '2025-02-01'; },
    x => { x.monthly.period = '2026-13'; },
  ];
  for (const mutate of mutations) { const x = fixture(); mutate(x); assert.throws(() => calculate(x)); }
});

test('reject implicit null money, formatted dollars, unsafe arithmetic and unsupported currency', () => {
  for (const amount of [null, '1000', 1.2, Number.MAX_SAFE_INTEGER + 1]) {
    const x = fixture(); x.cohort.fees[0].amountCents = amount; assert.throws(() => calculate(x));
  }
  const x = fixture(); x.monthly.revenueCents = Number.MAX_SAFE_INTEGER;
  assert.throws(() => calculate(x));
  x.currency = 'EUR'; assert.throws(() => calculate(x));
});

test('scenarios stay separate and preserve expense savings without crossing accounting bases', () => {
  const x = fixture();
  x.scenarios.push({ ...x.scenarios[0], id: 's2', feeRevenueDeltaCents: 0, expenseDeltaCents: -500000 });
  const r = calculate(x);
  assert.equal(r.scenarios[1].modeledMonthlyProfitCents, 16500000);
  assert.equal(r.scenarios[0].modeledMonthlyProfitCents, 20000000);
  x.scenarios[0].basis = 'cash'; assert.throws(() => calculate(x));
});

test('missing provenance and allocation basis cannot silently pass', () => {
  const mutations = [
    x => { x.monthly.goalSourceRef = ''; },
    x => { x.cohort.costLedgerRefs.acquisition = ''; },
    x => { x.cohort.costs[2].allocationRef = ''; },
    x => { x.cohort.fees[0].sourceRef = ''; },
  ];
  for (const mutate of mutations) { const x = fixture(); mutate(x); assert.throws(() => calculate(x)); }
});

test('CLI accepts stdin and refuses invalid input with a nonzero exit', () => {
  const path = fileURLToPath(new URL('./calculate.mjs', import.meta.url));
  const valid = spawnSync(process.execPath, [path, '-'], { input: JSON.stringify(fixture()), encoding: 'utf8' });
  assert.equal(valid.status, 0);
  assert.equal(JSON.parse(valid.stdout).monthly.reportedGoalGapCents, 4000000);
  const invalid = spawnSync(process.execPath, [path, '-'], { input: '{invalid', encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.equal(invalid.stdout, '');
});
