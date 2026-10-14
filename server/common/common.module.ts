import { Global, Module } from '@nestjs/common';
import { RateLimiter } from './rate-limiter';

/** Бүх модульд хэрэгтэй үйлчилгээ (хурдны хязгаар) */
@Global()
@Module({
  providers: [RateLimiter],
  exports: [RateLimiter],
})
export class CommonModule {}
