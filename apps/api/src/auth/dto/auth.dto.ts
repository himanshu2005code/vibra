import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cityId?: string;
}

export class LoginDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class OtpRequestDto {
  @ApiProperty()
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;
}

export class OtpVerifyDto {
  @ApiProperty()
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  code!: string;
}
