'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SeatMap } from '@/components/booking/seat-map';
import { Button } from '@/components/ui/button';
import { apiClient, type SeatMapResponse } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useBookingStore } from '@/store/booking';

export default function BookingPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { selectedSeats, setShowtime, setLockResult } = useBookingStore();
  const [data, setData] = useState<SeatMapResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowtime(showtimeId);
    apiClient.seats(showtimeId).then(setData).catch(console.error);
  }, [showtimeId, setShowtime]);

  const subtotal = selectedSeats.reduce((s, seat) => s + seat.price, 0);

  async function handleProceed() {
    if (!accessToken) {
      router.push('/login?redirect=/booking/' + showtimeId);
      return;
    }
    if (!selectedSeats.length) return;
    setLoading(true);
    try {
      const result = await apiClient.bookings.lock(accessToken, {
        showtimeId,
        seatIds: selectedSeats.map((s) => s.id),
      });
      setLockResult(result);
      router.push(`/checkout/${result.bookingId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to lock seats');
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-bold">{data.movie?.title ?? 'Select Seats'}</h1>
      <p className="text-sm text-white/60">Choose your seats</p>
      <div className="mt-8">
        <SeatMap showtimeId={showtimeId} initialSeats={data.seats} />
      </div>
      <div className="sticky bottom-20 mt-8 glass rounded-2xl p-4 md:bottom-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">{selectedSeats.length} seat(s)</p>
            <p className="text-xl font-bold">{formatPrice(subtotal)}</p>
          </div>
          <Button onClick={handleProceed} disabled={!selectedSeats.length || loading}>
            {loading ? 'Locking...' : 'Proceed'}
          </Button>
        </div>
      </div>
    </div>
  );
}
