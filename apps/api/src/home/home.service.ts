import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getHomeFeed(citySlug = 'mumbai') {
    const [banners, cities, trendingMovies, upcomingMovies, concerts, comedy, sports] =
      await Promise.all([
        this.prisma.banner.findMany({ where: { active: true }, orderBy: { position: 'asc' } }),
        this.prisma.city.findMany({ where: { active: true } }),
        this.prisma.movie.findMany({
          where: { trending: true, deletedAt: null, cities: { some: { city: { slug: citySlug } } } },
          take: 10,
        }),
        this.prisma.movie.findMany({
          where: {
            deletedAt: null,
            releaseDate: { gte: new Date() },
            cities: { some: { city: { slug: citySlug } } },
          },
          take: 10,
          orderBy: { releaseDate: 'asc' },
        }),
        this.prisma.event.findMany({
          where: { type: 'CONCERT', status: 'PUBLISHED', startAt: { gte: new Date() } },
          take: 8,
          include: { venue: true },
        }),
        this.prisma.event.findMany({
          where: { type: 'COMEDY', status: 'PUBLISHED', startAt: { gte: new Date() } },
          take: 8,
        }),
        this.prisma.event.findMany({
          where: { type: 'SPORTS', status: 'PUBLISHED', startAt: { gte: new Date() } },
          take: 8,
        }),
      ]);

    return {
      banners,
      cities,
      sections: {
        trendingMovies,
        upcomingMovies,
        liveConcerts: concerts,
        comedyShows: comedy,
        sportsEvents: sports,
      },
    };
  }
}
