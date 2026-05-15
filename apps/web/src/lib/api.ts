const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function api<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, ...init } = options ?? {};
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    next: init.method === 'GET' ? { revalidate: 60 } : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'API error');
  }

  return res.json();
}

export const apiClient = {
  home: (city?: string) => api<{ banners: Banner[]; sections: HomeSections }>(`/home?city=${city ?? 'mumbai'}`),
  movies: {
    trending: (city?: string) => api<{ items: Movie[] }>(`/movies/trending?city=${city ?? 'mumbai'}`),
    get: (slug: string, city?: string) => api<MovieDetail>(`/movies/${slug}?city=${city ?? 'mumbai'}`),
    list: (params?: string) => api<{ items: Movie[] }>(`/movies?${params ?? ''}`),
  },
  events: {
    list: (type?: string) => api<{ items: EventItem[] }>(`/events?${type ? `type=${type}` : ''}`),
    get: (slug: string) => api<EventItem>(`/events/${slug}`),
  },
  search: (q: string) => api<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`),
  recommendations: (city?: string) => api<{ recommendations: RecItem[] }>(`/recommendations?city=${city ?? 'mumbai'}`),
  seats: (showtimeId: string) => api<SeatMapResponse>(`/bookings/showtimes/${showtimeId}/seats`),
  auth: {
    login: (body: { email: string; password: string }) =>
      api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { email: string; password: string; name?: string }) =>
      api<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: (token: string) => api<UserProfile>('/auth/me', { token }),
  },
  bookings: {
    lock: (token: string, body: { showtimeId: string; seatIds: string[] }) =>
      api<LockResponse>('/bookings/lock', { method: 'POST', body: JSON.stringify(body), token }),
    my: (token: string) => api<Booking[]>(`/bookings/my`, { token }),
  },
  payments: {
    createOrder: (token: string, bookingId: string) =>
      api<PaymentOrder>('/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId }), token }),
    mockComplete: (token: string, bookingId: string) =>
      api<{ success: boolean }>('/payments/mock-complete', { method: 'POST', body: JSON.stringify({ bookingId }), token }),
  },
};

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  posterUrl?: string;
  genres: string[];
  language: string[];
  rating?: string;
  imdbRating?: number;
  trending?: boolean;
}

export interface MovieDetail extends Movie {
  description?: string;
  duration: number;
  showtimes: Showtime[];
}

export interface Showtime {
  id: string;
  startAt: string;
  language?: string;
  format?: string;
  basePrice: number;
  screen?: { name: string; theatre: { name: string; address: string } };
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  posterUrl?: string;
  startAt: string;
  minPrice?: number;
  maxPrice?: number;
  venue?: { name: string; city?: { name: string } };
}

export interface HomeSections {
  trendingMovies: Movie[];
  upcomingMovies: Movie[];
  liveConcerts: EventItem[];
  comedyShows: EventItem[];
  sportsEvents: EventItem[];
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  slug: string;
  posterUrl?: string;
  subtitle?: string;
}

export interface RecItem {
  id: string;
  type: string;
  title: string;
  slug: string;
  posterUrl?: string;
  reason?: string;
}

export interface SeatMapResponse {
  showtimeId: string;
  seats: Seat[];
  movie?: { title: string };
  startAt: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  category: string;
  price: number;
  status: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  role: string;
  walletBalance: number;
  loyaltyPoints: number;
}

export interface LockResponse {
  bookingId: string;
  bookingRef: string;
  total: number;
  expiresAt: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  provider: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  status: string;
  total: number;
  showtime?: { movie?: Movie; event?: EventItem; startAt: string };
  ticket?: { qrCode: string };
}
