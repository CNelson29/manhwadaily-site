import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const base  = 'https://manhwadaily.com';
  const urls  = [
    { loc: base, priority: '1.0', freq: 'daily' },
    { loc: `${base}/recommender/`, priority: '0.9', freq: 'weekly' },
    ...posts.map(p => ({ loc: `${base}/${p.slug}/`, priority: '0.8', freq: 'weekly', lastmod: p.data.date })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`).join('\n')}
</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
