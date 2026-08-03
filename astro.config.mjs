// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL / BASE_PATH 由部署环境注入(见 .github/workflows/deploy.yml)。
// 未来切换到 lawrencelawproperty.com 自定义域名时:
//   SITE_URL=https://lawrencelawproperty.com  BASE_PATH=/
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://lawrence8818.github.io',
  base: process.env.BASE_PATH ?? '/LLP-recruitment-website',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
