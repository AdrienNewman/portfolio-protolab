// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
// Astro 5: output 'static' supports on-demand rendering via adapter
export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
});
