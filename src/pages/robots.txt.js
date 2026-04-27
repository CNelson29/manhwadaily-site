export async function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: https://manhwadaily.com/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } });
}
