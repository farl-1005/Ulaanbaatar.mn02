import { Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as path from 'path';
import { AdminGuard } from '../auth/admin.guard';
import { ApiError } from '../common/http';
import { MEDIA_TYPES, UploadsService } from './uploads.service';

/** Видео, аудио оруулах (admin) ба үйлчлэх (нийтэд) */
@Controller()
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  /** POST /api/upload/media: биед нь файл өөрөө (Content-Type: video/mp4, audio/mpeg ...).
      Видео (MP4, WebM, MOV) 500 МБ, аудио (MP3, M4A, OGG, WAV) 100 МБ хүртэл. Хариу: { url: '/media/<файл>', size, type: 'video' | 'audio' } */
  @Post('api/upload/media')
  @UseGuards(AdminGuard)
  @HttpCode(201)
  upload(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.uploads.save(req, res);
  }

  /** GET /media/<файл>: Range хүсэлтийг (видео гүйлгэх) res.sendFile өөрөө дэмжинэ. Файлын нэр давтагддаггүй тул удаан кэшилнэ. */
  @Get('media/:file')
  serve(@Param('file') file: string, @Res() res: Response) {
    const f = this.uploads.filePath(file);
    if (!f) throw new ApiError(404, 'not_found');
    res.sendFile(f, {
      headers: { 'Content-Type': MEDIA_TYPES[path.extname(f).slice(1)], 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    }, (err: (Error & { status?: number }) | undefined) => { if (err && !res.headersSent) res.status(err.status === 416 ? 416 : 404).end(); });   // үзэгч хаахад (ECONNABORTED) алдаа биш
  }
}
