import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://inplace.digital',
  integrations: [react()],
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
