import type { APIRoute } from 'astro';
import { rateLimit, rateLimitedResponse } from '../../../lib/rate-limit';
import { generatePainting } from '../../../lib/painting-gen';
import { uploadHd, previewUrl } from '../../../lib/cloudinary';
import { signToken } from '../../../lib/painting-token';
import { PREVIEW_TTL_MS } from '../../../lib/painting-config';

export const prerender = false;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  // Generar + subir resolución cuesta dinero → límite estricto por IP.
  const limited = rateLimit(request, 'painting-generate', 6, 60);
  if (!limited.allowed) return rateLimitedResponse(limited);

  let imageDataUrl: string;
  try {
    ({ imageDataUrl } = await request.json());
  } catch {
    return json({ error: 'Body inválido' }, 400);
  }

  if (!imageDataUrl || !/^data:image\/(jpeg|png|webp);base64,/.test(imageDataUrl)) {
    return json({ error: 'Falta la imagen (data URI jpeg/png/webp)' }, 400);
  }
  // Límite de tamaño del payload (~6MB base64) para no abusar del serverless.
  if (imageDataUrl.length > 8_000_000) {
    return json({ error: 'La imagen es muy grande. Súbela más pequeña.' }, 413);
  }

  try {
    const gen = await generatePainting(imageDataUrl);
    const pid = await uploadHd(gen.imageUrl);
    const token = signToken({ pid, style: 'medieval-poster', exp: Date.now() + PREVIEW_TTL_MS });
    return json({ token, previewUrl: previewUrl(pid) });
  } catch (err: any) {
    return json({ error: err?.message || 'Error generando el póster' }, 502);
  }
};
