import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { calculate } from './calculate.mjs';

function fixture() {
  const doc = readFileSync(new URL('../references/calculations.md', import.meta.url), 'utf8');
  return JSON.parse(doc.split('```json\n')[1].split('\n```')[0]);
}

test('documented flat-fee example: profit target does not hide capacity, cash and owner limits', () => {
  const r = calculate(fixture());
  assert.equal(r.financial.modeledProfitMinorPerMonth, 2000000);
  assert.equal(r.financial.modeledGoalGapMinorPerMonth, 0);
  assert.equal(r.financial.unconstrainedRequiredMonthlyUnitsForProfit, 30);
  assert.equal(r.flows[0].requirements[0].requiredInputPerMonth, 200);
  assert.equal(r.capacity[0].modeledDemandUnitsPerMonth, 110);
  assert.equal(r.capacity[0].shortfallUnitsPerMonth, 10);
  assert.equal(r.capacityAssessment, 'exceeded');
  assert.equal(r.ownerHoursOverLimitPerMonth, 5);
  assert.equal(r.cash.additionalCashLowerBoundMinor, 500000);
});

test('hourly firm uses realized revenue per worked billable hour and support demand', () => {
  const x = fixture(), s = x.financial.segments[0];
  x.firm = 'Example Hourly Firm'; s.unit = 'worked-billable-hour'; s.monthlyUnits = 200;
  delete x.flows;
  s.recognizedFeeMinorPerUnit = 30000; s.variableCostMinorPerUnit = 10000;
  s.workload[0].unitsPerPlanningUnit = 0.25;
  const r = calculate(x);
  assert.equal(r.financial.modeledProfitMinorPerMonth, 3000000);
  assert.equal(r.financial.unconstrainedRequiredMonthlyUnitsForProfit, 150);
  assert.equal(r.capacity[0].modeledDemandUnitsPerMonth, 70);
  assert.equal(r.capacityAssessment, 'within-modeled-capacity');
});

test('contingency firm: steady-state profit remains separate from delayed collections', () => {
  const x = fixture(), s = x.financial.segments[0];
  x.firm = 'Example Contingency Firm'; s.unit = 'expected-resolved-matter'; s.monthlyUnits = 10;
  delete x.flows;
  s.recognizedFeeMinorPerUnit = 1000000; s.variableCostMinorPerUnit = 500000;
  x.cash.months[1].collectionsMinor = 0;
  const r = calculate(x);
  assert.equal(r.financial.modeledProfitMinorPerMonth, 4000000);
  assert.equal(r.cash.months[1].modeledClosingCashMinor, -500000);
  assert.equal(r.cash.additionalCashLowerBoundMinor, 1500000);
});

test('subscription firm uses modeled average active stock rather than additions', () => {
  const x = fixture(), s = x.financial.segments[0];
  x.firm = 'Example Subscription Firm'; s.unit = 'average-billable-active-client'; s.monthlyUnits = 100;
  s.recognizedFeeMinorPerUnit = 50000; s.variableCostMinorPerUnit = 20000;
  s.workload[0].unitsPerPlanningUnit = 0.5;
  delete x.flows;
  const r = calculate(x);
  assert.equal(r.financial.modeledProfitMinorPerMonth, 2000000);
  assert.equal(r.capacity[0].modeledDemandUnitsPerMonth, 70);
});

test('referral firm uses an actual partner acceptance ceiling without invented hours', () => {
  const x = fixture(), s = x.financial.segments[0];
  x.firm = 'Example Referral Firm'; s.unit = 'accepted-referral';
  delete x.flows;
  s.workload[0].resourceUnit = 'accepted-referral'; s.workload[0].unitsPerPlanningUnit = 1;
  x.resources[0].capacityUnit = 'accepted-referral';
  x.resources[0].netAvailableUnitsPerMonth = 25; x.resources[0].otherCommittedUnitsPerMonth = 0;
  assert.equal(calculate(x).capacity[0].shortfallUnitsPerMonth, 5);
});

test('mixed practice adds shared workload and fixed cost only once', () => {
  const x = fixture();
  x.financial.segments.push({ ...structuredClone(x.financial.segments[0]), id: 'second-practice', monthlyUnits: 10 });
  const r = calculate(x);
  assert.equal(r.financial.modeledProfitMinorPerMonth, 3000000);
  assert.equal(r.capacity[0].modeledDemandUnitsPerMonth, 140);
  assert.equal(r.capacity[0].shortfallUnitsPerMonth, 40);
  assert.equal(r.financial.unconstrainedRequiredMonthlyUnitsForProfit, null);
  assert.equal(r.financial.requiredVolumeStatus, 'mix-specific-scenario-required');
});

