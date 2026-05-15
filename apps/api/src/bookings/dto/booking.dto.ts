import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LockSeatsDto {
  @ApiProperty()
  @IsString()
  showtimeId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seatIds!: string[];
}

export class ConfirmBookingDto {
  @ApiProperty()
  @IsString()
  bookingId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
}
