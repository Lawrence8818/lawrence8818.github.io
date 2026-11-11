import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../data/site';
import { propertyOneLine } from '../lib/property-facts';

// llms.txt —— 给 AI 助手看的网站说明书(格式见 llmstxt.org)。
// 一份纯文字的目录:这个网站是谁的、每一页讲什么、每个项目的关键数字。
// 和 robots.txt 一样在构建时生成,项目资料每日同步后会自动跟着更新。
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const abs = (path: string) => new URL(`${base}${path}`, site).href;

  const guides = (await getCollection('guides', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );
  const areas = (await getCollection('areas')).sort((a, b) => a.data.order - b.data.order);
  const properties = (await getCollection('properties')).sort((a, b) => a.data.order - b.data.order);
  const videos = (await getCollection('videos')).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );

  // "Kuala Lumpur, Selangor, Johor and Penang"
  const areasText = new Intl.ListFormat('en', { type: 'conjunction' }).format(SITE.serviceAreas).replace(', and ', ' and ');

  const lines = [
    `# ${SITE.name} ${SITE.nameZh} — Malaysia Property Consultant`,
    '',
    `> ${SITE.name} (${SITE.nameZh}) is a registered estate negotiator in Malaysia (${SITE.renNumber}), in real estate since ${SITE.since}. ` +
      `He specialises in new-launch property in ${areasText}, with a background in the subsale market. ` +
      'This site lists the projects he covers — with starting price, land tenure, unit sizes and completion date — alongside his home-buyer guides.',
    '',
    `- Contact: WhatsApp +${SITE.whatsappNumber} · ${SITE.email}`,
    '- Languages: Chinese, English, Malay',
    '- Project figures are starting prices and developer estimates. They change, so confirm the current price and availability before relying on them.',
    '',
    '## About',
    '',
    `- [About ${SITE.name}](${abs('/about/')}): background, credentials (${SITE.renNumber}) and awards`,
    `- [Client Stories](${abs('/spasignings/')}): first-hand accounts from buyers he has advised`,
    `- [Contact](${abs('/contact/')}): how to reach him, plus common questions about working with him`,
    '',
    '## Buyer guides',
    '',
    `- [Buyer Guide](${abs('/buyerguide/')}): overview of the home-buying process in Malaysia`,
    ...guides.map((g) => `- [${g.data.title}](${abs(`/guides/${g.id}/`)}): ${g.data.description}`),
    '',
    '## Areas',
    '',
    ...areas.map((a) => `- [${a.data.nameEn}](${abs(`/areas/${a.id}/`)}): ${a.data.intro}`),
    '',
    `## Projects (${properties.length})`,
    '',
    `- [All properties](${abs('/allproperties/')}): the full list, filterable by region`,
    ...properties.map(
      (p) => `- [${p.data.name}](${abs(`/properties/${p.id}/`)}): ${propertyOneLine(p.data)}`,
    ),
    '',
    '## Optional',
    '',
    ...videos.map((v) => `- [${v.data.title}](${abs(`/videos/${v.id}/`)})${v.data.description ? `: ${v.data.description}` : ''}`),
    '',
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
