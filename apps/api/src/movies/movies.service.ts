import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class MoviesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(params: { citySlug?: string; genre?: string; language?: string; page?: number; limit?: number }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const cacheKey = `movies:${params.citySlug ?? 'all'}:${page}:${params.genre ?? ''}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const where: Record<string, unknown> = { deletedAt: null };
    if (params.genre) where.genres = { has: params.genre };
    if (params.language) where.language = { has: params.language };
    if (params.citySlug) {
      where.cities = { some: { city: { slug: params.citySlug } } };
    }

    const [items, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ trending: 'desc' }, { releaseDate: 'desc' }],
      }),
      this.prisma.movie.count({ where }),
    ]);

    const result = { items, meta: { page, limit, total } };
    await this.redis.set(cacheKey, JSON.stringify(result), 120);
    return result;
  }

  async getTrending(citySlug?: string) {
    return this.findAll({ citySlug, limit: 10 });
  }

  async findBySlug(slug: string, citySlug?: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { slug },
      include: {
        showtimes: {
          where: { active: true, startAt: { gte: new Date() } },
          include: {
            screen: { include: { theatre: { include: { city: true } } } },
          },
          orderBy: { startAt: 'asc' },
        },
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    let showtimes = movie.showtimes;
    if (citySlug) {
      showtimes = showtimes.filter((s) => s.screen?.theatre.city.slug === citySlug);
    }

    return { ...movie, showtimes };
  }
}
