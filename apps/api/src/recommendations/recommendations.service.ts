import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getForUser(userId?: string, citySlug?: string) {
    const personalized = userId ? await this.collaborativeFilter(userId) : [];
    const trending = await this.getTrending(citySlug);
    const contentBased = userId ? await this.contentBased(userId) : [];

    const seen = new Set<string>();
    const merged = [...personalized, ...contentBased, ...trending].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    return { recommendations: merged.slice(0, 20) };
  }

  private async collaborativeFilter(userId: string) {
    const behaviors = await this.prisma.userBehavior.findMany({
      where: { userId, action: { in: ['VIEW', 'BOOK', 'SEARCH'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const entityIds = behaviors.map((b) => b.entityId).filter(Boolean) as string[];
    if (!entityIds.length) return [];

    const similarUsers = await this.prisma.userBehavior.findMany({
      where: {
        entityId: { in: entityIds },
        userId: { not: userId },
        action: 'BOOK',
      },
      distinct: ['userId'],
      take: 10,
    });

    const similarUserIds = similarUsers.map((b) => b.userId).filter(Boolean) as string[];
    if (!similarUserIds.length) return [];

    const theirBookings = await this.prisma.userBehavior.findMany({
      where: { userId: { in: similarUserIds }, action: 'BOOK' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return this.resolveEntities(theirBookings.map((b) => ({ id: b.entityId!, type: b.entityType! })));
  }

  private async contentBased(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId, status: 'CONFIRMED' },
      include: { showtime: { include: { movie: true, event: true } } },
      take: 10,
    });

    const genres = new Set<string>();
    bookings.forEach((b) => b.showtime.movie?.genres.forEach((g) => genres.add(g)));

    if (!genres.size) return [];

    const movies = await this.prisma.movie.findMany({
      where: { genres: { hasSome: [...genres] }, deletedAt: null },
      take: 10,
    });

    return movies.map((m) => ({
      id: m.id,
      type: 'movie' as const,
      title: m.title,
      slug: m.slug,
      posterUrl: m.posterUrl ?? undefined,
      score: 0.8,
      reason: 'Based on your taste',
    }));
  }

  private async getTrending(citySlug?: string) {
    const movies = await this.prisma.movie.findMany({
      where: {
        trending: true,
        deletedAt: null,
        ...(citySlug && { cities: { some: { city: { slug: citySlug } } } }),
      },
      take: 8,
    });

    const events = await this.prisma.event.findMany({
      where: { status: 'PUBLISHED', startAt: { gte: new Date() } },
      take: 8,
      orderBy: { startAt: 'asc' },
    });

    return [
      ...movies.map((m) => ({
        id: m.id,
        type: 'movie' as const,
        title: m.title,
        slug: m.slug,
        posterUrl: m.posterUrl ?? undefined,
        score: 1,
        reason: 'Trending now',
      })),
      ...events.map((e) => ({
        id: e.id,
        type: 'event' as const,
        title: e.title,
        slug: e.slug,
        posterUrl: e.posterUrl ?? undefined,
        score: 0.95,
        reason: 'Popular event',
      })),
    ];
  }

  private async resolveEntities(entities: { id: string; type: string }[]) {
    const results = [];
    for (const e of entities) {
      if (e.type === 'movie') {
        const m = await this.prisma.movie.findUnique({ where: { id: e.id } });
        if (m) results.push({ id: m.id, type: 'movie', title: m.title, slug: m.slug, posterUrl: m.posterUrl, score: 0.7, reason: 'Fans also booked' });
      }
    }
    return results;
  }

  async trackBehavior(userId: string | null, action: string, entityType: string, entityId: string, sessionId?: string) {
    return this.prisma.userBehavior.create({
      data: { userId: userId ?? undefined, action, entityType, entityId, sessionId },
    });
  }
}
