import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let event;
  try {
    event = await apiClient.events.get(slug);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/5 md:aspect-[4/5]">
          {event.posterUrl && (
            <Image src={event.posterUrl} alt={event.title} fill className="object-cover" priority />
          )}
        </div>
        <div>
          <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs uppercase text-brand-300">{event.type}</span>
          <h1 className="mt-3 text-3xl font-bold">{event.title}</h1>
          <p className="mt-2 text-white/60">
            {event.venue?.name} · {event.venue?.city?.name}
          </p>
          <p className="mt-1 text-lg">{formatDate(event.startAt)}</p>
          {event.minPrice != null && (
            <p className="mt-4 text-xl font-semibold text-brand-400">
              From {formatPrice(Number(event.minPrice))}
            </p>
          )}
          <Button className="mt-6" size="lg">
            Book Tickets
          </Button>
          <Link href="/explore" className="mt-4 block text-sm text-white/50 hover:text-white">
            ← Back to explore
          </Link>
        </div>
      </div>
    </div>
  );
}
