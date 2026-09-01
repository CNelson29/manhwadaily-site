import { getCollection } from 'astro:content';
import { coverForBody } from '../lib/manhwa-covers';

// Lightweight manifest used client-side by /my-list/ to render a signed-in
// user's bookmarked posts (bookmarks are stored in Clerk unsafeMetadata, not
// a database — this manifest lets the browser resolve slug -> display data).
export async function GET() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const manifest = posts.map((p) => ({
    slug: p.slug,
    title: p.data.title,
    excerpt: p.data.excerpt,
    category: p.data.category,
    image: coverForBody(p.body)?.cover ?? p.data.image ?? null,
  }));
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/json' },
  });
}
