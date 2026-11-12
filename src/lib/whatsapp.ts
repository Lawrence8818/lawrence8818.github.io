import { SITE } from '../data/site';

/**
 * Build a WhatsApp click-to-chat link, optionally with a page-specific
 * prefilled message, so Lawrence can tell at a glance which page the buyer came from.
 */
export function waLink(message?: string): string {
  const text = encodeURIComponent(message ?? SITE.whatsappDefaultMessage);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}

/** Build a context-aware prefilled message for a given topic */
export function waContextMessage(context: string, lang: 'en' | 'zh' = 'en'): string {
  return lang === 'zh'
    ? `你好 Lawrence，我在你的网站上看了「${context}」，想进一步了解。`
    : `Hi Lawrence, I read "${context}" on your website and would like to know more.`;
}

/** 中文页面的默认预填讯息 —— 买家用什么语言开口,Lawrence 一看就知道 */
export const WA_DEFAULT_ZH = '你好 Lawrence，我看了你的网站，想咨询买房的事。';
export const WA_LEADMAGNET_ZH = '你好 Lawrence，我想索取免费的《买房指南》。';
