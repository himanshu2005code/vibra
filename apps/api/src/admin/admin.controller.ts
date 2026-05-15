import { Body, Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.getDashboard();
  }

  @Get('users')
  users(@Query('page') page?: number) {
    return this.admin.listUsers(Number(page) || 1);
  }

  @Patch('events/:id/moderate')
  moderate(@Param('id') id: string, @Body() body: { status: 'PUBLISHED' | 'CANCELLED' }) {
    return this.admin.moderateEvent(id, body.status);
  }
}
