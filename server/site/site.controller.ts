import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as path from 'path';
import { ApiError } from '../common/http';
import { DEV, SITE } from '../config';
import { SiteService } from './site.service';

@Controller()
export class SiteController {
  constructor(private readonly site: SiteService) {}

  /** GET /__dev: npm run dev үед хөтчийг автоматаар refresh хийлгэх холболт */
  @Get('__dev')
  devReload(@Req() req: Request, @Res() res: Response) {
    if (!DEV) throw new ApiError(404, 'not_found');
    this.site.subscribe(req, res);
  }

  @Get('favicon.svg')
  favicon(@Res() res: Response) {
    res.sendFile(path.join(SITE, 'favicon.svg'), { headers: { 'Cache-Control': DEV ? 'no-store' : 'no-cache' } });
  }
}
