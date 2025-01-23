import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  async set(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  async get(key: string) {
    return await this.redisClient.get(key);
  }
}
