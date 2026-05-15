import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import { randomBytes, createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateTicket(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, status: BookingStatus.CONFIRMED },
      include: {
        showtime: { include: { movie: true, event: true } },
        seats: { include: { seat: true } },
        ticket: true,
        payment: true,
      },
    });

    if (!booking) throw new NotFoundException('Confirmed booking not found');
    if (booking.payment?.status !== 'COMPLETED') {
      throw new ForbiddenException('Payment required before ticket generation');
    }

    if (booking.ticket) {
      return this.formatTicket(booking, booking.ticket.qrCode);
    }

    const qrSecret = randomBytes(32).toString('hex');
    const payload = `${booking.bookingRef}:${booking.id}:${qrSecret}`;
    const signature = createHmac('sha256', process.env.JWT_ACCESS_SECRET ?? 'ticket-secret')
      .update(payload)
      .digest('hex');
    const qrCode = `${booking.bookingRef}.${signature.slice(0, 16)}`;

    const ticket = await this.prisma.ticket.create({
      data: { bookingId: booking.id, qrCode, qrSecret },
    });

    const qrDataUrl = await QRCode.toDataURL(qrCode, { width: 300, margin: 2 });

    return {
      ...this.formatTicket(booking, ticket.qrCode),
      qrDataUrl,
      ticketId: ticket.id,
    };
  }

  async verifyTicket(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            showtime: { include: { movie: true, event: true } },
            seats: { include: { seat: true } },
          },
        },
      },
    });

    if (!ticket) return { valid: false, reason: 'Ticket not found' };
    if (ticket.checkedIn) return { valid: false, reason: 'Already checked in', ticket };

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { checkedIn: true, checkedInAt: new Date() },
    });

    return { valid: true, ticket, booking: ticket.booking };
  }

  private formatTicket(booking: {
    bookingRef: string;
    showtime: { startAt: Date; movie?: { title: string } | null; event?: { title: string } | null };
    seats: { seat: { row: string; number: number; category: string } }[];
  }, qrCode: string) {
    return {
      bookingRef: booking.bookingRef,
      title: booking.showtime.movie?.title ?? booking.showtime.event?.title,
      startAt: booking.showtime.startAt,
      seats: booking.seats.map((s) => `${s.seat.row}${s.seat.number} (${s.seat.category})`),
      qrCode,
    };
  }
}
