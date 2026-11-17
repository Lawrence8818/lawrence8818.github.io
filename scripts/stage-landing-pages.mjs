// Stage the archived landing pages as real routes.
//
// landing-pages/<slug>.html are complete standalone documents (their own <head>,
// inlined base64 images, their own analytics). Astro must not template them, so
// they are copied verbatim into public/<slug>/index.html, which Astro passes
// through untouched — giving /oakaberjaya, /khayabangsar and the rest.
//
// The staged copies are generated, not authored: they live under public/ only
// during a build and are gitignored, so the archive stays the single source.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { translatePage, loadMap } from './landing-i18n.mjs';

const SRC = new URL('../landing-pages/', import.meta.url).pathname;
const PUB = new URL('../public/', import.meta.url).pathname;

const pages = readdirSync(SRC).filter((n) => n.endsWith('.html')).sort();
let bytes = 0;

for (const file of pages) {
  const slug = file.replace(/\.html$/, '');
  const dir = PUB + slug;
  // Rebuild from scratch each time so a renamed archive never leaves a stale route.
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
  const html = readFileSync(SRC + file);
  writeFileSync(dir + '/index.html', html);
  bytes += html.length;
  console.log('  /' + slug.padEnd(20) + (html.length / 1048576).toFixed(1) + ' MB');
}

// ---- 中文版:有译文对照表(landing-pages/zh/<slug>.json)的页面,生成 /zh/<slug>/ ----
// 英文页仍是唯一的源文件;这里按对照表把文字换成中文(见 scripts/landing-i18n.mjs)。
const ZH_PUB = PUB + 'zh/';
if (existsSync(ZH_PUB)) rmSync(ZH_PUB, { recursive: true });
let zhCount = 0;
for (const file of pages) {
  const slug = file.replace(/\.html$/, '');
  const map = loadMap(slug);
  if (!map) continue;
  const { html, missing } = translatePage(readFileSync(SRC + file, 'utf8'), map);
  mkdirSync(ZH_PUB + slug, { recursive: true });
  writeFileSync(ZH_PUB + slug + '/index.html', html);
  zhCount++;
  console.log('  /zh/' + slug.padEnd(16) + (missing.length ? '有 ' + missing.length + ' 段没有译文,保留英文' : '全部已翻'));
  missing.slice(0, 3).forEach((m) => console.log('      · ' + m.slice(0, 80)));
}
if (zhCount) console.log(zhCount + ' 个中文落地页已生成');

console.log(pages.length + ' 个落地页已就位 · 合计 ' + (bytes / 1048576).toFixed(1) + ' MB');
