// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // TODO: replace with the real domain once it is set up on Vercel
  site: 'https://salsa.vercel.app',
  trailingSlash: 'ignore',
  // Pages are fetched before the click: on hover for links, so navigation feels instant
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
