export const SEAT_LOCK_TTL_SECONDS = 300;
export const BOOKING_EXPIRY_MINUTES = 10;
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const TAX_RATE = 0.18;
export const CONVENIENCE_FEE_RATE = 0.02;

export const EVENT_TYPES = [
  'MOVIE',
  'CONCERT',
  'COMEDY',
  'WORKSHOP',
  'FESTIVAL',
  'SPORTS',
  'EXPERIENCE',
] as const;

export const SEAT_CATEGORIES = ['REGULAR', 'PREMIUM', 'GOLD', 'PLATINUM', 'RECLINER', 'VIP'] as const;
