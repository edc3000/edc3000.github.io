// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import reportBackLink from './src/integrations/report-back-link';

export default defineConfig({
  site: 'https://edc3000.github.io',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap(), pagefind(), reportBackLink()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
