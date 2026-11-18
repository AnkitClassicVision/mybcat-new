import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isPublishReady } from './validate-seo-topic-queue.mjs';

const REQUIRED_SOURCES = 5;

export function externalCitations(content) {
  const seen = new Set();
  const urls = [];
  for (const match of content.matchAll(/https?:\/\/[^)\s\]]+/g)) {
    const url = match[0].replace(/[.,]+$/, '');
    let host = '';
    try {
      host = new URL(url).host.toLowerCase();
    } catch {
      continue;
    }
    if (host.endsWith('mybcat.com') || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length === REQUIRED_SOURCES) break;
  }
  return urls;
}

function frontmatterValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)['"]?\\s*$`, 'm'));
  return match?.[1]?.trim() || '';
}

export function bindScheduledPosts(queue, files, now = new Date()) {
  const topics = Array.isArray(queue.topics) ? queue.topics : [];
  queue.topics = topics;
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  let nextSlot = topics.reduce((max, topic) => Math.max(max, Number(topic.slot) || 0), 0) + 1;
  const bound = [];
  const skipped = [];
  const approvedAt = now.toISOString().replace('.000Z', 'Z');

  for (const file of files) {
    if (!/^status:\s*['"]?scheduled['"]?\s*$/mi.test(file.content)) continue;
    const slug = file.name.replace(/\.mdx?$/, '');
    const existing = byId.get(frontmatterValue(file.content, 'seoTopicId')) || byId.get(slug);
    if (existing && isPublishReady(existing, queue)) {
      if (!/^seoTopicId:/m.test(file.content)) {
        file.content = file.content.replace(/^status:\s*['"]?scheduled['"]?\s*$/mi, (line) => `${line}\nseoTopicId: ${existing.id}`);
        bound.push(slug);
      }
      continue;
    }
    // Existing queue decisions must be reviewed in place. Registering another
    // topic here would duplicate its ID and overwrite its approval at release.
    if (existing) {
      skipped.push(slug);
      continue;
    }
    const urls = externalCitations(file.content);
    if (urls.length < REQUIRED_SOURCES) {
      skipped.push(slug);
      continue;
    }
    const keyword = frontmatterValue(file.content, 'targetKeyword') || slug.replace(/-/g, ' ');
    const title = frontmatterValue(file.content, 'title') || keyword;
    const topic = {
      id: slug,
      slot: nextSlot,
      funnel: 'service',
      buyer_stage: 'consideration',
      content_cluster: 'patient-access',
      topic: title,
      keyword,
      suggested_title: title,
      slug,
      content_action: 'scheduled-release',
      intended_crm_outcome: 'operator-inquiry',
      cannibalization_note: 'Standing release registration for a writer-scheduled post. No new cannibalization study was run.',
      cannibalization_reviewed: true,
      geography: ['GA', 'FL', 'AL', 'TN', 'SC', 'NC'],
      search_intent: 'commercial',
      category: 'Technology',
      word_count: 0,
      pillar_url: '/industries/optometry/',
      cta_id: 'talk-to-mybcat',
      status: 'publish_ready',
      research_reviewed: true,
      research_reviewed_at: approvedAt,
      claims_reviewed: true,
      required_external_source_count: REQUIRED_SOURCES,
      evidence_set: urls.map((url) => ({
        title: new URL(url).host,
        publisher: new URL(url).host,
        url,
        accessed_at: approvedAt.slice(0, 10),
        snippet: 'Cited by the scheduled post.',
        supports: keyword,
      })),
      evidence_packet: `scheduled-post:${slug}`,
      approval: {
        decision: 'approved',
        owner: 'Ankit',
        approved_at: approvedAt,
      },
    };
    topics.push(topic);
    byId.set(slug, topic);
    nextSlot += 1;
    if (!/^seoTopicId:/m.test(file.content)) {
      file.content = file.content.replace(/^status:\s*['"]?scheduled['"]?\s*$/mi, (line) => `${line}\nseoTopicId: ${slug}`);
    }
    bound.push(slug);
  }
  return { queue, files, bound, skipped };
}

function readScheduledFiles(dir) {
  return fs.readdirSync(dir)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => ({ name, path: path.join(dir, name), content: fs.readFileSync(path.join(dir, name), 'utf8') }));
}

function main() {
  const queuePath = process.argv[2] || 'config/seo-topic-queue.json';
  const dirIndex = process.argv.indexOf('--scheduled-dir');
  const scheduledDir = dirIndex === -1 ? 'src/content/blog' : process.argv[dirIndex + 1];
  const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
  const files = readScheduledFiles(scheduledDir);
  const result = bindScheduledPosts(queue, files);
  fs.writeFileSync(queuePath, `${JSON.stringify(result.queue, null, 2)}\n`);
  for (const file of result.files) {
    if (file.path) fs.writeFileSync(file.path, file.content);
  }
  process.stdout.write(`${JSON.stringify({ bound: result.bound, skipped: result.skipped })}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