test('unknown costs or fees cannot become zero or a positive profit recommendation', () => {
  for (const key of ['recognizedFeeMinorPerUnit', 'variableCostMinorPerUnit', 'monthlyUnits']) {
    const x = fixture(); x.financial.segments[0][key] = null;
    const r = calculate(x);
    assert.equal(r.financial.modeledProfitMinorPerMonth, null);
    assert.equal(r.financial.modeledGoalGapMinorPerMonth, null);
  }
  const x = fixture(); x.financial.fixedCostMinorPerMonth = null;
  assert.equal(calculate(x).financial.unconstrainedRequiredMonthlyUnitsForProfit, null);
});

test('known zero volume is distinct from missing volume', () => {
  const x = fixture(); x.financial.segments[0].monthlyUnits = 0;
  const r = calculate(x);
  assert.equal(r.financial.modeledProfitMinorPerMonth, -1000000);
  assert.equal(r.capacity[0].modeledDemandUnitsPerMonth, 20);
});

test('missing capacities, partial workload and empty resources never imply unlimited room', () => {
  const x = fixture(); x.financial.segments[0].monthlyUnits = 1;
  x.resources[0].netAvailableUnitsPerMonth = null;
  assert.equal(calculate(x).capacityAssessment, 'unknown');
  x.resources[0].netAvailableUnitsPerMonth = 100;
  x.workloadCoverage = 'partial'; assert.equal(calculate(x).capacityAssessment, 'unknown');
  x.workloadCoverage = 'complete'; x.resources = []; x.financial.segments[0].workload = [];
  assert.equal(calculate(x).capacityAssessment, 'unknown');
});

test('unknown workload propagates; a separate known overload still remains exceeded', () => {
  const x = fixture(); x.financial.segments[0].workload[0].unitsPerPlanningUnit = null;
  assert.equal(calculate(x).capacity[0].modeledDemandUnitsPerMonth, null);
  assert.equal(calculate(x).capacityAssessment, 'unknown');
  x.resources.push({ ...x.resources[0], id: 'known-overload', netAvailableUnitsPerMonth: 1, otherCommittedUnitsPerMonth: 2 });
  assert.equal(calculate(x).capacityAssessment, 'exceeded');
});

test('zero capacity with demand shows the overload without Infinity', () => {
  const x = fixture(); x.resources[0].netAvailableUnitsPerMonth = 0;
  const r = calculate(x);
  assert.equal(r.capacity[0].shortfallUnitsPerMonth, 110);
  assert.equal(r.capacity[0].utilizationFraction, null);
  assert.equal(r.capacityAssessment, 'exceeded');
});

test('zero/negative contribution cannot solve a positive profit requirement', () => {
  for (const fee of [50000, 0]) {
    const x = fixture(); x.financial.segments[0].recognizedFeeMinorPerUnit = fee;
    const r = calculate(x);
    assert.equal(r.financial.unconstrainedRequiredMonthlyUnitsForProfit, null);
    assert.equal(r.financial.requiredVolumeStatus, 'no-positive-unit-contribution');
  }
});

test('flow zero conversion is impossible; missing conversion is unknown; zero target is zero', () => {
  const x = fixture(); x.flows[0].transitions[0].passRate = 0;
  assert.equal(calculate(x).flows[0].status, 'impossible-zero-conversion');
  x.flows[0].transitions[0].passRate = null;
  assert.equal(calculate(x).flows[0].status, 'unknown');
  x.flows[0].targetOutputPerMonth = 0;
  assert.equal(calculate(x).flows[0].requirements[0].requiredInputPerMonth, 0);
});

test('reject disconnected/cyclic flows and percent values in fractional rates', () => {
  const mutations = [
    x => { x.flows[0].transitions[1].inputUnit = 'different-unit'; },
    x => { x.flows[0].transitions[1].outputUnit = 'lead'; },
    x => { x.flows[0].transitions[0].passRate = 50; },
    x => { x.flows[0].transitions = []; },
  ];
  for (const mutate of mutations) { const x = fixture(); mutate(x); assert.throws(() => calculate(x)); }
});

