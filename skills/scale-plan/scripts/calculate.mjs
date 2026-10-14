import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

function check(ok, message) { if (!ok) throw new Error(message); }
function text(v, name) { check(typeof v === 'string' && v.trim().length > 0, `${name} is required`); return v; }
function list(v, name) { check(Array.isArray(v), `${name} must be an array`); return v; }
function number(v, name, { signed = false, integer = false } = {}) {
  if (v === null) return null;
  check(typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER, `${name} must be finite or explicitly null`);
  check(signed || v >= 0, `${name} must be nonnegative`);
  check(!integer || Number.isSafeInteger(v), `${name} must use integer minor currency units`);
  return v;
}
const money = (v, name, signed = false) => number(v, name, { signed, integer: true });
function sum(values) {
  if (values.some(v => v === null)) return null;
  return values.reduce((a, b) => number(a + b, 'calculation total', { signed: true }), 0);
}
function product(a, b, round = false) {
  if (a === null || b === null) return null;
  const result = a * b;
  number(result, 'calculation product', { signed: true });
  return round ? money(Math.round(result), 'rounded amount', true) : result;
}
function ids(records, name) {
  const result = new Set();
  for (const r of records) {
    const id = text(r.id, `${name}.id`);
    check(!result.has(id), `${name} contains a duplicate ID`);
    result.add(id);
  }
  return result;
}
function source(row, scope, name) {
  check(row.scope === scope, `${name} scope mismatch`);
  text(row.sourceRef, `${name}.sourceRef`);
}
function monthIndex(value) {
  check(typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value), 'cash period must be YYYY-MM');
  const [y, m] = value.split('-').map(Number);
  return y * 12 + m - 1;
}

export function backsolve(flow, scope) {
  source(flow, scope, 'flow');
  const target = number(flow.targetOutputPerMonth, 'flow.targetOutputPerMonth');
  const transitions = list(flow.transitions, 'flow.transitions');
  check(transitions.length > 0, 'flow requires at least one transition');
  ids(transitions, 'transitions');
  const seenUnits = new Set();
  transitions.forEach((t, i) => {
    text(t.sourceRef, 'transition.sourceRef');
    text(t.inputUnit, 'transition.inputUnit'); text(t.outputUnit, 'transition.outputUnit');
    if (i) check(transitions[i - 1].outputUnit === t.inputUnit, 'flow units are not contiguous');
    check(!seenUnits.has(t.inputUnit), 'flow contains a cycle'); seenUnits.add(t.inputUnit);
    check(!seenUnits.has(t.outputUnit), 'flow contains a cycle');
    number(t.passRate, 'transition.passRate');
    check(t.passRate === null || t.passRate <= 1, 'passRate is a fraction between zero and one');
  });
  const impossible = target !== null && target > 0 && transitions.some(t => t.passRate === 0);
  let needed = target;
  const requirements = [];
  for (const t of [...transitions].reverse()) {
    const out = needed;
    needed = out === 0 ? 0 : out === null || t.passRate === null || t.passRate === 0 ? null : number(out / t.passRate, 'required volume');
    requirements.unshift({ id: t.id, inputUnit: t.inputUnit, outputUnit: t.outputUnit,
      requiredInputPerMonth: needed, requiredOutputPerMonth: out });
  }
  return { id: flow.id, status: impossible ? 'impossible-zero-conversion' : needed === null ? 'unknown' : 'calculated',
    requirements, limitation: 'Steady-state conditional volumes only; stage delays, branches, rework and deadline attainment require separate evidence' };
}

