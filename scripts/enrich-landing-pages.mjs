// Post-build:给落地页补上机器可读的资料(AEO)。
//
//   node scripts/enrich-landing-pages.mjs     ← `npm run build` 的最后一步
//
// landing-pages/<slug>.html 是手工做的独立页面,Astro 不碰它们,所以站内其他
// 页面都有的结构化数据,它们一样都没有。这里在 dist/<slug>/index.html 上补:
//
//   1. 网址:canonical / og:url / JSON-LD 里写的还是旧平台时期的
//      https://lawrencelawproperty.com/<slug>(apex、没有结尾斜线),访问时要
//      跳转两次才到真正的页面。改成这次构建的正式网址。
//   2. FAQPage:从页面上看得到的问答(.qa 区块)原文生成,一字不改。
//      页面自己已经有 FAQPage 的不重复加。
//   3. 项目本身:页面没有任何项目 schema 的(目前是 Park Green、Vividz),
//      用页面自己的标题、描述加上项目资料里的地点补一个。
//   4. RealEstateAgent:直接取首页那一份,保证和全站完全一致。
//   5. WebPage + BreadcrumbList:把这一页挂到 Lawrence 名下、挂进站内层级。
//
// 只改 dist,不改 landing-pages/ 里的源文件 —— 源文件仍是作者写的原样。
// 页面文字怎么写,这里就怎么读;不往里加任何页面上没有的说法。
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname;
const SRC = ROOT + 'landing-pages/';
const DIST = ROOT + 'dist/';
const PROPS = ROOT + 'src/content/properties/';
const MARK = '<!-- structured data added at build time: scripts/enrich-landing-pages.mjs -->';

if (!existsSync(DIST + 'index.html')) {
  console.error('dist/index.html 不存在 —— 这个脚本要在 astro build 之后跑');
  process.exit(1);
}

// ---- 取首页的正式网址和身份资料,落地页跟它保持一致 ----
const home = readFileSync(DIST + 'index.html', 'utf8');
const siteRoot = (home.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
if (!siteRoot) {
  console.error('首页没有 canonical,无法确定正式网址');
  process.exit(1);
}
const ldBlocks = (html) =>
  [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((m) => {
    try {
      const j = JSON.parse(m[1]);
      return Array.isArray(j['@graph']) ? j['@graph'] : [j];
    } catch {
      return [];
    }
  });
const agent = ldBlocks(home).find((b) => b['@type'] === 'RealEstateAgent');
if (!agent || !agent['@id']) {
  console.error('首页找不到 RealEstateAgent schema');
  process.exit(1);
}

// ---- HTML 片段 → 纯文字 ----
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', middot: '·', hellip: '…', times: '×', deg: '°',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', asymp: '≈', sup2: '²',
};
const unknownEntities = new Set();
const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z0-9]+);/g, (m, name) => {
      if (name in ENT) return ENT[name];
      unknownEntities.add(m);
      return m;
    })
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();

/** 页面上的问答:<div class="qa"><button>问</button><div class="ans">答</div></div> */
function readFaqs(html) {
  const faqs = [];
  const re = /<div class="qa">\s*<button[^>]*>([\s\S]*?)<\/button>\s*<div class="ans">/g;
  let m;
  while ((m = re.exec(html))) {
    // 答案里还有 <div>/<p>,数着层数找到 .ans 的结束标签
    let depth = 1, i = re.lastIndex;
    const tag = /<(\/?)div\b[^>]*>/g;
    tag.lastIndex = i;
    let t, end = -1;
    while ((t = tag.exec(html))) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { end = t.index; break; }
    }
    if (end < 0) continue;
    const question = text(m[1]);
    const answer = text(html.slice(i, end));
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

/** 这个落地页对应哪个项目(项目档的 landingUrl 以 /<slug> 结尾) */
function propertyFor(slug) {
  for (const f of readdirSync(PROPS).filter((n) => n.endsWith('.md'))) {
    const raw = readFileSync(PROPS + f, 'utf8');
    const lu = (raw.match(/^landingUrl:\s*"?([^"\n]+)/m) || [])[1];
    if (!lu || lu.replace(/\/+$/, '').split('/').pop() !== slug) continue;
    const get = (k) => (raw.match(new RegExp('^' + k + ':\\s*"?([^"\\n]*)', 'm')) || [])[1];
    return { name: get('name'), location: get('location') };
  }
  return null;
}

