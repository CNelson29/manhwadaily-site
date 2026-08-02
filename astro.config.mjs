import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// output: 'hybrid' → todas las páginas siguen estáticas (prerender por defecto);
// solo las rutas que marcan `export const prerender = false` corren en serverless
// (las de la herramienta de pinturas: /api/painting/*).
export default defineConfig({
  site: 'https://manhwadaily.com',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false })],
});
