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

/** "RM 2,060" → 2060;没填月供回传 undefined(配对测验和筛选用) */
export function monthlyNumber(monthly?: string): number | undefined {
  if (!isRm(monthly)) return undefined;
  const n = parseInt((monthly!.match(/[\d,]+/)?.[0] ?? '').replace(/,/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * 卡片和页首那个大字金额。全站不显示售价,只讲月供:
 * 有月供 → "RM 2,060";已售完 → "Fully sold";没填月供 → "Instalment on request"。
 * amount 为 true 时前面可以接 "From"、后面可以接 "/ month"。
 */
export function instalmentDisplay(d: { monthly?: string; soldOut?: boolean }): {
  text: string;
  amount: boolean;
} {
  if (d.soldOut) return { text: 'Fully sold', amount: false };
  if (isRm(d.monthly)) return { text: d.monthly!, amount: true };
  return { text: 'Instalment on request', amount: false };
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

// ════════════════════════════════════════════════════════════════════
// 中文版。和上面的英文版一一对应:同样的栏位、同样的规矩(不写售价、
// 没有月供数字就不提金额、不拿售价推算)。项目名称和地名保留英文原文,
// 只在句子里补上城市 / 州属的中文名。
// ════════════════════════════════════════════════════════════════════

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** "Jun 2029" → "2029 年 6 月";"Q4 2027" → "2027 年第 4 季";认不出的原样返回 */
export function zhDate(text: string): string {
  const t = text.trim();
  let m: RegExpMatchArray | null;
  if ((m = t.match(/^Q([1-4])\s+(\d{4})$/i))) return `${m[2]} 年第 ${m[1]} 季`;
  if ((m = t.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})$/)) && MONTHS[m[2].toLowerCase()])
    return `${m[3]} 年 ${MONTHS[m[2].toLowerCase()]} 月 ${+m[1]} 日`;
  if ((m = t.match(/^([A-Za-z]{3})[a-z]*\s+(\d{4})$/)) && MONTHS[m[1].toLowerCase()])
    return `${m[2]} 年 ${MONTHS[m[1].toLowerCase()]} 月`;
  if ((m = t.match(/^(\d{4})$/))) return `${m[1]} 年`;
  if ((m = t.match(/^(\d{4})\s*[–-]\s*(\d{4})$/))) return `${m[1]}–${m[2]} 年`;
  return t;
}

/** 规格表里「完工」一格的中文写法 */
export function completionZh(completion: string): string {
  const c = completion.trim();
  let m: RegExpMatchArray | null;
  if (/^completed$/i.test(c)) return '已完工';
  if ((m = c.match(/^completed\s+(.+)$/i))) return `已完工（${zhDate(m[1])}）`;
  if (/^(tba|tbc)$/i.test(c)) return '待公布';
  if ((m = c.match(/^(\d+)\s+months?\s+from\s+SPA$/i))) return `签署 SPA 后 ${m[1]} 个月`;
  if ((m = c.match(/^(\d+)\s+months?\s+after\s+APDL$/i))) return `获批 APDL 后 ${m[1]} 个月`;
  if ((m = c.match(/^est\.?\s+(.+)$/i))) return `预计 ${zhDate(m[1])}`;
  return zhDate(c);
}

/** "Leasehold (to Aug 2123)" → "租赁地契（至 2123 年 8 月）" */
export function tenureZh(tenure: string): string {
  const t = tenure.trim();
  if (/tbc|tba/i.test(t)) return '地契待确认';
  const m = t.match(/^(Freehold|Leasehold)\s*(?:\((.+)\))?$/i);
  if (!m) return t;
  const kind = /^free/i.test(m[1]) ? '永久地契' : '租赁地契';
  if (!m[2]) return kind;
  const to = m[2].match(/^to\s+(.+)$/i);
  return `${kind}（${to ? '至 ' + zhDate(to[1]) : m[2]}）`;
}

const sizeZh = (s: string) => s.replace(/\bsf\b/g, '平方尺').replace(/\bacres?\b/gi, '英亩');
const maintenanceZh = (d: PropertyFacts) => `每平方尺 ${(d.maintenance ?? '').replace(/\s*psf\b/, '')}`;

/** 地名保留英文,后面补上城市 / 州属的中文名,例如 "Taman Desa, KL（吉隆坡）" */
export function placeZh(d: PropertyFacts): string {
  const loc = d.location;
  const zh = /Kuala Lumpur|\bKL\b|KLCC/.test(loc) || d.region === 'klcc'
    ? '吉隆坡'
    : /Petaling Jaya|\bPJ\b/.test(loc)
      ? '雪兰莪八打灵再也'
      : /Selangor/.test(loc)
        ? '雪兰莪'
        : /Johor/.test(loc)
          ? '柔佛'
          : /Penang/.test(loc)
            ? '槟城'
            : '';
  return zh ? `${loc}（${zh}）` : loc;
}

/** 中英文之间留一个空格;但前面已经是全角括号时不用 */
const gap = (s: string) => (/[）)]$/.test(s) ? '' : ' ');

/** 卡片和页首那个大字金额(中文) */
export function instalmentDisplayZh(d: { monthly?: string; soldOut?: boolean }): {
  text: string;
  amount: boolean;
} {
  if (d.soldOut) return { text: '已售完', amount: false };
  if (isRm(d.monthly)) return { text: d.monthly!, amount: true };
  return { text: '月供请洽询', amount: false };
}

