import { SITE } from '../data/site';

/**
 * 把项目的资料栏位写成完整句子 —— 项目页的摘要、问答和 llms.txt 都用这里。
 *
 * AI 搜索引用的是「能直接当答案的句子」,光有一格一格的规格表不够。
 * 所有内容都只从现有栏位推出来,不加任何资料里没有的说法;
 * 金额只讲月供,不写售价(Lawrence 2026-11-11 的要求);
 * 每日同步改了 CSV,这些句子会跟着变,不用手写。
 */
export interface PropertyFacts {
  name: string;
  priceFrom: string;
  location: string;
  region?: string;
  tenure: string;
  landSize: string;
  layoutSize?: string;
  maintenance?: string;
  monthly?: string;
  completion: string;
  soldOut?: boolean;
}

export const REGION_LABEL: Record<string, string> = {
  'kuala-lumpur': 'Kuala Lumpur',
  klcc: 'KLCC',
  'petaling-jaya': 'Petaling Jaya',
  selangor: 'Selangor',
  johor: 'Johor',
  penang: 'Penang',
};

const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const isRm = (s?: string) => !!s && /^RM\s*[\d,]+/.test(s);
const sqft = (s: string) => s.replace(/\bsf\b/g, 'sq ft');

/**
 * "Taman Desa, KL" → "Taman Desa, Kuala Lumpur"。只展开缩写,不拿 region 去补:
 * region 是网站筛选用的分组(Seri Kembangan 归在 kuala-lumpur 组,但它在雪兰莪),
 * 硬接上去就成了写错的地址。唯一的例外是 klcc 组 —— KLCC 一定在吉隆坡。
 */
export function placeText(d: PropertyFacts): string {
  let loc = d.location.replace(/\bKL\b/g, 'Kuala Lumpur').replace(/\bPJ\b/g, 'Petaling Jaya');
  if (d.region === 'klcc' && !loc.includes('Kuala Lumpur')) loc = `${loc}, Kuala Lumpur`;
  return loc;
}

