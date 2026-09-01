import type { APIRoute } from 'astro';
import { createClerkClient } from '@clerk/backend';
import { rateLimit, rateLimitedResponse } from '../../../lib/rate-limit';

export const prerender = false;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });

// Public leaderboard for Gate Crawler World. Scores live in each user's own
// Clerk publicMetadata (see ./submit.ts) — this endpoint lists users and
// sorts client-visible fields only (name, class, level, dop). No email, no
// user IDs, nothing else from the Clerk profile is ever returned.
export const GET: APIRoute = async ({ request }) => {
  const limited = rateLimit(request, 'gcw-leaderboard-list', 30, 60);
  if (!limited.allowed) return rateLimitedResponse(limited);

  const secretKey = import.meta.env.CLERK_SECRET_KEY;
  if (!secretKey) return json({ entries: [] });

  const clerkClient = createClerkClient({ secretKey });

  // Fine at this site's current scale (low hundreds of signed-up users).
  // Would need a real datastore if the user base grows into the thousands.
  const { data: users } = await clerkClient.users.getUserList({ limit: 500 });

  const entries = users
    .map((u) => u.publicMetadata?.gcw as { cls?: string; level?: number; dop?: number; name?: string } | undefined)
    .filter((g): g is { cls: string; level: number; dop: number; name: string } =>
      !!g && typeof g.dop === 'number' && typeof g.name === 'string')
    .sort((a, b) => b.dop - a.dop)
    .slice(0, 20);

  return json({ entries });
};
