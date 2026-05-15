'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function OrganizerPage() {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<{ totalEvents: number; revenue: number; ticketsSold: number } | null>(null);

  useEffect(() => {
    if (!user || !['EVENT_ORGANIZER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      router.push('/');
      return;
    }
    fetch(`${API}/api/v1/organizer/analytics`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [accessToken, user, router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50">Events</p>
          <p className="text-2xl font-bold">{data?.totalEvents ?? '—'}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50">Revenue</p>
          <p className="text-2xl font-bold">₹{data?.revenue?.toLocaleString('en-IN') ?? '—'}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-white/50">Tickets Sold</p>
          <p className="text-2xl font-bold">{data?.ticketsSold ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
