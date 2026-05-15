import { HeroCarousel } from '@/components/home/hero-carousel';
import { ContentRow } from '@/components/home/content-row';
import { apiClient } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let feed;
  try {
    feed = await apiClient.home('mumbai');
  } catch {
    feed = {
      banners: [],
      sections: {
        trendingMovies: [],
        upcomingMovies: [],
        liveConcerts: [],
        comedyShows: [],
        sportsEvents: [],
      },
    };
  }

  const { banners, sections } = feed;

  return (
    <div className="bg-hero-gradient min-h-screen pb-8">
      <HeroCarousel banners={banners} />
      <ContentRow title="Trending Movies" items={sections.trendingMovies} hrefPrefix="/movies" seeAllHref="/movies" />
      <ContentRow title="Upcoming" items={sections.upcomingMovies} hrefPrefix="/movies" />
      <ContentRow title="Live Concerts" items={sections.liveConcerts} hrefPrefix="/events" seeAllHref="/explore?type=CONCERT" />
      <ContentRow title="Comedy Shows" items={sections.comedyShows} hrefPrefix="/events" seeAllHref="/explore?type=COMEDY" />
      <ContentRow title="Sports" items={sections.sportsEvents} hrefPrefix="/events" seeAllHref="/explore?type=SPORTS" />
    </div>
  );
}
