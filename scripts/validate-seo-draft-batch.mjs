#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const queuePath = path.join(repoRoot, 'config', 'seo-topic-queue.json');
const reviewDir = process.env.BLOG_WRITER_REVIEW_EVIDENCE_DIR
  ? path.resolve(process.env.BLOG_WRITER_REVIEW_EVIDENCE_DIR)
  : path.resolve(repoRoot, '..', 'blog_writer', 'blogs', 'review', 'evidence');

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const issues = [];
const rows = [];

function addIssue(topicId, code) {
  issues.push({ topic_id: topicId, code });
}

for (const topic of queue.topics || []) {
  const artifactSlug = topic.target_slug || topic.slug;
  const artifactPath = topic.content_action === 'refresh'
    ? path.join(repoRoot, 'artifacts', 'blog-drafts', `${artifactSlug}.md`)
    : path.join(repoRoot, 'src', 'content', 'blog', `${artifactSlug}.md`);
  const receiptPath = path.join(reviewDir, `${artifactSlug}.json`);
  const evidencePath = path.join(repoRoot, topic.evidence_packet || '');
  const row = {
    topic_id: topic.id,
    funnel: topic.funnel,
    content_action: topic.content_action,
    evidence_packet: fs.existsSync(evidencePath),
    draft_artifact: fs.existsSync(artifactPath),
    review_receipt: fs.existsSync(receiptPath),
    review_warnings: [],
  };

  if (topic.status !== 'draft_ready') addIssue(topic.id, 'topic_not_draft_ready');
  if (topic.approval?.decision !== 'approved') addIssue(topic.id, 'topic_not_approved');
  if (topic.claims_reviewed !== false) addIssue(topic.id, 'topic_claims_flag_not_false');
  if ((topic.evidence_set || []).length < (topic.required_external_source_count || 5)) {
    addIssue(topic.id, 'locked_source_count_too_low');
  }
  if (!row.evidence_packet) addIssue(topic.id, 'evidence_packet_missing');

  if (!row.draft_artifact) {
    addIssue(topic.id, 'draft_artifact_missing');
  } else {
    const raw = fs.readFileSync(artifactPath, 'utf8');
    const parsed = matter(raw);
    const frontmatter = parsed.data;

    if (frontmatter.status !== 'draft') addIssue(topic.id, 'draft_status_invalid');
    if (frontmatter.funnel !== topic.funnel) addIssue(topic.id, 'draft_funnel_mismatch');
    if (frontmatter.ctaId !== topic.cta_id) addIssue(topic.id, 'draft_cta_mismatch');
    if (frontmatter.claimsReviewed !== false) addIssue(topic.id, 'draft_claims_flag_not_false');
    if ('scheduledDate' in frontmatter) addIssue(topic.id, 'scheduled_date_present');
    if (/\u2014/.test(raw)) addIssue(topic.id, 'em_dash_present');
    if (/<\s*(script|iframe|object|embed)\b|\son[a-z]+\s*=|javascript\s*:/i.test(parsed.content)) {
      addIssue(topic.id, 'active_html_present');
    }
  }

  if (!row.review_receipt) {
    addIssue(topic.id, 'review_receipt_missing');
  } else {
    const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    const codexAudit = receipt?.stages?.['13']?.audit || {};
    row.review_warnings = receipt.review_warnings || [];

    if (receipt.publication_mode !== 'draft') addIssue(topic.id, 'receipt_not_draft');
    if (receipt.status !== 'review_ready') addIssue(topic.id, 'receipt_not_review_ready');
    if (receipt.funnel !== topic.funnel) addIssue(topic.id, 'receipt_funnel_mismatch');
    if (receipt.claims_reviewed !== false) addIssue(topic.id, 'receipt_claims_flag_not_false');
    if (receipt.external_actions_taken !== 0) addIssue(topic.id, 'receipt_external_action_count_nonzero');
    if (codexAudit.codex_used !== true || codexAudit.review_passed !== true) {
      addIssue(topic.id, 'direct_codex_review_not_passed');
    }
  }

  rows.push(row);
}

const summary = {
  ok: issues.length === 0,
  queue_topics: rows.length,
  acquisition_topics: rows.filter((row) => row.funnel === 'acquisition').length,
  service_topics: rows.filter((row) => row.funnel === 'service').length,
  evidence_packets: rows.filter((row) => row.evidence_packet).length,
  draft_artifacts: rows.filter((row) => row.draft_artifact).length,
  review_receipts: rows.filter((row) => row.review_receipt).length,
  review_warning_topics: rows.filter((row) => row.review_warnings.length > 0).length,
  external_actions_taken: 0,
};

if (rows.length < Number(queue.minimum_draft_ready || 0)) {
  issues.push({ topic_id: '_batch', code: 'approved_queue_below_minimum' });
  summary.ok = false;
}

console.log(JSON.stringify({ summary, issues, topics: rows }, null, 2));
process.exitCode = summary.ok ? 0 : 1;
