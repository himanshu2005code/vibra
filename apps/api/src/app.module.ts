import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';
import { EventsModule } from './events/events.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { SearchModule } from './search/search.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AdminModule } from './admin/admin.module';
import { OrganizerModule } from './organizer/organizer.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    MoviesModule,
    EventsModule,
    BookingsModule,
    PaymentsModule,
    SearchModule,
    RecommendationsModule,
    AdminModule,
    OrganizerModule,
    NotificationsModule,
    HealthModule,
    HomeModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
