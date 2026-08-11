import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateBudget, summarizeReports } from '../../scripts/validate-lighthouse-budget.mjs';

const policy = {
  critical_paths: ['/'],
  minimum_runs_per_path: 3,
  regression_limits: { performance_points: 5, total_blocking_time_ms: 200 },
  enforce_absolute_targets_on_or_after: '2026-09-08',
  absolute_targets: {
    performance: 80,
    best_practices: 90,
    seo: 95,
    accessibility: 95,
    largest_contentful_paint_ms: 2500,
    total_blocking_time_ms: 400,
    cumulative_layout_shift: 0.1,
  },
};

function report(performance, tbt) {
  return {
    categories: {
      performance: { score: performance / 100 },
      accessibility: { score: 0.96 },
      'best-practices': { score: 0.92 },
      seo: { score: 0.98 },
    },
    audits: {
      'largest-contentful-paint': { numericValue: 2200 },
      'total-blocking-time': { numericValue: tbt },
      'cumulative-layout-shift': { numericValue: 0.05 },
    },
  };
}

test('uses the median of three mobile runs', () => {
  const summary = summarizeReports({ '/': [report(80, 300), report(65, 900), report(82, 280)] });
  assert.equal(summary['/'].performance, 80);
  assert.equal(summary['/'].total_blocking_time_ms, 300);
  assert.equal(summary['/'].runs, 3);
});

test('fails a greater than five-point performance regression', () => {
  const current = { '/': { ...summarizeReports({ '/': [report(74, 300), report(74, 300), report(74, 300)] })['/'] } };
  const baseline = { paths: { '/': { performance: 80, total_blocking_time_ms: 300 } } };
  const result = evaluateBudget(current, baseline, policy, new Date('2026-08-20T00:00:00Z'));
  assert.ok(result.issues.includes('RED_PERFORMANCE_REGRESSION:/'));
});

test('fails a greater than 200ms blocking-time regression', () => {
  const current = { '/': summarizeReports({ '/': [report(80, 501), report(80, 501), report(80, 501)] })['/'] };
  const baseline = { paths: { '/': { performance: 80, total_blocking_time_ms: 300 } } };
  const result = evaluateBudget(current, baseline, policy, new Date('2026-08-20T00:00:00Z'));
  assert.ok(result.issues.includes('RED_TBT_REGRESSION:/'));
});

test('enforces the absolute Day-28 targets on and after the policy date', () => {
  const current = { '/': summarizeReports({ '/': [report(79, 401), report(79, 401), report(79, 401)] })['/'] };
  const baseline = { paths: { '/': { performance: 79, total_blocking_time_ms: 401 } } };
  const result = evaluateBudget(current, baseline, policy, new Date('2026-09-08T00:00:00Z'));
  assert.equal(result.enforce_absolute_targets, true);
  assert.ok(result.issues.includes('RED_PERFORMANCE_TARGET:/'));
  assert.ok(result.issues.includes('RED_TOTAL_BLOCKING_TIME_MS_TARGET:/'));
});
