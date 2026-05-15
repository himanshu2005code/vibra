'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('user@eventsphere.in');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.auth.login({ email, password });
      setAuth({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
      router.push(params.get('redirect') ?? '/');
    } catch {
      alert('Login failed. Use user@eventsphere.in / Password123! after seeding.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-white/60">Sign in to book tickets</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Password"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-white/50">
        Demo: user@eventsphere.in / Password123!
      </p>
      <Link href="/" className="mt-4 text-center text-sm text-brand-400 hover:underline">
        Continue as guest
      </Link>
    </div>
  );
}
