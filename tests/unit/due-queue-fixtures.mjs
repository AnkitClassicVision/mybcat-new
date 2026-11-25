// Builders shared by check-due-queue.test.mjs and publish-selection.test.mjs.
// Not a test file: the runner picks up *.test.mjs only.

export const RULE = { id: 'auto-release-v1', approved_by: 'owner', approved_at: '2026-11-23T19:40:04Z', enabled: true };

/** A blog post file as the publish job reads it. */
export function post(name, { status, scheduledDate, publishDate, topic = true }) {
  const slug = name.replace(/\.md$/, '');
  const lines = [
    '---',
    `title: "Post ${slug}"`,
    `targetKeyword: "optometry ${slug}"`,
    `status: ${status}`,
    `publishDate: '${publishDate ?? scheduledDate}'`,
  ];
  if (scheduledDate) lines.push(`scheduledDate: '${scheduledDate}'`);
  if (topic) lines.push(`seoTopicId: ${slug}`);
  lines.push('---', '', 'Body.', '');
  return { name, content: lines.join('\n') };
}

export const scheduled = (name, scheduledDate, extra = {}) => post(name, { status: 'scheduled', scheduledDate, ...extra });
export const published = (name, publishDate) => post(name, { status: 'published', publishDate, topic: false });

/** A publish-ready topic, approved by a person or by the standing rule. */
export function topic(name, approvedAt, { automatic = false } = {}) {
  const id = name.replace(/\.md$/, '');
  return {
    id,
    status: 'publish_ready',
    research_reviewed: true,
    claims_reviewed: true,
    cannibalization_reviewed: true,
    required_external_source_count: 1,
    evidence_set: ['source-1'],
    approval: automatic
      ? { decision: 'approved', mode: 'automatic', owner: `standing-rule:${RULE.id}`, rule_id: RULE.id, approved_at: approvedAt }
      : { decision: 'approved', owner: 'human-owner', approved_at: approvedAt },
  };
}

export const queueOf = (...topics) => ({ standing_release_rule: RULE, topics });

/** One record of the publish job's history: where a post stood and when it went live. */
export const record = (file, scheduledDate, publishedOn) => ({ file, scheduledDate, publishedOn });

/** The history the gate reads, covering from `coversFrom`. */
export const history = (records, coversFrom = '2020-01-01') => ({ records, coversFrom });

export const addDay = (day, count = 1) => new Date(Date.parse(day) + count * 86_400_000).toISOString().split('T')[0];

/**
 * A repository in memory: file contents by name, plus the publish history, newest
 * first. `publishOne(day, pick)` is the publish job: it takes the file `pick`
 * chooses from the posts due on `day`, as the job does, and records it.
 */
export class Repo {
  constructor(files = [], records = []) {
    this.contents = new Map(files.map((file) => [file.name, file.content]));
    this.records = [...records];
  }

  add(file) {
    this.contents.set(file.name, file.content);
  }

  get files() {
    return [...this.contents].map(([name, content]) => ({ name, content }));
  }

  due(day) {
    return [...this.contents]
      .filter(([, content]) => /^status: scheduled$/m.test(content))
      .map(([file, content]) => ({ file, scheduledDate: content.match(/^scheduledDate: '(.+)'$/m)[1] }))
      .filter((entry) => entry.scheduledDate <= day);
  }

  /** Publish the post `pick(due)` returns, or nothing. Returns the file name. */
  publishOne(day, pick) {
    const choice = pick(this.due(day));
    if (!choice) return null;
    this.contents.set(choice.file, this.contents.get(choice.file)
      .replace(/^status: scheduled$/m, 'status: published')
      .replace(/^publishDate: .*$/m, `publishDate: '${day}'`)
      .replace(/^scheduledDate: .*\n/m, ''));
    this.records.unshift(record(choice.file, choice.scheduledDate, day));
    return choice.file;
  }
}

const byDateThenName = (a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.file.localeCompare(b.file);
/** What the publish job does: the oldest scheduledDate, then the filename. */
export const oldestFirst = (due) => [...due].sort(byDateThenName)[0];
/** A broken publisher that takes the newest. */
export const newestFirst = (due) => [...due].sort(byDateThenName).at(-1);
