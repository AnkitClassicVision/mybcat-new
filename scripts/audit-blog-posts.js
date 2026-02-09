import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import sharp from 'sharp';

const DEFAULT_FROM = '2025-12-09';

function parseArgs(argv) {
  const args = new Map();
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const [key, value = 'true'] = raw.slice(2).split('=');
    args.set(key, value);
  }
  const failOnIssuesRaw = args.get('failOnIssues');
  const failOnIssues = failOnIssuesRaw == null ? true : failOnIssuesRaw !== 'false';
  return {
    from: args.get('from') ?? DEFAULT_FROM,
    to: args.get('to') ?? new Date().toISOString().slice(0, 10),
    site: args.get('site') ?? 'https://mybcat.com',
    dir: args.get('dir') ?? 'src/content/blog',
    csv: args.get('csv'),
    failOnIssues,
  };
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIsoDate(value) {
  const date = toDate(value);
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function normalizeUrl(url) {
  if (!url) return '';
  return String(url).trim();
}

function ensureTrailingSlash(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (trimmed.endsWith('/')) return trimmed;
  return `${trimmed}/`;
}

function extractUrls(markdown) {
  const urls = new Set();

  // Markdown links: [text](url)
  const mdLinkRe = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi;
  for (const match of markdown.matchAll(mdLinkRe)) {
    urls.add(match[1]);
  }

  // Autolinks / bare URLs.
  const bareUrlRe = /\bhttps?:\/\/[^\s<>()]+/gi;
  for (const match of markdown.matchAll(bareUrlRe)) {
    const candidate = match[0].replace(/[),.]+$/g, '');
    urls.add(candidate);
  }

  return [...urls];
}

function hasSourcesSection(markdown) {
  return (
    /\n##\s+sources\b/i.test(markdown) ||
    /\n\*sources:\s*/i.test(markdown) ||
    /\n_sources:\s*/i.test(markdown)
  );
}

function getHeadingCount(markdown, level) {
  const re = new RegExp(`\\n${'#'.repeat(level)}\\s+`, 'g');
  return (markdown.match(re) || []).length;
}

function findBadCtaPlaceholders(markdown) {
  const needles = [
    'Schedule a Consultation Today',
    'Book a Discovery Call Today',
  ];

  const lines = markdown.split('\n');
  const hits = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const needle of needles) {
      if (!line.includes(needle)) continue;
      const hasLinkSyntax = /\[[^\]]*\]\([^)]+\)/.test(line) || /<a\s/i.test(line) || /href\s*=/.test(line);
      if (!hasLinkSyntax) hits.push({ lineNumber: i + 1, line: line.trim(), needle });
    }
  }
  return hits;
}

function formatBool(value) {
  return value ? '✅' : '❌';
}

function formatCount(value) {
  return typeof value === 'number' ? String(value) : '';
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseCsvLine(line) {
  // Minimal CSV parsing for our tracker file: supports quoted fields.
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  out.push(current);
  return out.map((v) => v.trim());
}

async function readTrackerCsv(csvPath) {
  const raw = await fs.readFile(csvPath, 'utf8');
  const lines = raw
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const slugIndex = header.indexOf('slug');
  const urlIndex = header.indexOf('url');
  const publishDateIndex = header.indexOf('publish_date');

  if (slugIndex === -1) throw new Error(`CSV missing 'slug' column: ${csvPath}`);

  const rows = [];
  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);
    const slug = fields[slugIndex];
    if (!slug) continue;
    rows.push({
      slug,
      url: urlIndex === -1 ? undefined : fields[urlIndex],
      publishDate: publishDateIndex === -1 ? undefined : fields[publishDateIndex],
    });
  }
  return rows;
}

