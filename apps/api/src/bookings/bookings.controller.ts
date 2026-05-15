import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { TicketsService } from './tickets.service';
import { LockSeatsDto, ConfirmBookingDto } from './dto/booking.dto';

@ApiTags('bookings')
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(
    private bookings: BookingsService,
    private tickets: TicketsService,
  ) {}

  @Get('showtimes/:showtimeId/seats')
  getSeatMap(@Param('showtimeId') showtimeId: string) {
    return this.bookings.getSeatMap(showtimeId);
  }

  @Post('lock')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  lockSeats(@Req() req: { user: { sub: string } }, @Body() dto: LockSeatsDto) {
    return this.bookings.lockSeats(req.user.sub, dto);
  }

  @Post(':bookingId/release')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  release(@Req() req: { user: { sub: string } }, @Param('bookingId') bookingId: string) {
    return this.bookings.releaseSeats(req.user.sub, bookingId);
  }

  @Post('confirm')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  confirm(@Req() req: { user: { sub: string } }, @Body() dto: ConfirmBookingDto) {
    return this.bookings.confirmBooking(req.user.sub, dto);
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  myBookings(@Req() req: { user: { sub: string } }) {
    return this.bookings.getUserBookings(req.user.sub);
  }

  @Get(':bookingId/ticket')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getTicket(@Req() req: { user: { sub: string } }, @Param('bookingId') bookingId: string) {
    return this.tickets.getOrCreateTicket(req.user.sub, bookingId);
  }
}
