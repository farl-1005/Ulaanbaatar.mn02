import { Controller, Delete, Get, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as path from 'path';
import { AdminGuard } from '../auth/admin.guard';
import { ApiError, clean, readJson } from '../common/http';
import { SUBMISSION_STATUSES, SubmissionsService } from './submissions.service';

const IMAGE_TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

/** Admin-ы «Ирсэн хүсэлт»: жагсаалт, төлөв солих, өргөдөл гомдолд хариу бичих, устгах, иргэний зураг үзэх */
@Controller()
@UseGuards(AdminGuard)
export class InboxController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Get('api/submissions')
  async list() {
    return { list: await this.submissions.list() };
  }

  /** PATCH /api/submissions/<id> { status?: new | progress | done | rejected, reply?: иргэнд харагдах хариу (өргөдөл, гомдолд, 2000 тэмдэгт хүртэл; хоосон бол арилгана) } */
  @Patch('api/submissions/:id')
  async setStatus(@Param('id') id: string, @Req() req: Request) {
    this.checkId(id);
    const b = await readJson(req, 16e3);
    if (b.status !== undefined && !SUBMISSION_STATUSES.includes(b.status)) throw new ApiError(400, 'bad_status');
    if (b.reply !== undefined && typeof b.reply !== 'string') throw new ApiError(400, 'bad_reply');
    if (b.status === undefined && b.reply === undefined) throw new ApiError(400, 'bad_status');
    const ok = await this.submissions.update(id, { status: b.status, reply: b.reply === undefined ? undefined : clean(b.reply, 2000) });
    if (!ok) throw new ApiError(404, 'not_found');
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
