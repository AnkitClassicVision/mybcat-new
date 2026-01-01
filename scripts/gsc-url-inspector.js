#!/usr/bin/env node

/**
 * Google Search Console URL Inspector
 *
 * This script checks the indexing status of critical URLs using the GSC API
 * and generates a report with manual indexing recommendations.
 *
 * Note: The GSC API doesn't support direct indexing requests via API.
 * Users must manually request indexing through the GSC UI for non-indexed URLs.
 *
 * Usage:
 *   node scripts/gsc-url-inspector.js
 *   node scripts/gsc-url-inspector.js --urls "url1,url2,url3"
 *   node scripts/gsc-url-inspector.js --json
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default critical URLs to inspect
const DEFAULT_URLS = [
  'https://mybcat.com/about/',
  'https://mybcat.com/pricing/',
  'https://mybcat.com/careers/',
  'https://mybcat.com/faq/',
  'https://mybcat.com/contact/',
];

// Parse command line arguments
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const customUrlsArg = args.find(arg => arg.startsWith('--urls='));
const urls = customUrlsArg
  ? customUrlsArg.split('=')[1].split(',').map(url => url.trim())
  : DEFAULT_URLS;

const SITE_URL = 'https://mybcat.com/';
const GSC_SCRIPT = `${process.env.HOME}/.claude/skills/google-search-console/gsc.py`;

/**
 * Inspect a URL using the GSC API
 */
function inspectUrl(url) {
  try {
    const result = execSync(
      `python3 "${GSC_SCRIPT}" inspect "${SITE_URL}" "${url}"`,
      { encoding: 'utf-8' }
    );

    return parseInspectionResult(url, result);
  } catch (error) {
    return {
      url,
      error: error.message,
      status: 'ERROR',
      needsIndexing: true,
    };
  }
}

/**
 * Parse the GSC inspection result
 */
function parseInspectionResult(url, result) {
  const lines = result.split('\n');
  const data = {
    url,
    coverageState: '',
    indexingState: '',
    lastCrawl: '',
    fetchState: '',
    robotsState: '',
    mobileUsability: '',
    needsIndexing: false,
    status: 'UNKNOWN',
  };

  lines.forEach(line => {
    if (line.includes('Coverage State:')) {
      data.coverageState = line.split(':')[1].trim();
    } else if (line.includes('Indexing State:')) {
      data.indexingState = line.split(':')[1].trim();
    } else if (line.includes('Last Crawl Time:')) {
      data.lastCrawl = line.split(':')[1].trim();
    } else if (line.includes('Page Fetch State:')) {
      data.fetchState = line.split(':')[1].trim();
    } else if (line.includes('Robots.txt State:')) {
      data.robotsState = line.split(':')[1].trim();
    } else if (line.includes('Mobile Usability:')) {
      data.mobileUsability = line.split(':')[1].trim();
    }
  });

  // Determine status and if indexing is needed
  if (data.coverageState.includes('Discovered')) {
    data.status = 'DISCOVERED_NOT_INDEXED';
    data.needsIndexing = true;
  } else if (data.coverageState.includes('not indexed')) {
    data.status = 'NOT_INDEXED';
    data.needsIndexing = true;
  } else if (data.coverageState.includes('indexed')) {
    data.status = 'INDEXED';
    data.needsIndexing = false;
  } else if (data.lastCrawl === 'Never') {
    data.status = 'NOT_INDEXED';
    data.needsIndexing = true;
  }

  return data;
}

/**
 * Generate a markdown report
 */
