import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/organizer.dto';

@Injectable()
export class OrganizerService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(organizerId: string) {
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: {
        showtimes: { include: { bookings: { where: { status: 'CONFIRMED' } } } },
      },
    });

    let revenue = 0;
    let ticketsSold = 0;
    events.forEach((e) => {
      e.showtimes.forEach((s) => {
        s.bookings.forEach((b) => {
          revenue += Number(b.total);
          ticketsSold += 1;
        });
      });
    });

    return {
      totalEvents: events.length,
      revenue,
      ticketsSold,
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        status: e.status,
        startAt: e.startAt,
        capacity: e.capacity,
      })),
    };
  }

  async createEvent(organizerId: string, dto: CreateEventDto) {
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.event.create({
      data: {
        ...dto,
        slug: `${slug}-${Date.now()}`,
        organizerId,
        status: 'PENDING_REVIEW',
      },
    });
  }

  async getEvents(organizerId: string) {
    return this.prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  assertOwner(organizerId: string, resourceOrganizerId: string) {
    if (organizerId !== resourceOrganizerId) throw new ForbiddenException();
  }
}
