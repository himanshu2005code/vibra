export type UserRole =
  | 'CUSTOMER'
  | 'EVENT_ORGANIZER'
  | 'THEATRE_OWNER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: { page?: number; limit?: number; total?: number };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email?: string;
  role: UserRole;
}

export interface SeatMapSeat {
  id: string;
  row: string;
  number: number;
  category: string;
  price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'BLOCKED';
  lockedBy?: string;
}

export interface RecommendationItem {
  id: string;
  type: 'movie' | 'event';
  title: string;
  slug: string;
  posterUrl?: string;
  score: number;
  reason?: string;
}

export interface SearchResult {
  id: string;
  type: 'movie' | 'event' | 'venue' | 'artist' | 'city';
  title: string;
  slug: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface BookingCheckout {
  bookingId: string;
  bookingRef: string;
  seats: { row: string; number: number; category: string; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  expiresAt: string;
}

export interface PaymentIntent {
  orderId: string;
  amount: number;
  currency: string;
  provider: 'razorpay' | 'stripe';
  key?: string;
}
