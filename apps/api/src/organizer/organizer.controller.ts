import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizerService } from './organizer.service';
import { CreateEventDto } from './dto/organizer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('organizer')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('EVENT_ORGANIZER', 'ADMIN', 'SUPER_ADMIN')
@Controller({ path: 'organizer', version: '1' })
export class OrganizerController {
  constructor(private organizer: OrganizerService) {}

  @Get('analytics')
  analytics(@Req() req: { user: { sub: string } }) {
    return this.organizer.getAnalytics(req.user.sub);
  }

  @Get('events')
  events(@Req() req: { user: { sub: string } }) {
    return this.organizer.getEvents(req.user.sub);
  }

  @Post('events')
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateEventDto) {
    return this.organizer.createEvent(req.user.sub, dto);
  }
}
