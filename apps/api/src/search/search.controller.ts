import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private search: SearchService) {}

  @Get()
  search(@Query('q') q: string) {
    return this.search.search(q ?? '');
  }

  @Get('suggest')
  suggest(@Query('q') q: string) {
    return this.search.suggest(q ?? '');
  }

  @Get('trending')
  trending() {
    return this.search.getTrending();
  }
}
