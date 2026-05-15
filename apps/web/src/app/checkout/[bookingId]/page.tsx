'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useBookingStore } from '@/store/booking';
import { apiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { total, bookingRef, clear } = useBookingStore();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (!accessToken) return;
    setLoading(true);
    try {
      await apiClient.payments.createOrder(accessToken, bookingId);
      await apiClient.payments.mockComplete(accessToken, bookingId);
      clear();
      router.push(`/ticket/${bookingId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="text-white/60">Ref: {bookingRef}</p>
      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Button className="mt-6 w-full" size="lg" onClick={handlePay} disabled={loading}>
          {loading ? 'Processing...' : 'Pay with UPI / Card'}
        </Button>
        <p className="mt-3 text-center text-xs text-white/40">Secured by Razorpay & Stripe</p>
      </div>
    </div>
  );
}
