import { Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, EventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    type?: EventType;
    citySlug?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const where = {
      status: EventStatus.PUBLISHED,
      deletedAt: null,
      ...(params.type && { type: params.type }),
      ...(params.citySlug && { venue: { city: { slug: params.citySlug } } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { venue: { include: { city: true } } },
        orderBy: { startAt: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { items, meta: { page, limit, total } };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        venue: { include: { city: true } },
        organizer: { select: { id: true, name: true } },
        showtimes: { where: { active: true, startAt: { gte: new Date() } } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async joinWaitlist(userId: string, eventId: string) {
    return this.prisma.waitlist.upsert({
      where: { userId_eventId: { userId, eventId } },
      update: {},
      create: { userId, eventId },
    });
  }
}
