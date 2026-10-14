import { Controller, Delete, Get, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as path from 'path';
import { AdminGuard } from '../auth/admin.guard';
import { ApiError, readJson } from '../common/http';
import { SUBMISSION_STATUSES, SubmissionsService } from './submissions.service';

const IMAGE_TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

/** Admin-ы «Ирсэн хүсэлт»: жагсаалт, төлөв солих, устгах, иргэний зураг үзэх */
@Controller()
@UseGuards(AdminGuard)
export class InboxController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get('api/submissions')
  async list() {
    return { list: await this.submissions.list() };
  }

  /** PATCH /api/submissions/<id> { status: new | progress | done | rejected } */
  @Patch('api/submissions/:id')
  async setStatus(@Param('id') id: string, @Req() req: Request) {
    this.checkId(id);
    const b = await readJson(req, 1024);
    if (!SUBMISSION_STATUSES.includes(b.status)) throw new ApiError(400, 'bad_status');
    await this.submissions.setStatus(id, b.status);
    return { ok: true };
  }

  @Delete('api/submissions/:id')
  async remove(@Param('id') id: string) {
    this.checkId(id);
    await this.submissions.remove(id);
    return { ok: true };
  }

  /** GET /uploads/<файл>: иргэний оруулсан зураг */
  @Get('uploads/:file')
  photo(@Param('file') file: string, @Res() res: Response) {
    const f = /^[\w.-]+$/.test(file) ? this.submissions.uploadPath(file) : null;
    if (!f) throw new ApiError(404, 'not_found');
    res.sendFile(f, { headers: { 'Content-Type': IMAGE_TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'private, max-age=3600' } });
  }

  private checkId(id: string) {
    if (!/^[\w-]+$/.test(id)) throw new ApiError(404, 'not_found');
  }
}
