import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';

@ApiTags('home')
@Controller({ path: 'home', version: '1' })
export class HomeController {
  constructor(private home: HomeService) {}

  @Get()
  feed(@Query('city') city?: string) {
    return this.home.getHomeFeed(city ?? 'mumbai');
  }
}
