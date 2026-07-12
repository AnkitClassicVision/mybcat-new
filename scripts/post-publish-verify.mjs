import { readFile } from 'node:fs/promises';

const SITE_ORIGIN = 'https://mybcat.com';
const SITEMAP_INDEX_URL = `${SITE_ORIGIN}/sitemap-index.xml`;
const ROBOTS_URL = `${SITE_ORIGIN}/robots.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_RETRIES = 10;
const DEFAULT_INTERVAL_SECONDS = 60;
const REQUEST_TIMEOUT_MS = 30_000;

function usage() {
  return [
    'Usage: node scripts/post-publish-verify.mjs --slug <slug> [options]',
    '',
    'Options:',
    '  --slug <slug>              Repeatable or comma-separated',
    `  --retries <N>              Verification attempts (default: ${DEFAULT_RETRIES})`,
    `  --interval-seconds <N>     Base retry interval (default: ${DEFAULT_INTERVAL_SECONDS})`,
    '  --skip-indexnow            Do not submit verified URLs to IndexNow',
  ].join('\n');
}

function parseInteger(value, flag, { minimum }) {
  if (!/^\d+$/.test(value ?? '')) {
    throw new Error(`${flag} must be an integer greater than or equal to ${minimum}.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(`${flag} must be an integer greater than or equal to ${minimum}.`);
  }
  return parsed;
}

function parseArgs(argv) {
  const slugValues = [];
  let retries = DEFAULT_RETRIES;
  let intervalSeconds = DEFAULT_INTERVAL_SECONDS;
  let skipIndexNow = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--slug') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) throw new Error('--slug requires a value.');
      slugValues.push(value);
    } else if (argument === '--retries') {
      retries = parseInteger(argv[++index], '--retries', { minimum: 1 });
    } else if (argument === '--interval-seconds') {
      intervalSeconds = parseInteger(argv[++index], '--interval-seconds', { minimum: 0 });
    } else if (argument === '--skip-indexnow') {
      skipIndexNow = true;
    } else if (argument === '--help' || argument === '-h') {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  const slugs = [...new Set(
    slugValues
      .flatMap((value) => value.split(','))
      .map((slug) => slug.trim())
      .filter(Boolean),
  )];

  if (slugs.length === 0) throw new Error('At least one --slug is required.');
  for (const slug of slugs) {
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(slug)) {
      throw new Error(`Invalid slug: ${JSON.stringify(slug)}`);
    }
  }

  return { slugs, retries, intervalSeconds, skipIndexNow };
}

