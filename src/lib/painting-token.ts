// Token firmado (HMAC-SHA256) para atar el preview con la imagen HD sin base de datos.
// El servidor genera la imagen, la sube a Cloudinary con un public_id, y devuelve al
// cliente SOLO este token (que contiene el public_id firmado). El cliente no puede
// forjar un public_id porque no tiene el secreto. Tras pagar, el servidor verifica el
// token y entrega la URL firmada de la HD limpia.
import crypto from 'node:crypto';

function secret(): string {
  const s = import.meta.env.PAINTING_SECRET || import.meta.env.PAYPAL_SECRET;
  if (!s) throw new Error('PAINTING_SECRET (o PAYPAL_SECRET) no configurado');
  return s;
}

const b64u = (buf: Buffer) => buf.toString('base64url');

export interface PaintingPayload {
  pid: string;      // Cloudinary public_id de la HD limpia
  style: string;    // 'medieval' | 'anime'
  exp: number;      // epoch ms de expiración
}

export function signToken(payload: PaintingPayload): string {
  const body = b64u(Buffer.from(JSON.stringify(payload)));
  const sig = b64u(crypto.createHmac('sha256', secret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifyToken(token: string): PaintingPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = b64u(crypto.createHmac('sha256', secret()).update(body).digest());
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload: PaintingPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
  if (!payload?.pid || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  return payload;
}