export function cashProjection(cash, scope) {
  source(cash, scope, 'cash');
  const opening = money(cash.openingCashMinor, 'cash.openingCashMinor', true);
  const reserve = money(cash.minimumReserveMinor, 'cash.minimumReserveMinor');
  const upfront = money(cash.upfrontOutlayMinor, 'cash.upfrontOutlayMinor');
  let balance = sum([opening, upfront === null ? null : -upfront]);
  let lowest = balance;
  let previous = null;
  const months = list(cash.months, 'cash.months');
  check(months.length > 0, 'cash requires a nonempty monthly timeline');
  const output = months.map(m => {
    const serial = monthIndex(m.period);
    if (previous !== null) check(serial === previous + 1, 'cash months must be consecutive, unique and ordered');
    previous = serial;
    text(m.sourceRef, 'cash month.sourceRef');
    const collected = money(m.collectionsMinor, 'cash collections', true);
    const financing = money(m.approvedFinancingMinor, 'cash approved financing');
    const outlays = money(m.outflowsMinor, 'cash outflows', true);
    balance = sum([balance, collected, financing, outlays === null ? null : -outlays]);
    lowest = lowest === null || balance === null ? null : Math.min(lowest, balance);
    return { period: m.period, modeledClosingCashMinor: balance,
      reserveShortfallMinor: balance === null || reserve === null ? null : Math.max(0, sum([reserve, -balance])) };
  });
  return { months: output,
    additionalCashLowerBoundMinor: lowest === null || reserve === null ? null : Math.max(0, sum([reserve, -lowest])),
    limitation: 'Conditional month-end funding lower bound, including upfront outlay; intra-month cash shortfalls can be larger' };
}

