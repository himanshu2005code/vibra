import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto, LoginDto, RefreshDto, OtpRequestDto, OtpVerifyDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
    });
    if (existing) throw new ConflictException('User already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const referralCode = randomBytes(4).toString('hex').toUpperCase();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        passwordHash,
        referralCode,
        cityId: dto.cityId,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return this.issueTokens(user.id, user.email ?? '', user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: dto.email ? { email: dto.email } : { phone: dto.phone },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email ?? '', user.role);
  }

  async requestOtp(dto: OtpRequestDto) {
    const key = `otp:throttle:${dto.phone}`;
    const throttled = await this.redis.get(key);
    if (throttled) throw new BadRequestException('Please wait before requesting another OTP');

    const code = process.env.SMS_PROVIDER === 'mock' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otpVerification.create({
      data: { phone: dto.phone, code, expiresAt },
    });

    await this.redis.set(key, '1', 60);
    return { message: 'OTP sent', expiresIn: 600, ...(process.env.NODE_ENV !== 'production' && { code }) };
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const otp = await this.prisma.otpVerification.findFirst({
      where: { phone: dto.phone, verified: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== dto.code) {
      if (otp) {
        await this.prisma.otpVerification.update({
          where: { id: otp.id },
          data: { attempts: { increment: 1 } },
        });
      }
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.otpVerification.update({ where: { id: otp.id }, data: { verified: true } });

    let user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          phoneVerified: true,
          authProvider: 'PHONE',
          referralCode: randomBytes(4).toString('hex').toUpperCase(),
        },
      });
    } else {
      await this.prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    }

    return this.issueTokens(user.id, user.email ?? '', user.role);
  }

  async refresh(dto: RefreshDto) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.session.delete({ where: { id: session.id } });
    return this.issueTokens(session.user.id, session.user.email ?? '', session.user.role);
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
    return { message: 'Logged out' };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        cityId: true,
        walletBalance: true,
        loyaltyPoints: true,
        locale: true,
        preferences: true,
        createdAt: true,
      },
    });
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.session.create({
      data: { userId, refreshToken, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: { id: userId, email, role },
    };
  }
}
