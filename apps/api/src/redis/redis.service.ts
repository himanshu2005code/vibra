import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.client.connect().catch(() => {
      console.warn('Redis unavailable — caching disabled');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) await this.client.setex(key, ttlSeconds, value);
      else await this.client.set(key, value);
    } catch {
      /* noop */
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      /* noop */
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
