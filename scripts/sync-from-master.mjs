// Sync the customer-facing property listings from Project-Info-Master.
//
//   node scripts/sync-from-master.mjs [--write]
//
// Reads projects-master.csv (single source of truth, maintained in the
// Lawrence8818/Project-Info-Master repo) and updates the PUBLIC fields of
// src/content/properties/*.md, matching rows to files by `slug`:
//
//   name, region, location, tenure, land_size, layout_size_range,
//   completion, price_from, monthly_from, maintenance, status, penthouse
//
// Master-only columns (developer, commission, contacts, PDFs, notes, ...)
// are ignored here and never reach the website. Website-only presentation
// fields (image, fallbackImage, order, label, featured) are preserved.
//
// Without --write it only prints the diff (dry run). New slugs in the CSV
// become new listing files; site files missing from the CSV are reported
// but never deleted automatically.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const PROPS = new URL('../src/content/properties/', import.meta.url).pathname;
const CSV =
  process.env.MASTER_CSV || '/workspace/project-info-master/projects-master.csv';
const WRITE = process.argv.includes('--write');

// CSV 里有、但刻意不放上网站的项目。
//
// 光删 src/content/properties/<slug>.md 是不够的:下面看到文件不存在
// 就会当成新项目重建,第二天同步一跑就回来了。列在这里才是真的下架。
// 资料仍然留在 Project-Info-Master 里(发展商、佣金、户型都不受影响)。
const NOT_PUBLISHED = new Set([
  // Avaland 的三个项目,Lawrence 2026-10-28 决定全部不放在网站上
  'aetas-taman-desa',
  'aetas-seputeh',
  'accent-jaya-33',
]);

if (!existsSync(CSV)) {
  console.error('master CSV not found: ' + CSV + '\n(clone Project-Info-Master or set MASTER_CSV)');
  process.exit(1);
}

// ---- minimal CSV parser (handles quoted cells with commas/newlines) ----
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const [header, ...lines] = parseCsv(readFileSync(CSV, 'utf8')).filter((r) => r.length > 1);
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
for (const need of ['slug', 'name', 'region', 'tenure', 'completion', 'price_from', 'status']) {
  if (!(need in col)) { console.error('CSV missing column: ' + need); process.exit(1); }
}

