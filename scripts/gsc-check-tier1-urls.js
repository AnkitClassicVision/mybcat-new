#!/usr/bin/env node

/**
 * Google Search Console - Tier 1 Priority URLs Inspector
 *
 * This script checks the indexing status of Tier 1 priority URLs
 * identified in the GSC audit report as business-critical pages.
 *
 * Usage:
 *   node scripts/gsc-check-tier1-urls.js
 */

import { execSync } from 'child_process';

// Tier 1 - Business Critical URLs from the GSC report
const TIER1_URLS = [
  'https://mybcat.com/about/',
  'https://mybcat.com/pricing/',
  'https://mybcat.com/solutions/integrations/',
  'https://mybcat.com/case-studies/classic-vision-care/',
  'https://mybcat.com/enterprise/veterinary-groups/',
];

// Additional important URLs
const TIER2_URLS = [
  'https://mybcat.com/careers/',
  'https://mybcat.com/faq/',
  'https://mybcat.com/industries/optometry/',
  'https://mybcat.com/industries/dermatology/',
  'https://mybcat.com/compare/',
];

const ALL_URLS = [...TIER1_URLS, ...TIER2_URLS];

console.log('🔍 Checking Tier 1 & 2 Priority URLs in Google Search Console\n');
console.log(`Total URLs to check: ${ALL_URLS.length}\n`);
console.log('=' .repeat(70));

let indexedCount = 0;
let notIndexedCount = 0;
let errorCount = 0;

const results = [];

for (const url of ALL_URLS) {
  const tier = TIER1_URLS.includes(url) ? 'T1' : 'T2';
  process.stdout.write(`[${tier}] ${url}... `);

  try {
    const result = execSync(
      `python3 ~/.claude/skills/google-search-console/gsc.py inspect "https://mybcat.com/" "${url}"`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    const isIndexed = result.includes('Submitted and indexed');
    const isDiscovered = result.includes('Discovered - currently not indexed');
    const lastCrawl = result.match(/Last Crawl Time:\s+(.+)/)?.[1] || 'Unknown';

    if (isIndexed) {
      console.log('✅ INDEXED');
      indexedCount++;
      results.push({ url, status: 'INDEXED', tier, lastCrawl });
    } else if (isDiscovered) {
      console.log('⚠️  DISCOVERED (Not Indexed)');
      notIndexedCount++;
      results.push({ url, status: 'DISCOVERED', tier, lastCrawl });
    } else {
      console.log('❌ NOT FOUND');
      notIndexedCount++;
      results.push({ url, status: 'NOT_FOUND', tier, lastCrawl });
    }
  } catch (error) {
    console.log('❌ ERROR');
    errorCount++;
    results.push({ url, status: 'ERROR', tier, error: error.message });
  }
}

console.log('=' .repeat(70));
console.log('\n📊 Summary:\n');
console.log(`Total URLs:        ${ALL_URLS.length}`);
console.log(`✅ Indexed:        ${indexedCount} (${Math.round(indexedCount/ALL_URLS.length*100)}%)`);
console.log(`⚠️  Not Indexed:   ${notIndexedCount} (${Math.round(notIndexedCount/ALL_URLS.length*100)}%)`);
console.log(`❌ Errors:         ${errorCount}`);

// Show URLs that need indexing
const needsIndexing = results.filter(r => r.status !== 'INDEXED');
if (needsIndexing.length > 0) {
  console.log('\n⚠️  URLs Requiring Manual Indexing:\n');
  needsIndexing.forEach(r => {
    const tierLabel = r.tier === 'T1' ? '[TIER 1 - CRITICAL]' : '[TIER 2]';
    console.log(`${tierLabel} ${r.url}`);
  });

  console.log('\n📝 Action Required:');
  console.log('   1. Go to https://search.google.com/search-console');
  console.log('   2. Use URL Inspection tool for each URL above');
  console.log('   3. Click "Request Indexing" for each');
  console.log('   4. Re-run this script in 1-2 weeks to verify\n');
} else {
  console.log('\n✅ All URLs are indexed!\n');
}
