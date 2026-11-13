// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // set to Cuelo's real domain for canonical URLs and the sitemap
  site: 'https://cuelo.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});