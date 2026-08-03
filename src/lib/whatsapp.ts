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
export function waContextMessage(context: string): string {
  return `Hi Lawrence, I read "${context}" on your website and would like to know more.`;
}
