import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, OtpRequestDto, OtpVerifyDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('otp/request')
  requestOtp(@Body() dto: OtpRequestDto) {
    return this.auth.requestOtp(dto);
  }

  @Post('otp/verify')
  verifyOtp(@Body() dto: OtpVerifyDto) {
    return this.auth.verifyOtp(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: { user: { sub: string } }) {
    return this.auth.getProfile(req.user.sub);
  }
}
