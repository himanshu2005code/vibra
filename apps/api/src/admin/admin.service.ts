import { Injectable } from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, todayBookings, revenue, pendingRefunds, popularMovies] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: today }, status: BookingStatus.CONFIRMED },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.booking.groupBy({
        by: ['showtimeId'],
        where: { status: BookingStatus.CONFIRMED },
        _count: true,
        orderBy: { _count: { showtimeId: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalUsers,
      todayBookings,
      totalRevenue: revenue._sum.amount ?? 0,
      pendingRefunds,
      popularShowtimes: popularMovies.length,
    };
  }

  async listUsers(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return { users, meta: { page, limit, total } };
  }

  async moderateEvent(eventId: string, status: 'PUBLISHED' | 'CANCELLED') {
    return this.prisma.event.update({
      where: { id: eventId },
      data: { status },
    });
  }
}
