import type { APIRoute } from 'astro';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { rateLimit, rateLimitedResponse } from '../../../lib/rate-limit';

export const prerender = false;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });

const CLASSES = ['Warrior', 'Mage', 'Archer', 'Rogue', 'Tamer'];

// Gate Crawler World leaderboard — score is stored on the Clerk user's own
// publicMetadata (no database needed; publicMetadata is only writable from
// the server, which is why this goes through an API route with the secret
// key instead of the client writing it directly).
export const POST: APIRoute = async ({ request }) => {
  const limited = rateLimit(request, 'gcw-leaderboard-submit', 10, 60);
  if (!limited.allowed) return rateLimitedResponse(limited);

  const secretKey = import.meta.env.CLERK_SECRET_KEY;
  if (!secretKey) return json({ error: 'Leaderboard not configured' }, 503);

  const authHeader = request.headers.get('authorization') || '';
  const sessionToken = authHeader.replace(/^Bearer\s+/i, '');
  if (!sessionToken) return json({ error: 'Not signed in' }, 401);

  let body: { cls?: string; level?: number; dop?: number };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const cls = String(body.cls || '');
  const level = Number(body.level);
  const dop = Number(body.dop);
  if (!CLASSES.includes(cls) || !Number.isFinite(level) || level < 1 || level > 999 ||
      !Number.isFinite(dop) || dop < 0 || dop > 100_000_000) {
    return json({ error: 'Invalid score payload' }, 400);
  }

  let userId: string;
  try {
    const { data, errors } = await verifyToken(sessionToken, { secretKey });
    if (errors || !data?.sub) return json({ error: 'Not signed in' }, 401);
    userId = data.sub;
  } catch {
    return json({ error: 'Not signed in' }, 401);
  }

  const clerkClient = createClerkClient({ secretKey });

  const user = await clerkClient.users.getUser(userId);
  const prevBest = (user.publicMetadata?.gcw as { dop?: number } | undefined)?.dop ?? -1;

  if (dop <= prevBest) {
    return json({ updated: false, reason: 'not a new personal best' });
  }

  const displayName = user.username || user.firstName || 'Adventurer';
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      gcw: { cls, level, dop, name: displayName.slice(0, 24), at: new Date().toISOString() },
    },
  });

  return json({ updated: true });
};
