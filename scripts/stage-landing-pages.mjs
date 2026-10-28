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

console.log(pages.length + ' 个落地页已就位 · 合计 ' + (bytes / 1048576).toFixed(1) + ' MB');
