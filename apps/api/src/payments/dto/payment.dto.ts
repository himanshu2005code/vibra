import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  bookingId!: string;

  @ApiPropertyOptional({ enum: ['RAZORPAY', 'STRIPE', 'UPI', 'WALLET'] })
  @IsOptional()
  @IsEnum(['RAZORPAY', 'STRIPE', 'UPI', 'WALLET'])
  method?: 'RAZORPAY' | 'STRIPE' | 'UPI' | 'WALLET';
}
