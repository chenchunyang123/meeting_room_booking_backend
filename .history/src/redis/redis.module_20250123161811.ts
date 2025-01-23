import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
