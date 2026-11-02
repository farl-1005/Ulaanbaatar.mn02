import { closeMenu, renderReact } from '../core/bridge.js';
import { CMS, apiCall } from '../core/cms.js';
import { store } from '../core/helpers.js';
import { openModal, toast } from '../core/modal.js';
import { t } from '../core/state.js';
import { fDate, hhmm } from '../core/time.js';
import { submitErr } from './forms.js';
/* ================= Өргөдөл, гомдол =================
   Иргэн өргөдөл / гомдол / санал хүсэлт гаргана (POST /api/submit/complaint → { id, key }), дараа нь дугаар + нууц түлхүүрээр явцаа шалгана (GET /api/track/<id>?key=).
   Цонхыг site/app/modals/Complaint.tsx зурна: товч, талбарууд props.on-оор (React onClick) энд ирнэ. Нээх товч data-act="complaint" (data-tab="track", data-id) → features/wiring.js.
   Илгээсэн { id, key }-ийг хөтөчид (store 'complaints') хадгалж «Явц шалгах» таб ба «Миний булан» (features/my-page.js)-д төлөвтэй нь харуулна. */

/** Төрөл, сэдэв: [түлхүүр, икон]. Шошго нь data/i18n.js (cty_<төрөл>, ctp_<сэдэв>); түлхүүрүүд server/forms/validation.ts-тэй ижил байна. */
export const C_TYPES = [['petition', 'file-text'], ['complaint', 'message-square-warning'], ['request', 'message-square-plus']];
export const C_TOPICS = [['city', 'trees'], ['road', 'bus'], ['social', 'hand-heart'], ['health', 'stethoscope'], ['edu', 'graduation-cap'], ['land', 'map'], ['other', 'circle-help']];
const typeIcon = (k) => (C_TYPES.find((x) => x[0] === k) || C_TYPES[0])[1];
/** Төлөв → алхам (0 хүлээн авсан, 1 шийдвэрлэж буй, 2 шийдвэрлэсэн / татгалзсан) */
const stepOf = (st) => (st === 'new' ? 0 : st === 'progress' ? 1 : 2);

/** Түлхүүрийг уншихад хялбар: ABCDE-FGHJK (сервер зураас, зай, жижиг үсгийг үл тооно) */
export const fmtKey = (k) => { const s = String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); return s.length > 5 ? s.slice(0, 5) + '-' + s.slice(5) : s; };
/** ISO огноо → Улаанбаатарын цагаар «10-р сарын 3, 14:20» */
export function fWhen(iso) {
  const d0 = new Date(iso);
  if (!iso || isNaN(+d0)) return '';
  const d = new Date(d0.getTime() + (480 + d0.getTimezoneOffset()) * 60000);
  return fDate(d) + ', ' + hhmm(d);
}

/* ---- Энэ хөтчөөс илгээсэн: [{ id, key, type, topic, at }] (шинэ нь эхэндээ) ---- */
export function myComplaints() {
  const v = store.get('complaints', []);
  return Array.isArray(v) ? v.filter((x) => x && typeof x.id === 'string' && typeof x.key === 'string') : [];
}
function remember(x) { store.set('complaints', [x, ...myComplaints().filter((y) => y.id !== x.id)].slice(0, 30)); }

/* ---- Явцын кэш: id → { v: серверийн хариу | null, err: 'gone' | 'net', at } ---- */
export const TRACK = {};
const trackApi = (id, key) => apiCall('/track/' + encodeURIComponent(id) + '?key=' + encodeURIComponent(key));
let refreshing = false;
/** Хадгалсан өргөдөл, гомдлын төлөвийг (1 минутаас хуучирсан бол) серверээс шинэчилж дахин зурна */
export function refreshMine() {
  if (refreshing || CMS.mode !== 'api') return;
  const due = myComplaints().filter((x) => !TRACK[x.id] || Date.now() - TRACK[x.id].at > 60e3);
  if (!due.length) return;
  refreshing = true;
  Promise.all(due.map((x) => trackApi(x.id, x.key).then(
    (v) => { TRACK[x.id] = { v, at: Date.now() }; },
    (e) => { TRACK[x.id] = { v: null, err: e && e.status === 404 ? 'gone' : 'net', at: Date.now() }; },
  ))).then(() => { refreshing = false; renderReact(); });
}

