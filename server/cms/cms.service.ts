import { Injectable } from '@nestjs/common';
import { Database } from '../database/database';
import { EventsService } from '../events/events.service';

/** Admin-аас засагдах бүлгүүд (src/admin/cms.js-ийн CMS_COLS-тай ижил байх ёстой) */
export const CMS_COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media',
  'mediaitems', 'sits', 'docs', 'struct', 'orgs', 'history', 'citydata', 'menu', 'rubrics', 'ecats', 'pcats', 'topics', 'faq', 'banners', 'govsched'];
export const ID_RE = /^[\w.-]{1,80}$/;

/** Admin-ы засвар. Сайтын анхны агуулга src/data/-д, засвар нь өгөгдлийн санд; хөтөч хоёрыг нийлүүлж харуулна. */
@Injectable()
export class CmsService {
  constructor(private readonly db: Database, private readonly events: EventsService) {}

  /** Бүх засвар: { бүлэг: { id: бие } } */
  async all() {
    const data: Record<string, Record<string, any>> = {};
    CMS_COLS.forEach((c) => { data[c] = {}; });
    for (const r of await this.db.cmsAll()) if (data[r.col]) data[r.col][r.id] = r.body;
    return data;
  }

  /** Нэг бүлгийн засвар: { id: бие } */
  async collection(col: string) {
    const out: Record<string, any> = {};
    for (const r of await this.db.cmsCol(col)) out[r.id] = r.body;
    return out;
  }

  get(col: string, id: string) {
    return this.db.cmsOne(col, id);
  }

  async save(col: string, id: string, body: object) {
    await this.db.cmsPut(col, id, Object.assign(body, { id }), new Date().toISOString());
    this.events.broadcast('cms');
  }

  async remove(col: string, id: string) {
    await this.db.cmsDel(col, id);
    this.events.broadcast('cms');
  }

  log(action: string, col: string, id: string, title: string) {
    return this.db.logAdd(new Date().toISOString(), action, col, id, title, 'admin');
  }

  recentLog() {
    return this.db.logRecent();
  }
}
