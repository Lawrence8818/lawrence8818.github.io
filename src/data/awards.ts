export interface Award {
  title: string;
  org: string;
  year: string;
  /** photo under public/; omit to show the branded trophy tile instead */
  image?: string;
  fallbackImage?: string;
}

/** Newest first. Cards without an image render a navy tile with a gold
 *  trophy icon until the real medal/certificate photo is provided. */
export const AWARDS: Award[] = [
  {
    title: 'Million Dollar Achiever Club — Diamond Category',
    org: 'IQI Prestige Awards',
    year: '2025',
    image: '/images/award-diamond-2025.jpg',
    fallbackImage: '/images/placeholders/award-01.svg',
  },
  {
    title: 'Top 47 Nationwide — Top Performance Overall, Primary Market',
    org: 'IQI Prestige Awards',
    year: '2025',
    image: '/images/award-top47-2025.jpg',
    fallbackImage: '/images/placeholders/award-02.svg',
  },
  {
    title: 'Top 18 KL Region — Top Regional Project Sales Performer',
    org: 'IQI Prestige Awards · Central Region, Kuala Lumpur',
    year: '2025',
    image: '/images/award-top18-2025.jpg',
    fallbackImage: '/images/placeholders/award-03.svg',
  },
  {
    // Merges the 2017–2019 Yearly Top Personal/Group Converted Value and
    // GD Top Achiever awards into one card.
    title: '3 Consecutive Years — Top Personal Converted Value',
    org: 'Real Estate Special Awards',
    year: '2017–2019',
    image: '/images/award-2017-2019.jpg',
    fallbackImage: '/images/placeholders/award-02.svg',
  },
];

/** Stats bar under the hero (from Lawrence's real track record, since 2015).
 *  `num` drives the pure-CSS count-up animation in TrustBar. */
export const TRUST_STATS = [
  { num: 10, prefix: '', suffix: '', label: 'Years in Real Estate' },
  { num: 2000, prefix: '', suffix: '+', label: 'Buyers Trusted Over the Years' },
  { num: 1500, prefix: '', suffix: '+', label: 'Homeowners Served' },
  { num: 47, prefix: 'TOP ', suffix: '', label: 'Nationwide Primary Market 2025' },
];