const PROJECT_TYPES = new Set(['Residence', 'ApartmentComplex', 'Apartment', 'Place', 'RealEstateListing', 'Accommodation']);
// JSON 放进 <script> 里:把 < 转掉,内容里出现 </script> 也不会提前结束标签
const ld = (data) =>
  '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';

const pages = readdirSync(SRC).filter((n) => n.endsWith('.html')).sort();
let done = 0;

for (const file of pages) {
  const slug = file.replace(/\.html$/, '');
  const path = DIST + slug + '/index.html';
  if (!existsSync(path)) {
    console.error('缺少 dist/' + slug + '/index.html');
    process.exit(1);
  }
  let html = readFileSync(path, 'utf8');
  if (html.includes(MARK)) continue; // 同一份 dist 跑两次也不会重复加

  const pageUrl = siteRoot + slug + '/';

  // 1) 旧网址 → 正式网址(只动属性值和 JSON 字符串里完整匹配的那几处)
  for (const old of ['https://lawrencelawproperty.com/' + slug, 'https://www.lawrencelawproperty.com/' + slug]) {
    html = html.split('"' + old + '"').join('"' + pageUrl + '"');
    html = html.split('"' + old + '/"').join('"' + pageUrl + '"');
  }
  html = html.split('"https://lawrencelawproperty.com/"').join('"' + siteRoot + '"');
  html = html.split('"https://lawrencelawproperty.com"').join('"' + siteRoot + '"');

  const existing = ldBlocks(html);
  const types = new Set(existing.map((b) => b['@type']));
  const title = text((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || slug);
  const description = text((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const prop = propertyFor(slug);
  // 标题里「—」或「|」前面那一段就是项目名,例如 "Park Green @ Bukit Jalil"
  const shortName = title.split(/\s+[—|]\s+/)[0].trim() || prop?.name || slug;

  const added = [];
  const blocks = [];

  if (![...types].some((t) => PROJECT_TYPES.has(t))) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Residence',
      name: shortName,
      ...(description ? { description } : {}),
      url: pageUrl,
      ...(prop?.location
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: prop.location.replace(/\bKL\b/g, 'Kuala Lumpur').replace(/\bPJ\b/g, 'Petaling Jaya'),
              addressCountry: 'MY',
            },
          }
        : {}),
    });
    added.push('Residence');
  }

  const faqs = types.has('FAQPage') ? [] : readFaqs(html);
  if (faqs.length) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
    added.push('FAQPage×' + faqs.length);
  }

  blocks.push({ ...agent });
  blocks.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: title,
    ...(description ? { description } : {}),
    inLanguage: 'en',
    publisher: { '@id': agent['@id'] },
  });
  blocks.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteRoot },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: siteRoot + 'allproperties/' },
      { '@type': 'ListItem', position: 3, name: shortName, item: pageUrl },
    ],
  });
  added.push('RealEstateAgent', 'WebPage', 'BreadcrumbList');

  if (!/<\/head>/i.test(html)) {
    console.error(slug + ': 找不到 </head>');
    process.exit(1);
  }
  html = html.replace(/<\/head>/i, MARK + '\n' + blocks.map(ld).join('\n') + '\n</head>');
  writeFileSync(path, html);
  done++;
  console.log('  /' + slug.padEnd(20) + added.join(' · '));
}

if (unknownEntities.size) {
  console.error('问答里有没处理的 HTML 实体,请加进 ENT: ' + [...unknownEntities].join(' '));
  process.exit(1);
}
console.log(done + ' 个落地页已补上结构化数据');
