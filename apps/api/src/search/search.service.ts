import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, limit = 10) {
    const q = query.trim();
    if (!q) return { results: [], trending: await this.getTrending() };

    const [movies, events, cities] = await Promise.all([
      this.prisma.movie.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { genres: { hasSome: [q] } },
          ],
        },
        take: limit,
        select: { id: true, title: true, slug: true, posterUrl: true },
      }),
      this.prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { artists: { hasSome: [q] } },
            { tags: { hasSome: [q] } },
          ],
        },
        take: limit,
        select: { id: true, title: true, slug: true, posterUrl: true, type: true },
      }),
      this.prisma.city.findMany({
        where: { name: { contains: q, mode: 'insensitive' }, active: true },
        take: 5,
        select: { id: true, name: true, slug: true },
      }),
    ]);

    const results = [
      ...movies.map((m) => ({ ...m, type: 'movie' as const, subtitle: 'Movie' })),
      ...events.map((e) => ({ ...e, type: 'event' as const, subtitle: e.type })),
      ...cities.map((c) => ({ id: c.id, title: c.name, slug: c.slug, type: 'city' as const, subtitle: 'City' })),
    ];

    return { results, query: q };
  }

  async getTrending() {
    const movies = await this.prisma.movie.findMany({
      where: { trending: true },
      take: 5,
      select: { title: true, slug: true },
    });
    return movies.map((m) => m.title);
  }

  async suggest(query: string) {
    if (query.length < 2) return [];
    const { results } = await this.search(query, 5);
    return results;
  }
}
