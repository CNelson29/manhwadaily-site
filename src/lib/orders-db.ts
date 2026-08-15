// Registro de ventas — Supabase compartido entre aitoolspot y manhwadaily
// (proyecto dedicado "sites-orders", separado del resto del negocio).
// Vars en Vercel: SUPABASE_URL, SUPABASE_SERVICE_KEY

const SUPABASE_URL = String(process.env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? '').trim();
const SUPABASE_SERVICE_KEY = String(process.env.SUPABASE_SERVICE_KEY ?? import.meta.env.SUPABASE_SERVICE_KEY ?? '').trim();

export async function recordOrder(params: {
  productSlug: string;
  paypalOrderId: string;
  amountUsd: number;
  payerEmail?: string;
}): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        site: 'manhwadaily',
        product_slug: params.productSlug,
        paypal_order_id: params.paypalOrderId,
        amount_usd: params.amountUsd,
        payer_email: params.payerEmail ?? null,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
