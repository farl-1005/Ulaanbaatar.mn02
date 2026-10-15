/* Admin-ы өгөгдөл: сервер дээрх засвар (GET /api/cms) + сайтын анхны агуулга (kit.defaults).
   Засвар бүр /api/cms/<бүлэг>/<id>-д хадгалагдаж, сайт /api/events-ээр шууд шинэчлэгдэнэ.
   React-д: const state = useCms();  үйлдэл: cms.save(...), cms.remove(...) */
import { useSyncExternalStore } from 'react';
import { api, ApiError } from './api';
import { CmsData, kit, L } from './kit';

export interface LogEntry { at: string; action: string; col: string; id: string; title: string; by: string }
export interface CmsState {
  /** loading: ачаалж байна, ready: бэлэн, offline: сервертэй холбогдсонгүй */
  status: 'loading' | 'ready' | 'offline';
  admin: boolean;
  data: CmsData;
  log: LogEntry[];
  inboxNew: number;
  /** Иргэдийн маягт ирэх бүрд нэмэгдэнэ («Ирсэн хүсэлт» дахин ачаална) */
  inboxTick: number;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
/** Хадгалахгүй, зөвхөн дэлгэцэнд хэрэгтэй талбарууд */
const VIEW_ONLY = ['ts', 'ago', '_edited', '_new', 'b', 'w', 'd_'];

class CmsStore {
  private state: CmsState = { status: 'loading', admin: false, data: {}, log: [], inboxNew: 0, inboxTick: 0 };
  private listeners = new Set<() => void>();
  private events: EventSource | null = null;

  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  get = () => this.state;

  private set(patch: Partial<CmsState>) {
    this.state = { ...this.state, ...patch };
    if (patch.data) kit().apply(this.state.data);   // ангилал, тохиргоо, текстийг урьдчилан харахад тусгана
    this.listeners.forEach((f) => f());
  }

  async load() {
    try {
      const j = await api<{ data: CmsData; log: LogEntry[]; admin: boolean; inboxNew: number }>('/cms');
      const data: CmsData = {};
      kit().cols.forEach((c) => { data[c] = (j.data && j.data[c]) || {}; });
      this.set({ status: 'ready', admin: !!j.admin, data, log: j.log || [], inboxNew: j.inboxNew || 0 });
    } catch {
      this.set({ status: 'offline' });
    }
  }

  /** Өөр хөтөч, өөр admin-ы хийсэн засвар, шинэ маягтыг шууд авна */
  watch() {
    if (this.events) return;
    let tm: ReturnType<typeof setTimeout> | undefined;
    const reload = () => { clearTimeout(tm); tm = setTimeout(() => this.load(), 150); };
    this.events = new EventSource('/api/events');
    this.events.addEventListener('cms', reload);
    this.events.addEventListener('submission', () => { reload(); this.set({ inboxTick: this.state.inboxTick + 1 }); });
  }

  /** Анхны агуулга + засвар (засвартайг _edited, шинээр нэмснийг _new гэж тэмдэглэнэ; deleted бол хасна) */
  merged(col: string): any[] {
    const defs = kit().defaults[col] || [], ov = this.state.data[col] || {}, out: any[] = [], seen = new Set<string>();
    defs.forEach((d: any) => {
      seen.add(d.id);
      const o = ov[d.id];
      if (o && o.deleted) return;
      const x = Object.assign(clone(d), o || {});
      if (o) x._edited = 1;
      out.push(x);
    });
    Object.keys(ov).forEach((id) => { const o = ov[id]; if (!seen.has(id) && !o.deleted) out.push(Object.assign({ _new: 1 }, clone(o))); });
    return out;
  }

  isDefault(col: string, id: string) {
    return (kit().defaults[col] || []).some((x: any) => x.id === id);
  }

  /* ---- Бичих ---- */
  async write(col: string, id: string, body: Record<string, unknown>) {
    await api(`/cms/${col}/${encodeURIComponent(id)}`, { method: 'PUT', body });
    this.set({ data: { ...this.state.data, [col]: { ...this.state.data[col], [id]: { ...body, id } } } });
  }
  async drop(col: string, id: string) {
    await api(`/cms/${col}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const next = { ...this.state.data[col] };
    delete next[id];
    this.set({ data: { ...this.state.data, [col]: next } });
  }
  /** Хадгалах (шинэ эсвэл засвар) */
  async save(col: string, id: string, doc: Record<string, any>, title: string, action: 'create' | 'update' = 'update') {
    const body = clone(doc);
    VIEW_ONLY.forEach((k) => { delete body[k]; });
    await this.write(col, id, Object.assign(body, { id, updatedAt: new Date().toISOString(), by: 'admin' }));
    this.log(action, col, id, title);
  }
  /** Устгах: анхны агуулгын бичлэгийг «deleted» гэж тэмдэглэнэ, admin-аас нэмснийг бүр устгана */
  async remove(col: string, id: string, title: string) {
    if (this.isDefault(col, id)) await this.write(col, id, { id, deleted: true, updatedAt: new Date().toISOString(), by: 'admin' });
    else await this.drop(col, id);
    this.log('delete', col, id, title);
  }
  /** Засварыг арилгаж анхны хувилбарт буцаана */
  async revert(col: string, id: string, title: string) {
    await this.drop(col, id);
    this.log('revert', col, id, title);
  }
  /** Үйлдлийн түүх (алдаа гарвал алгасна) */
  async log(action: string, col: string, id: string, title: string) {
    const e = { at: new Date().toISOString(), action, col, id, title: String(title || '').slice(0, 140), by: 'admin' };
    this.set({ log: [e, ...this.state.log].slice(0, 20) });
    try { await api('/cms-log', { method: 'POST', body: e }); } catch { /* түүх заавал биш */ }
  }

  /* ---- Нэвтрэлт ---- */
  async login(password: string) {
    await api('/login', { method: 'POST', body: { password } });
    await this.load();
  }
  async logout() {
    try { await api('/logout', { method: 'POST', body: {} }); } catch { /* алгасна */ }
    this.set({ admin: false, log: [] });
  }
  /** Нэвтрэх хугацаа дууссан (401) бол нэвтрэх хуудас руу */
  expired() {
    this.set({ admin: false });
  }
}

export const cms = new CmsStore();

const SERVER_STATE: CmsState = { status: 'loading', admin: false, data: {}, log: [], inboxNew: 0, inboxTick: 0 };
export const useCms = () => useSyncExternalStore(cms.subscribe, cms.get, () => SERVER_STATE);

/** Алдааг хэрэглэгчид ойлгомжтой текст болгоно */
export function errMsg(e: unknown): string {
  const c = e instanceof ApiError ? e.code : '';
  if (c === 'unauthorized') { cms.expired(); return L(['Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.', 'Your session expired. Sign in again.']); }
  if (c === 'too_large') return L(['Өгөгдөл хэт том байна', 'The data is too large']);
  if (c === 'bad_target' || c === 'bad_body') return L(['Өгөгдөл буруу байна', 'Invalid data']);
  return L(['Хадгалж чадсангүй. Дахин оролдоно уу.', "Couldn't save. Try again."]);
}
