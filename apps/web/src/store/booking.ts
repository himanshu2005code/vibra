import { create } from 'zustand';
import type { Seat } from '@/lib/api';

interface BookingState {
  showtimeId: string | null;
  selectedSeats: Seat[];
  bookingId: string | null;
  bookingRef: string | null;
  total: number;
  setShowtime: (id: string) => void;
  toggleSeat: (seat: Seat) => void;
  setLockResult: (data: { bookingId: string; bookingRef: string; total: number }) => void;
  clear: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  showtimeId: null,
  selectedSeats: [],
  bookingId: null,
  bookingRef: null,
  total: 0,
  setShowtime: (id) => set({ showtimeId: id, selectedSeats: [], bookingId: null }),
  toggleSeat: (seat) => {
    if (seat.status !== 'AVAILABLE' && seat.status !== 'LOCKED') return;
    const current = get().selectedSeats;
    const exists = current.find((s) => s.id === seat.id);
    if (exists) {
      set({ selectedSeats: current.filter((s) => s.id !== seat.id) });
    } else {
      set({ selectedSeats: [...current, seat] });
    }
  },
  setLockResult: (data) => set({ ...data }),
  clear: () => set({ showtimeId: null, selectedSeats: [], bookingId: null, bookingRef: null, total: 0 }),
}));
