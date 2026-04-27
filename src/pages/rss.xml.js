import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  posts.sort((a, b) => a.data.date < b.data.date ? 1 : -1);
  return rss({
    title: 'ManhwaDaily — Manhwa Rankings & Reviews',
    description: 'Daily manhwa recommendations, top rankings and hidden gems.',
    site: context.site ?? 'https://manhwadaily.com',
    items: posts.map(post => {
      const d = new Date(post.data.date);
      return {
        title:       post.data.title,
        description: post.data.excerpt,
        link:        `/${post.slug}/`,
        pubDate:     isNaN(d.getTime()) ? new Date() : d,
      };
    }),
    customData: '<language>en-us</language>',
  });
}
