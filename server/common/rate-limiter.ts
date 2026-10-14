import { Injectable, OnModuleDestroy } from '@nestjs/common';

/** Энгийн хурдны хязгаар: түлхүүрээр (IP + үйлдэл) тодорхой хугацаанд N удаа. */
@Injectable()
export class RateLimiter implements OnModuleDestroy {
  private readonly hits = new Map<string, number[]>();
  private readonly cleanup = setInterval(() => {
    const t = Date.now();
    for (const [k, v] of this.hits) if (!v.some((x) => t - x < 3600e3)) this.hits.delete(k);
  }, 600e3).unref();

  /** Хязгаар хэтэрсэн бол true */
  limited(key: string, max: number, windowMs: number): boolean {
    const t = Date.now(), arr = (this.hits.get(key) || []).filter((x) => t - x < windowMs);
    arr.push(t);
    this.hits.set(key, arr);
    return arr.length > max;
  }

  onModuleDestroy() {
    clearInterval(this.cleanup);
  }
}
