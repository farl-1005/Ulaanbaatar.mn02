/* Өгөгдлийн сангийн давхарга. Бусад модуль зөвхөн энэ абстракт классыг (Nest-ийн DI-ээр) ашиглана:
     constructor(private readonly db: Database) {}
   Хэрэгжүүлэлт: postgres.ts (DATABASE_URL өгсөн бол), sqlite.ts (эс бөгөөс data/ub.sqlite).
   Хүснэгтүүд:
     cms          admin-ы засвар (col, id, body JSON)
     cms_log      admin-ы үйлдлийн түүх
     sessions     admin нэвтрэлт (token-ий sha256)
     submissions  иргэдийн маягт (эрсдэл, санал, имэйл бүртгэл)
     air_log      агаарын чанарын хэмжилт (IQAir) */
import { OnModuleDestroy } from '@nestjs/common';

export interface CmsRow { col: string; id: string; body: any }
export interface CmsLogRow { at: string; action: string; col: string; id: string; title: string; by: string }
export interface SubmissionRow { id: string; kind: string; data: any; status: string; created_at: string; updated_at: string | null }
export interface AirRow { ts: number; aqi: number }

export abstract class Database implements OnModuleDestroy {
  abstract readonly kind: 'postgres' | 'sqlite';

  /* ---- Admin-ы засвар ---- */
  abstract cmsAll(): Promise<CmsRow[]>;
  abstract cmsCol(col: string): Promise<{ id: string; body: any }[]>;
  abstract cmsOne(col: string, id: string): Promise<any | null>;
  abstract cmsPut(col: string, id: string, body: object, at: string): Promise<void>;
  abstract cmsDel(col: string, id: string): Promise<void>;
  abstract logAdd(at: string, action: string, col: string, id: string, title: string, by: string): Promise<void>;
  abstract logRecent(): Promise<CmsLogRow[]>;

  /* ---- Нэвтрэлт ---- */
  abstract sessAdd(hash: string, expires: number): Promise<void>;
  abstract sessGet(hash: string): Promise<{ expires: number } | null>;
  abstract sessDel(hash: string): Promise<void>;
  abstract sessGc(now: number): Promise<void>;

  /* ---- Иргэдийн маягт ---- */
  abstract subAdd(id: string, kind: string, data: object, at: string): Promise<void>;
  abstract subCount(kind: string): Promise<number>;
  abstract subList(): Promise<SubmissionRow[]>;
  abstract subGet(id: string): Promise<{ id: string; data: any } | null>;
  abstract subStatus(status: string, at: string, id: string): Promise<void>;
  abstract subDel(id: string): Promise<void>;
  abstract subNew(): Promise<number>;
  abstract emailExists(email: string): Promise<boolean>;

  /* ---- Агаарын чанарын түүх ---- */
  abstract airAdd(ts: number, aqi: number, main: string | null): Promise<void>;
  abstract airSince(ts: number): Promise<AirRow[]>;
  abstract airGc(ts: number): Promise<void>;

  abstract close(): Promise<void>;

  onModuleDestroy() {
    return this.close();
  }
}