export function calculate(input) {
  const scope = text(input.scope, 'scope'); text(input.firm, 'firm'); text(input.scenario, 'scenario');
  check(/^[A-Z]{3}$/.test(input.currency || ''), 'currency must be an explicit three-letter code');
  check([1, 10, 100, 1000, 10000].includes(input.minorUnitsPerMajor), 'minorUnitsPerMajor must be explicit');
  check(input.periodUnit === 'month', 'periodUnit must be month');
  check(['complete', 'partial', 'unavailable'].includes(input.workloadCoverage), 'workloadCoverage is required');
  const f = input.financial; source(f, scope, 'financial');
  check(['accrual', 'cash'].includes(f.basis), 'financial accounting basis is required');
  const fixed = money(f.fixedCostMinorPerMonth, 'fixed cost');
  const other = money(f.otherIncomeMinorPerMonth, 'other income', true);
  const goal = money(input.goalProfitMinorPerMonth, 'goalProfitMinorPerMonth', true);
  if (goal !== null) text(input.goalSourceRef, 'goalSourceRef');
  const ownerHours = number(input.ownerHoursPerMonth, 'ownerHoursPerMonth');
  const ownerLimit = number(input.ownerHoursLimitPerMonth, 'ownerHoursLimitPerMonth');
  const segments = list(f.segments, 'segments'); check(segments.length > 0, 'at least one segment is required'); ids(segments, 'segments');
  const resources = list(input.resources, 'resources'); const resourceIds = ids(resources, 'resources');
  const resourceUnits = new Map(resources.map(r => [r.id, text(r.capacityUnit, 'resource.capacityUnit')]));
  const demand = new Map(resources.map(r => [r.id, []]));
  const modeledSegments = segments.map(s => {
    source(s, scope, 'segment'); text(s.unit, 'segment.unit');
    const units = number(s.monthlyUnits, 'segment.monthlyUnits');
    const revenue = money(s.recognizedFeeMinorPerUnit, 'segment.recognizedFeeMinorPerUnit');
    const cost = money(s.variableCostMinorPerUnit, 'segment.variableCostMinorPerUnit');
    const workload = list(s.workload, 'segment.workload');
    const used = new Set();
    for (const w of workload) {
      check(resourceIds.has(w.resourceId), 'workload references an unknown resource');
      check(!used.has(w.resourceId), 'segment duplicates a resource workload'); used.add(w.resourceId);
      check(w.resourceUnit === resourceUnits.get(w.resourceId), 'workload resource unit mismatch');
      number(w.unitsPerPlanningUnit, 'workload.unitsPerPlanningUnit'); text(w.sourceRef, 'workload.sourceRef');
      demand.get(w.resourceId).push(product(units, w.unitsPerPlanningUnit));
    }
    const rev = product(units, revenue, true), variable = product(units, cost, true);
    return { id: s.id, unit: s.unit, monthlyUnits: units, modeledRevenueMinor: rev,
      modeledVariableCostMinor: variable,
      modeledContributionMinor: sum([rev, variable === null ? null : -variable]) };
  });
  const contribution = sum(modeledSegments.map(s => s.modeledContributionMinor));
  const profit = sum([contribution, fixed === null ? null : -fixed, other]);
  const capacity = resources.map(r => {
    source(r, scope, 'resource');
    const available = number(r.netAvailableUnitsPerMonth, 'resource.netAvailableUnitsPerMonth');
    const committed = number(r.otherCommittedUnitsPerMonth, 'resource.otherCommittedUnitsPerMonth');
    const needed = sum([committed, ...demand.get(r.id)]);
    return { id: r.id, capacityUnit: r.capacityUnit, modeledDemandUnitsPerMonth: needed, netAvailableUnitsPerMonth: available,
      shortfallUnitsPerMonth: available === null || needed === null ? null : Math.max(0, needed - available),
      spareUnitsPerMonth: available === null || needed === null ? null : available - needed,
      utilizationFraction: available === null || needed === null || available === 0 ? null : needed / available };
  });
  const exceeded = capacity.some(r => r.shortfallUnitsPerMonth > 0);
  const capacityKnown = resources.length > 0 && input.workloadCoverage === 'complete' && capacity.every(r => r.shortfallUnitsPerMonth !== null);
  let requiredVolume = null, volumeStatus = 'mix-specific-scenario-required';
  if (segments.length === 1) {
    const s = segments[0];
    const margin = sum([s.recognizedFeeMinorPerUnit, s.variableCostMinorPerUnit === null ? null : -s.variableCostMinorPerUnit]);
    const needed = sum([goal, fixed, other === null ? null : -other]);
    volumeStatus = needed === null || margin === null ? 'unknown' : needed <= 0 ? 'calculated' : margin <= 0 ? 'no-positive-unit-contribution' : 'calculated';
    requiredVolume = volumeStatus !== 'calculated' ? null : needed <= 0 ? 0 : number(needed / margin, 'required profit volume');
  }
  const result = { firm: input.firm, scope, scenario: input.scenario, currency: input.currency,
    minorUnitsPerMajor: input.minorUnitsPerMajor, periodUnit: 'month',
    evidenceStatus: 'conditional arithmetic only; not source verification, approval or a deadline forecast',
    financial: { basis: f.basis, segments: modeledSegments, modeledProfitMinorPerMonth: profit,
      modeledGoalGapMinorPerMonth: profit === null || goal === null ? null : Math.max(0, sum([goal, -profit])),
      unconstrainedRequiredMonthlyUnitsForProfit: requiredVolume, requiredVolumeStatus: volumeStatus,
      limitation: 'Per-unit rates, mix and fixed costs are conditional; round indivisible units upward and recheck costs, capacity and ramp' },
    capacity, capacityAssessment: exceeded ? 'exceeded' : capacityKnown ? 'within-modeled-capacity' : 'unknown',
    ownerHoursOverLimitPerMonth: ownerHours === null || ownerLimit === null ? null : Math.max(0, ownerHours - ownerLimit),
  };
  if (input.flows !== undefined) {
    ids(list(input.flows, 'flows'), 'flows'); result.flows = input.flows.map(flow => backsolve(flow, scope));
  }
  if (input.cash !== undefined) result.cash = cashProjection(input.cash, scope);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    check(process.argv.length === 3, 'usage: node calculate.mjs <input.json|->');
    const input = JSON.parse(readFileSync(process.argv[2] === '-' ? 0 : process.argv[2], 'utf8'));
    console.log(JSON.stringify(calculate(input), null, 2));
  } catch (error) {
    console.error(`scale-plan: ${error instanceof SyntaxError ? 'invalid JSON input' : error.message}`);
    process.exitCode = 1;
  }
}
