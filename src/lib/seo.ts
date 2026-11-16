// 搜索结果里标题大约只显示 60 个半角字符、描述大约 160 个,超出的会被截掉。
// 这里把标题和描述控制在这个范围内。汉字在搜索结果里占两格,所以按「宽度」算:
// 半角字符算 1,汉字和全角标点算 2。
import type { Lang } from '../i18n';

export const TITLE_MAX = 60;
export const DESC_MAX = 160;

export function width(s: string): number {
  let w = 0;
  for (const ch of s) w += ch.codePointAt(0)! > 0x2e7f ? 2 : 1;
  return w;
}

/** 候选标题按「最想用的排前面」给,取第一个放得下的;都放不下就取最短的 */
export function fitTitle(candidates: string[]): string {
  const c = candidates.filter(Boolean);
  return c.find((t) => width(t) <= TITLE_MAX) ?? c.reduce((a, b) => (width(b) < width(a) ? b : a));
}

const BRAND: Record<Lang, string> = { en: ' | Lawrence Law', zh: '｜Lawrence Law 刘智权' };

/** 页面标题 + 品牌名;放不下就只留页面标题(标题本身比品牌名重要) */
export function brandTitle(lang: Lang, title: string): string {
  // 标题里已经有名字的(例如 About 页)不再重复加
  if (title.includes('Lawrence Law')) return title;
  return fitTitle([title + BRAND[lang], title]);
}

/**
 * 描述超长时收短:优先在一句话结束的地方截(不留半句),
 * 找不到合适的句末就在词与词之间截,加省略号。
 */
export function clipDescription(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (width(t) <= DESC_MAX) return t;
  // 走到放得下的最后一个字符
  let w = 0, end = 0;
  for (const ch of t) {
    const cw = ch.codePointAt(0)! > 0x2e7f ? 2 : 1;
    if (w + cw > DESC_MAX) break;
    w += cw;
    end += ch.length;
  }
  const head = t.slice(0, end);
  // 句末:英文的 . ! ? 后面跟空格,或中文的 。！？
  let cut = -1;
  for (const m of head.matchAll(/[.!?](?=\s)|[。！？]/g)) cut = m.index! + 1;
  if (cut > 0 && width(head.slice(0, cut)) >= DESC_MAX * 0.5) return head.slice(0, cut).trim();
  // 词间:最后一个空格或中文逗号
  const soft = Math.max(head.lastIndexOf(' ', end - 2), head.lastIndexOf('，'), head.lastIndexOf('、'));
  const body = (soft > end * 0.6 ? head.slice(0, soft) : head.slice(0, end - 1)).replace(/[\s,;:，、—–-]+$/, '');
  return body + '…';
}
