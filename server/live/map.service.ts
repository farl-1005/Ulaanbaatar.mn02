import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { ApiError } from '../common/http';
import { RateLimiter } from '../common/rate-limiter';

const UPSTREAM = 'https://gateway-city.hamuga.mn/';

interface CachedTile { at: number; code: number; headers: Record<string, string>; body: Buffer }

/** Газрын зураг: hamuga.mn «UB Engineering Map server».
    Түлхүүрийг (HAMUGA_API_KEY, .env) хөтөч рүү гаргахгүйн тулд tile-ыг манай серверээр дамжуулна. Татсаныг 24 цаг санах ойд хадгална. */
@Injectable()
export class MapService {
  private readonly cache = new Map<string, CachedTile>();

  constructor(private readonly limiter: RateLimiter) {}

  /** sub: «tiles/<layerId>/<z>/<x>/<y>.pbf» эсвэл «tiles/map-info/<id>» */
  async proxy(res: Response, sub: string, ip: string) {
    const key = process.env.HAMUGA_API_KEY;
    if (!key) throw new ApiError(503, 'map_key_missing');
    if (this.limiter.limited('map:' + ip, 3000, 60e3)) throw new ApiError(429, 'too_many_requests');
    const hit = this.cache.get(sub);
    if (hit && Date.now() - hit.at < 864e5) { res.writeHead(hit.code, hit.headers).end(hit.body); return; }

    let r: globalThis.Response;
    try { r = await fetch(UPSTREAM + sub, { headers: { apikey: key, 'x-api-key': key }, signal: AbortSignal.timeout(15000) }); }
    catch { throw new ApiError(504, 'map_upstream_timeout'); }
    if (r.status === 401 || r.status === 403) {
      console.warn('  ⚠ Газрын зураг: hamuga.mn түлхүүрийг хүлээж авсангүй (' + r.status + ')');
      throw new ApiError(502, 'map_key_rejected');
    }
    const body = Buffer.from(await r.arrayBuffer());
    const headers = {
      'Content-Type': r.headers.get('content-type') || (sub.endsWith('.pbf') ? 'application/x-protobuf' : 'application/json'),
      'Cache-Control': r.ok ? 'public, max-age=86400' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    };
    if (r.ok) {
      this.cache.set(sub, { at: Date.now(), code: r.status, headers, body });
      if (this.cache.size > 3000) this.cache.delete(this.cache.keys().next().value!);
    }
    res.writeHead(r.status, headers).end(body);
  }
}
