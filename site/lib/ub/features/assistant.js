import { wxInfo } from '../core/header.js';
import { $, esc, reduced } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { go } from '../core/pages.js';
import { setRoute } from '../core/router.js';
import { openSearch } from '../core/search.js';
import { EN, L, S, t } from '../core/state.js';
import { POL, aqiCat, clock, evDate, fill, pm25, today } from '../core/time.js';
import { ALERTS } from '../data/alerts.js';
import { CHAT_CHIPS, FAQ, FAQ_DEFAULT } from '../data/chat.js';
import { EVENTS } from '../data/events.js';
import { NEWS } from '../data/news.js';
import { PROJECTS } from '../data/projects.js';
import { SERVICES, SITS } from '../data/services.js';
import { openLogin } from './dan-login.js';
import { openReport, openVote } from './forms.js';
import { openAlert } from './season.js';
import { evSort } from '../sections/events.js';
/* ================= AI assistant ================= */
export const Chat = { fn: undefined, ready: null, ctl: null, busy: false, seen: false, tip: false, v: 0 };
export const ACTS = {
  report: ['siren', () => t('cta_report'), () => openReport()], vote: ['vote', () => t('cta_vote'), () => openVote()],
  services: ['layout-grid', () => t('tab_services'), () => go({ sec: 'hub', hub: 'services' })], data: ['activity', () => t('nav_data'), () => go({ sec: 'data', hl: 'aqi' })],
  events: ['calendar-days', () => t('evTitle'), () => go({ sec: 'events' })], transparency: ['scroll-text', () => t('nav_open'), () => go({ sec: 'transparency' })],
  login: ['fingerprint', () => t('login'), () => openLogin()], search: ['search', () => t('search'), () => openSearch()],
  alerts: ['siren', () => t('more'), () => openAlert('a1')], my: ['layout-dashboard', () => t('myCorner'), () => setRoute('my')],
};
export const actIcon = (a) => (a.indexOf('situation:') === 0 ? 'route' : (ACTS[a] || ACTS.search)[0]);
export function actLabel(a) { if (a.indexOf('situation:') === 0) { const s = SITS.find((x) => x.id === a.split(':')[1]); return s ? L(s.t) : t('s_sits'); } return (ACTS[a] || ACTS.search)[1](); }
export function runAct(a) { if (innerWidth < 1024) toggleChat(false); if (a.indexOf('situation:') === 0) { go({ sec: 'situations', sit: a.split(':')[1] }); return; } (ACTS[a] || ACTS.search)[2](); }
export function md(s) {
  const lines = esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let out = '', list = false;
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (m) { if (!list) { out += '<ul class="list-disc pl-5 space-y-1 my-1.5">'; list = true; } out += `<li>${m[1]}</li>`; }
    else { if (list) { out += '</ul>'; list = false; } if (ln.trim()) out += `<p class="${out ? 'mt-2' : ''}">${ln}</p>`; }
  }
  return list ? out + '</ul>' : out;
}
export const stripTags = (s) => (s || '').replace(/\[\[[^\]]*\]\]/g, '').replace(/\[\[[^\]]*$/, '').trim();
export function parseActs(m) {
  const acts = [];
  m.text = (m.text || '').replace(/\[\[\s*([a-z]+(?::[a-z]+)?)\s*\]\]/gi, (_, a) => { a = a.toLowerCase(); if ((ACTS[a] || a.indexOf('situation:') === 0) && acts.indexOf(a) < 0) acts.push(a); return ''; }).trim();
  m.acts = (m.acts || []).concat(acts.filter((a) => !(m.acts || []).includes(a)));
}
/* Чатын харагдацыг React зурна (site/app/chrome/Chat.tsx): HOME.chat() бэлэн текст өгнө.
   Хариу урсаж ирэх бүрт бүх сайтыг биш зөвхөн чатыг дахин зурахын тулд тусдаа 'ub:chat' үйл явдал (Chat.v) — React шууд (синхрон) зурна. */
export function chatPaint() { Chat.v++; window.dispatchEvent(new Event('ub:chat')); }
export function chatData() {
  return {
    open: !!S.chatOpen, seen: Chat.seen, tip: Chat.tip, busy: Chat.busy,
    title: t('chatTitle'), status: Chat.fn === null ? t('chatFallback') : t('chatOn'), restart: t('restartChat'), close: t('close'),
    greet: t('chatGreet'), chips: CHAT_CHIPS.map((c) => L(c)), ph: t('chatPh'), note: t('chatNote'), tipText: t('chatTip'), openLbl: t('chatOpen'),
    stop: t('stop'), send: t('send'), thinking: t('thinking'),
    msgs: S.chat.map((m) => (m.role === 'user' ? { role: 'user', text: m.text } : {
      role: 'assistant', html: m.text ? md(m.streaming ? stripTags(m.text) : m.text) : '', streaming: !!m.streaming, err: m.err || '',
      acts: (m.acts || []).map((a) => ({ v: a, i: actIcon(a), label: actLabel(a) })),
    })),
  };
}
HOME.chat = chatData;
HOME.chatV = () => Chat.v;
/** Бүтэн дахин зурж, хамгийн доод мессеж рүү гүйлгэнэ (wiring.js chat-reset ч дууддаг) */
export function paintChat() { chatPaint(); const box = $('#chat-msgs'); if (box) box.scrollTop = box.scrollHeight; }
/** Урсаж буй хариу: хэрэглэгч доод талд байвал л дагаж гүйлгэнэ */
export function paintLast() {
  const box = $('#chat-msgs'), near = !!box && box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  chatPaint(); if (box && near) box.scrollTop = box.scrollHeight;
}
export function burst(el) {
  if (reduced || !el) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const ring2 = document.createElement('i'); ring2.className = 'burst-ring'; ring2.style.left = cx + 'px'; ring2.style.top = cy + 'px'; document.body.appendChild(ring2); setTimeout(() => ring2.remove(), 700);
  const cols = ['#D81E34', '#145095', '#FFC524', '#10A36A'];
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, dd = 44 + Math.random() * 34, p = document.createElement('i'); p.className = 'burst'; p.style.left = cx + 'px'; p.style.top = cy + 'px'; p.style.setProperty('--bc', cols[k % 4]); p.style.setProperty('--dx', Math.cos(a) * dd + 'px'); p.style.setProperty('--dy', Math.sin(a) * dd + 'px'); document.body.appendChild(p); setTimeout(() => p.remove(), 820); }
}
export function toggleChat(open) {
  const want = open == null ? !S.chatOpen : open; if (want === S.chatOpen) return;
  S.chatOpen = want; if (want) { Chat.seen = true; Chat.tip = false; }
  chatPaint();
  const fab = $('#chat-fab'); if (!fab) return;
  if (want) { burst(fab); setTimeout(() => { const i = $('#chat-in'); if (i && innerWidth >= 1024) i.focus({ preventScroll: true }); const b = $('#chat-msgs'); if (b) b.scrollTop = b.scrollHeight; }, 380); }
  else fab.focus({ preventScroll: true });
}
/** «Асуух зүйл байна уу?» сануулга: эхлүүлснээс хойш 6.5 секундэд (features/init.js) 7 секунд харагдана */
export function showChatTip() {
  if (Chat.seen || S.chatOpen) return;
  Chat.tip = true; chatPaint(); setTimeout(() => { Chat.tip = false; chatPaint(); }, 7000);
}
export function initChatCapability() {
  if (window.claude && typeof window.claude.use === 'function') {
    Chat.ready = window.claude.use('sample').then((fn) => { Chat.fn = fn || null; }).catch(() => { Chat.fn = null; }).then(chatPaint);
  } else { Chat.fn = null; Chat.ready = Promise.resolve(); chatPaint(); }
}
export function rules() {
  const lang = EN() ? 'English' : 'Mongolian (Cyrillic script)';
  const alerts = ALERTS.map((a) => `- ${a.k[0]}: ${fill(a.t[0])}`).join('\n');
  const sits = SITS.map((s) => `- ${s.t[0]} (ID ${s.id}): ${s.steps.map((x, i) => `${i + 1}) ${x.t[0]} [${x.m === 'on' ? 'онлайн' : 'биеэр'}]`).join('; ')}`).join('\n');
  const svcs = SERVICES.citizen.concat(SERVICES.business).map((x) => `${x.t[0]} (${x.m === 'on' ? 'онлайн' : 'биеэр'})`).join(', ');
  const evs = EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).sort(evSort).slice(0, 8).map((e) => `- ${e.t[0]}: ${(e.d.getMonth() + 1)}-р сарын ${e.d.getDate()}, ${e.tm}, ${e.v[0]}, ${e.price ? e.price + '₮' : 'үнэгүй'}`).join('\n');
  const known = PROJECTS.filter((p) => p.p != null), avg = known.length ? Math.round(known.reduce((a, p) => a + p.p, 0) / known.length) : 0;
  return `You are "AI туслах", the assistant on ulaanbaatar.mn, the Ulaanbaatar city portal. This is a design concept, so all data below is illustrative.
Reply in ${lang} unless the user clearly writes in another language; then use theirs.
Keep answers short: 2-5 sentences, or up to 5 bullet lines starting with "- ". No headings, no tables, no emojis.
Use only the facts below. If something is not covered, say you don't have that information and suggest the 1200 citizen hotline (24/7). Never invent phone numbers, prices, laws, names or dates.
If anyone may be in danger, tell them to call 101 (fire), 102 (police) or 103 (ambulance) first.
When one page feature would help, end with exactly one action tag on its own line, chosen from: [[report]] [[vote]] [[services]] [[data]] [[events]] [[transparency]] [[login]] [[situation:ID]] (ID is one of birth, marriage, home, business, retire, move).

Facts (Ulaanbaatar time ${clock()}, ${today().getMonth() + 1}-р сарын ${today().getDate()}):
- Weather ${Math.round(S.wx.temp)}°C, ${wxInfo(S.wx.code, S.wx.day).t}, feels like ${Math.round(S.wx.feels)}°C, wind ${Math.round(S.wx.wind)} m/s, humidity ${Math.round(S.wx.hum)}%. Air quality AQI ${S.aqi} (${aqiCat(S.aqi).k.replace('aqi', '')})${S.air && S.air.live ? ', measured by IQAir' + (S.air.main ? ', main pollutant ' + (POL[S.air.main] || S.air.main) : '') : ', PM2.5 about ' + pm25() + ' µg/m³'}; yellow air alert from 20:00 tonight. Advice: children, older adults and people with breathing conditions should limit long outdoor activity.
- Traffic congestion index ${S.traffic}/10 (busy). Busiest: Peace Avenue 8.2, Chinggis Avenue 7.4, Ring Road 6.6.
- Active alerts:\n${alerts}
- Hazards (potholes, broken street lights, uncollected waste, leaks, unsafe structures or open manholes) can be reported with the site's "Эрсдэл мэдээлэх" form in about a minute: choose a type, tap the map, add a photo. Reports go to the responsible agency within 30 minutes and can be tracked in "Миний булан" after signing in with ДАН (the national single sign-in: e-Mongolia app QR, one-time code or internet bank).
- Life-event guides:\n${sits}
- Popular services: ${svcs}
- Upcoming events:\n${evs}
- 24 flagship construction projects, average progress ${avg}%. Tuul Expressway 64%, Selbe sub-centre 41%, Nisekh-Zaisan flyover 93%.
- Latest city news (summaries from ulaanbaatar.mn):
${NEWS.slice().sort((a, b) => a.ago - b.ago).slice(0, 9).map((n) => `- ${n.t[0]} (${n.d}): ${n.l[0]}`).join('\n')}
- Open poll: what the 2027 khoroo development fund should do first (street lighting, playgrounds, footpaths, green space, safety cameras).
- Ulaanbaatar 2040 master plan draft: four sub-centres, 120 km of cycle lanes, new transit network; comments accepted until ${fill('{t+39}')}.`;
}
export function fallbackReply(text) {
  const msg = { role: 'assistant', text: '', streaming: true, acts: [] };
  S.chat.push(msg); Chat.busy = true; paintChat();
  setTimeout(() => { const f = FAQ.find((x) => x.re.test(text)) || FAQ_DEFAULT; msg.text = fill(L(f.a)); msg.acts = f.acts.slice(); msg.streaming = false; Chat.busy = false; paintChat(); }, 600 + Math.random() * 500);
}
export async function aiReply() {
  const msg = { role: 'assistant', text: '', streaming: true, acts: [] };
  const history = S.chat.filter((m) => m.text && !m.err).slice(-10);
  S.chat.push(msg); Chat.busy = true; paintChat();
  const turns = [{ role: 'user', content: rules() }].concat(history.map((m) => ({ role: m.role, content: m.text })));
  const ctl = new AbortController(); Chat.ctl = ctl;
  try {
    const res = await Chat.fn(turns, { cache: false, modelTier: 'quick', signal: ctl.signal, onText: ({ text }) => { msg.text = text; paintLast(); } });
    msg.text = res.text;
  } catch (e) {
    const code = e && e.code;
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) {
      Chat.fn = null; S.chat.pop(); Chat.busy = false; Chat.ctl = null;
      const lastUser = S.chat.filter((m) => m.role === 'user').pop(); fallbackReply(lastUser ? lastUser.text : ''); return;
    }
    if (code === 'cancelled') msg.text = (e && e.text) || msg.text;
    else if (code === 'rate_limited') { msg.text = (e && e.text) || ''; msg.err = t('chatBusy'); }
    else if (code === 'refused') { msg.text = ''; msg.err = t('chatRefused'); }
    else { msg.text = (e && e.text) || ''; msg.err = t('chatErr'); }
  }
  msg.streaming = false; parseActs(msg); Chat.busy = false; Chat.ctl = null; paintChat();
}
export async function chatSend(raw) {
  const text = (raw || '').trim(); if (!text || Chat.busy) return;
  const inp = $('#chat-in'); if (inp) { inp.value = ''; inp.style.height = ''; }
  S.chat.push({ role: 'user', text }); paintChat();
  if (Chat.fn === undefined && Chat.ready) await Chat.ready;
  if (Chat.fn) aiReply(); else fallbackReply(text);
}
export function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(128, el.scrollHeight + 2) + 'px'; }

