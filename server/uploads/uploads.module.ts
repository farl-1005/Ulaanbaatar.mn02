import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Server } from 'http';
import { AuthModule } from '../auth/auth.module';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

/** Хүсэлтийг бүхэлд нь хүлээн авах хугацаа: том видеог удаан сүлжээгээр оруулахад хүрэлцэхүйц */
const UPLOAD_TIMEOUT = 3600e3;

/** Admin-аас видео, аудио оруулах (/api/upload/media), нийтэд үйлчлэх (/media/<файл>) */
@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule implements OnApplicationBootstrap {
  constructor(private readonly adapter: HttpAdapterHost) {}

  /** Node анхдагчаар хүсэлтийг 5 минутад бүрэн хүлээн авахыг шаарддаг (requestTimeout, 408): 500 МБ видеод хүрэлцэхгүй тул 1 цаг болгоно.
      Толгойг (headersTimeout, 60 секунд) хэвээр хязгаарлана. */
  onApplicationBootstrap() {
    const server = this.adapter.httpAdapter?.getHttpServer() as Server | undefined;
    if (server && server.requestTimeout > 0 && server.requestTimeout < UPLOAD_TIMEOUT) server.requestTimeout = UPLOAD_TIMEOUT;
  }
}
