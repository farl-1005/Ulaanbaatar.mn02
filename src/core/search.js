/* ================= Search (command palette) ================= */
let SQ = { q: '', idx: 0, items: [], scope: 'all' };
const SQ_SCOPES = [['all', ['Бүгд', 'All'], 'search'], ['svc', ['Үйлчилгээ', 'Services'], 'layout-grid'], ['sit', ['Амьдралын нөхцөл', 'Life events'], 'route'], ['news', ['Мэдээ', 'News'], 'newspaper'], ['proj', ['Төсөл', 'Projects'], 'hard-hat'], ['ev', ['Арга хэмжээ', 'Events'], 'calendar-days']];
const SQ_TYPE = { act: ['bg-ubred/10 text-ubred', ['Шуурхай үйлдэл', 'Quick actions']], svc: ['bg-ubblue/10 text-ubblue', ['Үйлчилгээ', 'Services']], sit: ['bg-ubred/10 text-ubred', ['Амьдралын нөхцөл', 'Life events']], news: ['bg-ubamber/15 text-amberink', ['Мэдээ', 'News']], proj: ['bg-ubgreen/15 text-greenink', ['Төсөл', 'Projects']], ev: ['bg-soft text-ink', ['Арга хэмжээ', 'Events']] };
const SQ_ACTS = [['report', ['Эрсдэл мэдээлэх', 'Report a hazard'], 'siren', 'эрсдэл мэдээлэх нүх эвдрэл гэрэлтүүлэг хог гоожсон аюул report hazard pothole'], ['vote', ['Санал өгөх', 'Have your say'], 'vote', 'санал асуулга хүсэлт vote poll suggestion'], ['my', ['Миний булан', 'My page'], 'circle-user-round', 'миний булан хүсэлт төлбөр хороо my page requests payments'], ['chat', ['AI туслахаас асуух', 'Ask the AI assistant'], 'sparkles', 'ai туслах асуух чат chat assistant help'], ['data', ['Агаарын чанар, түгжрэл', 'Air quality and traffic'], 'activity', 'агаар aqi утаа түгжрэл цаг агаар air traffic weather']];
const SQ_POP = [['Хүүхдийн мөнгө', 'Child benefit'], ['Халуун ус', 'Hot water'], ['Тендер', 'Tender'], ['Цэцэрлэг', 'Kindergarten'], ['Дүүжин зам', 'Cable car']];
function searchIndex() {
  const out = [];
  SQ_ACTS.forEach(([id, tt, i, kw]) => out.push({ type: 'act', id, t: tt, m: kw, sub: L(['Шуурхай үйлдэл', 'Quick action']), i }));
  ALL_SVC.forEach((s) => out.push({ type: 'svc', id: s.id, t: s.t, m: s.d[0] + ' ' + s.d[1], sub: L(s.d), i: s.i }));
  SITS.forEach((s) => out.push({ type: 'sit', id: s.id, t: s.t, m: s.steps.map((x) => x.t[0] + ' ' + x.t[1]).join(' '), sub: t('stepsN', { n: s.steps.length }), i: s.i }));
  NEWS.forEach((n) => out.push({ type: 'news', id: n.id, t: n.t, m: fill(n.l[0]) + ' ' + (n.l[1] || ''), sub: `${L((RUB[n.cat] || RUB.city).t)}${n.ts ? ', ' + fDate(n.ts) : ''}`, i: n.zar ? 'megaphone' : 'newspaper' }));
  PROJECTS.forEach((p) => out.push({ type: 'proj', id: p.id, t: p.n, m: PCAT[p.c].t[0] + ' ' + PCAT[p.c].t[1], sub: `${L(PCAT[p.c].t)}${p.p != null ? ', ' + p.p + '%' : ''}`, i: PCAT[p.c].i }));
  EVENTS.forEach((e) => out.push({ type: 'ev', id: e.id, t: e.t, m: e.v[0] + ' ' + e.v[1], sub: `${fDate(evDate(e.w), true)}, ${L(e.v)}`, i: 'calendar-days' }));
  return out;
}
function searchResults(q) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
  const order = ['act', 'svc', 'sit', 'news', 'proj', 'ev'];
  return searchIndex().map((x) => {
    const title = (x.t[0] + ' ' + x.t[1]).toLowerCase(), hay = title + ' ' + String(x.m).toLowerCase();
    if (!words.every((w) => hay.includes(w))) return null;
    const lt = L(x.t).toLowerCase(); x.score = (lt.startsWith(words[0]) ? 3 : 0) + (words.every((w) => title.includes(w)) ? 2 : 0); return x;
  }).filter(Boolean).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || b.score - a.score);
}
function sqHl(text, q) {
  const s = String(text), low = s.toLowerCase(), marks = [];
  q.trim().toLowerCase().split(/\s+/).filter(Boolean).forEach((w) => { let i = low.indexOf(w); while (i >= 0) { marks.push([i, i + w.length]); i = low.indexOf(w, i + w.length); } });
  if (!marks.length) return esc(s);
  marks.sort((a, b) => a[0] - b[0]); const mm = [];
  marks.forEach((m) => { const last = mm[mm.length - 1]; if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else mm.push(m.slice()); });
  let out = '', pos = 0; mm.forEach(([a, b]) => { out += esc(s.slice(pos, a)) + `<mark class="sq-mark">${esc(s.slice(a, b))}</mark>`; pos = b; });
  return out + esc(s.slice(pos));
}
const sqRecent = () => store.get('recentQ', []);
function sqAddRecent(q) { q = String(q || '').trim(); if (q.length < 2) return; store.set('recentQ', [q].concat(sqRecent().filter((x) => x !== q)).slice(0, 5)); }
function sqScopes() {
  const all = SQ.q.trim() ? searchResults(SQ.q) : [], cnt = {}; all.forEach((x) => { cnt[x.type] = (cnt[x.type] || 0) + 1; });
  return SQ_SCOPES.map(([v, l, i]) => { const n = v === 'all' ? all.length : cnt[v] || 0; return `<button type="button" class="chip !h-8 !px-3 !text-[13px] shrink-0" data-act="sq-scope" data-v="${v}" aria-pressed="${SQ.scope === v}">${ic(i, 'w-4 h-4')}${esc(L(l))}${SQ.q.trim() ? `<span class="tnum opacity-60">${n}</span>` : ''}</button>`; }).join('');
}
const sqHead = (txt) => `<p class="px-2 pt-3 pb-2 text-[12.5px] font-bold text-muted">${txt}</p>`;
function searchBody() {
  const q = SQ.q.trim();
  if (!q) {
    SQ.items = [];
    const rec = sqRecent(), top = ['c2', 'c3', 'c4', 'c8'].map((id) => ALL_SVC.find((s) => s.id === id)).filter(Boolean);
    return `${rec.length ? `${sqHead(L(['Сүүлийн хайлт', 'Recent']))}<div class="flex flex-wrap gap-2 px-2">${rec.map((r) => `<span class="chip !h-8 !pl-3 !pr-1 !text-[13px]"><button type="button" class="inline-flex items-center gap-1.5" data-act="sq" data-v="${esc(r)}">${ic('history', 'w-4 h-4 text-muted')}${esc(r)}</button><button type="button" class="w-6 h-6 grid place-items-center rounded-full hover:bg-soft text-muted" data-act="sq-recent-del" data-v="${esc(r)}" aria-label="${esc(L(['Устгах', 'Remove']))}">${ic('x', 'w-3.5 h-3.5')}</button></span>`).join('')}</div>` : ''}
      ${sqHead(L(['Түгээмэл үйлчилгээ', 'Popular services']))}<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">${top.map((s) => `<button type="button" class="flex items-center gap-3 p-3 rounded-xl border border-line text-left hover:bg-soft hover:border-ink/20 transition-colors" data-act="sgo" data-type="svc" data-id="${s.id}"><span class="w-9 h-9 rounded-lg bg-ubblue/10 text-ubblue grid place-items-center shrink-0">${ic(s.i, 'w-[18px] h-[18px]')}</span><span class="min-w-0"><b class="block text-[14px] truncate">${esc(L(s.t))}</b><span class="block text-[12.5px] text-muted truncate">${s.m === 'off' ? t('inperson') : s.m === 'sys' ? t('system') : t('online')}</span></span></button>`).join('')}</div>
      ${sqHead(L(['Түгээмэл хайлт', 'Popular searches']))}<div class="flex flex-wrap gap-2 px-2">${SQ_POP.map((p) => `<button type="button" class="chip !h-8 !text-[13px]" data-act="sq" data-v="${esc(L(p))}">${ic('trending-up', 'w-4 h-4 text-muted')}${esc(L(p))}</button>`).join('')}</div>
      ${sqHead(L(['Шуурхай үйлдэл', 'Quick actions']))}<div class="grid grid-cols-2 gap-2 px-2 pb-2">${SQ_ACTS.slice(0, 4).map(([v, l, i], k) => `<button type="button" class="flex items-center gap-2.5 min-h-[44px] py-2 px-3 rounded-xl text-[13.5px] font-semibold text-left transition-colors ${k === 0 ? 'bg-ubred/10 text-ubred hover:bg-ubred/15' : k === 1 ? 'bg-ubblue/10 text-ubblue hover:bg-ubblue/15' : 'bg-soft hover:bg-line'}" data-act="sgo" data-type="act" data-id="${v}">${ic(i, 'w-[18px] h-[18px]')}<span class="leading-tight">${esc(L(l))}</span></button>`).join('')}</div>`;
  }
  const all = searchResults(q), list = (SQ.scope === 'all' ? all : all.filter((x) => x.type === SQ.scope)).slice(0, 24);
  SQ.items = list; if (SQ.idx >= list.length) SQ.idx = 0;
  if (!list.length) {
    return `<div class="py-10 px-4 text-center sq-in"><span class="w-14 h-14 mx-auto rounded-2xl bg-soft grid place-items-center text-muted">${ic('search-x', 'w-7 h-7')}</span><p class="mt-4 font-bold text-[16px]">${L([`«${esc(q)}» гэсэн хайлтаар илэрц олдсонгүй`, `No results for "${esc(q)}"`])}</p><p class="mt-1 text-[14px] text-muted">${all.length && SQ.scope !== 'all' ? L(['Бусад ангилалд илэрц байна, «Бүгд»-ийг сонгоно уу.', 'There are matches in other categories; choose "All".']) : L(['Өөр үгээр хайх эсвэл AI туслахаас асууж болно.', 'Try other words, or ask the AI assistant.'])}</p><button type="button" class="btn btn-ink mt-5" data-act="sq-ai">${ic('sparkles', 'w-[18px] h-[18px]')}${L(['AI туслахаас асуух', 'Ask the AI assistant'])}</button></div>`;
  }
  let g = '', html = '';
  list.forEach((x, k) => {
    if (x.type !== g) { g = x.type; html += sqHead(`${esc(L(SQ_TYPE[g][1]))} <span class="tnum font-semibold">${all.filter((y) => y.type === g).length}</span>`); }
    html += `<button type="button" class="sq-row sq-in" style="animation-delay:${Math.min(k * 14, 160)}ms" data-act="sgo" data-type="${x.type}" data-id="${esc(x.id)}" data-k="${k}" aria-selected="${k === SQ.idx}"><span class="w-10 h-10 rounded-xl grid place-items-center shrink-0 ${SQ_TYPE[x.type][0]}">${ic(x.i, 'w-5 h-5')}</span><span class="min-w-0 flex-1"><b class="block text-[15px] leading-snug truncate">${sqHl(L(x.t), q)}</b><span class="block text-[13px] text-muted truncate">${sqHl(x.sub, q)}</span></span><span class="sq-enter hidden sm:inline-flex items-center gap-1 text-[12px] text-muted">${L(['Нээх', 'Open'])}<span class="sq-kbd">↵</span></span></button>`;
  });
  return html;
}
function sqRender() { const sc = $('#sscope'), rs = $('#sres'), cl = $('#sq-clear'); if (sc) sc.innerHTML = sqScopes(); if (rs) { rs.innerHTML = searchBody(); rs.scrollTop = 0; } if (cl) cl.classList.toggle('hidden', !SQ.q); }
function sqMark() { $$('#sres [data-k]').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.k === SQ.idx))); const cur = $(`#sres [data-k="${SQ.idx}"]`); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
function sqMove(d) { const n = SQ.items.length; if (!n) return; SQ.idx = (SQ.idx + d + n) % n; sqMark(); }
function openSearch(q = '') {
  closeMenu();
  SQ = { q, idx: 0, items: [], scope: 'all' };
  openModal({ size: 'search', top: true, label: t('search'), render: () => `<div class="sticky top-0 z-10 bg-card">
      <div class="flex items-center gap-3 px-4 sm:px-5 h-16 border-b border-line">${ic('search', 'w-[22px] h-[22px] text-ubblue')}<input data-autofocus id="sq" type="search" value="${esc(SQ.q)}" placeholder="${esc(t('searchPh'))}" class="sq-input flex-1 min-w-0 h-full bg-transparent text-[17px] sm:text-[18px] font-semibold placeholder:text-muted/70 placeholder:font-medium" autocomplete="off" spellcheck="false" aria-label="${esc(t('search'))}"/>
        <button type="button" id="sq-clear" class="${SQ.q ? '' : 'hidden'} w-8 h-8 grid place-items-center rounded-full bg-soft hover:bg-line text-muted" data-act="sq-clear" aria-label="${esc(L(['Арилгах', 'Clear']))}">${ic('x', 'w-4 h-4')}</button>
        <button type="button" class="sm:hidden text-[15px] font-semibold text-ubblue px-1" data-act="modal-close">${L(['Болих', 'Cancel'])}</button><span class="hidden sm:inline-flex"><button type="button" class="sq-kbd !h-7 !px-2" data-act="modal-close" aria-label="${esc(t('close'))}">Esc</button></span></div>
      <div id="sscope" class="flex gap-1.5 overflow-x-auto no-scrollbar px-4 sm:px-5 py-2.5 border-b border-line">${sqScopes()}</div></div>
    <div id="sres" class="p-2 sm:p-3 sm:max-h-[min(520px,58vh)] overflow-auto thin-scroll">${searchBody()}</div>
    <div class="hidden sm:flex items-center gap-5 px-5 py-2.5 border-t border-line text-[12px] text-muted"><span class="inline-flex items-center gap-1.5"><span class="sq-kbd">↑</span><span class="sq-kbd">↓</span>${L(['сонгох', 'move'])}</span><span class="inline-flex items-center gap-1.5"><span class="sq-kbd">↵</span>${L(['нээх', 'open'])}</span><span class="inline-flex items-center gap-1.5"><span class="sq-kbd">Esc</span>${L(['хаах', 'close'])}</span><span class="ml-auto inline-flex items-center gap-1.5">${L(['Хаанаас ч', 'Anywhere'])}<span class="sq-kbd">Ctrl</span><span class="sq-kbd">K</span></span></div>`,
    after: (sh) => {
      const inp = $('#sq', sh);
      inp.addEventListener('input', () => { SQ.q = inp.value; SQ.idx = 0; sqRender(); });
      $('#sres', sh).addEventListener('mousemove', (e) => { const r = e.target.closest('[data-k]'); if (r && +r.dataset.k !== SQ.idx) { SQ.idx = +r.dataset.k; $$('#sres [data-k]').forEach((b) => b.setAttribute('aria-selected', String(b === r))); } });
      setTimeout(() => { try { inp.focus(); } catch (e) { /* ignore */ } }, 60);
    } });
}
function sqAct(v) {
  if (v === 'report') openReport(); else if (v === 'vote') openVote(); else if (v === 'my') setRoute('my');
  else if (v === 'chat') toggleChat(true); else go({ sec: 'data', hl: 'aqi' });
}
function searchGo(type, id) {
  sqAddRecent(SQ.q);
  closeModal(true);
  if (type === 'act') sqAct(id);
  else if (type === 'svc') { const s = ALL_SVC.find((x) => x.id === id); if (!s) return; go({ sec: 'hub', hub: 'services', svc: s.g }); setTimeout(() => openService(id), 450); }
  else if (type === 'sit') go({ sec: 'situations', sit: id });
  else if (type === 'news') openNews(id);
  else if (type === 'proj') go({ sec: 'projects', pid: id });
  else if (type === 'ev') go({ sec: 'events', ev: id });
}

