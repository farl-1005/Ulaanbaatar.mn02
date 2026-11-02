import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { UPLOADS } from '../config';
import { Database } from '../database/database';
import { EventsService } from '../events/events.service';
import { FormKind, ID_PREFIX } from './validation';

export const SUBMISSION_STATUSES = ['new', 'progress', 'done', 'rejected'];

/** Иргэдийн илгээсэн маягт: admin-ы «Ирсэн хүсэлт» хэсэгт харагдана. Зураг data/uploads/-д (зөвхөн admin үзнэ). */
@Injectable()
export class SubmissionsService {
  constructor(private readonly db: Database, private readonly events: EventsService) {
    fs.mkdirSync(UPLOADS, { recursive: true });
  }

  /** Шинэ хүсэлт хадгалж дугаарыг нь буцаана. Бүртгэлтэй имэйл дахин ирвэл null. */
  async create(kind: FormKind, data: Record<string, unknown>, photo?: string): Promise<string | null> {
    if (kind === 'digest' && await this.db.emailExists(String(data.email))) return null;
    let n = 48500 + (await this.db.subCount(kind)) + 1, id: string;
    while (await this.db.subGet((id = `${ID_PREFIX[kind]}-${new Date().getFullYear()}-${n}`))) n++;   // устгасан дугаар давхцахгүй
    if (kind === 'report' && photo) data.photo = this.savePhoto(id, photo);
    await this.db.subAdd(id, kind, data, new Date().toISOString());
    this.events.broadcast('submission');
    return id;
  }

  list() {
    return this.db.subList();
  }

  async setStatus(id: string, status: string) {
    await this.db.subStatus(status, new Date().toISOString(), id);
    this.events.broadcast('submission');
  }

  async remove(id: string) {
    const row = await this.db.subGet(id);
    if (row) {
      const photo = row.data && row.data.photo;
      if (photo) fs.rm(path.join(UPLOADS, path.basename(photo)), () => {});
      await this.db.subDel(id);
    }
    this.events.broadcast('submission');
  }

  /** Иргэний оруулсан зургийн файлын зам (байхгүй бол null) */
  uploadPath(file: string): string | null {
    const f = path.join(UPLOADS, file);
    return f.startsWith(UPLOADS + path.sep) && fs.existsSync(f) ? f : null;
  }

  /** data:image/...;base64 → data/uploads/<id>.<ext> (3 МБ хүртэл) */
  private savePhoto(id: string, dataUrl: string): string | null {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
    if (!m) return null;
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 3e6) return null;
    const file = `${id}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
    fs.writeFileSync(path.join(UPLOADS, file), buf);
    return '/uploads/' + file;
  }
}