function canonicalUrl(slug) {
  return `${SITE_ORIGIN}/blog/${slug}/`;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    redirect: 'follow',
    ...options,
    headers: {
      'User-Agent': 'MyBCAT-Post-Publish-Verifier/1.0',
      ...options.headers,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function parseAttributes(tag) {
  const attributes = new Map();
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attributePattern.exec(tag)) !== null) {
    const name = match[1].toLowerCase();
    if (name === 'meta' || name === 'link') continue;
    attributes.set(name, decodeEntities(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attributes;
}

function containsNoindex(value) {
  return /(?:^|[,;\s])(?:noindex|none)(?:$|[,;\s])/i.test(value ?? '');
}

function inspectHtml(html) {
  const metaRobotsNoindex = [...html.matchAll(/<meta\b[^>]*>/gi)].some((match) => {
    const attributes = parseAttributes(match[0]);
    return attributes.get('name')?.toLowerCase() === 'robots'
      && containsNoindex(attributes.get('content'));
  });

  const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => parseAttributes(match[0]))
    .filter((attributes) => (attributes.get('rel') ?? '').toLowerCase().split(/\s+/).includes('canonical'))
    .map((attributes) => attributes.get('href'))
    .filter(Boolean);

  return { metaRobotsNoindex, canonicals };
}

function extractXmlLocations(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeEntities(match[1].trim()))
    .filter(Boolean);
}

async function loadSitemapUrls() {
  try {
    const indexResponse = await fetchWithTimeout(SITEMAP_INDEX_URL);
    if (indexResponse.status !== 200) {
      return { urls: new Set(), error: `sitemap index returned HTTP ${indexResponse.status}` };
    }

    const indexXml = await indexResponse.text();
    const childUrls = extractXmlLocations(indexXml);
    if (childUrls.length === 0) {
      return { urls: new Set(), error: 'sitemap index contains no child sitemap locations' };
    }

    const childResults = await Promise.all(childUrls.map(async (childUrl) => {
      try {
        const response = await fetchWithTimeout(childUrl);
        if (response.status !== 200) {
          return { childUrl, locations: [], error: `HTTP ${response.status}` };
        }
        return { childUrl, locations: extractXmlLocations(await response.text()), error: null };
      } catch (error) {
        return { childUrl, locations: [], error: error.message };
      }
    }));

    const urls = new Set(childResults.flatMap((result) => result.locations));
    const failedChildren = childResults.filter((result) => result.error);
    const error = failedChildren.length > 0
      ? `${failedChildren.length} of ${childResults.length} child sitemaps could not be read`
      : null;
    return { urls, error };
  } catch (error) {
    return { urls: new Set(), error: `sitemap request failed: ${error.message}` };
  }
}

function robotsPatternMatches(pattern, pathname) {
  const endAnchor = pattern.endsWith('$');
  const rulePath = endAnchor ? pattern.slice(0, -1) : pattern;
  const escaped = rulePath.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  const source = endAnchor ? `${escaped}$` : `${escaped}.*`;
  return new RegExp(`^${source}`).test(pathname);
}

function robotsAllows(robotsText, pathname) {
  const groups = [];
  let agents = [];
  let rules = [];
  let sawRule = false;

  const flush = () => {
    if (agents.length > 0) groups.push({ agents, rules });
    agents = [];
    rules = [];
    sawRule = false;
  };

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const directive = line.match(/^([^:]+):\s*(.*)$/);
    if (!directive) continue;
    const name = directive[1].trim().toLowerCase();
    const value = directive[2].trim();

    if (name === 'user-agent') {
      if (sawRule) flush();
      agents.push(value.toLowerCase());
    } else if ((name === 'allow' || name === 'disallow') && agents.length > 0) {
      sawRule = true;
      if (value) rules.push({ type: name, pattern: value });
    }
  }
  flush();

  const applicableRules = groups
    .filter((group) => group.agents.includes('*'))
    .flatMap((group) => group.rules)
    .filter((rule) => robotsPatternMatches(rule.pattern, pathname));

  if (applicableRules.length === 0) return true;
  applicableRules.sort((left, right) => {
    const specificity = right.pattern.replace(/[*$]/g, '').length - left.pattern.replace(/[*$]/g, '').length;
    if (specificity !== 0) return specificity;
    return left.type === right.type ? 0 : left.type === 'allow' ? -1 : 1;
  });
  return applicableRules[0].type === 'allow';
}

async function loadRobots() {
  try {
    const response = await fetchWithTimeout(ROBOTS_URL);
    if (response.status !== 200) {
      return { text: null, error: `robots.txt returned HTTP ${response.status}` };
    }
    return { text: await response.text(), error: null };
  } catch (error) {
    return { text: null, error: `robots.txt request failed: ${error.message}` };
  }
}

async function verifyPage(slug) {
  const expectedUrl = canonicalUrl(slug);
  const failures = [];

  try {
    const response = await fetchWithTimeout(expectedUrl);
    const html = await response.text();
    const { metaRobotsNoindex, canonicals } = inspectHtml(html);

    if (response.status !== 200) {
      failures.push(['http-status', `expected 200, received ${response.status}`]);
    }
    if (response.url !== expectedUrl) {
      failures.push(['final-url', `expected ${expectedUrl}, received ${response.url}`]);
    }
    if (metaRobotsNoindex) {
      failures.push(['meta-robots', 'HTML contains a meta robots noindex directive']);
    }
    const xRobotsTag = response.headers.get('x-robots-tag');
    if (containsNoindex(xRobotsTag)) {
      failures.push(['x-robots-tag', `response header contains noindex: ${xRobotsTag}`]);
    }
    if (canonicals.length !== 1 || canonicals[0] !== expectedUrl) {
      const found = canonicals.length > 0 ? canonicals.join(', ') : 'none';
      failures.push(['canonical', `expected exactly ${expectedUrl}, found ${found}`]);
    }
  } catch (error) {
    const reason = `page request failed: ${error.message}`;
    for (const assertion of ['http-status', 'final-url', 'meta-robots', 'x-robots-tag', 'canonical']) {
      failures.push([assertion, reason]);
    }
  }

  return failures;
}

