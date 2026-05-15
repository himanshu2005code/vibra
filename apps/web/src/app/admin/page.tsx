'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function AdminPage() {
  const { accessToken, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      router.push('/');
      return;
    }
    fetch(`${API}/api/v1/admin/dashboard`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, [accessToken, user, router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', key: 'totalUsers' },
          { label: 'Today Bookings', key: 'todayBookings' },
          { label: 'Revenue', key: 'totalRevenue' },
          { label: 'Pending Refunds', key: 'pendingRefunds' },
        ].map(({ label, key }) => (
          <div key={key} className="glass rounded-2xl p-6">
            <p className="text-sm text-white/50">{label}</p>
            <p className="mt-2 text-2xl font-bold">{String(stats?.[key] ?? '—')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