const REGIONS = ['kuala-lumpur', 'klcc', 'petaling-jaya', 'selangor', 'johor', 'penang'];
/** Optional fields an empty CSV cell is allowed to remove (see setStr). */
const CLEARABLE = new Set(['landingUrl']);
const q = (v) => '"' + String(v).replace(/"/g, '\\"') + '"';

let changedFiles = 0, created = 0, unpublished = 0;
const report = [], problems = [];
const csvSlugs = new Set();

// next `order` for brand-new listings
let maxOrder = 0;
for (const f of readdirSync(PROPS).filter((n) => n.endsWith('.md'))) {
  const m = readFileSync(PROPS + f, 'utf8').match(/^order:\s*(\d+)/m);
  if (m) maxOrder = Math.max(maxOrder, +m[1]);
}

for (const line of lines) {
  const v = (k) => (line[col[k]] ?? '').trim();
  const slug = v('slug');
  if (!slug) continue;
  csvSlugs.add(slug);

  if (NOT_PUBLISHED.has(slug)) {
    unpublished++;
    if (existsSync(PROPS + slug + '.md')) {
      problems.push(slug + ': 在 NOT_PUBLISHED 名单里,但 src/content/properties/ 还有文件');
    }
    continue;
  }

  if (v('region') && !REGIONS.includes(v('region'))) {
    problems.push(slug + ': 无效 region "' + v('region') + '" (可用: ' + REGIONS.join(' / ') + ')');
    continue;
  }

  const want = {
    name: v('name'),
    region: v('region'),
    location: v('location'),
    tenure: v('tenure'),
    landSize: v('land_size') || '-',
    layoutSize: v('layout_size_range'),
    completion: v('completion'),
    priceFrom: v('price_from') || 'Price on request',
    monthly: v('monthly_from'),
    maintenance: v('maintenance'),
    landingUrl: v('landing_page'),
  };
  const soldOut = v('status') === 'fully-sold';
  const penthouse = v('penthouse') === 'yes';

  const path = PROPS + slug + '.md';
  if (!existsSync(path)) {
    const fm = [
      '---',
      `name: ${q(want.name)}`,
      `priceFrom: ${q(want.priceFrom)}`,
      `location: ${q(want.location)}`,
      `region: ${q(want.region)}`,
      `tenure: ${q(want.tenure)}`,
      `landSize: ${q(want.landSize)}`,
      ...(want.layoutSize ? [`layoutSize: ${q(want.layoutSize)}`] : []),
      ...(want.maintenance ? [`maintenance: ${q(want.maintenance)}`] : []),
      ...(want.monthly ? [`monthly: ${q(want.monthly)}`] : []),
      `completion: ${q(want.completion)}`,
      `image: /images/property-${slug}.jpg`,
      'fallbackImage: /images/placeholders/property-01.svg',
      ...(penthouse ? ['penthouse: true'] : []),
      ...(soldOut ? ['soldOut: true'] : []),
      `order: ${++maxOrder}`,
      '---',
      '',
    ].join('\n');
    if (WRITE) writeFileSync(path, fm);
    created++;
    report.push('+ 新项目 ' + slug + ' (' + want.name + ') — 记得上传门面照 property-' + slug + '.jpg');
    continue;
  }

  let raw = readFileSync(path, 'utf8');
  const edits = [];
  const setStr = (key, value) => {
    const re = new RegExp('^' + key + ':\\s*(.*)$', 'm');
    const m = raw.match(re);
    const old = m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
    if (value === '' || value === undefined) {
      // Blank normally means "no info in the sheet" and is ignored, so a
      // half-filled row can never wipe live copy. CLEARABLE fields are the
      // exception: they're optional extras, so an empty cell removes them
      // (e.g. taking a landing page down).
      if (!CLEARABLE.has(key) || !m) return;
      raw = raw.replace(new RegExp('^' + key + ':.*\\n', 'm'), '');
      edits.push(key + ': ' + old + ' → (已移除)');
      return;
    }
    if (old === value) return;
    if (m) raw = raw.replace(re, key + ': ' + q(value));
    else raw = raw.replace(/^(completion:.*)$/m, key + ': ' + q(value) + '\n$1');
    edits.push(key + ': ' + (old ?? '(无)') + ' → ' + value);
  };
  const setFlag = (key, on) => {
    const has = new RegExp('^' + key + ':\\s*true\\s*$', 'm').test(raw);
    if (on === has) return;
    if (on) raw = raw.replace(/^(order:.*)$/m, key + ': true\n$1');
    else raw = raw.replace(new RegExp('^' + key + ':\\s*true\\s*\\n', 'm'), '');
    edits.push(key + ': ' + has + ' → ' + on);
  };

  for (const [k, val] of Object.entries(want)) setStr(k, val);
  setFlag('penthouse', penthouse);
  setFlag('soldOut', soldOut);

  if (edits.length) {
    if (WRITE) writeFileSync(path, raw);
    changedFiles++;
    report.push('~ ' + slug + '\n    ' + edits.join('\n    '));
  }
}

const orphans = readdirSync(PROPS)
  .filter((n) => n.endsWith('.md') && !csvSlugs.has(n.replace('.md', '')));

console.log((WRITE ? '已写入' : '试运行(加 --write 才会写入)') +
  ' · CSV ' + lines.length + ' 行 · 更新 ' + changedFiles + ' · 新增 ' + created +
  (unpublished ? ' · 不上网站 ' + unpublished : ''));
if (report.length) console.log('\n' + report.join('\n'));
if (orphans.length)
  console.log('\n⚠ 网站有但 CSV 没有(不会自动删除,需人工确认): ' + orphans.join(', '));
if (problems.length) {
  console.log('\n❌ 有问题的行:\n' + problems.join('\n'));
  process.exit(2);
}
