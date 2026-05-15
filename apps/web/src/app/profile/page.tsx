'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { apiClient, type UserProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, accessToken, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (accessToken) apiClient.auth.me(accessToken).then(setProfile).catch(console.error);
  }, [accessToken]);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/60">Sign in to view your profile</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-bold">{profile?.name ?? user.email}</h1>
      <p className="text-white/60">{user.role}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-white/50">Wallet</p>
          <p className="text-xl font-bold">₹{Number(profile?.walletBalance ?? 0).toFixed(0)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-white/50">Loyalty Points</p>
          <p className="text-xl font-bold">{profile?.loyaltyPoints ?? 0}</p>
        </div>
      </div>
      <div className="mt-8 space-y-2">
        <Link href="/bookings" className="block glass rounded-xl px-4 py-3 hover:bg-white/10">My Bookings</Link>
        {(user.role === 'EVENT_ORGANIZER' || user.role === 'ADMIN') && (
          <Link href="/organizer" className="block glass rounded-xl px-4 py-3 hover:bg-white/10">Organizer Dashboard</Link>
        )}
        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
          <Link href="/admin" className="block glass rounded-xl px-4 py-3 hover:bg-white/10">Admin Panel</Link>
        )}
        <Button variant="outline" className="w-full mt-4" onClick={logout}>Logout</Button>
      </div>
    </div>
  );
}
