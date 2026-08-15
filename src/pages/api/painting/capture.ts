import type { APIRoute } from 'astro';
import { rateLimit, rateLimitedResponse } from '../../../lib/rate-limit';
import { verifyToken } from '../../../lib/painting-token';
import { capturePaintingOrder } from '../../../lib/paypal';
import { cleanDownloadUrl, cleanViewUrl } from '../../../lib/cloudinary';
import { PRICE_USD } from '../../../lib/painting-config';
import { recordOrder } from '../../../lib/orders-db';

export const prerender = false;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  const limited = rateLimit(request, 'painting-capture', 12, 60);
  if (!limited.allowed) return rateLimitedResponse(limited);

  let token: string, orderID: string;
  try {
    ({ token, orderID } = await request.json());
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  const payload = verifyToken(token);
  if (!payload) return json({ error: 'Preview expirado o inválido.' }, 400);
  if (!orderID || typeof orderID !== 'string') return json({ error: 'Falta orderID' }, 400);

  try {
    // Verifica el pago real ANTES de entregar la HD limpia.
    const paid = await capturePaintingOrder(orderID, PRICE_USD);
    if (!paid) return json({ error: 'El pago no se completó.' }, 402);

    recordOrder({ productSlug: `portrait-${payload.style}`, paypalOrderId: orderID, amountUsd: PRICE_USD }).catch(() => {});

    return json({ downloadUrl: cleanDownloadUrl(payload.pid), viewUrl: cleanViewUrl(payload.pid) });
  } catch (err: any) {
    return json({ error: err?.message || 'Error capturando el pago' }, 502);
  }
};
