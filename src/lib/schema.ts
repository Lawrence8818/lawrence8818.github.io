import { SITE } from '../data/site';
import { AWARDS } from '../data/awards';
import { url } from './url';

/** JSON-LD builders — one per page type, output via <JsonLd data={...} /> */

// 全站各页的 schema 用 @id 互相指向同一个「人」和同一个「业务」,
// AI / 搜索引擎才会把分散在各页的资料归到同一个实体上。
const agentId = (siteUrl: string) => `${new URL(url('/'), siteUrl).href}#agent`;
const personId = (siteUrl: string) => `${new URL(url('/'), siteUrl).href}#lawrence`;

/** REN 执照 —— 马来西亚中介身份最硬的一项凭证 */
function renCredential() {
  return {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'license',
    name: `Registered Estate Negotiator (${SITE.renNumber})`,
    recognizedBy: {
      '@type': 'Organization',
      name: 'Board of Valuers, Appraisers, Estate Agents and Property Managers (BOVAEP) Malaysia',
    },
  };
}

// 奖项只写名称和年份,不带颁奖机构 —— Lawrence 不希望显示所属公司
const awardList = () => AWARDS.map((a) => `${a.title} (${a.year})`);

const portraitUrl = (siteUrl: string) => new URL(url('/images/lawrence-portrait.jpg'), siteUrl).href;

/** 全站每一页都带的身份资料 */
export function agentSchema(siteUrl: string) {
  const sameAs = Object.values(SITE.socials).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': agentId(siteUrl),
    name: SITE.name,
    alternateName: [SITE.nameZh, `Lawrence Law ${SITE.nameZh}`],
    description:
      `${SITE.tagline}. Registered estate negotiator in Malaysia (${SITE.renNumber}), ` +
      `in real estate since ${SITE.since}. Areas served: ${SITE.serviceAreas.join(', ')}.`,
    url: siteUrl,
    image: portraitUrl(siteUrl),
    logo: new URL(url('/images/logo.png'), siteUrl).href,
    telephone: `+${SITE.whatsappNumber}`,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.addressParts.street,
      postalCode: SITE.addressParts.postcode,
      addressLocality: SITE.addressParts.city,
      addressCountry: 'MY',
    },
    areaServed: SITE.serviceAreas.map((name) => ({ '@type': 'AdministrativeArea', name })),
    knowsLanguage: ['zh', 'en', 'ms'],
    identifier: { '@type': 'PropertyValue', propertyID: 'REN', value: SITE.renNumber.replace(/^REN\s*/, '') },
    hasCredential: renCredential(),
    award: awardList(),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/** About 页:把 Lawrence 本人标成一个 Person,并声明这一页是他的个人档案 */
export function profileSchema(opts: { siteUrl: string; url: string; description: string }) {
  const sameAs = Object.values(SITE.socials).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: opts.url,
    mainEntity: {
      '@type': 'Person',
      '@id': personId(opts.siteUrl),
      name: SITE.name,
      alternateName: SITE.nameZh,
      jobTitle: 'Registered Estate Negotiator',
      description: opts.description,
      url: opts.url,
      image: portraitUrl(opts.siteUrl),
      telephone: `+${SITE.whatsappNumber}`,
      knowsLanguage: ['zh', 'en', 'ms'],
      hasCredential: renCredential(),
      award: awardList(),
      worksFor: { '@id': agentId(opts.siteUrl) },
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: opts.datePublished.toISOString(),
    dateModified: (opts.dateModified ?? opts.datePublished).toISOString(),
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      '@id': personId(opts.url),
      name: SITE.name,
      url: new URL(url('/about/'), opts.url).href,
    },
    publisher: { '@id': agentId(opts.url) },
    ...(opts.image ? { image: opts.image } : {}),
  };
}

/**
 * 项目详情页:一个 RealEstateListing(这一页)+ 它讲的那个项目(Place ——
 * 清单里也有办公楼,不能一律标成住宅)。
 * 不输出售价(offers):对外只讲月供,月供在 additionalProperty 里。
 */
export function propertyListingSchema(opts: {
  url: string;
  name: string;
  description: string;
  locality: string;
  image?: string;
  specs: { name: string; value: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${opts.url}#listing`,
    url: opts.url,
    name: `${opts.name}, ${opts.locality}`,
    description: opts.description,
    inLanguage: 'en',
    ...(opts.image ? { image: opts.image } : {}),
    mainEntity: {
      '@type': 'Place',
      name: opts.name,
      ...(opts.image ? { image: opts.image } : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality: opts.locality,
        addressCountry: 'MY',
      },
      additionalProperty: opts.specs.map((s) => ({
        '@type': 'PropertyValue',
        name: s.name,
        value: s.value,
      })),
    },
  };
}

export function videoSchema(opts: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: Date;
  embedUrl?: string;
  contentUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: opts.name,
    description: opts.description || opts.name,
    thumbnailUrl: opts.thumbnailUrl,
    uploadDate: opts.uploadDate.toISOString(),
    ...(opts.embedUrl ? { embedUrl: opts.embedUrl } : {}),
    ...(opts.contentUrl ? { contentUrl: opts.contentUrl } : {}),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