/** "RM 626,000" → 626000;不是数字价格(如 Price on request)回传 undefined */
export function priceNumber(priceFrom: string): number | undefined {
  if (!isRm(priceFrom)) return undefined;
  const n = parseInt((priceFrom.match(/[\d,]+/)?.[0] ?? '').replace(/,/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const tenureKnown = (d: PropertyFacts) => !/tbc|tba/i.test(d.tenure);

function tenureSentence(d: PropertyFacts): string {
  if (!tenureKnown(d)) return `The land tenure for ${d.name} has not been confirmed yet.`;
  return `${d.name} is ${lcFirst(d.tenure)}.`;
}

function landPhrase(d: PropertyFacts): string {
  // 只有写成「几英亩」的才入句;"-"、"Part of … masterplan" 这类留在规格表里
  const m = d.landSize.match(/^[\d.]+\s*acres?\b.*$/i);
  return m ? d.landSize.replace(/\bAcres\b/, 'acres') : '';
}

function layoutSentence(d: PropertyFacts, withName: boolean): string {
  if (!d.layoutSize) return '';
  const subject = withName ? `Unit layouts at ${d.name}` : 'Unit layouts';
  const range = d.layoutSize.match(/^([\d,]+)–([\d,]+)\s*sf$/);
  return range
    ? `${subject} range from ${range[1]} to ${range[2]} sq ft.`
    : `${subject} are listed at ${sqft(d.layoutSize)}.`;
}

function completionSentence(d: PropertyFacts): string {
  const c = d.completion.trim();
  let m: RegExpMatchArray | null;
  if (/^completed$/i.test(c)) return `${d.name} is completed.`;
  if ((m = c.match(/^completed\s+(.+)$/i))) return `${d.name} was completed in ${m[1]}.`;
  if (/^(tba|tbc)$/i.test(c)) return `The completion date for ${d.name} has not been announced yet.`;
  if (/months/i.test(c)) return `${d.name} is expected to be completed ${c}.`;
  if ((m = c.match(/^est\.?\s+(.+)$/i))) return `Completion of ${d.name} is estimated for ${m[1]}.`;
  return `The target completion date for ${d.name} is ${c}.`;
}

// 不写售价 —— Lawrence 要求对外只讲月供。月供数字来自 CSV 的 monthly_from,
// 没填的项目就不提金额,不自己拿售价去推算。
function instalmentSentence(d: PropertyFacts): string {
  if (d.soldOut || !isRm(d.monthly)) return '';
  return `The estimated monthly instalment for ${d.name} starts from about ${d.monthly}.`;
}

const hasMaintenance = (d: PropertyFacts) => isRm(d.maintenance);
const maintenanceText = (d: PropertyFacts) => (d.maintenance ?? '').replace(/\bpsf\b/, 'per sq ft');

/** 项目页顶部那段事实摘要 */
export function propertySummary(d: PropertyFacts): string {
  const land = landPhrase(d);
  return [
    `${d.name} is a ${d.soldOut ? 'fully sold ' : ''}property development in ${placeText(d)}, Malaysia.`,
    tenureKnown(d)
      ? `It is ${lcFirst(d.tenure)}${land ? ` and the site covers ${land}` : ''}.`
      : tenureSentence(d) + (land ? ` The site covers ${land}.` : ''),
    layoutSentence(d, false),
    instalmentSentence(d),
    hasMaintenance(d) ? `The maintenance fee is ${maintenanceText(d)}.` : '',
    completionSentence(d),
  ]
    .filter(Boolean)
    .join(' ');
}

/** 项目页的问答 —— 买家(和 AI)实际会问的那几题 */
export function propertyFaqs(d: PropertyFacts): { question: string; answer: string }[] {
  const phone = `+${SITE.whatsappNumber}`;
  const faqs: { question: string; answer: string }[] = [];

  const instalment = instalmentSentence(d);
  faqs.push(
    d.soldOut
      ? { question: `Is ${d.name} still available?`, answer: `No — ${d.name} is fully sold.` }
      : {
          question: `What is the monthly instalment for ${d.name}?`,
          answer: instalment
            ? `${instalment} The actual figure depends on your loan margin, interest rate and tenure.`
            : `The instalment for ${d.name} depends on the unit you choose and on your loan margin, interest rate and tenure. Message ${SITE.name} on WhatsApp (${phone}) for an estimate based on your own numbers.`,
        },
  );

  faqs.push({
    question: `Where is ${d.name} located?`,
    answer: `${d.name} is located in ${placeText(d)}, Malaysia.`,
  });

  faqs.push({
    question: `Is ${d.name} freehold or leasehold?`,
    answer: tenureSentence(d),
  });

  faqs.push({
    question: /^completed/i.test(d.completion)
      ? `Is ${d.name} completed?`
      : `When will ${d.name} be completed?`,
    answer: completionSentence(d),
  });

  if (d.layoutSize) {
    faqs.push({
      question: `What unit sizes are available at ${d.name}?`,
      answer: layoutSentence(d, true),
    });
  }

  if (hasMaintenance(d)) {
    faqs.push({
      question: `What is the maintenance fee at ${d.name}?`,
      answer: `The maintenance fee at ${d.name} is ${maintenanceText(d)}.`,
    });
  }

  if (!d.soldOut) {
    faqs.push({
      question: `How can I get the floor plans and price list for ${d.name}?`,
      answer: `Message ${SITE.name} on WhatsApp at ${phone}. He is a registered estate negotiator in Malaysia (${SITE.renNumber}) and will send the layout plans, price list and current availability for ${d.name}.`,
    });
  }

  return faqs;
}

/** 给 schema 用的规格清单(名称 + 值),"-" 之类的空值不输出 */
export function propertySpecs(d: PropertyFacts): { name: string; value: string }[] {
  const blank = (v?: string) => !v || /^[-—]$/.test(v.trim());
  return [
    { name: 'Land tenure', value: d.tenure },
    { name: 'Land size', value: d.landSize },
    { name: 'Unit size', value: d.layoutSize },
    { name: 'Estimated monthly instalment from', value: d.monthly },
    { name: 'Maintenance fee', value: d.maintenance },
    { name: 'Completion', value: d.completion },
    { name: 'Sales status', value: d.soldOut ? 'Fully sold' : undefined },
  ].filter((s): s is { name: string; value: string } => !blank(s.value));
}

/** llms.txt 里每个项目的一行 */
export function propertyOneLine(d: PropertyFacts): string {
  return [
    placeText(d),
    d.soldOut ? 'fully sold' : isRm(d.monthly) ? `monthly instalment from about ${d.monthly}` : '',
    d.tenure,
    d.layoutSize ? sqft(d.layoutSize) : '',
    `completion: ${d.completion}`,
  ]
    .filter(Boolean)
    .join(' · ');
}
