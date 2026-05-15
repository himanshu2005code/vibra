import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller({ path: 'recommendations', version: '1' })
export class RecommendationsController {
  constructor(private recs: RecommendationsService) {}

  @Get()
  get(@Query('city') citySlug?: string, @Query('userId') userId?: string) {
    return this.recs.getForUser(userId, citySlug);
  }

  @Get('personalized')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  personalized(@Req() req: { user: { sub: string } }, @Query('city') citySlug?: string) {
    return this.recs.getForUser(req.user.sub, citySlug);
  }

  @Post('track')
  track(
    @Body() body: { action: string; entityType: string; entityId: string; sessionId?: string; userId?: string },
  ) {
    return this.recs.trackBehavior(body.userId ?? null, body.action, body.entityType, body.entityId, body.sessionId);
  }
}