async function verifyAll(slugs) {
  const [pageResults, sitemap, robots] = await Promise.all([
    Promise.all(slugs.map(async (slug) => [slug, await verifyPage(slug)])),
    loadSitemapUrls(),
    loadRobots(),
  ]);
  const failures = new Map(pageResults);

  for (const slug of slugs) {
    const expectedUrl = canonicalUrl(slug);
    if (!sitemap.urls.has(expectedUrl)) {
      const detail = sitemap.error
        ? `${expectedUrl} was not found; ${sitemap.error}`
        : `${expectedUrl} was not found in any child sitemap`;
      failures.get(slug).push(['sitemap', detail]);
    }

    if (robots.error) {
      failures.get(slug).push(['robots', robots.error]);
    } else if (!robotsAllows(robots.text, new URL(expectedUrl).pathname)) {
      failures.get(slug).push(['robots', `${new URL(expectedUrl).pathname} is disallowed by robots.txt`]);
    }
  }

  return failures;
}

function hasFailures(failures) {
  return [...failures.values()].some((items) => items.length > 0);
}

function printFailures(failures) {
  console.error('Post-publish verification failed:');
  for (const [slug, assertions] of failures) {
    if (assertions.length === 0) continue;
    console.error(`- ${slug}`);
    for (const [assertion, detail] of assertions) {
      console.error(`  - ${assertion}: ${detail}`);
    }
  }
}

function printSuccesses(urls) {
  console.log(`Post-publish verification passed for ${urls.length} URL(s):`);
  for (const url of urls) {
    console.log(`- ${url}`);
    console.log('  - http-status: HTTP 200');
    console.log(`  - final-url: ${url}`);
    console.log('  - meta-robots: no noindex directive');
    console.log('  - x-robots-tag: no noindex directive');
    console.log(`  - canonical: ${url}`);
    console.log('  - sitemap: URL found in a child sitemap');
    console.log(`  - robots: ${new URL(url).pathname} is allowed`);
  }
}

async function verifyWithRetries(slugs, retries, intervalSeconds) {
  let failures;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    console.log(`Verification attempt ${attempt}/${retries} for ${slugs.length} slug(s)...`);
    failures = await verifyAll(slugs);
    if (!hasFailures(failures)) return;

    if (attempt < retries) {
      const delaySeconds = intervalSeconds * attempt;
      console.log(`Assertions still failing; retrying the whole verification set in ${delaySeconds}s.`);
      await sleep(delaySeconds * 1_000);
    }
  }

  printFailures(failures);
  process.exitCode = 1;
}

async function discoverIndexNowKey() {
  const source = await readFile(new URL('./publish-scheduled.js', import.meta.url), 'utf8');
  const match = source.match(/\bconst\s+INDEXNOW_KEY\s*=\s*(['"])([^'"]+)\1/);
  if (!match?.[2]) {
    throw new Error('could not discover the existing INDEXNOW_KEY convention');
  }
  return match[2];
}

async function submitIndexNow(urls) {
  const key = await discoverIndexNowKey();
  const body = JSON.stringify({
    host: new URL(SITE_ORIGIN).hostname,
    key,
    keyLocation: `${SITE_ORIGIN}/${key}.txt`,
    urlList: urls,
  });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let response;
    try {
      response = await fetchWithTimeout(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (error) {
      if (attempt === 3) throw new Error(`request failed after 3 attempts: ${error.message}`);
      const delaySeconds = 5 * attempt;
      console.log(`IndexNow request failed; retrying in ${delaySeconds}s (${attempt}/3).`);
      await sleep(delaySeconds * 1_000);
      continue;
    }

    if (response.status === 200 || response.status === 202) {
      console.log(`IndexNow accepted ${urls.length} URL(s) with HTTP ${response.status}.`);
      return;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable) {
      throw new Error(`hard failure: IndexNow returned HTTP ${response.status}`);
    }
    if (attempt === 3) {
      throw new Error(`retryable failure persisted after 3 attempts: HTTP ${response.status}`);
    }

    const delaySeconds = 5 * attempt;
    console.log(`IndexNow returned HTTP ${response.status}; retrying in ${delaySeconds}s (${attempt}/3).`);
    await sleep(delaySeconds * 1_000);
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Argument error: ${error.message}\n\n${usage()}`);
    process.exitCode = 2;
    return;
  }

  await verifyWithRetries(options.slugs, options.retries, options.intervalSeconds);
  if (process.exitCode === 1) return;

  const urls = options.slugs.map(canonicalUrl);
  printSuccesses(urls);

  if (options.skipIndexNow) {
    console.log('IndexNow submission skipped by request.');
    return;
  }

  try {
    await submitIndexNow(urls);
  } catch (error) {
    console.error(`IndexNow submission failed after liveness checks passed: ${error.message}`);
    process.exitCode = 3;
  }
}

await main();
