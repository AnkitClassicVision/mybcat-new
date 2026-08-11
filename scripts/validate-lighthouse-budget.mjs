import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function pathnameFor(url) {
  const pathname = new URL(url).pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function reportMetrics(report) {
  return {
    performance: (report.categories?.performance?.score ?? 0) * 100,
    accessibility: (report.categories?.accessibility?.score ?? 0) * 100,
    best_practices: (report.categories?.['best-practices']?.score ?? 0) * 100,
    seo: (report.categories?.seo?.score ?? 0) * 100,
    largest_contentful_paint_ms: report.audits?.['largest-contentful-paint']?.numericValue ?? Infinity,
    total_blocking_time_ms: report.audits?.['total-blocking-time']?.numericValue ?? Infinity,
    cumulative_layout_shift: report.audits?.['cumulative-layout-shift']?.numericValue ?? Infinity,
  };
}

export function summarizeReports(reportsByPath) {
  return Object.fromEntries(Object.entries(reportsByPath).map(([pagePath, reports]) => {
    const metrics = reports.map(reportMetrics);
    const summary = { runs: metrics.length };
    for (const name of Object.keys(metrics[0] || {})) summary[name] = median(metrics.map((item) => item[name]));
    return [pagePath, summary];
  }));
}

export function evaluateBudget(current, baseline, policy, now = new Date()) {
  const issues = [];
  for (const pagePath of policy.critical_paths) {
    const metrics = current[pagePath];
    const prior = baseline?.paths?.[pagePath];
    if (!metrics || metrics.runs < policy.minimum_runs_per_path) {
      issues.push(`RED_LIGHTHOUSE_RUNS_MISSING:${pagePath}`);
      continue;
    }
    if (!prior) {
      issues.push(`RED_LIGHTHOUSE_BASELINE_MISSING:${pagePath}`);
      continue;
    }
    if (metrics.performance < prior.performance - policy.regression_limits.performance_points) {
      issues.push(`RED_PERFORMANCE_REGRESSION:${pagePath}`);
    }
    if (metrics.total_blocking_time_ms > prior.total_blocking_time_ms + policy.regression_limits.total_blocking_time_ms) {
      issues.push(`RED_TBT_REGRESSION:${pagePath}`);
    }
  }

  const enforceAbsolute = now >= new Date(`${policy.enforce_absolute_targets_on_or_after}T00:00:00Z`);
  if (enforceAbsolute) {
    const targets = policy.absolute_targets;
    for (const pagePath of policy.critical_paths) {
      const metrics = current[pagePath];
      if (!metrics) continue;
      for (const name of ['performance', 'best_practices', 'seo', 'accessibility']) {
        if (metrics[name] < targets[name]) issues.push(`RED_${name.toUpperCase()}_TARGET:${pagePath}`);
      }
      for (const name of ['largest_contentful_paint_ms', 'total_blocking_time_ms', 'cumulative_layout_shift']) {
        if (metrics[name] > targets[name]) issues.push(`RED_${name.toUpperCase()}_TARGET:${pagePath}`);
      }
    }
  }
  return { ok: issues.length === 0, enforce_absolute_targets: enforceAbsolute, issues };
}

function loadManifest(manifestPath) {
  const reports = {};
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const result of manifest) {
      const pagePath = pathnameFor(result.url);
      reports[pagePath] ||= [];
      reports[pagePath].push(JSON.parse(fs.readFileSync(result.jsonPath, 'utf8')));
    }
  } else {
    const reportDirectory = path.dirname(manifestPath);
    const reportFiles = fs.readdirSync(reportDirectory).filter((name) => /^lhr-.*\.json$/.test(name));
    for (const name of reportFiles) {
      const report = JSON.parse(fs.readFileSync(path.join(reportDirectory, name), 'utf8'));
      const pagePath = pathnameFor(report.finalDisplayedUrl || report.finalUrl || report.requestedUrl);
      reports[pagePath] ||= [];
      reports[pagePath].push(report);
    }
  }
  return summarizeReports(reports);
}

function main() {
  const args = new Set(process.argv.slice(2));
  const manifestPath = path.resolve('.lighthouseci/manifest.json');
  const policyPath = path.resolve('config/lighthouse-budget.json');
  const baselinePath = path.resolve('config/lighthouse-baseline.json');
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

  const reportDirectory = path.dirname(manifestPath);
  const hasRawReports = fs.existsSync(reportDirectory) && fs.readdirSync(reportDirectory).some((name) => /^lhr-.*\.json$/.test(name));
  if (!fs.existsSync(manifestPath) && !hasRawReports) {
    process.stdout.write(JSON.stringify({ ok: false, issues: ['RED_LIGHTHOUSE_MANIFEST_MISSING'] }) + '\n');
    process.exitCode = 2;
    return;
  }
  const current = loadManifest(manifestPath);
  if (args.has('--write-baseline')) {
    const baseline = { schema_version: 'lighthouse-baseline.v1', captured_at: new Date().toISOString(), paths: current };
    fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    process.stdout.write(JSON.stringify({ ok: true, baseline: path.relative(process.cwd(), baselinePath), paths: Object.keys(current).length }) + '\n');
    return;
  }

  if (!fs.existsSync(baselinePath)) {
    process.stdout.write(JSON.stringify({ ok: false, issues: ['RED_LIGHTHOUSE_BASELINE_MISSING'] }) + '\n');
    process.exitCode = 2;
    return;
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const result = evaluateBudget(current, baseline, policy);
  process.stdout.write(JSON.stringify(result) + '\n');
  if (!result.ok) process.exitCode = 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
