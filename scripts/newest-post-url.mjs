import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIRECTORY = path.join(process.cwd(), 'src/content/blog');
const PREVIEW_ORIGIN = 'http://localhost:4321';

function parseScalar(rawValue) {
  const value = rawValue.trim();
  const quote = value[0];

  if ((quote === "'" || quote === '"') && value.at(-1) === quote) {
    return value.slice(1, -1);
  }

  return value.replace(/\s+#.*$/, '').trim();
}

function readFrontmatter(source) {
  const match = source.match(/^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return {};

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/);
    if (field && (field[1] === 'status' || field[1] === 'publishDate')) {
      fields[field[1]] = parseScalar(field[2]);
    }
  }

  return fields;
}

const filenames = (await readdir(BLOG_DIRECTORY))
  .filter((filename) => /\.mdx?$/.test(filename))
  .sort();
const now = Date.now();
const publishedPosts = [];

for (const filename of filenames) {
  const source = await readFile(path.join(BLOG_DIRECTORY, filename), 'utf8');
  const { status, publishDate } = readFrontmatter(source);
  const publishedAt = Date.parse(publishDate ?? '');

  if (status?.toLowerCase() === 'published' && Number.isFinite(publishedAt) && publishedAt <= now) {
    publishedPosts.push({
      publishedAt,
      slug: filename.replace(/\.mdx?$/, ''),
    });
  }
}

publishedPosts.sort((a, b) => b.publishedAt - a.publishedAt || a.slug.localeCompare(b.slug));

if (publishedPosts.length === 0) {
  console.error('No published blog post with a non-future publishDate was found.');
  process.exit(2);
}

console.log(`${PREVIEW_ORIGIN}/blog/${publishedPosts[0].slug}/`);
