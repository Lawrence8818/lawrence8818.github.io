// Site is English-only. This tiny dictionary keeps chrome strings in one place.
export type Lang = 'en';

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.guides': 'Buyer Guides',
    'nav.videos': 'Videos',
    'nav.areas': 'Areas',
    'nav.testimonials': 'Testimonials',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'cta.whatsapp': 'Chat on WhatsApp',
    'cta.leadMagnet': 'Get the Free Buyer’s Guide',
    'footer.disclaimer':
      'Content on this site is for general reference only and does not constitute investment or legal advice. Policies and figures follow the latest official announcements.',
    'footer.rights': 'All rights reserved',
  },
} as const;

export function t(_lang: Lang, key: keyof (typeof ui)['en']): string {
  return ui.en[key];
}
