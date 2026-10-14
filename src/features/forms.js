/* ================= Маягт илгээх туслах ================= */
/* Зургийг 1600px хүртэл жижигрүүлж JPEG data URL болгоно (сервер рүү илгээхэд). */
function shrinkPhoto(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.82)); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}
function submitErr(e) {
  const c = e && e.code;
  if (c === 'too_many_requests') return L(['Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.', 'Too many submissions. Please wait and try again.']);
  if (c === 'bad_email') return t('badEmail');
  if (c === 'too_large') return L(['Зураг хэт том байна', 'The photo is too large']);
  return L(['Илгээж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.', "Couldn't send. Check your connection and try again."]);
}

/* ================= Hazard report ================= */
function openReport(preset) {
  closeMenu();
  const R = { step: 1, cat: preset || null, pt: null, dist: null, desc: '', photo: null, track: true, done: null };
  let map = null;
  const distTxt = () => (R.dist ? t('pickedIn', { d: L(R.dist.n) + ' ' + L(['дүүрэг', 'District']) }) : '');
  const render = () => {
    if (R.done) return `<div class="px-6 sm:px-8 py-10 text-center"><span class="w-16 h-16 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop">${ic('check', 'w-8 h-8', 2.6)}</span><h2 class="mt-5 text-[24px] font-extrabold">${t('rDone')}</h2><p class="mt-2 text-muted max-w-[42ch] mx-auto">${esc(t('rDoneD', { id: R.done }))}</p>
      <ol class="mt-7 grid grid-cols-4 gap-1.5 text-left max-w-md mx-auto">${['s0', 's1', 's2', 's3'].map((k, i) => `<li><span class="block h-1.5 rounded-full ${i === 0 ? 'bg-ubgreen' : 'bg-line'}"></span><span class="block mt-2 text-[12px] leading-tight ${i === 0 ? 'font-bold' : 'text-muted'}">${t(k)}</span></li>`).join('')}</ol>
      <div class="mt-8 flex flex-col sm:flex-row gap-2 justify-center"><button type="button" class="btn btn-ink" data-act="r-track">${ic('list-checks', 'w-[18px] h-[18px]')}${t('trackIt')}</button><button type="button" class="btn btn-ghost" data-act="modal-close">${t('close')}</button></div></div>`;
    let body = '';
    if (R.step === 1) body = `<h3 class="text-[18px] font-extrabold">${t('rS1')}</h3><div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">${['pothole', 'light', 'waste', 'water', 'building', 'other'].map((k) => `<button type="button" class="rounded-2xl border-2 p-4 text-left transition-colors ${R.cat === k ? 'border-ubred bg-ubred/5' : 'border-line hover:border-ink/25'}" data-act="r-cat" data-v="${k}" aria-pressed="${R.cat === k}"><span class="w-10 h-10 rounded-xl grid place-items-center transition-colors ${R.cat === k ? 'bg-ubred text-white' : 'bg-soft text-ubred'}">${ic(RCAT[k].i, 'w-5 h-5')}</span><span class="block mt-3 text-[14px] font-bold leading-snug">${esc(L(RCAT[k].t))}</span></button>`).join('')}</div>`;
    else if (R.step === 2) body = `<h3 class="text-[18px] font-extrabold">${t('rS2')}</h3><p class="mt-1 text-[13.5px] text-muted">${t('tapMap')}</p><div id="r-map" class="mt-4 h-[300px] sm:h-[340px] rounded-2xl overflow-hidden border border-line"></div><div class="mt-3 flex flex-wrap items-center justify-between gap-3"><button type="button" class="btn btn-sm btn-ghost" data-act="r-locate">${ic('locate', 'w-4 h-4')}${t('locate')}</button><span class="text-[13.5px] font-semibold" id="r-picked">${esc(distTxt())}</span></div>`;
    else body = `<h3 class="text-[18px] font-extrabold">${t('rS3')}</h3><label class="block mt-4 text-[13.5px] font-semibold mb-2" for="r-desc">${t('desc')}</label><textarea id="r-desc" rows="4" class="field" placeholder="${esc(t('descPh'))}">${esc(R.desc)}</textarea>
      <label class="mt-4 flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-line hover:border-ink/25 cursor-pointer transition-colors"><input type="file" accept="image/*" class="sr-only" id="r-photo"/>${R.photo ? `<img src="${R.photo}" alt="" class="w-16 h-16 rounded-xl object-cover"/>` : `<span class="w-16 h-16 rounded-xl bg-soft grid place-items-center text-muted">${ic('camera', 'w-6 h-6')}</span>`}<span><b class="block text-[14.5px]">${t('photo')}</b><span class="text-[13px] text-muted">${t('photoOpt')}</span></span></label>
      ${S.user ? `<label class="mt-4 flex items-center gap-3 text-[14px] font-semibold"><input type="checkbox" id="r-track" class="w-5 h-5 accent-[#D81E34]" ${R.track ? 'checked' : ''}/>${t('track')}</label>` : ''}`;
    const can = !((R.step === 1 && !R.cat) || (R.step === 2 && !R.pt));
    return `${modalHead(t('rTitle'), '', 'siren', 'bg-ubred text-white')}<div class="px-5 sm:px-7 pt-5 pb-6"><p class="rounded-xl bg-ubred/10 text-ubred text-[13.5px] font-semibold p-3 flex gap-2.5 items-start">${ic('phone-call', 'w-[18px] h-[18px] mt-px')}${t('rEmergency')}</p>
      <div class="mt-5 grid grid-cols-3 gap-1.5">${[1, 2, 3].map((i) => `<span class="h-1.5 rounded-full transition-colors ${i <= R.step ? 'bg-ubred' : 'bg-line'}"></span>`).join('')}</div><p class="mt-2 text-[12.5px] font-semibold text-muted">${t('rStep', { n: R.step })}</p>
      <div class="mt-5">${body}</div>
      <div class="mt-7 flex gap-2">${R.step > 1 ? `<button type="button" class="btn btn-ghost" data-act="r-back">${ic('arrow-left', 'w-[18px] h-[18px]')}${t('back')}</button>` : ''}<button type="button" class="btn btn-red flex-1" data-act="r-next" ${can ? '' : 'disabled'}>${R.step === 3 ? ic('send', 'w-[18px] h-[18px]') + t('submit') : t('continue') + ic('arrow-right', 'w-[18px] h-[18px]')}</button></div></div>`;
  };
  const setPt = (x, y) => {
    R.pt = [x, y]; R.dist = inDistrict(x, y);
    if (map) map.recluster(true);
    const el = $('#r-picked'); if (el) el.textContent = distTxt();
    const nb = $('[data-act="r-next"]'); if (nb) nb.disabled = false;
  };
  const after = (sh) => {
    if (map) { map.destroy(); map = null; }
    if (R.step === 2 && !R.done) {
      map = new MapView($('#r-map', sh), { cluster: false, points: () => (R.pt ? [{ id: 'pick', x: R.pt[0], y: R.pt[1], c: '#D81E34', i: RCAT[R.cat || 'other'].i }] : []), onPick: setPt });
      if (R.pt) setTimeout(() => map && map.centerOn(R.pt[0], R.pt[1], 1.8), 80);
    }
    if (R.step === 3) {
      const ta = $('#r-desc', sh); if (ta) ta.addEventListener('input', () => { R.desc = ta.value; });
      const ph = $('#r-photo', sh); if (ph) ph.addEventListener('change', () => { const f = ph.files && ph.files[0]; if (f) { R.file = f; try { R.photo = URL.createObjectURL(f); } catch (e) { R.photo = null; } paintModal(true); } });
      const tr = $('#r-track', sh); if (tr) tr.addEventListener('change', () => { R.track = tr.checked; });
    }
  };
  openModal({ size: 'lg', label: t('rTitle'), render, after, onClose: () => { if (map) map.destroy(); } });
  MS = {
    rCat: (v) => { R.cat = v; paintModal(true); },
    rNext: async () => {
      if (R.step < 3) { R.step++; paintModal(); return; }
      if (R.busy) return;
      if (CMS.mode === 'api') {
        const btn = $('[data-act="r-next"]'); R.busy = true; if (btn) btn.disabled = true;
        try {
          const photo = R.file ? await shrinkPhoto(R.file).catch(() => null) : null;
          R.done = (await apiCall('/submit/report', { method: 'POST', body: { cat: R.cat, pt: R.pt, dist: R.dist ? L(R.dist.n) : '', desc: R.desc, photo } })).id;
        } catch (e) { R.busy = false; if (btn) btn.disabled = false; toast(submitErr(e), 'triangle-alert'); return; }
      } else R.done = newReqId();
      if (S.user && R.track && R.dist) { S.requests.unshift({ id: R.done, cat: R.cat, st: 0, ago: 0, place: [R.dist.n[0] + ' дүүрэг', R.dist.n[1] + ' District'], ag: RAGENCY[R.cat] || RAGENCY.other, note: NOTE_NEW }); store.set('requests', S.requests); }
      paintModal(); toast(t('rDone'), 'circle-check');
    },
    rBack: () => { R.step--; paintModal(); },
    rLocate: () => { setPt(ME.x + Math.random() * 30 - 15, ME.y + Math.random() * 20 - 10); if (map) map.centerOn(R.pt[0], R.pt[1], 1.8); },
    rTrack: () => { closeModal(); S.myTab = 'req'; setRoute('my'); },
  };
}

