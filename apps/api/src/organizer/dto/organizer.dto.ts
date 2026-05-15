import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type!: EventType;

  @ApiProperty()
  @IsDateString()
  startAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  artists?: string[];
}
