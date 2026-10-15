import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CmsService, ID_RE } from '../cms/cms.service';
import { DIST } from '../config';
import { clone, isoUB, mn } from './text';

const INDEX = path.join(DIST, 'news-index.json');

export interface Rubric { t: [string, string]; c: string }
export interface NewsItem {
  id: string; t: any; l?: any; b?: any[]; bt?: [string, string]; d?: string; img?: string; cat: string;
  live?: number; zar?: number; draft?: boolean; src?: string; updatedAt?: string;
  /** ISO огноо (Улаанбаатарын цаг) */
  at: string | null;
}
export interface NewsFeed { news: NewsItem[]; rub: Record<string, Rubric>; src: string }

/** Мэдээний жагсаалт: бүтээх үеийн dist/news-index.json + admin-ы засвар (src/core/cms.js-ийн дүрмээр нийлүүлнэ). */
@Injectable()
export class NewsFeedService {
  private index: { mtime: number; data: any } | null = null;

  constructor(private readonly cms: CmsService) {}

  /** Сайт хараахан бүтээгдээгүй бол null */
  async all(): Promise<NewsFeed | null> {
    const idx = this.readIndex();
    if (!idx) return null;
    const rub: Record<string, Rubric> = clone(idx.rub), rubOv = await this.cms.collection('rubrics');
    for (const id in rubOv) if (!rubOv[id].deleted) rub[id] = { t: rubOv[id].t || (rub[id] || {}).t, c: rubOv[id].c || (rub[id] || {}).c };
    const news = merged(idx.news, await this.cms.collection('news'))
      .filter((n) => !n.draft && ID_RE.test(n.id || '') && mn(n.t))
      .map((n) => {
        if (n.bt) {   // admin-аас засварласан бие: [монгол, англи] догол мөрүүдээр
          const a = paras(n.bt[0]), b = paras(n.bt[1]);
          n.b = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i] || b[i] || '', b[i] || a[i] || '']);
        }
        if (!rub[n.cat]) n.cat = 'city';
        n.at = isoUB(n.d);
        return n as NewsItem;
      })
      .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
    return { news, rub, src: idx.src };
  }

  async find(id: string): Promise<{ feed: NewsFeed; item: NewsItem | null } | null> {
    const feed = await this.all();
    return feed && { feed, item: (ID_RE.test(id) && feed.news.find((x) => x.id === id)) || null };
  }

  /** Файл өөрчлөгдөх хүртэл санах ойд хадгална (бүтээлт бүр дахин бичдэг) */
  private readIndex() {
    let st: fs.Stats;
    try { st = fs.statSync(INDEX); } catch { return null; }
    if (!this.index || this.index.mtime !== st.mtimeMs) this.index = { mtime: st.mtimeMs, data: JSON.parse(fs.readFileSync(INDEX, 'utf8')) };
    return this.index.data;
  }
}

/** Анхны жагсаалт + засвар: засвартай бол дарж бичнэ, deleted бол хасна, шинээр нэмсэнийг төгсгөлд нь (src/core/cms.js mergedItems) */
function merged(defs: any[], ov: Record<string, any>): any[] {
  const out: any[] = [], seen = new Set<string>();
  defs.forEach((d) => { seen.add(d.id); const o = ov[d.id]; if (o && o.deleted) return; out.push(Object.assign(clone(d), o || {})); });
  Object.keys(ov).forEach((id) => { const o = ov[id]; if (!seen.has(id) && !o.deleted) out.push(clone(o)); });
  return out;
}

const paras = (s: unknown) => String(s || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
