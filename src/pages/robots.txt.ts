import type { APIRoute } from 'astro';

// robots.txt 动态生成:site/base 变更(域名切换)时自动跟随,无需手改
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const sitemapUrl = new URL(`${base}/sitemap-index.xml`, site).href;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