function completionSentenceZh(d: PropertyFacts): string {
  const c = d.completion.trim();
  let m: RegExpMatchArray | null;
  if (/^completed$/i.test(c)) return `${d.name} 已经完工。`;
  if ((m = c.match(/^completed\s+(.+)$/i))) return `${d.name} 已于 ${zhDate(m[1])}完工。`;
  if (/^(tba|tbc)$/i.test(c)) return `${d.name} 的完工日期还没有公布。`;
  if (/months/i.test(c)) return `${d.name} 预计在${completionZh(c)}完工。`;
  if ((m = c.match(/^est\.?\s+(.+)$/i))) return `${d.name} 预计在 ${zhDate(m[1])}完工。`;
  return `${d.name} 的目标完工日期是 ${zhDate(c)}。`;
}

function layoutSentenceZh(d: PropertyFacts, withName: boolean): string {
  if (!d.layoutSize) return '';
  const subject = withName ? `${d.name} 的单位面积` : '单位面积';
  const range = d.layoutSize.match(/^([\d,]+)–([\d,]+)\s*sf$/);
  return range
    ? `${subject}介于 ${range[1]} 至 ${range[2]} 平方尺。`
    : `${subject}是 ${sizeZh(d.layoutSize)}。`;
}

function instalmentSentenceZh(d: PropertyFacts): string {
  if (d.soldOut || !isRm(d.monthly)) return '';
  return `${d.name} 的预估月供从约 ${d.monthly} 起。`;
}

export function propertySummaryZh(d: PropertyFacts): string {
  const land = landPhrase(d);
  return [
    `${d.name} 是位于 ${placeZh(d)}${gap(placeZh(d))}的${d.soldOut ? '已售完' : ''}房产项目。`,
    tenureKnown(d)
      ? `地契属于${tenureZh(d.tenure)}${land ? `，土地面积 ${sizeZh(land)}` : ''}。`
      : `地契类型还有待确认${land ? `，土地面积 ${sizeZh(land)}` : ''}。`,
    layoutSentenceZh(d, false),
    instalmentSentenceZh(d),
    hasMaintenance(d) ? `管理费是${maintenanceZh(d)}。` : '',
    completionSentenceZh(d),
  ]
    .filter(Boolean)
    .join('');
}

export function propertyFaqsZh(d: PropertyFacts): { question: string; answer: string }[] {
  const phone = `+${SITE.whatsappNumber}`;
  const faqs: { question: string; answer: string }[] = [];
  const instalment = instalmentSentenceZh(d);

  faqs.push(
    d.soldOut
      ? { question: `${d.name} 还有单位吗？`, answer: `没有，${d.name} 已经售完。` }
      : {
          question: `${d.name} 的月供大概多少？`,
          answer: instalment
            ? `${instalment}实际数额取决于你的贷款额、利率和年限。`
            : `${d.name} 的月供要看你选的单位，以及你的贷款额、利率和年限。可以 WhatsApp ${SITE.name}（${phone}），按你的情况估算。`,
        },
  );

  faqs.push({ question: `${d.name} 在哪里？`, answer: `${d.name} 位于 ${placeZh(d)}。` });

  faqs.push({
    question: `${d.name} 是永久地契还是租赁地契？`,
    answer: tenureKnown(d) ? `${d.name} 是${tenureZh(d.tenure)}。` : `${d.name} 的地契类型还有待确认。`,
  });

  faqs.push({
    question: /^completed/i.test(d.completion) ? `${d.name} 完工了吗？` : `${d.name} 什么时候完工？`,
    answer: completionSentenceZh(d),
  });

  if (d.layoutSize) {
    faqs.push({ question: `${d.name} 有哪些面积的单位？`, answer: layoutSentenceZh(d, true) });
  }

  if (hasMaintenance(d)) {
    faqs.push({ question: `${d.name} 的管理费是多少？`, answer: `${d.name} 的管理费是${maintenanceZh(d)}。` });
  }

  if (!d.soldOut) {
    faqs.push({
      question: `怎样拿到 ${d.name} 的户型图和价目表？`,
      answer: `WhatsApp 联系 ${SITE.name}（${phone}）。他是马来西亚注册房地产谈判员（${SITE.renNumber}），会把 ${d.name} 的户型图、价目表和目前还有哪些单位发给你。`,
    });
  }

  return faqs;
}

/** 规格表(中文):名称 + 值 */
export function specsZh(d: PropertyFacts): { k: string; v: string }[] {
  const blank = (v?: string) => !v || /^[-—]$/.test(v.trim());
  return [
    { k: '地契', v: tenureZh(d.tenure) },
    { k: '土地面积', v: blank(d.landSize) ? d.landSize : sizeZh(d.landSize) },
    ...(d.layoutSize ? [{ k: '单位面积', v: sizeZh(d.layoutSize) }] : []),
    ...(hasMaintenance(d) ? [{ k: '管理费', v: maintenanceZh(d) }] : []),
    { k: '完工', v: completionZh(d.completion) },
  ];
}

/** 卡片左上角的标签 */
export const LABEL_ZH: Record<string, string> = {
  'FAMILY-ORIENTED': '适合家庭',
  'INVESTMENT PICK': '投资之选',
};

export const REGION_LABEL_ZH: Record<string, string> = {
  'kuala-lumpur': '吉隆坡',
  klcc: 'KLCC',
  'petaling-jaya': '八打灵再也',
  selangor: '雪兰莪',
  johor: '柔佛',
  penang: '槟城',
};