/** «Миний булан»-д: хадгалсан өргөдөл, гомдол бүр сүүлийн төлөвтэйгээ (st: null бол хараахан мэдэгдээгүй) */
export function myComplaintRows() {
  refreshMine();
  return myComplaints().map((x) => {
    const tr = TRACK[x.id], v = tr && tr.v, st = v ? v.status : null;
    return {
      id: x.id, i: typeIcon(x.type), title: t('cty_' + x.type), topic: t('ctp_' + x.topic), date: fWhen(x.at),
      st, gone: !!(tr && tr.err === 'gone'), stLabel: st ? t('cst_' + st) : !tr ? t('cLoading') : tr.err === 'gone' ? t('cGone') : t('cOffline'),
      step: st ? stepOf(st) : -1, steps: ['new', 'progress', st === 'rejected' ? 'rejected' : 'done'].map((s) => t('cst_' + s)),
      reply: v && v.reply ? v.reply : '',
    };
  });
}

/* ---- Цонх ---- */
const FIELDS = ['text', 'name', 'phone', 'email', 'tid', 'tkey'];
const C = { tab: 'new', dir: 0, type: 'complaint', topic: 'city', text: '', name: '', phone: '', email: '', photo: null, err: '', errField: '', busy: false, sent: null, tid: '', tkey: '', fill: 0, tres: null, terr: '', tbusy: false };

/** Явцын хариуг цонхонд: 3 алхам (огноотой), хариу */
function resView(v) {
  const cur = stepOf(v.status), hist = Array.isArray(v.history) ? v.history : [];
  const lastAt = (s) => { const h = hist.filter((x) => x.status === s); return h.length ? fWhen(h[h.length - 1].at) : ''; };
  return {
    id: v.id, i: typeIcon(v.type), title: t('cty_' + v.type), topic: t('ctp_' + v.topic), status: v.status, stLabel: t('cst_' + v.status),
    steps: ['new', 'progress', v.status === 'rejected' ? 'rejected' : 'done'].map((s, i) => ({ l: t('cst_' + s), at: i <= cur ? lastAt(s) : '', done: i <= cur, cur: i === cur })),
    updated: t('cUpdated', { d: fWhen(v.updatedAt || v.createdAt) }),
    replyLbl: t('cReply'), reply: v.reply || '', replyAt: v.replyAt ? fWhen(v.replyAt) : '', noReply: t('cNoReply'),
  };
}

/* React-д: текст нь сонгосон хэлээр */
function data() {
  const d = { title: t('cTitle'), sub: t('cSub'), tab: C.tab, dir: C.dir, fill: C.fill, tabs: [['new', t('cNew'), 'file-pen-line'], ['track', t('cTrack'), 'search-check']] };
  if (C.tab === 'new' && C.sent) {
    d.sent = { title: t('cSent'), desc: t('cSentD'), idLbl: t('cId'), id: C.sent.id, keyLbl: t('cKey'), key: fmtKey(C.sent.key), save: t('cSaveKey'), copy: t('cCopy'), copyAll: t('cCopyAll'), track: t('cTrackIt'), close: t('close') };
  } else if (C.tab === 'new') {
    d.form = {
      typeLbl: t('cTypeLbl'), type: C.type, types: C_TYPES.map(([k, i]) => ({ k, i, l: t('cty_' + k), d: t('ctyD_' + k) })),
      topicLbl: t('cTopicLbl'), topic: C.topic, topics: C_TOPICS.map(([k, i]) => ({ k, i, l: t('ctp_' + k) })),
      textLbl: t('cTextLbl'), text: C.text, textPh: t('cTextPh'),
      contactLbl: t('cContact'), hint: t('cContactHint'), name: C.name, phone: C.phone, email: C.email, namePh: t('cNamePh'), phonePh: t('cPhonePh'), emailPh: t('cEmailPh'),
      photoLbl: t('cPhoto'), photo: C.photo, photoDel: t('cPhotoDel'),
      err: C.err, errField: C.errField, busy: C.busy, send: t('cSend'),
    };
  } else {
    d.track = {
      desc: t('cTrackD'), idLbl: t('cId'), keyLbl: t('cKey'), id: C.tid, key: C.tkey, check: t('cCheck'), busy: C.tbusy, err: C.terr,
      mineLbl: t('cMine'), mine: myComplaints().map((x) => ({ id: x.id, label: t('cty_' + x.type), on: !!C.tres && C.tres.id === x.id })),
      res: C.tres ? resView(C.tres) : null,
    };
  }
  return d;
}

function fail(msg, field) {
  C.err = msg; C.errField = field || ''; renderReact();
  const el = field && document.getElementById('c-' + field);
  if (el) el.focus();
}

