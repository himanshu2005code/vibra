'use client';

import Link from 'next/link';
import { Search, MapPin, User, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, city, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Event<span className="text-gradient">Sphere</span>
          </span>
        </Link>

        <div className="hidden flex-1 max-w-md md:flex">
          <Link
            href="/search"
            className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10"
          >
            <Search className="h-4 w-4" />
            Search movies, events, artists...
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 capitalize">
            <MapPin className="h-4 w-4" />
            {city}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
