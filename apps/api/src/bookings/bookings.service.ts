import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SeatStatus, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TAX_RATE, CONVENIENCE_FEE_RATE, BOOKING_EXPIRY_MINUTES } from '@eventsphere/shared';
import { LockSeatsDto, ConfirmBookingDto } from './dto/booking.dto';

const LOCK_TTL = parseInt(process.env.SEAT_LOCK_TTL ?? '300', 10);

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getSeatMap(showtimeId: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        screen: {
          include: {
            seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] },
          },
        },
        movie: { select: { title: true, posterUrl: true } },
      },
    });
    if (!showtime?.screen) throw new NotFoundException('Showtime not found');

    const bookedSeatIds = await this.getBookedSeatIds(showtimeId);

    const seats = showtime.screen.seats.map((s) => {
      let status = s.status;
      if (bookedSeatIds.has(s.id)) status = SeatStatus.BOOKED;
      else if (s.lockExpiry && s.lockExpiry < new Date()) status = SeatStatus.AVAILABLE;

      return {
        id: s.id,
        row: s.row,
        number: s.number,
        category: s.category,
        price: Number(s.basePrice),
        status,
        lockedBy: status === SeatStatus.LOCKED ? s.lockedBy : undefined,
      };
    });

    return {
      showtimeId,
      screen: showtime.screen.name,
      movie: showtime.movie,
      startAt: showtime.startAt,
      seats,
    };
  }

  async lockSeats(userId: string, dto: LockSeatsDto) {
    const lockKey = `seat-lock:${dto.showtimeId}`;
    const acquired = await this.acquireLock(lockKey, userId);
    if (!acquired) throw new ConflictException('Another lock in progress, retry');

    try {
      const showtime = await this.prisma.showtime.findUnique({
        where: { id: dto.showtimeId },
        include: { screen: true },
      });
      if (!showtime) throw new NotFoundException('Showtime not found');

      const seats = await this.prisma.seat.findMany({
        where: { id: { in: dto.seatIds }, screenId: showtime.screenId! },
      });
      if (seats.length !== dto.seatIds.length) throw new BadRequestException('Invalid seats');

      const bookedIds = await this.getBookedSeatIds(dto.showtimeId);
      const now = new Date();
      const lockExpiry = new Date(now.getTime() + LOCK_TTL * 1000);

      for (const seat of seats) {
        if (bookedIds.has(seat.id)) throw new ConflictException(`Seat ${seat.row}${seat.number} already booked`);
        if (
          seat.status === SeatStatus.LOCKED &&
          seat.lockedBy !== userId &&
          seat.lockExpiry &&
          seat.lockExpiry > now
        ) {
          throw new ConflictException(`Seat ${seat.row}${seat.number} is locked`);
        }
      }

      await this.prisma.$transaction([
        this.prisma.seat.updateMany({
          where: { id: { in: dto.seatIds } },
          data: { status: SeatStatus.LOCKED, lockedBy: userId, lockedAt: now, lockExpiry },
        }),
        this.prisma.seat.updateMany({
          where: {
            screenId: showtime.screenId!,
            status: SeatStatus.LOCKED,
            lockExpiry: { lt: now },
          },
          data: { status: SeatStatus.AVAILABLE, lockedBy: null, lockedAt: null, lockExpiry: null },
        }),
      ]);

      const subtotal = seats.reduce((sum, s) => sum + Number(s.basePrice), 0);
      const convenienceFee = subtotal * CONVENIENCE_FEE_RATE;
      const tax = (subtotal + convenienceFee) * TAX_RATE;
      const total = subtotal + convenienceFee + tax;
      const expiresAt = new Date(now.getTime() + BOOKING_EXPIRY_MINUTES * 60 * 1000);

      const existing = await this.prisma.booking.findFirst({
        where: { userId, showtimeId: dto.showtimeId, status: BookingStatus.PENDING },
      });

      let booking;
      if (existing) {
        await this.prisma.bookingSeat.deleteMany({ where: { bookingId: existing.id } });
        booking = await this.prisma.booking.update({
          where: { id: existing.id },
          data: { subtotal, tax, total, expiresAt },
        });
      } else {
        booking = await this.prisma.booking.create({
          data: {
            userId,
            showtimeId: dto.showtimeId,
            status: BookingStatus.PENDING,
            subtotal,
            tax,
            total,
            expiresAt,
          },
        });
      }

      await this.prisma.bookingSeat.createMany({
        data: seats.map((s) => ({
          bookingId: booking.id,
          seatId: s.id,
          price: s.basePrice,
        })),
      });

      return {
        bookingId: booking.id,
        bookingRef: booking.bookingRef,
        seats: seats.map((s) => ({ row: s.row, number: s.number, category: s.category, price: Number(s.basePrice) })),
        subtotal,
        tax,
        total,
        expiresAt,
        lockExpiresIn: LOCK_TTL,
      };
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  async releaseSeats(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId, status: BookingStatus.PENDING },
      include: { seats: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const seatIds = booking.seats.map((s) => s.seatId);
    await this.prisma.$transaction([
      this.prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: SeatStatus.AVAILABLE, lockedBy: null, lockedAt: null, lockExpiry: null },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.EXPIRED },
      }),
    ]);

    return { message: 'Seats released' };
  }

  async confirmBooking(userId: string, dto: ConfirmBookingDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, userId, status: BookingStatus.PENDING },
      include: { seats: { include: { seat: true } }, showtime: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.expiresAt && booking.expiresAt < new Date()) {
      throw new BadRequestException('Booking expired');
    }

    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: dto.couponCode,
          active: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });
      if (coupon) {
        if (coupon.discountType === 'FLAT') discount = Number(coupon.discountValue);
        else discount = Number(booking.subtotal) * (Number(coupon.discountValue) / 100);
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    }

    const total = Number(booking.subtotal) + Number(booking.tax) - discount;

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { discount, total, status: BookingStatus.CONFIRMED, confirmedAt: new Date() },
    });

    const seatIds = booking.seats.map((s) => s.seatId);
    await this.prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: SeatStatus.BOOKED, lockedBy: null, lockedAt: null, lockExpiry: null },
    });

    if (booking.showtime) {
      await this.prisma.showtime.update({
        where: { id: booking.showtimeId },
        data: { sold: { increment: booking.seats.length } },
      });
    }

    return { bookingId: booking.id, bookingRef: booking.bookingRef, total, status: 'CONFIRMED' };
  }

  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId, status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] } },
      include: {
        showtime: { include: { movie: true, event: true } },
        seats: { include: { seat: true } },
        ticket: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getBookedSeatIds(showtimeId: string): Promise<Set<string>> {
    const booked = await this.prisma.bookingSeat.findMany({
      where: {
        booking: { showtimeId, status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] } },
      },
      select: { seatId: true },
    });
    return new Set(booked.map((b) => b.seatId));
  }

  private async acquireLock(key: string, owner: string): Promise<boolean> {
    const existing = await this.redis.get(key);
    if (existing && existing !== owner) return false;
    await this.redis.set(key, owner, 5);
    return true;
  }

  private async releaseLock(key: string) {
    await this.redis.del(key);
  }
}
