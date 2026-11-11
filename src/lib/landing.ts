import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { url } from './url';

const OWN_HOSTS = new Set(['lawrencelawproperty.com', 'www.lawrencelawproperty.com']);

/**
 * landingUrl 来自 Project-Info-Master 的 landing_page 栏,写的是完整网址
 * (https://lawrencelawproperty.com/<slug>)。这里把它换成站内链接,并且
 * 只在 landing-pages/<slug>.html 真的存在时才返回。
 *
 * 落地页下架后(theatera、kingswoodzexsim 就是这样),CSV 里的网址还在,
 * 卡片会一直指向 404。有了这层检查,卡片自动退回项目详情页。
 */
export function landingHref(landingUrl?: string): string | undefined {
  if (!landingUrl) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(landingUrl, 'https://www.lawrencelawproperty.com');
  } catch {
    return undefined;
  }
  // 别的网站的链接原样保留,不归这里管
  if (!OWN_HOSTS.has(parsed.hostname)) return landingUrl;

  const slug = parsed.pathname.replace(/^\/+|\/+$/g, '');
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  return existsSync(join(process.cwd(), 'landing-pages', `${slug}.html`)) ? url(`/${slug}/`) : undefined;
}
