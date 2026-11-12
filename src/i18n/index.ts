import { url } from '../lib/url';

// 双语支持。英文是默认语言,网址不变;中文版在 /zh/ 下面。
//
// 组件里不用层层传语言:Astro 会按网址算出 Astro.currentLocale,
// 任何组件里写 `const lang = langOf(Astro)` 就知道现在是哪个语言。
export type Lang = 'en' | 'zh';

export function langOf(astro: { currentLocale?: string }): Lang {
  return astro.currentLocale === 'zh' ? 'zh' : 'en';
}

/** 二选一:`pick(lang, 'Properties', '项目')` */
export function pick<T>(lang: Lang, en: T, zh: T): T {
  return lang === 'zh' ? zh : en;
}

/**
 * 哪些页面有中文版(路径不含 /zh,不含 base)。
 * 第一批:首页、About、指南(列表 + 文章)、项目列表、项目详情页。
 * 以后翻了新的页面,加在这里,导航和语言切换就会自动接上。
 */
export function hasZh(path: string): boolean {
  const p = path.split('#')[0].split('?')[0].replace(/\/?$/, '/');
  return (
    p === '/' ||
    p === '/about/' ||
    p === '/allproperties/' ||
    p === '/guides/' ||
    /^\/guides\/[^/]+\/$/.test(p) ||
    /^\/properties\/[^/]+\/$/.test(p)
  );
}

/**
 * 站内链接。中文页面里的链接:目标有中文版就去中文版,没有就去英文版
 * (总比死链接好)。英文页面里的链接永远是英文版。
 */
export function href(lang: Lang, path: string): string {
  return lang === 'zh' && hasZh(path) ? url('/zh' + path) : url(path);
}

/** 当前页面的路径(去掉 base 和 /zh 前缀),例如 "/guides/spa-7-pitfalls/" */
export function barePath(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/^\/zh(\/|$)/, '/');
  return p.replace(/\/?$/, '/');
}

export const HTML_LANG: Record<Lang, string> = { en: 'en', zh: 'zh-Hans' };
