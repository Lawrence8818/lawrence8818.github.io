import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/** 买房指南文章:src/content/guides/*.md,一篇文章 = 一个文件 */
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Buying Basics', 'Avoiding Pitfalls', 'Loans & Financing', 'The Buying Process']),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: z.string().optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    /** 可选:关联视频的 slug,文章页会嵌入该视频 */
    relatedVideo: z.string().optional(),
  }),
});

/** 视频:src/content/videos/*.md,一支视频 = 一个文件,正文是 show notes(可空) */
const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    /** optional Chinese title shown as a secondary bilingual line */
    titleZh: z.string().optional(),
    description: z.string().default(''),
    platform: z.enum(['youtube', 'tiktok', 'instagram', 'facebook']),
    /** YouTube 视频 ID(仅 platform=youtube 时需要,用于站内嵌入) */
    videoId: z.string().optional(),
    /** 视频原始链接(所有平台都要填) */
    videoUrl: z.string(),
    category: z.enum(['Pitfalls', 'Loans', 'Process', 'Projects', 'Q&A']),
    thumbnail: z.string().default('/images/placeholders/video-thumb-default.svg'),
    publishDate: z.coerce.date(),
    featured: z.boolean().default(false),
    /** true = YouTube 长视频,视频页会突出 show notes 排版 */
    longform: z.boolean().default(false),
  }),
});

/** 区域落地页:src/content/areas/*.md,正文是该区域的长文 SEO 内容 */
const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    name: z.string(),
    nameEn: z.string(),
    region: z.enum(['klang-valley', 'johor', 'penang']),
    heroImage: z.string(),
    intro: z.string(),
    highlights: z.array(z.string()),
    hotProjects: z
      .array(
        z.object({
          name: z.string(),
          type: z.string(),
          priceFrom: z.string().optional(),
          note: z.string().optional(),
        }),
      )
      .optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    order: z.number(),
  }),
});

/** Featured properties: src/content/properties/*.md, one listing = one file */
const properties = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/properties' }),
  schema: z.object({
    name: z.string(),
    /** pill label, e.g. FAMILY-ORIENTED / INVESTMENT PICK */
    label: z.string().optional(),
    priceFrom: z.string(),
    location: z.string(),
    /** used by the /properties filter bar */
    region: z.enum(['kuala-lumpur', 'klcc', 'petaling-jaya', 'selangor', 'johor', 'penang']).optional(),
    type: z.string().optional(),
    tenure: z.string(),
    landSize: z.string(),
    /** unit layout size range, e.g. "1,000–1,800 sf" — shown on the card
     *  in place of the maintenance fee */
    layoutSize: z.string().optional(),
    /** kept as data; no longer displayed on the card */
    maintenance: z.string().optional(),
    /** estimated monthly instalment, as shown on the official site */
    monthly: z.string().optional(),
    completion: z.string(),
    image: z.string().default('/images/placeholders/property-01.svg'),
    /** branded placeholder shown until the real photo file is uploaded */
    fallbackImage: z.string().default('/images/placeholders/property-01.svg'),
    listingUrl: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
    /** true = sample data, card shows a "Sample" tag; replace before launch */
    placeholder: z.boolean().default(false),
    /** true = project fully sold; card stays as track record with a SOLD OUT badge */
    soldOut: z.boolean().default(false),
    /** true = has layouts of 1,400 sq ft or larger; card gets a PENTHOUSE
     *  pill and the listing appears under the Special → Penthouse filter */
    penthouse: z.boolean().default(false),
  }),
});

/** 客户见证:单个 JSON 文件,一条见证 = 数组里一个对象 */
const testimonials = defineCollection({
  loader: file('./src/content/testimonials.json'),
  schema: z.object({
    id: z.string(),
    /** headline of the testimonial, as on the official site */
    title: z.string(),
    quote: z.string(),
    name: z.string(),
    /** client's occupation, e.g. "Fintech Leader" */
    role: z.string().default(''),
    image: z.string().default('/images/placeholders/signing-01.svg'),
    /** branded placeholder shown until the real photo file is uploaded */
    fallbackImage: z.string().default('/images/placeholders/signing-01.svg'),
    featured: z.boolean().default(false),
    /** true = the real photo is still pending; card shows a small tag */
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { guides, videos, areas, properties, testimonials };
