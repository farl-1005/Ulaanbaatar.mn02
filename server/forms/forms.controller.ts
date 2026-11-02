import { Controller, HttpCode, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiError, clientIp, readJson } from '../common/http';
import { RateLimiter } from '../common/rate-limiter';
import { SubmissionsService } from './submissions.service';
import { FORM_KINDS, FormKind, validate } from './validation';

/** Иргэд маягт илгээх (нэвтрэлтгүй) */
@Controller('api')
export class FormsController {
  constructor(private readonly submissions: SubmissionsService, private readonly limiter: RateLimiter) {}

  /** POST /api/submit/report | idea | digest */
  @Post('submit/:kind')
  @HttpCode(201)
  async submit(@Param('kind') kind: string, @Req() req: Request) {
    if (!FORM_KINDS.includes(kind as FormKind)) throw new ApiError(404, 'not_found');
    if (this.limiter.limited('submit:' + clientIp(req), 30, 3600e3)) throw new ApiError(429, 'too_many_requests');
    const b = await readJson(req, 4.5e6);   // зурагтай тул том
    const v = validate(kind as FormKind, b);
    if ('error' in v) throw new ApiError(400, v.error);
    const id = await this.submissions.create(kind as FormKind, v.data, b.photo);
    return { ok: true, id };
  }
}
