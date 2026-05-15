'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Ticket, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/bookings', label: 'Tickets', icon: Ticket },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 md:hidden pb-safe">
      <div className="flex justify-around py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition',
                active ? 'text-brand-400' : 'text-white/50',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
