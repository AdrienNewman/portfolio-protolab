// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
// Astro 5: output 'static' supports on-demand rendering via adapter
export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  vite: {
    build: {
      // Enable minification for production
      minify: 'esbuild',
      // Generate source maps for debugging (disable in prod if needed)
      sourcemap: false,
    },
  },
  // Security headers will be applied via middleware
  // See src/middleware.ts for implementation
});
