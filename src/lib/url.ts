/**
 * base-aware 内部链接助手。
 * 全站所有内部 href/src 必须经过这个函数,禁止写裸的 "/xxx" 路径,
 * 否则部署在 GitHub Pages 子路径(/LLP-recruitment-website/)下会 404。
 */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${base}${path}`;
}
