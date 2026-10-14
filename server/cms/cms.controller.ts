import { Controller, Delete, Get, HttpCode, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { AuthService } from '../auth/auth.service';
import { ApiError, clean, readJson } from '../common/http';
import { Database } from '../database/database';
import { CMS_COLS, CmsService, ID_RE } from './cms.service';

@Controller('api')
export class CmsController {
  constructor(private readonly cms: CmsService, private readonly auth: AuthService, private readonly db: Database) {}

  /** GET /api/cms: бүх засвар (хүн бүрт). Admin-д үйлдлийн түүх, шинэ хүсэлтийн тоог нэмж өгнө. */
  @Get('cms')
  async read(@Req() req: Request) {
    const admin = await this.auth.isAdmin(req);
    return {
      data: await this.cms.all(),
      log: admin ? await this.cms.recentLog() : [],
      admin,
      inboxNew: admin ? await this.db.subNew() : 0,
    };
  }

  /** PUT /api/cms/<бүлэг>/<id>: засвар хадгалах */
  @Put('cms/:col/:id')
  @UseGuards(AdminGuard)
  async save(@Param('col') col: string, @Param('id') id: string, @Req() req: Request) {
    this.checkTarget(col, id);
    const body = await readJson(req, 1e6);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'bad_body');
    await this.cms.save(col, id, body);
    return { ok: true };
  }

  /** DELETE /api/cms/<бүлэг>/<id>: засварыг устгаж анхны агуулга руу буцаана */
  @Delete('cms/:col/:id')
  @UseGuards(AdminGuard)
  async remove(@Param('col') col: string, @Param('id') id: string) {
    this.checkTarget(col, id);
    await this.cms.remove(col, id);
    return { ok: true };
  }

  /** POST /api/cms-log { action, col, id, title }: admin-ы үйлдлийн түүх */
  @Post('cms-log')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async log(@Req() req: Request) {
    const b = await readJson(req, 8192);
    await this.cms.log(clean(b.action, 20), clean(b.col, 20), clean(b.id, 80), clean(b.title, 140));
    return { ok: true };
  }

  private checkTarget(col: string, id: string) {
    if (!CMS_COLS.includes(col) || !ID_RE.test(id)) throw new ApiError(400, 'bad_target');
  }
}