function generateReport(results) {
  const timestamp = new Date().toISOString().split('T')[0];

  let report = `# Google Search Console URL Inspection Report\n`;
  report += `**Date:** ${timestamp}\n`;
  report += `**Site:** ${SITE_URL}\n`;
  report += `**URLs Inspected:** ${results.length}\n\n`;
  report += `---\n\n`;

  // Summary
  const indexed = results.filter(r => r.status === 'INDEXED').length;
  const notIndexed = results.filter(r => r.needsIndexing).length;

  report += `## Summary\n\n`;
  report += `| Status | Count |\n`;
  report += `|--------|-------|\n`;
  report += `| **Indexed** | ${indexed} |\n`;
  report += `| **Needs Indexing** | ${notIndexed} |\n`;
  report += `| **Total** | ${results.length} |\n\n`;

  // Indexed URLs
  const indexedUrls = results.filter(r => r.status === 'INDEXED');
  if (indexedUrls.length > 0) {
    report += `## ✓ Indexed URLs (${indexedUrls.length})\n\n`;
    report += `These URLs are successfully indexed and appear in Google Search.\n\n`;
    report += `| URL | Last Crawled |\n`;
    report += `|-----|-------------|\n`;
    indexedUrls.forEach(r => {
      report += `| ${r.url} | ${r.lastCrawl} |\n`;
    });
    report += `\n`;
  }

  // URLs needing indexing
  const needsIndexing = results.filter(r => r.needsIndexing);
  if (needsIndexing.length > 0) {
    report += `## ⚠ URLs Requiring Manual Indexing (${needsIndexing.length})\n\n`;
    report += `**IMPORTANT:** The Google Search Console API does not support automated indexing requests.\n`;
    report += `You must manually request indexing for these URLs through the GSC web interface.\n\n`;

    report += `### How to Request Indexing:\n`;
    report += `1. Go to [Google Search Console](https://search.google.com/search-console)\n`;
    report += `2. Select your property (mybcat.com)\n`;
    report += `3. Use the URL Inspection tool (top search bar)\n`;
    report += `4. Enter the URL and click "Request Indexing"\n\n`;

    report += `### URLs to Process:\n\n`;
    report += `| URL | Coverage State | Last Crawl |\n`;
    report += `|-----|----------------|------------|\n`;
    needsIndexing.forEach(r => {
      report += `| ${r.url} | ${r.coverageState} | ${r.lastCrawl} |\n`;
    });
    report += `\n`;

    // Provide copy-paste list
    report += `### Quick Copy-Paste List:\n\n`;
    report += `\`\`\`\n`;
    needsIndexing.forEach(r => {
      report += `${r.url}\n`;
    });
    report += `\`\`\`\n\n`;
  }

  // Detailed results
  report += `---\n\n`;
  report += `## Detailed Inspection Results\n\n`;
  results.forEach(r => {
    const statusEmoji = r.status === 'INDEXED' ? '✓' : '⚠';
    report += `### ${statusEmoji} ${r.url}\n\n`;
    report += `| Property | Value |\n`;
    report += `|----------|-------|\n`;
    report += `| **Coverage State** | ${r.coverageState} |\n`;
    report += `| **Indexing State** | ${r.indexingState} |\n`;
    report += `| **Last Crawl Time** | ${r.lastCrawl} |\n`;
    report += `| **Page Fetch State** | ${r.fetchState} |\n`;
    report += `| **Robots.txt State** | ${r.robotsState} |\n`;
    report += `| **Mobile Usability** | ${r.mobileUsability} |\n`;
    report += `| **Status** | ${r.status} |\n`;
    report += `| **Needs Manual Indexing** | ${r.needsIndexing ? 'YES' : 'NO'} |\n\n`;
  });

  report += `---\n\n`;
  report += `## Next Steps\n\n`;
  report += `1. Review the URLs that need manual indexing\n`;
  report += `2. Log into [Google Search Console](https://search.google.com/search-console)\n`;
  report += `3. Request indexing for each non-indexed URL using the URL Inspection tool\n`;
  report += `4. Monitor indexing progress over the next 1-2 weeks\n`;
  report += `5. Re-run this script to verify indexing status\n\n`;

  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Inspecting URLs in Google Search Console...\n');

  const results = [];

  for (const url of urls) {
    process.stdout.write(`Checking: ${url}... `);
    const result = inspectUrl(url);
    results.push(result);

    const statusIcon = result.status === 'INDEXED' ? '✓' : '⚠';
    console.log(`${statusIcon} ${result.status}`);
  }

  console.log('\n✅ Inspection complete!\n');

  if (jsonOutput) {
    // Output JSON
    console.log(JSON.stringify(results, null, 2));
  } else {
    // Generate and save report
    const report = generateReport(results);
    const reportPath = join(process.cwd(), 'gsc_critical_urls_report.md');
    fs.writeFileSync(reportPath, report);

    console.log(`📄 Report saved to: ${reportPath}\n`);

    // Print summary
    const needsIndexing = results.filter(r => r.needsIndexing);
    if (needsIndexing.length > 0) {
      console.log(`⚠️  ${needsIndexing.length} URL(s) need manual indexing request:`);
      needsIndexing.forEach(r => console.log(`   - ${r.url}`));
      console.log('\n📝 Follow the instructions in the report to request indexing.\n');
    } else {
      console.log('✓ All URLs are indexed!\n');
    }
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
