/* ================= AI assistant ================= */
const Chat = { fn: undefined, ready: null, ctl: null, busy: false, seen: false };
const ACTS = {
  report: ['siren', () => t('cta_report'), () => openReport()], vote: ['vote', () => t('cta_vote'), () => openVote()],
  services: ['layout-grid', () => t('tab_services'), () => go({ sec: 'hub', hub: 'services' })], data: ['activity', () => t('nav_data'), () => go({ sec: 'data', hl: 'aqi' })],
  events: ['calendar-days', () => t('evTitle'), () => go({ sec: 'events' })], transparency: ['scroll-text', () => t('nav_open'), () => go({ sec: 'transparency' })],
  login: ['fingerprint', () => t('login'), () => openLogin()], search: ['search', () => t('search'), () => openSearch()],
  alerts: ['siren', () => t('more'), () => openAlert('a1')], my: ['layout-dashboard', () => t('myCorner'), () => setRoute('my')],
};
const actIcon = (a) => (a.indexOf('situation:') === 0 ? 'route' : (ACTS[a] || ACTS.search)[0]);
function actLabel(a) { if (a.indexOf('situation:') === 0) { const s = SITS.find((x) => x.id === a.split(':')[1]); return s ? L(s.t) : t('s_sits'); } return (ACTS[a] || ACTS.search)[1](); }
function runAct(a) { if (innerWidth < 1024) toggleChat(false); if (a.indexOf('situation:') === 0) { go({ sec: 'situations', sit: a.split(':')[1] }); return; } (ACTS[a] || ACTS.search)[2](); }
function md(s) {
  const lines = esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let out = '', list = false;
  for (const ln of lines) {
    const m = ln.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (m) { if (!list) { out += '<ul class="list-disc pl-5 space-y-1 my-1.5">'; list = true; } out += `<li>${m[1]}</li>`; }
    else { if (list) { out += '</ul>'; list = false; } if (ln.trim()) out += `<p class="${out ? 'mt-2' : ''}">${ln}</p>`; }
  }
  return list ? out + '</ul>' : out;
}
const stripTags = (s) => (s || '').replace(/\[\[[^\]]*\]\]/g, '').replace(/\[\[[^\]]*$/, '').trim();
function parseActs(m) {
  const acts = [];
  m.text = (m.text || '').replace(/\[\[\s*([a-z]+(?::[a-z]+)?)\s*\]\]/gi, (_, a) => { a = a.toLowerCase(); if ((ACTS[a] || a.indexOf('situation:') === 0) && acts.indexOf(a) < 0) acts.push(a); return ''; }).trim();
  m.acts = (m.acts || []).concat(acts.filter((a) => !(m.acts || []).includes(a)));
}
const botAvatar = () => `<span class="w-8 h-8 rounded-lg bg-navy text-white grid place-items-center shrink-0">${ic('sparkles', 'w-4 h-4')}</span>`;
function msgHTML(m, i) {
  if (m.role === 'user') return `<div class="flex justify-end"><div class="max-w-[85%] rounded-2xl rounded-tr-[4px] bg-ubbluebg text-white px-3.5 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">${esc(m.text)}</div></div>`;
  const body = m.text ? md(m.streaming ? stripTags(m.text) : m.text) : m.streaming ? `<span class="inline-flex items-center gap-2 text-muted text-[13.5px]"><span class="typing"><span></span><span></span><span></span></span>${t('thinking')}</span>` : '';
  return `<div class="flex gap-2.5" data-msg="${i}">${botAvatar()}<div class="max-w-[85%] min-w-0"><div class="rounded-2xl rounded-tl-[4px] bg-card border border-line px-3.5 py-2.5 text-[14.5px] leading-relaxed break-words ${body ? '' : 'hidden'}" data-body>${body}</div>${m.err ? `<p class="mt-1.5 text-[12.5px] text-ubred">${esc(m.err)}</p>` : ''}${m.acts && m.acts.length ? `<div class="mt-2 flex flex-wrap gap-1.5">${m.acts.map((a) => `<button type="button" class="chip !h-8 !text-[13px] !px-3 !text-ubblue" data-act="chat-do" data-v="${esc(a)}">${ic(actIcon(a), 'w-4 h-4')}${esc(actLabel(a))}</button>`).join('')}</div>` : ''}</div></div>`;
}
function chatMsgs() {
  const greet = `<div class="flex gap-2.5">${botAvatar()}<div class="max-w-[88%]"><div class="rounded-2xl rounded-tl-[4px] bg-card border border-line px-3.5 py-2.5 text-[14.5px] leading-relaxed">${esc(t('chatGreet'))}</div><div class="mt-2 flex flex-wrap gap-1.5">${CHAT_CHIPS.map((c) => `<button type="button" class="chip !h-8 !text-[13px] !px-3" data-act="chat-ask" data-v="${esc(L(c))}">${esc(L(c))}</button>`).join('')}</div></div></div>`;
  return greet + S.chat.map(msgHTML).join('');
}
function chatStatus() { return `<span class="inline-block w-1.5 h-1.5 rounded-full bg-[#34C78C] mr-1.5 align-middle"></span>${Chat.fn === null ? t('chatFallback') : t('chatOn')}`; }
function renderChat() {
  const keep = $('#chat-in') ? $('#chat-in').value : '';
  $('#chat').innerHTML = `<div class="${S.chatOpen ? 'chat-open' : ''}" id="chat-root">
    <div class="chat-panel card shadow-[0_30px_80px_-24px_rgb(0_0_0/.5)] flex flex-col overflow-hidden" role="dialog" aria-label="${esc(t('chatTitle'))}" aria-hidden="${!S.chatOpen}">
      <div class="bg-navy text-white px-4 py-3.5 flex items-center gap-3 shrink-0"><span class="w-10 h-10 rounded-xl bg-gradient-to-br from-ubblue to-ubred grid place-items-center">${ic('sparkles', 'w-5 h-5')}</span><div class="flex-1 min-w-0"><b class="block text-[15.5px]">${t('chatTitle')}</b><span class="block text-[12px] text-white/65 truncate" id="chat-status">${chatStatus()}</span></div><button type="button" class="icon-btn hover:bg-white/10" data-act="chat-reset" title="${esc(t('restartChat'))}" aria-label="${esc(t('restartChat'))}">${ic('rotate-ccw', 'w-[18px] h-[18px]')}</button><button type="button" class="icon-btn hover:bg-white/10" data-act="chat-toggle" aria-label="${esc(t('close'))}">${ic('x')}</button></div>
      <div id="chat-msgs" class="flex-1 overflow-y-auto thin-scroll px-4 py-4 space-y-3 bg-soft/60" aria-live="polite">${chatMsgs()}</div>
      <form class="p-3 border-t border-line bg-card shrink-0" data-form="chat"><div class="flex items-end gap-2"><textarea id="chat-in" rows="1" class="field !h-auto min-h-[46px] max-h-32 !py-3 !resize-none" placeholder="${esc(t('chatPh'))}" aria-label="${esc(t('chatPh'))}"></textarea><span id="chat-btn">${chatBtn()}</span></div><p class="mt-2 text-[11.5px] text-muted leading-snug">${t('chatNote')}</p></form></div>
    <div class="chat-fab"><div id="chat-tip" class="hidden absolute right-[72px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-card border border-line shadow-xl px-4 py-2.5 text-[14px] font-semibold tip-in">${t('chatTip')}</div>
      <button type="button" class="relative w-[60px] h-[60px] rounded-full bg-navy text-white grid place-items-center shadow-[0_16px_36px_-12px_rgb(11_29_69/.8)] ring-1 ring-white/10 hover:scale-105 transition-transform" data-act="chat-toggle" aria-label="${esc(t('chatOpen'))}" aria-expanded="${S.chatOpen}" id="chat-fab"><span data-fabicon>${S.chatOpen ? ic('x', 'w-6 h-6') : ic('sparkles', 'w-6 h-6')}</span><span class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-ubred ring-2 ring-white ${Chat.seen ? 'hidden' : ''}" data-fabdot></span></button></div></div>`;
  if (keep) $('#chat-in').value = keep;
}
function chatBtn() { return Chat.busy ? `<button type="button" class="btn btn-ink !h-[46px] !px-3.5" data-act="chat-stop" aria-label="${esc(t('stop'))}">${ic('square', 'w-4 h-4')}</button>` : `<button type="submit" class="btn btn-blue !h-[46px] !px-3.5" aria-label="${esc(t('send'))}">${ic('send-horizontal', 'w-5 h-5')}</button>`; }
function paintChat() { const box = $('#chat-msgs'); if (!box) return; box.innerHTML = chatMsgs(); $('#chat-btn').innerHTML = chatBtn(); box.scrollTop = box.scrollHeight; }
function paintLast(m) {
  const box = $('#chat-msgs'), el = box && box.querySelector(`[data-msg="${S.chat.indexOf(m)}"] [data-body]`); if (!el) return;
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  el.classList.remove('hidden'); el.innerHTML = md(stripTags(m.text)); if (near) box.scrollTop = box.scrollHeight;
}
function burst(el) {
  if (reduced || !el) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const ring2 = document.createElement('i'); ring2.className = 'burst-ring'; ring2.style.left = cx + 'px'; ring2.style.top = cy + 'px'; document.body.appendChild(ring2); setTimeout(() => ring2.remove(), 700);
  const cols = ['#D81E34', '#145095', '#FFC524', '#10A36A'];
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, dd = 44 + Math.random() * 34, p = document.createElement('i'); p.className = 'burst'; p.style.left = cx + 'px'; p.style.top = cy + 'px'; p.style.setProperty('--bc', cols[k % 4]); p.style.setProperty('--dx', Math.cos(a) * dd + 'px'); p.style.setProperty('--dy', Math.sin(a) * dd + 'px'); document.body.appendChild(p); setTimeout(() => p.remove(), 820); }
}
function toggleChat(open) {
  const want = open == null ? !S.chatOpen : open; if (want === S.chatOpen) return;
  S.chatOpen = want;
  const root = $('#chat-root'); root.classList.toggle('chat-open', want);
  $('.chat-panel', root).setAttribute('aria-hidden', String(!want));
  const fab = $('#chat-fab'); fab.setAttribute('aria-expanded', String(want)); $('[data-fabicon]', fab).innerHTML = want ? ic('x', 'w-6 h-6') : ic('sparkles', 'w-6 h-6');
  if (want) { Chat.seen = true; $('[data-fabdot]', fab).classList.add('hidden'); $('#chat-tip').classList.add('hidden'); burst(fab); setTimeout(() => { const i = $('#chat-in'); if (i && innerWidth >= 1024) i.focus({ preventScroll: true }); const b = $('#chat-msgs'); if (b) b.scrollTop = b.scrollHeight; }, 380); }
  else fab.focus({ preventScroll: true });
}
function initChatCapability() {
  if (window.claude && typeof window.claude.use === 'function') {
    Chat.ready = window.claude.use('sample').then((fn) => { Chat.fn = fn || null; }).catch(() => { Chat.fn = null; }).then(() => { const s = $('#chat-status'); if (s) s.innerHTML = chatStatus(); });
  } else { Chat.fn = null; Chat.ready = Promise.resolve(); const s = $('#chat-status'); if (s) s.innerHTML = chatStatus(); }
}
function rules() {
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
function fallbackReply(text) {
  const msg = { role: 'assistant', text: '', streaming: true, acts: [] };
  S.chat.push(msg); Chat.busy = true; paintChat();
  setTimeout(() => { const f = FAQ.find((x) => x.re.test(text)) || FAQ_DEFAULT; msg.text = fill(L(f.a)); msg.acts = f.acts.slice(); msg.streaming = false; Chat.busy = false; paintChat(); }, 600 + Math.random() * 500);
}
async function aiReply() {
  const msg = { role: 'assistant', text: '', streaming: true, acts: [] };
  const history = S.chat.filter((m) => m.text && !m.err).slice(-10);
  S.chat.push(msg); Chat.busy = true; paintChat();
  const turns = [{ role: 'user', content: rules() }].concat(history.map((m) => ({ role: m.role, content: m.text })));
  const ctl = new AbortController(); Chat.ctl = ctl;
  try {
    const res = await Chat.fn(turns, { cache: false, modelTier: 'quick', signal: ctl.signal, onText: ({ text }) => { msg.text = text; paintLast(msg); } });
    msg.text = res.text;
  } catch (e) {
    const code = e && e.code;
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) {
      Chat.fn = null; S.chat.pop(); Chat.busy = false; Chat.ctl = null; const s = $('#chat-status'); if (s) s.innerHTML = chatStatus();
      const lastUser = S.chat.filter((m) => m.role === 'user').pop(); fallbackReply(lastUser ? lastUser.text : ''); return;
    }
    if (code === 'cancelled') msg.text = (e && e.text) || msg.text;
    else if (code === 'rate_limited') { msg.text = (e && e.text) || ''; msg.err = t('chatBusy'); }
    else if (code === 'refused') { msg.text = ''; msg.err = t('chatRefused'); }
    else { msg.text = (e && e.text) || ''; msg.err = t('chatErr'); }
  }
  msg.streaming = false; parseActs(msg); Chat.busy = false; Chat.ctl = null; paintChat();
}
async function chatSend(raw) {
  const text = (raw || '').trim(); if (!text || Chat.busy) return;
  const inp = $('#chat-in'); if (inp) { inp.value = ''; inp.style.height = ''; }
  S.chat.push({ role: 'user', text }); paintChat();
  if (Chat.fn === undefined && Chat.ready) await Chat.ready;
  if (Chat.fn) aiReply(); else fallbackReply(text);
}
function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(128, el.scrollHeight + 2) + 'px'; }

