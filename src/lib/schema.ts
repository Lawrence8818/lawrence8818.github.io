import { SITE } from '../data/site';

/** JSON-LD builders — one per page type, output via <JsonLd data={...} /> */

export function agentSchema(siteUrl: string) {
  const sameAs = Object.values(SITE.socials).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: SITE.name,
    alternateName: `Lawrence Law ${SITE.nameZh}`,
    description: `${SITE.tagline}. Areas served: ${SITE.serviceAreas.join(', ')}.`,
    url: siteUrl,
    areaServed: SITE.serviceAreas.map((name) => ({ '@type': 'AdministrativeArea', name })),
    knowsLanguage: ['zh', 'en', 'ms'],
    ...(sameAs.length > 0 ? { sameAs } : {}),
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
    author: { '@type': 'Person', name: SITE.name },
    ...(opts.image ? { image: opts.image } : {}),
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
