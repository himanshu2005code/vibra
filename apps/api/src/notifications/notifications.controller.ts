import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.notifications.getForUser(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.notifications.markRead(req.user.sub, id);
  }
}
