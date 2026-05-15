import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; role: string } | null;
  city: string;
  setAuth: (tokens: { accessToken: string; refreshToken: string; user: AuthState['user'] }) => void;
  logout: () => void;
  setCity: (city: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      city: 'mumbai',
      setAuth: ({ accessToken, refreshToken, user }) => set({ accessToken, refreshToken, user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      setCity: (city) => set({ city }),
    }),
    { name: 'eventsphere-auth' },
  ),
);
