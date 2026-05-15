import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@Controller({ path: 'movies', version: '1' })
export class MoviesController {
  constructor(private movies: MoviesService) {}

  @Get()
  findAll(
    @Query('city') citySlug?: string,
    @Query('genre') genre?: string,
    @Query('language') language?: string,
    @Query('page') page?: number,
  ) {
    return this.movies.findAll({ citySlug, genre, language, page: Number(page) || 1 });
  }

  @Get('trending')
  trending(@Query('city') citySlug?: string) {
    return this.movies.getTrending(citySlug);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @Query('city') citySlug?: string) {
    return this.movies.findBySlug(slug, citySlug);
  }
}