/* ================= Have your say ================= */
const VOTE_URL = 'https://vote.ulaanbaatar.mn/home';
function openVote(tab, opts = {}) {
  closeMenu();
  if ((tab || 'poll') === 'poll') { window.open(VOTE_URL, '_blank', 'noopener'); return; }
  let cur = tab || 'poll', pick = null, topic = opts.topic || (opts.gov ? 'other' : 'plan'), sent = false, text = '';
  const body = () => {
    if (cur === 'poll') {
      const v = S.vote, counts = POLL.map((p, i) => p[2] + (v === i ? 1 : 0)), tot = counts.reduce((a, b) => a + b, 0);
      return `<p class="text-[17px] font-extrabold leading-snug">${t('pollQ')}</p><p class="mt-1 text-[13px] text-muted">${t('pollUntil', { d: fDate(addDays(today(), 23)) })}</p>
        <div class="mt-5 space-y-2.5">${POLL.map((p, i) => {
          const pct = Math.round((counts[i] / tot) * 100), lbl = esc(EN() ? p[1] : p[0]);
          return v != null
            ? `<div class="relative rounded-xl border ${v === i ? 'border-ubblue' : 'border-line'} overflow-hidden"><div class="hbar absolute inset-y-0 left-0 ${v === i ? 'bg-ubblue/15' : 'bg-soft'}" style="width:${pct}%"></div><div class="relative flex items-center justify-between gap-3 px-4 h-12"><span class="font-semibold text-[14.5px] flex items-center gap-2">${v === i ? ic('circle-check', 'w-[18px] h-[18px] text-ubblue') : ''}${lbl}</span><b class="tnum text-[14px]">${pct}%</b></div></div>`
            : `<button type="button" class="w-full flex items-center gap-3 px-4 h-12 rounded-xl border-2 text-left transition-colors ${pick === i ? 'border-ubblue bg-ubblue/5' : 'border-line hover:border-ink/25'}" data-act="v-pick" data-i="${i}" aria-pressed="${pick === i}"><span class="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${pick === i ? 'border-ubblue' : 'border-line'}">${pick === i ? '<i class="w-2.5 h-2.5 rounded-full bg-ubblue"></i>' : ''}</span><span class="font-semibold text-[14.5px]">${lbl}</span></button>`;
        }).join('')}</div>
        ${v != null ? `<p class="mt-4 text-[13.5px] text-muted flex items-center gap-2">${ic('users-round', 'w-4 h-4')}${t('totalVotes', { n: num(tot) })}</p>` : `<button type="button" class="btn btn-blue w-full mt-5" data-act="v-cast" ${pick == null ? 'disabled' : ''}>${ic('vote', 'w-[18px] h-[18px]')}${t('voteBtn')}</button>`}`;
    }
    if (sent) return `<div class="py-6 text-center"><span class="w-14 h-14 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop">${ic('check', 'w-7 h-7', 2.6)}</span><p class="mt-4 font-extrabold text-[18px] max-w-[30ch] mx-auto">${t('ideaSent')}</p></div>`;
    return `${opts.gov ? `<p class="rounded-xl bg-soft p-3 mb-4 text-[13.5px] font-semibold flex items-center gap-2">${ic('mail', 'w-4 h-4')}${t('toGov')}</p>` : ''}<p class="text-[13.5px] font-semibold">${t('topic')}</p><div class="mt-2 flex flex-wrap gap-2">${TOPICS.map(([k, mn, en]) => `<button type="button" class="chip" data-act="v-topic" data-v="${k}" aria-pressed="${topic === k}">${esc(EN() ? en : mn)}</button>`).join('')}</div><textarea id="v-text" rows="5" class="field mt-4" placeholder="${esc(t('ideaPh'))}">${esc(text)}</textarea><p class="mt-1 text-[13px] text-ubred min-h-[18px]" id="v-err" role="alert"></p><button type="button" class="btn btn-blue w-full mt-1" data-act="v-send">${ic('send', 'w-[18px] h-[18px]')}${t('ideaSend')}</button>`;
  };
  const bindText = (root) => { const ta = $('#v-text', root); if (ta) ta.addEventListener('input', () => { text = ta.value; const e = $('#v-err'); if (e) e.textContent = ''; }); };
  const drawn = (el) => requestAnimationFrame(() => requestAnimationFrame(() => el && el.classList.add('drawn')));
  openModal({ size: 'md', label: t('vTitle'), render: () => `${modalHead(t('vTitle'), '', 'vote', 'bg-ubbluebg text-white')}<div class="px-5 sm:px-7 py-6">${tabs('vote', [['poll', t('vPoll'), 'chart-bar-big'], ['idea', t('vIdea'), 'message-square-plus']], cur, { cls: 'w-full [&>button]:flex-1 [&>button]:justify-center' })}<div id="v-body" class="mt-6">${body()}</div></div>`,
    after: (sh) => { bindText(sh); drawn($('#v-body', sh)); } });
  MS = {
    vTab: (v) => { if (v === cur) return; if (v === 'poll') { window.open(VOTE_URL, '_blank', 'noopener'); return; } const dir = v === 'idea' ? 1 : -1; cur = v; selectTab('vote', v); swap($('#v-body'), body(), dir, (el) => { bindText(el); el.classList.add('drawn'); }); },
    vPick: (i) => { pick = i; $('#v-body').innerHTML = body(); },
    vCast: () => { if (pick == null) return; S.vote = pick; store.set('vote', pick); const b = $('#v-body'); b.classList.remove('drawn'); b.innerHTML = body(); drawn(b); toast(t('voted'), 'vote'); },
    vTopic: (k) => { topic = k; $$('[data-act="v-topic"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === k))); },
    vSend: async () => {
      if (!text.trim()) { const e = $('#v-err'); if (e) e.textContent = t('needText'); const ta = $('#v-text'); if (ta) ta.focus(); return; }
      if (CMS.mode === 'api') {
        const btn = $('[data-act="v-send"]'); if (btn) { if (btn.disabled) return; btn.disabled = true; }
        try { await apiCall('/submit/idea', { method: 'POST', body: { topic, text, gov: !!opts.gov } }); }
        catch (e) { if (btn) btn.disabled = false; toast(submitErr(e), 'triangle-alert'); return; }
      }
      sent = true; $('#v-body').innerHTML = body(); toast(t('ideaSent'), 'send'); },
  };
}

