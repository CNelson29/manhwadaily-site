const ADSENSE_CLIENT_ID =
  import.meta.env.PUBLIC_ADSENSE_CLIENT_ID ||
  import.meta.env.PUBLIC_GOOGLE_ADSENSE_CLIENT_ID ||
  '';

export async function GET() {
  if (!ADSENSE_CLIENT_ID) {
    return new Response('AdSense is not configured.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const publisherId = ADSENSE_CLIENT_ID.replace(/^ca-/, '');
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
