/**
 * WordPress Blog Migration Script
 * Fetches posts and images from WordPress API and updates local blog files
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const IMAGES_DIR = path.join(__dirname, '../public/images/blog');
const WP_API = 'https://mybcat.com/wp-json/wp/v2';

// Fetch JSON from URL
async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Download image
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Get all posts
async function getAllPosts() {
  const posts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&_fields=id,slug,title,date,featured_media,content,excerpt`;
    console.log(`Fetching page ${page}...`);
    try {
      const data = await fetchJSON(url);
      if (data.length === 0) {
        hasMore = false;
      } else {
        posts.push(...data);
        page++;
      }
    } catch (e) {
      hasMore = false;
    }
  }

  return posts;
}

// Get media URL
async function getMediaURL(mediaId) {
  if (!mediaId || mediaId === 0) return null;
  try {
    const url = `${WP_API}/media/${mediaId}?_fields=source_url`;
    const data = await fetchJSON(url);
    return data.source_url;
  } catch (e) {
    console.log(`  Could not fetch media ${mediaId}`);
    return null;
  }
}

// Update frontmatter in markdown file
function updateFrontmatter(filepath, updates) {
  if (!fs.existsSync(filepath)) return false;

  let content = fs.readFileSync(filepath, 'utf-8');

  // Parse frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return false;

  let frontmatter = fmMatch[1];

  // Update featuredImage
  if (updates.featuredImage) {
    if (frontmatter.includes('featuredImage:')) {
      frontmatter = frontmatter.replace(/featuredImage:.*/, `featuredImage: "${updates.featuredImage}"`);
    } else {
      frontmatter += `\nfeaturedImage: "${updates.featuredImage}"`;
    }
  }

  // Write back
  content = content.replace(/^---\n[\s\S]*?\n---/, `---\n${frontmatter}\n---`);
  fs.writeFileSync(filepath, content);
  return true;
}

// Main migration
async function migrate() {
  console.log('Starting WordPress migration...\n');

  // Ensure directories exist
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Get all posts
  const posts = await getAllPosts();
  console.log(`\nFound ${posts.length} posts\n`);

  let updated = 0;
  let downloaded = 0;

  for (const post of posts) {
    const slug = post.slug;
    const mdPath = path.join(BLOG_DIR, `${slug}.md`);

    // Skip if no featured media
    if (!post.featured_media) {
      continue;
    }

    console.log(`Processing: ${slug}`);

    // Get image URL
    const imageUrl = await getMediaURL(post.featured_media);
    if (!imageUrl) {
      console.log(`  No image URL found`);
      continue;
    }

    // Determine local filename
    const urlPath = new URL(imageUrl).pathname;
    const imageName = path.basename(urlPath);
    const localImagePath = path.join(IMAGES_DIR, imageName);
    const webImagePath = `/images/blog/${imageName}`;

    // Download image if not exists
    if (!fs.existsSync(localImagePath)) {
      try {
        console.log(`  Downloading: ${imageName}`);
        await downloadImage(imageUrl, localImagePath);
        downloaded++;
      } catch (e) {
        console.log(`  Failed to download: ${e.message}`);
        continue;
      }
    } else {
      console.log(`  Image exists: ${imageName}`);
    }

    // Update markdown file
    if (fs.existsSync(mdPath)) {
      const result = updateFrontmatter(mdPath, { featuredImage: webImagePath });
      if (result) {
        console.log(`  Updated frontmatter`);
        updated++;
      }
    } else {
      console.log(`  Markdown file not found: ${mdPath}`);
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Posts processed: ${posts.length}`);
  console.log(`Images downloaded: ${downloaded}`);
  console.log(`Frontmatter updated: ${updated}`);
}

migrate().catch(console.error);
