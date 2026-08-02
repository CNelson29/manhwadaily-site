// In-memory rate limiter (per serverless instance). Good enough to blunt abuse
// of the paid generation endpoints; not a global limiter.
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

export function clientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export function rateLimit(request: Request, scope: string, limit: number, windowSeconds = 60): RateLimitResult {
  const ip = clientIp(request);
  const now = Date.now();
  const key = `${scope}:${ip}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > limit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }

  return { allowed: true, retryAfter: 0 };
}

export function rateLimitedResponse(result: RateLimitResult): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Try again in a few seconds.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(result.retryAfter),
    },
  });
}
