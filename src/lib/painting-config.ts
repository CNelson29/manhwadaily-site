// Precio y parámetros de la herramienta de pintura-póster.
// 100 DOP ≈ $1.75 USD (PayPal no soporta DOP → se cobra el equivalente USD).
export const PRICE_USD = 1.75;
export const PRICE_DISPLAY = '100 DOP (~$1.75 USD)';
export const PREVIEW_TTL_MS = 60 * 60 * 1000; // el preview/token vale 1 hora

// Formato físico: póster mediano 30x70cm para enmarcar, @300 DPI (estándar de imprenta).
// 30cm = 11.811in · 70cm = 27.559in → 3543 x 8268 px. Proporción 30:70 = 3:7 = 9:21 (fal aspect_ratio).
export const POSTER_CM = { w: 30, h: 70 };
export const POSTER_PX = { w: 3543, h: 8268 };
export const POSTER_ASPECT_RATIO = '9:21'; // == 3:7, exacto para fal flux-pro/kontext
export const POSTER_DPI = 300;

// Factor de upscale tras la generación (Kontext entrega ~1024-1440px de lado largo).
// Sobredimensiona a propósito; Cloudinary recorta después al tamaño exacto de impresión,
// así nunca falta resolución aunque el modelo entregue menos de lo esperado.
export const UPSCALE_FACTOR = 6;
