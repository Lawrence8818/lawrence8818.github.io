export interface Service {
  title: string;
  description: string;
  /** GoldIcon name — gold line icons, no emoji */
  icon: 'building' | 'bank' | 'key' | 'handshake';
}

export const SERVICES: Service[] = [
  {
    title: 'New Project Advisory',
    description:
      'Full coverage of every new launch across the entire Malaysia. I don’t push a single project, I compare options side by side against your budget and needs, and give you a straight opinion.',
    icon: 'building',
  },
  {
    title: 'Loan Planning',
    description:
      'We work out your DSR and loan eligibility before you shop, compare bank packages, and get your documents ready to improve your approval odds, so you never sign an SPA only to find the loan won’t go through.',
    icon: 'bank',
  },
  {
    title: 'Viewing Arrangements',
    description:
      'One-stop show-unit visits, project briefings and neighbourhood checks arranged around your schedule. See several projects in a single day, without the hassle.',
    icon: 'key',
  },
  {
    title: 'End-to-End Support',
    description:
      'From booking, SPA and loan to the lawyers and key collection with defect inspection. I flag what to watch for and what to avoid at every step, right until the keys are in your hand.',
    icon: 'handshake',
  },
];
