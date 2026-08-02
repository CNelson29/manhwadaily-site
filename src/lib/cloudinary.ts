// Cloudinary — almacenamiento y entrega segura de la pintura.
// La HD limpia se sube como `authenticated` (no accesible sin URL firmada).
// - previewUrl: versión con MARCA DE AGUA horneada + baja resolución (lo que ve gratis).
// - cleanDownloadUrl: HD limpia, solo se entrega tras verificar el pago.
// Vars en Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'node:crypto';
import { POSTER_PX, POSTER_DPI } from './painting-config';

let configured = false;
function cfg() {
  if (configured) return cloudinary;
  cloudinary.config({
    cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
  return cloudinary;
}

// Sube la imagen generada (URL remota o data URI) como asset autenticado.
export async function uploadHd(source: string): Promise<string> {
  const c = cfg();
  const publicId = `painting/${crypto.randomUUID()}`;
  const res = await c.uploader.upload(source, {
    public_id: publicId,
    type: 'authenticated',
    resource_type: 'image',
    overwrite: false,
  });
  return res.public_id;
}

// Preview firmado: marca de agua diagonal + tamaño limitado + calidad reducida.
export function previewUrl(publicId: string): string {
  return cfg().url(publicId, {
    type: 'authenticated',
    sign_url: true,
    secure: true,
    resource_type: 'image',
    format: 'jpg',
    transformation: [
      { width: 820, crop: 'limit' },
      {
        overlay: { font_family: 'Arial', font_size: 58, font_weight: 'bold', text: 'MANHWADAILY.COM' },
        color: '#FFFFFF', opacity: 38, gravity: 'center', angle: -30,
      },
      {
        overlay: { font_family: 'Arial', font_size: 30, font_weight: 'bold', text: 'PREVIEW  -  PAY TO UNLOCK HD' },
        color: '#FFFFFF', opacity: 60, gravity: 'south', y: 26,
      },
      { quality: 'auto:eco' },
    ],
  });
}

// Vista limpia firmada (sin marca de agua, tamaño web) para mostrar en <img> tras pagar.
// URL firmada aparte — NO se puede derivar editando la de descarga (rompería la firma).
export function cleanViewUrl(publicId: string): string {
  return cfg().url(publicId, {
    type: 'authenticated',
    sign_url: true,
    secure: true,
    resource_type: 'image',
    format: 'jpg',
    transformation: [{ width: 820, crop: 'limit' }, { quality: 'auto:good' }],
  });
}

// Descarga HD limpia firmada (solo tras pago), lista para imprimir 30x70cm @300dpi.
// c_fill fuerza el tamaño EXACTO de impresión sin importar la resolución que entregue el
// upscaler (recorta de sobra, nunca estira de menos). density incrusta el DPI en el JPEG.
// fl_attachment fuerza descarga.
export function cleanDownloadUrl(publicId: string): string {
  return cfg().url(publicId, {
    type: 'authenticated',
    sign_url: true,
    secure: true,
    resource_type: 'image',
    format: 'jpg',
    flags: 'attachment:manhwa-poster-30x70cm',
    transformation: [
      { width: POSTER_PX.w, height: POSTER_PX.h, crop: 'fill', gravity: 'auto' },
      { density: POSTER_DPI, quality: 'auto:best' },
    ],
  });
}