async function getImageInfo(publicPath) {
  if (!publicPath || typeof publicPath !== 'string') return { exists: false };
  if (!publicPath.startsWith('/')) return { exists: false, reason: 'not-a-public-path' };

  const absolute = path.join(process.cwd(), 'public', publicPath);
  const exists = await fileExists(absolute);
  if (!exists) return { exists: false, absolute };

  try {
    const meta = await sharp(absolute).metadata();
    return {
      exists: true,
      absolute,
      width: meta.width,
      height: meta.height,
      format: meta.format,
    };
  } catch (error) {
    return {
      exists: true,
      absolute,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const { from, to, site, dir, csv, failOnIssues } = parseArgs(process.argv.slice(2));

  const fromDate = toDate(from);
  const toDateValue = toDate(to);
  if (!fromDate || !toDateValue) {
    console.error(`Invalid date range. from=${from} to=${to}`);
    process.exitCode = 2;
    return;
  }

  const trackerRowsAll = csv ? await readTrackerCsv(csv) : [];
  const trackerRows = csv
    ? trackerRowsAll.filter((row) => {
        const publishDate = toDate(row.publishDate);
        if (!publishDate) return true;
        return publishDate >= fromDate && publishDate <= toDateValue;
      })
    : [];
  const trackerBySlug = new Map(trackerRows.map((r) => [r.slug, r]));

  const targetDir = path.join(process.cwd(), dir);
  const files = [];

  if (csv) {
    for (const row of trackerRows) {
      const mdPath = path.join(targetDir, `${row.slug}.md`);
      const mdxPath = path.join(targetDir, `${row.slug}.mdx`);
      if (await fileExists(mdPath)) {
        files.push(mdPath);
        continue;
      }
      if (await fileExists(mdxPath)) {
        files.push(mdxPath);
        continue;
      }
      files.push(mdPath); // report missing as .md by default
    }
  } else {
    const entries = await fs.readdir(targetDir);
    files.push(
      ...entries
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
        .map((f) => path.join(targetDir, f))
    );
  }

  const audits = [];
  for (const filePath of files) {
    if (!(await fileExists(filePath))) {
      const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, '');
      const tracker = trackerBySlug.get(slug);
      const expectedUrl = ensureTrailingSlash(tracker?.url) || `${site.replace(/\/+$/g, '')}/blog/${slug}/`;
      audits.push({
        slug,
        filePath: path.relative(process.cwd(), filePath),
        publishDate: tracker?.publishDate ?? '',
        status: 'missing',
        title: '',
        hasSeoTitle: false,
        hasSeoDescription: false,
        canonicalOk: false,
        featuredImage: '',
        imageExists: false,
        imageOk: false,
        hasSources: false,
        externalCitationCount: 0,
        hasCtaLink: false,
        badCta: [],
        hasEmDash: false,
        h2Count: 0,
        expectedUrl,
      });
      continue;
    }

    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = matter(raw);
    const publishDate = toDate(parsed.data.publishDate);
    if (!csv) {
      if (!publishDate) continue;
      if (publishDate < fromDate || publishDate > toDateValue) continue;
    }

    const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, '');
    const tracker = trackerBySlug.get(slug);
    const expectedUrl = ensureTrailingSlash(tracker?.url) || `${site.replace(/\/+$/g, '')}/blog/${slug}/`;
    const canonical = ensureTrailingSlash(normalizeUrl(parsed.data.canonical));
    const canonicalOk = !canonical || canonical === expectedUrl;

    const urls = extractUrls(parsed.content);
    const externalUrls = urls.filter((u) => {
      const lower = u.toLowerCase();
      return !lower.includes('mybcat.com') && !lower.includes('hubspot.mybcat.com');
    });

    const featuredImage = normalizeUrl(parsed.data.featuredImage);
    const imageInfo = await getImageInfo(featuredImage);
    const imageOk = !featuredImage || (imageInfo.exists && imageInfo.width === 1200 && imageInfo.height === 630);

    const badCta = findBadCtaPlaceholders(parsed.content);
    const hasCtaLink =
      /\]\(https:\/\/hubspot\.mybcat\.com\/meetings\/ankit98\/mybcat-discovery-call\)/i.test(parsed.content) ||
      /\]\(\/contact\/\)/i.test(parsed.content) ||
      /\bhref=\\?["']\/contact\/\\?["']/i.test(parsed.content);

    const hasEmDash = /—/.test(parsed.content);

    audits.push({
      slug,
      filePath: path.relative(process.cwd(), filePath),
      publishDate: csv ? (tracker?.publishDate ?? toIsoDate(publishDate)) : toIsoDate(publishDate),
      status: parsed.data.status ?? 'draft',
      title: parsed.data.title ?? '',
      hasSeoTitle: Boolean(parsed.data.seoTitle),
      hasSeoDescription: Boolean(parsed.data.seoDescription),
      canonicalOk,
      featuredImage: featuredImage || '',
      imageExists: featuredImage ? Boolean(imageInfo.exists) : true,
      imageOk,
      hasSources: hasSourcesSection(parsed.content),
      externalCitationCount: externalUrls.length,
      hasCtaLink,
      badCta,
      hasEmDash,
      h2Count: getHeadingCount(parsed.content, 2),
      expectedUrl,
    });
  }

  audits.sort((a, b) => (a.publishDate || '').localeCompare(b.publishDate || ''));

  console.log(`# Blog Audit (${csv ? `tracker: ${csv}` : `${from} → ${to}`})`);
  console.log('');
  console.log(`Found ${audits.length} posts in range.`);
  console.log('');

  console.log(
    [
      'publishDate',
      'slug',
      'status',
      'seoTitle',
      'seoDesc',
      'canonical',
      'image1200x630',
      'sources',
      'extCites',
      'ctaLink',
      'badCTA',
      'emDash',
    ].join(' | ')
  );
  console.log(
    [
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
      '---',
    ].join(' | ')
  );

  for (const a of audits) {
    console.log(
      [
        a.publishDate ?? '',
        a.slug,
        a.status,
        formatBool(a.hasSeoTitle),
        formatBool(a.hasSeoDescription),
        formatBool(a.canonicalOk),
        formatBool(a.imageOk),
        formatBool(a.hasSources),
        formatCount(a.externalCitationCount),
        formatBool(a.hasCtaLink),
        a.badCta.length ? `❌ (${a.badCta.length})` : '✅',
        formatBool(!a.hasEmDash),
      ].join(' | ')
    );
  }

  const failures = audits.filter((a) => {
    return (
      !a.hasSeoTitle ||
      !a.hasSeoDescription ||
      !a.canonicalOk ||
      !a.imageOk ||
      !a.hasSources ||
      a.externalCitationCount < 2 ||
      !a.hasCtaLink ||
      a.badCta.length > 0 ||
      a.hasEmDash
    );
  });

  console.log('');
  console.log(`## Posts Needing Attention (${failures.length})`);
  console.log('');

  for (const a of failures) {
    const problems = [];
    if (!a.hasSeoTitle) problems.push('missing seoTitle');
    if (!a.hasSeoDescription) problems.push('missing seoDescription');
    if (!a.canonicalOk) problems.push('canonical mismatch');
    if (!a.imageOk) problems.push('featuredImage missing or not 1200x630');
    if (!a.hasSources) problems.push('missing Sources section');
    if (a.externalCitationCount < 2) problems.push(`low external citations (${a.externalCitationCount})`);
    if (!a.hasCtaLink) problems.push('missing CTA link');
    if (a.badCta.length) problems.push(`bad CTA placeholder (${a.badCta.map((h) => `L${h.lineNumber}`).join(', ')})`);
    if (a.hasEmDash) problems.push('contains em dash');

    console.log(`- ${a.publishDate} \`${a.slug}\` (${a.filePath}): ${problems.join('; ')}`);
  }

  if (failOnIssues && failures.length > 0) {
    process.exitCode = 1;
  }
}

await main();
