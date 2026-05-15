import { ContentRow } from '@/components/home/content-row';
import { apiClient } from '@/lib/api';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [movies, events] = await Promise.all([
    apiClient.movies.list().catch(() => ({ items: [] })),
    apiClient.events.list(type).catch(() => ({ items: [] })),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold md:text-3xl">Explore</h1>
      <p className="mt-1 text-white/60">Discover movies and live experiences</p>
      <ContentRow title="Movies" items={movies.items} hrefPrefix="/movies" />
      <ContentRow title="Events" items={events.items} hrefPrefix="/events" />
    </div>
  );
}
