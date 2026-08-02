import type { APIRoute } from 'astro';
import { rateLimit, rateLimitedResponse } from '../../../lib/rate-limit';
import { verifyToken } from '../../../lib/painting-token';
import { createPaintingOrder } from '../../../lib/paypal';
import { PRICE_USD } from '../../../lib/painting-config';

export const prerender = false;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const limited = rateLimit(request, 'painting-order', 12, 60);
  if (!limited.allowed) return rateLimitedResponse(limited);

  let token: string;
  try {
    ({ token } = await request.json());
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  const payload = verifyToken(token);
  if (!payload) return json({ error: 'Preview expirado o inválido. Genera de nuevo.' }, 400);

  try {
    const orderId = await createPaintingOrder(PRICE_USD, `ManhwaDaily portrait (${payload.style})`);
    return json({ orderID: orderId });
  } catch (err: any) {
    return json({ error: err?.message || 'Error creando la orden' }, 502);
  }
};
