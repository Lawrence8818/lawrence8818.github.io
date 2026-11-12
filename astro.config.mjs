// @ts-check
import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL / BASE_PATH 由部署环境注入(见 .github/workflows/deploy.yml)。
// 未来切换到 lawrencelawproperty.com 自定义域名时:
//   SITE_URL=https://lawrencelawproperty.com  BASE_PATH=/
const site = process.env.SITE_URL ?? 'https://lawrence8818.github.io';
const base = process.env.BASE_PATH ?? '/LLP-recruitment-website';

// 落地页是 public/ 里的静态文件,Astro 的 sitemap 看不到它们,要手动列进去。
// 不列的话搜索引擎和 AI 爬虫只能靠站内链接碰巧找到这几页。
const landingPages = readdirSync(new URL('./landing-pages/', import.meta.url))
  .filter((n) => n.endsWith('.html'))
  .sort()
  .map((n) => `${site.replace(/\/+$/, '')}${base.replace(/\/+$/, '')}/${n.replace(/\.html$/, '')}/`);

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  // 英文是默认语言,网址不变;中文版在 /zh/ 下面(见 src/i18n/index.ts)。
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap({ customPages: landingPages })],
  vite: {
    plugins: [tailwindcss()],
  },
});
