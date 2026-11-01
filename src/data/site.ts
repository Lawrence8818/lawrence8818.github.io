// ============================================================
// Single source of truth for the whole site.
// Fill in / verify every value marked TODO-REPLACE before going live.
// ============================================================

export const SITE = {
  /** Brand name (appears in header / footer / SEO title) */
  name: 'Lawrence Law',
  /** Chinese name — shown next to the brand, as on the official site */
  nameZh: '刘智权',
  tagline: 'New Property Specialist with Subsales Expertise',

  /** Contact email (shown in footer / contact page) */
  email: 'LawrenceLawProperty@gmail.com',

  /** Office address (shown in footer) */
  address: 'No. 11G, Medan Kelang Lama 28, No. 419, Jalan Kelang Lama, 58000 Kuala Lumpur',

  /** WhatsApp number, international format, digits only, no + sign */
  whatsappNumber: '60199939860',

  /** Default prefilled message when the WhatsApp button is clicked */
  whatsappDefaultMessage: 'Hi Lawrence, I saw your website and would like to ask about buying property.',

  /** Prefilled message for the buyer guide lead magnet (secondary conversion) */
  leadMagnetMessage: 'Hi Lawrence, I would like to get the free Buyer’s Guide.',

  /** REN licence number (BOVAEA/LPPEH registration) — showing it publicly is a strong trust signal in Malaysia */
  renNumber: 'REN 26610',

  /** Shown next to the REN number (Lawrence prefers not to display the agency name) */
  agencyName: 'Registered REN',

  /** Service areas (used in copy and SEO schema) */
  serviceAreas: ['Kuala Lumpur', 'Selangor', 'Johor', 'Penang'],

  /** Social profiles; leave '' to hide that entry */
  socials: {
    facebook: 'https://facebook.com/lawrencelawproperty',
    instagram: 'https://instagram.com/lawrencelawproperty',
    tiktok: '',
    youtube: 'https://youtube.com/@lawrencelawproperty',
    xiaohongshu: 'https://xhslink.com/m/2nAmeNV3jrG', // XHS: Lawrence Law 刘智权
  },

  /**
   * Analytics IDs — leave empty and the corresponding script never loads.
   * GA4: like 'G-XXXXXXXXXX'; Meta Pixel: numeric ID.
   */
  ga4Id: 'G-2G3M1Y4Q6Q',
  metaPixelId: '1448303492862108',

  /**
   * Contact form (backup conversion channel). After creating a form on
   * formspree.io, paste its endpoint here (like 'https://formspree.io/f/xxxxxxxx').
   * Leave empty and the contact page shows WhatsApp only.
   */
  formspreeEndpoint: '',
} as const;

export type Site = typeof SITE;