async function submit() {
  if (C.busy) return;
  const text = C.text.trim(), phone = C.phone.trim(), email = C.email.trim();
  if (!text) { fail(t('cNeedText'), 'text'); return; }
  if (phone && !/^\+?[\d\s()-]{6,20}$/.test(phone)) { fail(t('cBadPhone'), 'phone'); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fail(t('badEmail'), 'email'); return; }
  C.busy = true; C.err = ''; C.errField = ''; renderReact();
  let r;
  try {
    r = await apiCall('/submit/complaint', { method: 'POST', body: { type: C.type, topic: C.topic, text, name: C.name.trim(), phone, email, photo: C.photo || undefined } });
    if (!r || !r.id || !r.key) throw {};
  } catch (e) {
    C.busy = false;
    const c = e && e.code;
    fail(c === 'bad_phone' ? t('cBadPhone') : c === 'bad_email' ? t('badEmail') : c === 'empty_text' ? t('cNeedText') : submitErr(e), c === 'bad_phone' ? 'phone' : c === 'bad_email' ? 'email' : c === 'empty_text' ? 'text' : '');
    return;
  }
  const at = new Date().toISOString();
  remember({ id: r.id, key: r.key, type: C.type, topic: C.topic, at });
  TRACK[r.id] = { v: { id: r.id, type: C.type, topic: C.topic, status: 'new', createdAt: at, updatedAt: null, reply: null, replyAt: null, history: [{ status: 'new', at }] }, at: Date.now() };
  Object.assign(C, { sent: { id: r.id, key: r.key }, text: '', photo: null, busy: false });
  renderReact(); toast(t('cSent'), 'send');
}

async function track() {
  if (C.tbusy) return;
  const id = C.tid.trim().toUpperCase(), key = C.tkey.trim();
  if (!id || !key) { C.terr = t('cTrackD'); C.tres = null; renderReact(); return; }
  C.tbusy = true; C.terr = ''; renderReact();
  try { const v = await trackApi(id, key); C.tres = v; TRACK[v.id] = { v, at: Date.now() }; }
  catch (e) { C.tres = null; C.terr = e && e.status === 404 ? t('cNotFound') : submitErr(e); }
  C.tbusy = false; renderReact();
}

/** Зургийг хөтөч дээр 1600px хүртэл жижигрүүлж JPEG болгоно (сервер 3 МБ хүртэл хүлээн авна) */
async function readPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = url; });
    const s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight, 1)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * s)); c.height = Math.max(1, Math.round(img.naturalHeight * s));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  } finally { URL.revokeObjectURL(url); }
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(t('cCopied'), 'copy'); } catch (e) { toast(text, 'copy'); }
}

/** Цонхны товч, талбарууд (site/app/modals/Complaint.tsx) */
const on = {
  tab(v) { if (v === C.tab || (v !== 'new' && v !== 'track')) return; C.dir = v === 'track' ? 1 : -1; C.tab = v; if (v === 'new') C.sent = null; renderReact(); },
  type(k) { if (C_TYPES.some((x) => x[0] === k)) { C.type = k; renderReact(); } },
  topic(k) { if (C_TOPICS.some((x) => x[0] === k)) { C.topic = k; renderReact(); } },
  input(name, v) { if (!FIELDS.includes(name)) return; C[name] = v; if (C.err && (!C.errField || C.errField === name)) { C.err = ''; C.errField = ''; renderReact(); } },
  async photo(file) {
    if (!file) return;
    try { if (!/^image\//.test(file.type)) throw new Error('type'); C.photo = await readPhoto(file); if (C.photo.length > 4.2e6) { C.photo = null; throw new Error('size'); } }
    catch (e) { C.photo = null; toast(t('cPhotoErr'), 'triangle-alert'); }
    renderReact();
  },
  photoDel() { C.photo = null; renderReact(); },
  submit, track, copy,
  pick(id) { const m = myComplaints().find((x) => x.id === id); if (!m) return; C.tid = m.id; C.tkey = fmtKey(m.key); C.fill++; track(); },
  goTrack() { if (!C.sent) return; C.tid = C.sent.id; C.tkey = fmtKey(C.sent.key); C.fill++; C.sent = null; C.dir = 1; C.tab = 'track'; renderReact(); track(); },
};

/** Цонх нээх: tab 'new' (анхдагч) | 'track'; id өгвөл (Миний булан) хадгалсан түлхүүрээр шууд шалгана */
export function openComplaint(tab, id) {
  closeMenu();
  Object.assign(C, { tab: tab === 'track' ? 'track' : 'new', dir: 0, err: '', errField: '', busy: false, sent: null, terr: '', tbusy: false, tres: null });
  const m = id ? myComplaints().find((x) => x.id === id) : null;
  if (m) { C.tid = m.id; C.tkey = fmtKey(m.key); C.fill++; }
  openModal({ size: 'md', label: t('cTitle'), view: 'Complaint', props: { data, on } });
  if (m && C.tab === 'track') track();
}
