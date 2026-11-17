// 落地页的中文版:从英文落地页 + 一份译文对照表,生成中文页。
//
//   node scripts/landing-i18n.mjs extract <slug>   列出这一页所有要翻译的文字(JSON,给译者用)
//   node scripts/landing-i18n.mjs check            每一页还有几段没翻
//   (生成中文页由 scripts/stage-landing-pages.mjs 在构建时调用 translatePage)
//
// 做法:英文页 landing-pages/<slug>.html 仍是唯一的源文件。译文放在
// landing-pages/zh/<slug>.json,是「英文原文 → 中文」的对照表。构建时按对照表
// 把英文页里的文字逐段换成中文,其余(版面、图片、脚本)原样不动。
// 英文页以后改了字,没有对应译文的那一段会保留英文,构建时会提示。
//
// 一段(unit)= 一个只含文字和行内标签的元素的内容,例如一个 <p>、<li>、<h2>、按钮。
// 行内的图标(<svg>、<img>)换成 ⟦0⟧ 这样的记号,译文里原样保留记号即可。
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parse } from 'parse5';

const ROOT = new URL('../', import.meta.url).pathname;
export const SRC = ROOT + 'landing-pages/';
export const ZH = SRC + 'zh/';

const SKIP = new Set(['script', 'style', 'svg', 'noscript', 'template', 'head', 'iframe', 'canvas', 'video', 'audio', 'picture']);
const INLINE = new Set(['b', 'strong', 'i', 'em', 'span', 'a', 'br', 'small', 'sup', 'sub', 'u', 'mark', 'svg', 'img', 'abbr', 'code', 'wbr', 'font', 'label']);
const ATTRS = ['placeholder', 'alt', 'title', 'aria-label'];
const META = new Set(['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description']);
const hasWords = (s) => /[A-Za-z]{2,}/.test(s.replace(/&[a-z#0-9]+;/gi, ' ').replace(/<[^>]+>/g, ' '));
const norm = (s) => s.replace(/\s+/g, ' ').trim();

const isEl = (n) => !!n.tagName;
const isText = (n) => n.nodeName === '#text';
function onlyInline(node) {
  for (const c of node.childNodes || []) {
    if (isEl(c)) {
      if (!INLINE.has(c.tagName)) return false;
      if (c.tagName !== 'svg' && !onlyInline(c)) return false;
    }
  }
  return true;
}

/** 把一段里的 <svg>…</svg> 和 <img …> 换成记号,返回 {text, tokens} */
function tokenize(html) {
  const tokens = [];
  const text = html.replace(/<svg[\s\S]*?<\/svg>|<img\b[^>]*>/gi, (m) => {
    tokens.push(m);
    return '⟦' + (tokens.length - 1) + '⟧';
  });
  return { text, tokens };
}
const detokenize = (text, tokens) => text.replace(/⟦(\d+)⟧/g, (_, i) => tokens[+i] ?? '');

/**
 * 走一遍页面,找出所有要翻译的地方。
 * 返回 [{kind, start, end, source, tokens?}],start/end 是在原始 html 字符串里的位置。
 */
export function findUnits(html) {
  const doc = parse(html, { sourceCodeLocationInfo: true });
  const units = [];
  const push = (kind, start, end, raw, extra = {}) => {
    if (start == null || end == null || end <= start) return;
    const lead = raw.match(/^\s*/)[0].length;
    const trail = raw.match(/\s*$/)[0].length;
    const body = raw.slice(lead, raw.length - trail);
    if (!body || !hasWords(body)) return;
    units.push({ kind, start: start + lead, end: end - trail, source: body, ...extra });
  };

  const walk = (node) => {
    for (const c of node.childNodes || []) {
      if (!isEl(c)) continue;
      const loc = c.sourceCodeLocation;
      // 属性里的字(占位提示、图片说明等)
      if (loc?.attrs) {
        for (const a of c.attrs || []) {
          const isMeta = c.tagName === 'meta' && a.name === 'content' &&
            META.has((c.attrs.find((x) => x.name === 'name' || x.name === 'property') || {}).value);
          const isBtnValue = c.tagName === 'input' && a.name === 'value' &&
            ['submit', 'button'].includes((c.attrs.find((x) => x.name === 'type') || {}).value);
          const isWa = c.tagName === 'a' && a.name === 'href' && /wa\.me\/|api\.whatsapp\.com/.test(a.value) && /[?&]text=/.test(a.value);
          if (!(ATTRS.includes(a.name) || isMeta || isBtnValue || isWa)) continue;
          const al = loc.attrs[a.name];
          if (!al) continue;
          const rawAttr = html.slice(al.startOffset, al.endOffset); // name="value"
          const m = rawAttr.match(/^[^=]+=\s*(["'])([\s\S]*)\1$/);
          if (!m) continue;
          const vStart = al.startOffset + rawAttr.indexOf(m[1]) + 1;
          if (isWa) {
            const tm = m[2].match(/([?&]text=)([^&"']*)/);
            if (!tm) continue;
            const tStart = vStart + m[2].indexOf(tm[0]) + tm[1].length;
            let decoded;
            try { decoded = decodeURIComponent(tm[2].replace(/\+/g, ' ')); } catch { continue; }
            if (hasWords(decoded)) units.push({ kind: 'wa', start: tStart, end: tStart + tm[2].length, source: decoded });
          } else {
            push('attr', vStart, vStart + m[2].length, m[2], { quote: m[1] });
          }
        }
      }
      if (c.tagName === 'title' && loc?.startTag && loc?.endTag) {
        push('html', loc.startTag.endOffset, loc.endTag.startOffset, html.slice(loc.startTag.endOffset, loc.endTag.startOffset));
        continue;
      }
      if (c.tagName === 'head') { walk(c); continue; }
      if (SKIP.has(c.tagName)) continue;
      const directText = (c.childNodes || []).some((t) => isText(t) && hasWords(t.value));
      if (directText && loc?.startTag && loc?.endTag && onlyInline(c)) {
        const s = loc.startTag.endOffset, e = loc.endTag.startOffset;
        const { text, tokens } = tokenize(html.slice(s, e));
        const lead = text.match(/^\s*/)[0].length, trail = text.match(/\s*$/)[0].length;
        const body = text.slice(lead, text.length - trail);
        if (body && hasWords(body)) units.push({ kind: 'html', start: s, end: e, source: body, tokens, pad: [text.slice(0, lead), text.slice(text.length - trail)] });
        continue;
      }
      if (directText) {
        // 文字和区块元素混在一起:每一小段文字单独算一段
        for (const t of c.childNodes) {
          if (isText(t) && hasWords(t.value) && t.sourceCodeLocation) {
            const tl = t.sourceCodeLocation;
            push('html', tl.startOffset, tl.endOffset, html.slice(tl.startOffset, tl.endOffset));
          }
        }
      }
      walk(c);
    }
  };
  walk(doc);

  // JSON-LD 里给搜索引擎看的问答和描述
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    const found = [];
    const visit = (o) => {
      if (Array.isArray(o)) return o.forEach(visit);
      if (!o || typeof o !== 'object') return;
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === 'string') {
          if ((k === 'text' || k === 'description' || k === 'headline' || (k === 'name' && o['@type'] === 'Question')) && hasWords(v)) found.push(v);
        } else visit(v);
      }
    };
    visit(data);
    if (found.length) units.push({ kind: 'ld', start: m.index + m[0].indexOf(m[1]), end: m.index + m[0].indexOf(m[1]) + m[1].length, source: m[1], strings: found });
  }

  // 脚本里显示给访客看的句子(表格提示、预填的 WhatsApp 讯息)
  for (const m of html.matchAll(/<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
    const base = m.index + m[0].indexOf(m[1]);
    for (const lit of m[1].matchAll(/(["'`])((?:(?!\1)[^\\\n]|\\.){8,400})\1/g)) {
      const v = lit[2];
      if (!/[A-Za-z]{2,} [A-Za-z]{2,} [A-Za-z]{2,}/.test(v)) continue;
      if (/[{};=<>]|function|https?:|\.css|querySelector|\$\{/.test(v)) continue;
      // 代码注释里的引号片段不是字面量:前面紧跟着字母的撇号(it's)跳过
      const before = m[1][lit.index - 1] || '';
      if (lit[1] === "'" && /[A-Za-z]/.test(before)) continue;
      units.push({ kind: 'js', start: base + lit.index + 1, end: base + lit.index + 1 + v.length, source: v, quote: lit[1] });
    }
  }
  return units;
}

/** 这一页要翻译的句子(去重),给译者用 */
export function sourceStrings(html) {
  const out = [];
  const seen = new Set();
  const add = (s) => { const k = norm(s); if (k && !seen.has(k)) { seen.add(k); out.push(k); } };
  for (const u of findUnits(html)) {
    if (u.kind === 'ld') u.strings.forEach(add);
    else add(u.source);
  }
  return out;
}

const escAttr = (s, q) => s.replace(/&(?![a-z#0-9]+;)/gi, '&amp;').replace(q === '"' ? /"/g : /'/g, q === '"' ? '&quot;' : '&#39;');
const escJs = (s, q) => s.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), '\\' + q).replace(/\n/g, '\\n');

/** 中文页的版面微调:汉字不拉宽字距、不用斜体,字体接上系统的中文字体 */
const ZH_STYLE = `<style data-zh>
html[lang="zh-Hans"] body,html[lang="zh-Hans"] button,html[lang="zh-Hans"] input,html[lang="zh-Hans"] select,html[lang="zh-Hans"] textarea{font-family:inherit}
html[lang="zh-Hans"] *{letter-spacing:0 !important;font-style:normal !important;font-synthesis:none}
html[lang="zh-Hans"] h1,html[lang="zh-Hans"] h2,html[lang="zh-Hans"] h3{line-height:1.3 !important;word-break:normal;overflow-wrap:anywhere}
html[lang="zh-Hans"] body{line-break:strict}
</style>`;

/**
 * 用对照表把英文页换成中文页。
 * 返回 {html, missing: [没有译文的原文…]}
 */
export function translatePage(html, map) {
  const get = (s) => {
    const v = map[norm(s)];
    return typeof v === 'string' && v.trim() ? v : null;
  };
  const missing = [];
  const edits = [];
  for (const u of findUnits(html)) {
    if (u.kind === 'ld') {
      let data;
      try { data = JSON.parse(u.source); } catch { continue; }
      const swap = (o) => {
        if (Array.isArray(o)) return o.forEach(swap);
        if (!o || typeof o !== 'object') return;
        for (const [k, v] of Object.entries(o)) {
          if (typeof v === 'string') {
            if (u.strings.includes(v)) { const t = get(v); if (t) o[k] = t.replace(/<[^>]+>/g, ''); else missing.push(norm(v)); }
          } else swap(v);
        }
        if (o.inLanguage) o.inLanguage = 'zh-Hans';
      };
      swap(data);
      edits.push({ start: u.start, end: u.end, text: JSON.stringify(data).replace(/</g, '\\u003c') });
      continue;
    }
    const t = get(u.source);
    if (!t) { missing.push(norm(u.source)); continue; }
    let text;
    if (u.kind === 'html') text = u.tokens ? (u.pad?.[0] ?? '') + detokenize(t, u.tokens) + (u.pad?.[1] ?? '') : t;
    else if (u.kind === 'attr') text = escAttr(t.replace(/<[^>]+>/g, ''), u.quote);
    else if (u.kind === 'js') text = escJs(t.replace(/<[^>]+>/g, ''), u.quote);
    else if (u.kind === 'wa') text = encodeURIComponent(t.replace(/<[^>]+>/g, ''));
    edits.push({ start: u.start, end: u.end, text });
  }
  edits.sort((a, b) => b.start - a.start);
  let out = html;
  let last = Infinity;
  for (const e of edits) {
    if (e.end > last) continue; // 重叠的保守跳过
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    last = e.start;
  }
  out = out.replace(/<html\b([^>]*)>/i, (m, attrs) => '<html' + (/\blang=/.test(attrs) ? attrs.replace(/\blang=(["'])[^"']*\1/, 'lang="zh-Hans"') : attrs + ' lang="zh-Hans"') + '>');
  out = out.replace(/(<meta property="og:locale" content=")[^"]*"/, '$1zh_CN"');
  out = out.replace(/<\/head>/i, ZH_STYLE + '\n</head>');
  return { html: out, missing: [...new Set(missing)] };
}

export function loadMap(slug) {
  const p = ZH + slug + '.json';
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ---- 命令行 ----
if (import.meta.url === 'file://' + process.argv[1]) {
  const [cmd, slug] = process.argv.slice(2);
  if (cmd === 'extract' && slug) {
    console.log(JSON.stringify(sourceStrings(readFileSync(SRC + slug + '.html', 'utf8')), null, 1));
  } else if (cmd === 'check') {
    for (const f of readdirSync(SRC).filter((n) => n.endsWith('.html')).sort()) {
      const s = f.replace(/\.html$/, '');
      const map = loadMap(s);
      const all = sourceStrings(readFileSync(SRC + f, 'utf8'));
      if (!map) { console.log(s.padEnd(20) + '没有中文版(' + all.length + ' 段)'); continue; }
      const miss = all.filter((x) => !(typeof map[x] === 'string' && map[x].trim()));
      console.log(s.padEnd(20) + all.length + ' 段,未翻 ' + miss.length);
      miss.slice(0, 5).forEach((x) => console.log('    · ' + x.slice(0, 90)));
    }
  } else {
    console.error('用法: node scripts/landing-i18n.mjs extract <slug> | check');
    process.exit(1);
  }
}