test('reject mixed entities, wrong workload units, unknown resources and duplicate load lines', () => {
  const mutations = [
    x => { x.financial.segments[0].scope = 'other-firm'; },
    x => { x.resources[0].scope = 'other-firm'; },
    x => { x.financial.segments[0].workload[0].resourceUnit = 'matters'; },
    x => { x.financial.segments[0].workload[0].resourceId = 'unmapped'; },
    x => { x.financial.segments[0].workload.push({ ...x.financial.segments[0].workload[0] }); },
    x => { x.financial.segments.push({ ...x.financial.segments[0] }); },
  ];
  for (const mutate of mutations) { const x = fixture(); mutate(x); assert.throws(() => calculate(x)); }
});

test('missing cash values propagate through future balances; no cash section makes no funding claim', () => {
  const x = fixture(); x.cash.months[0].collectionsMinor = null;
  const r = calculate(x);
  assert.equal(r.cash.months[1].modeledClosingCashMinor, null);
  assert.equal(r.cash.additionalCashLowerBoundMinor, null);
  delete x.cash; assert.equal(calculate(x).cash, undefined);
});

test('cash reflects initial outlays, existing reserve need and approved financing without changing profit', () => {
  const x = fixture(); x.cash.upfrontOutlayMinor = 2000000;
  x.cash.months[0].approvedFinancingMinor = 1000000;
  const r = calculate(x);
  assert.equal(r.cash.additionalCashLowerBoundMinor, 1000000);
  assert.equal(r.financial.modeledProfitMinorPerMonth, 2000000);
});

test('cash periods must be consecutive and ordered, including across a year boundary', () => {
  const x = fixture(); x.cash.months[0].period = '2026-12'; x.cash.months[1].period = '2027-01';
  assert.doesNotThrow(() => calculate(x));
  for (const period of ['2027-02', '2026-12', '2026-11', '2026-13']) {
    x.cash.months[1].period = period; assert.throws(() => calculate(x));
  }
});

test('currency is explicit; JPY uses whole minor units without an implicit dollar conversion', () => {
  const x = fixture(); x.currency = 'JPY'; x.minorUnitsPerMajor = 1;
  assert.equal(calculate(x).financial.modeledProfitMinorPerMonth, 2000000);
  x.minorUnitsPerMajor = undefined; assert.throws(() => calculate(x));
});

test('fractional hours are supported, but implicit numbers, omitted evidence and unsafe values fail', () => {
  const x = fixture(); x.financial.segments[0].monthlyUnits = 10.5;
  assert.equal(calculate(x).financial.modeledProfitMinorPerMonth, 50000);
  const mutations = [
    y => { y.financial.fixedCostMinorPerMonth = '1000000'; },
    y => { y.financial.fixedCostMinorPerMonth = undefined; },
    y => { y.financial.segments[0].recognizedFeeMinorPerUnit = Number.MAX_SAFE_INTEGER; },
    y => { y.goalSourceRef = ''; },
    y => { y.ownerHoursPerMonth = NaN; },
  ];
  for (const mutate of mutations) { const y = fixture(); mutate(y); assert.throws(() => calculate(y)); }
});

test('unknown owner workload cannot be labeled within the owner limit', () => {
  const x = fixture(); x.ownerHoursPerMonth = null;
  assert.equal(calculate(x).ownerHoursOverLimitPerMonth, null);
});

test('intermediate cash overflow is rejected even if a later outlay would bring it back down', () => {
  const x = fixture(); x.cash.openingCashMinor = Number.MAX_SAFE_INTEGER;
  x.cash.upfrontOutlayMinor = 0; x.cash.months[0].collectionsMinor = 100;
  x.cash.months[0].outflowsMinor = 100;
  assert.throws(() => calculate(x));
});

test('CLI computes a scenario from stdin and exits nonzero on invalid input', () => {
  const path = fileURLToPath(new URL('./calculate.mjs', import.meta.url));
  const valid = spawnSync(process.execPath, [path, '-'], { input: JSON.stringify(fixture()), encoding: 'utf8' });
  assert.equal(valid.status, 0);
  assert.equal(JSON.parse(valid.stdout).capacityAssessment, 'exceeded');
  const invalid = spawnSync(process.execPath, [path, '-'], { input: '{invalid', encoding: 'utf8' });
  assert.equal(invalid.status, 1); assert.equal(invalid.stdout, '');
});
