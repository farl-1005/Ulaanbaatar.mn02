import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { sha256 } from '../common/http';
import { UPLOADS } from '../config';
import { Database } from '../database/database';
import { EventsService } from '../events/events.service';
import { FormKind, ID_PREFIX } from './validation';

export const SUBMISSION_STATUSES = ['new', 'progress', 'done', 'rejected'];

/* Өргөдөл, гомдлын явц шалгах түлхүүр: 10 тэмдэгт, андуурагдах (0 O 1 I L) тэмдэгтгүй. Өгөгдлийн санд зөвхөн sha256(дугаар:түлхүүр). */
const KEY_ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newKey = () => Array.from({ length: 10 }, () => KEY_ABC[crypto.randomInt(KEY_ABC.length)]).join('');
const keyHash = (id: string, key: string) => sha256(id + ':' + key);
/** Иргэний бичсэн түлхүүр: том үсэг, зай, зураасгүй («abcde-fghjk» → «ABCDEFGHJK») */
export const normKey = (k: unknown) => String(k == null ? '' : k).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);

/** Иргэнд харагдах явц (нэр, утас, имэйл, текст, зураг БУЦААХГҮЙ) */
export interface TrackView {
  id: string; type: string; topic: string; status: string; createdAt: string; updatedAt: string | null;
  reply: string | null; replyAt: string | null; history: { status: string; at: string }[];
}

/** Иргэдийн илгээсэн маягт: admin-ы «Ирсэн хүсэлт» хэсэгт харагдана. Зураг data/uploads/-д (зөвхөн admin үзнэ). */
@Injectable()
export class SubmissionsService {
  constructor(private readonly db: Database, private readonly events: EventsService) {
    fs.mkdirSync(UPLOADS, { recursive: true });
  }

  /** Шинэ хүсэлт хадгалж дугаарыг нь (өргөдөл, гомдолд явц шалгах түлхүүрийг ч) буцаана. Бүртгэлтэй имэйл дахин ирвэл null. */
  async create(kind: FormKind, data: Record<string, unknown>, photo?: string): Promise<{ id: string; key?: string } | null> {
    if (kind === 'digest' && await this.db.emailExists(String(data.email))) return null;
    let n = 48500 + (await this.db.subCount(kind)) + 1, id: string;
    while (await this.db.subGet((id = `${ID_PREFIX[kind]}-${new Date().getFullYear()}-${n}`))) n++;   // устгасан дугаар давхцахгүй
    if ((kind === 'report' || kind === 'complaint') && photo) data.photo = this.savePhoto(id, photo);
    let key: string | undefined;
    if (kind === 'complaint') { key = newKey(); data.keyHash = keyHash(id, key); data.history = []; }
    await this.db.subAdd(id, kind, data, new Date().toISOString());
    this.events.broadcast('submission');
    return key ? { id, key } : { id };
  }

  /** Admin-д: түлхүүрийн hash-ийг харуулахгүй */
  async list() {
    return (await this.db.subList()).map((r) => {
      if (!r.data || !r.data.keyHash) return r;
      const { keyHash: _h, ...data } = r.data;
      return { ...r, data };
    });
  }

  /** Өргөдөл, гомдлын явц: дугаар ба түлхүүр таарвал нийтэд харагдах хэсэг, эс бөгөөс null */
  async track(id: string, key: string): Promise<TrackView | null> {
    const row = await this.db.subRow(id);
    if (!row || row.kind !== 'complaint' || !row.data) return null;
    const a = Buffer.from(keyHash(id, normKey(key)), 'hex'), b = Buffer.from(String(row.data.keyHash || ''), 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const d = row.data, hist = Array.isArray(d.history) ? d.history : [];
    return {
      id: row.id, type: d.type, topic: d.topic, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
      reply: d.reply || null, replyAt: d.replyAt || null,
      history: [{ status: 'new', at: row.created_at }, ...hist.map((h: any) => ({ status: String(h.status), at: String(h.at) }))],
    };
  }

  /** Төлөв солих ба (өргөдөл, гомдолд) иргэнд харагдах хариу бичих. Өргөдөл, гомдлын төлвийн өөрчлөлт бүр түүхэнд үлдэнэ. Байхгүй бол false. */
  async update(id: string, b: { status?: string; reply?: string }): Promise<boolean> {
    const row = await this.db.subRow(id);
    if (!row) return false;
    const at = new Date().toISOString(), status = b.status || row.status;
    if (row.kind === 'complaint') {
      const data = { ...row.data }, hist = Array.isArray(data.history) ? data.history.slice(-29) : [];
      if (status !== row.status) hist.push({ status, at });
      data.history = hist;
      if (b.reply !== undefined && b.reply !== (data.reply || '')) {
        if (b.reply) { data.reply = b.reply; data.replyAt = at; } else { delete data.reply; delete data.replyAt; }
      }
      await this.db.subUpdate(id, status, data, at);
    } else if (b.status) await this.db.subStatus(status, at, id);
    this.events.broadcast('submission');
    return true;
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
