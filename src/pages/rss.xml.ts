import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: any) {
  const posts = await getCollection('blog');
  const now = new Date();
  const publishedPosts = posts
    .filter(post => post.data.status === 'published' && post.data.publishDate <= now)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'MyBCAT Blog',
    description: 'Expert insights on patient intake, practice growth, and healthcare operations.',
    site: context.site || 'https://mybcat.com',
    items: publishedPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      author: post.data.author,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
