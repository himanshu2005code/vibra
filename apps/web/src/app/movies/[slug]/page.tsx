import Image from 'next/image';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let movie;
  try {
    movie = await apiClient.movies.get(slug);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5">
          {movie.posterUrl && (
            <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" priority />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="mt-2 text-white/60">
            {movie.genres.join(' · ')} · {movie.language.join(', ')} · {movie.duration} min
          </p>
          {movie.imdbRating && (
            <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-sm text-amber-300">
              IMDb {movie.imdbRating}
            </span>
          )}
          <p className="mt-4 text-white/80">{movie.description}</p>

          <h2 className="mt-8 text-xl font-semibold">Showtimes</h2>
          <div className="mt-4 space-y-4">
            {movie.showtimes?.length ? (
              movie.showtimes.map((st) => (
                <div key={st.id} className="glass rounded-xl p-4">
                  <p className="font-medium">{st.screen?.theatre.name}</p>
                  <p className="text-sm text-white/60">{st.screen?.theatre.address}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/booking/${st.id}`}>
                      <Button size="sm">
                        {formatDate(st.startAt)} · {st.format ?? st.language} · {formatPrice(Number(st.basePrice))}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50">No showtimes available in your city.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
