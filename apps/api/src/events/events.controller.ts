import { Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import { EventsService } from './events.service';

@ApiTags('events')
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private events: EventsService) {}

  @Get()
  findAll(
    @Query('type') type?: EventType,
    @Query('city') citySlug?: string,
    @Query('page') page?: number,
  ) {
    return this.events.findAll({ type, citySlug, page: Number(page) || 1 });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.events.findBySlug(slug);
  }

  @Post(':eventId/waitlist')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  waitlist(@Req() req: { user: { sub: string } }, @Param('eventId') eventId: string) {
    return this.events.joinWaitlist(req.user.sub, eventId);
  }
}
