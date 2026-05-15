import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, BookingStatus, SeatStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { createHmac } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, userId, status: BookingStatus.PENDING },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const amount = Number(booking.total) - Number(booking.discount);
    const method = dto.method ?? PaymentMethod.RAZORPAY;

    let providerOrderId: string;
    let key: string | undefined;

    if (method === PaymentMethod.RAZORPAY && process.env.RAZORPAY_KEY_ID) {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: booking.bookingRef,
      });
      providerOrderId = order.id;
      key = process.env.RAZORPAY_KEY_ID;
    } else if (method === PaymentMethod.STRIPE && process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'inr',
        metadata: { bookingId: booking.id },
      });
      providerOrderId = intent.id;
    } else {
      providerOrderId = `mock_order_${booking.bookingRef}`;
    }

    await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { amount, method, providerOrderId, status: PaymentStatus.PENDING },
      create: {
        bookingId: booking.id,
        amount,
        method,
        providerOrderId,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      orderId: providerOrderId,
      amount,
      currency: 'INR',
      provider: method === PaymentMethod.STRIPE ? 'stripe' : 'razorpay',
      key,
      bookingRef: booking.bookingRef,
    };
  }

  async verifyRazorpay(body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
    const expected = createHmac('sha256', secret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest('hex');

    if (expected !== body.razorpay_signature && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Invalid signature');
    }

    return this.completePayment(body.razorpay_order_id, body.razorpay_payment_id);
  }

  async mockComplete(userId: string, bookingId: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Not available in production');
    }
    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true },
    });
    if (!payment || payment.booking.userId !== userId) throw new NotFoundException();
    return this.completePayment(payment.providerOrderId ?? '', `mock_pay_${Date.now()}`);
  }

  private async completePayment(orderId: string, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerOrderId: orderId },
      include: { booking: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const booking = await this.prisma.booking.findUnique({
      where: { id: payment.bookingId },
      include: { seats: true },
    });

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED, providerPaymentId: paymentId },
      }),
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.CONFIRMED, confirmedAt: new Date() },
      }),
      ...(booking
        ? [
            this.prisma.seat.updateMany({
              where: { id: { in: booking.seats.map((s) => s.seatId) } },
              data: { status: SeatStatus.BOOKED, lockedBy: null, lockedAt: null, lockExpiry: null },
            }),
          ]
        : []),
    ]);

    return { success: true, bookingId: payment.bookingId, bookingRef: payment.booking.bookingRef };
  }
}
