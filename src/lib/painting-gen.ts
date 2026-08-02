// Foto → póster de pintura al óleo estilo medieval, listo para imprimir 30x70cm.
// Un solo estilo fijo (pintura medieval): el SUJETO de la foto puede ser cualquier cosa
// (persona real o personaje de anime) — lo único fijo es el estilo artístico.
// Dos llamadas HTTP a fal.ai (corre en Vercel serverless):
//   1) flux-pro/kontext — repinta la foto como óleo medieval, aspect_ratio 9:21 (=3:7, el póster).
//   2) clarity-upscaler — sube la resolución para que alcance el tamaño de impresión real.
// El costo total (~$0.1-0.6) lo cubre de sobra el precio de venta ($1.75).
import { POSTER_ASPECT_RATIO, UPSCALE_FACTOR } from './painting-config';

const PROMPT =
  'Transform this photo into a majestic Renaissance-era medieval oil painting portrait, ' +
  'full-length museum masterpiece composition. Keep the main subject\'s face, features and ' +
  'likeness clearly recognizable (whether a real person or an anime/fictional character). Dress ' +
  'them in ornate royal medieval attire, regal fantasy atmosphere, dramatic chiaroscuro lighting, ' +
  'rich visible brushstrokes, aged canvas texture, ornate golden frame vibe. Tall vertical poster ' +
  'composition with balanced empty space above and below the subject for framing.';

export interface GenResult {
  imageUrl: string;
  width?: number;
  height?: number;
}

async function falPost(model: string, body: Record<string, unknown>): Promise<any> {
  const key = import.meta.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY no configurado');
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`fal ${model} falló: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

// imageDataUrl: data URI (data:image/jpeg;base64,...) de la foto subida (ya reducida en el cliente).
export async function generatePainting(imageDataUrl: string): Promise<GenResult> {
  // 1) Estilizar como óleo medieval en la proporción del póster.
  const painted = await falPost('fal-ai/flux-pro/kontext', {
    prompt: PROMPT,
    image_url: imageDataUrl,
    aspect_ratio: POSTER_ASPECT_RATIO,
    guidance_scale: 3.5,
    num_images: 1,
    output_format: 'jpeg',
    safety_tolerance: '2',
  });
  const painting = painted?.images?.[0];
  if (!painting?.url) throw new Error(`Generación falló: ${JSON.stringify(painted).slice(0, 300)}`);

  // 2) Subir resolución para impresión física real (30x70cm @300dpi).
  const upscaled = await falPost('fal-ai/clarity-upscaler', {
    image_url: painting.url,
    upscale_factor: UPSCALE_FACTOR,
    output_format: 'jpeg',
  });
  const hi = upscaled?.image;
  if (!hi?.url) throw new Error(`Upscale falló: ${JSON.stringify(upscaled).slice(0, 300)}`);

  return { imageUrl: hi.url, width: hi.width, height: hi.height };
}
