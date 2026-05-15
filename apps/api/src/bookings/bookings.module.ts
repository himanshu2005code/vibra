import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SeatGateway } from './seat.gateway';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, SeatGateway, TicketsService],
  exports: [BookingsService, TicketsService],
})
export class BookingsModule {}
