/* ================= Media player ================= */
/* ---- Бодит медиа (ulaanbaatar.mn): Live = Facebook/YouTube видео (дарахад л ачаална), Фото = цомог, Постер = том зураг + текст, Подкаст ---- */
/* Цомгийн эх зураг 2–5 МБ: сервертэй үед /api/img жижигрүүлж (WebP) өгнө, сервергүй бол эх хаяг */
const mediaImg = (u, w) => (PRETTY && /^https:\/\/ulaanbaatar\.mn\/files\//.test(u) ? `/api/img?w=${w}&u=${encodeURIComponent(u)}` : u);
function videoEmbed(u) {
  const y = String(u).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([\w-]{6,})/);
  if (y) return `https://www.youtube-nocookie.com/embed/${y[1]}?autoplay=1`;
  if (/facebook\.com|fb\.watch/.test(u)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true&width=1280`;
  return '';
}
/* ---- Медиа үзэгч (ulaanbaatar.mn): зүүн талд бараан «тайз», баруун талд мэдээлэл + «Бусад ...». Төрөл бүр өөрийн өнгөтэй ---- */
const MV_TYPE = {
  live: { c: '#E5253B', i: 'radio', k: 'm_live' }, photo: { c: '#145095', i: 'images', k: 'm_photo' },
  poster: { c: '#F2A516', i: 'image', k: 'm_poster' }, podcast: { c: '#8B5CFF', i: 'headphones', k: 'm_podcast' },
};
function mvDate(m) {
  const d = parseUB(m.date || ''); if (!d) return '';
  return EN() ? `${EN_MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${hhmm(d)}` : `${d.getFullYear()} оны ${fDate(d)} · ${hhmm(d)}`;
}
function openMediaLive(m0) {
  let m = m0, ph = 0, playing = false, zoom = false;
  const st = () => {
    const ty = MV_TYPE[m.type] || MV_TYPE.poster, photos = m.photos || [], cover = m.img || mediaFallback(m);
    return { ty, photos, cover, src: NEWS_SRC + m.nid, embed: m.video && videoEmbed(m.video), amb: m.type === 'photo' && photos.length ? mediaImg(photos[ph], 240) : (/^(assets|https)/.test(cover) ? cover : '') };
  };
  const stage = (x) => {
    const close = `<button type="button" class="mv-x lg:hidden" data-act="modal-close" aria-label="${esc(t('close'))}">${ic('x', 'w-5 h-5')}</button>`;
    const amb = x.amb ? `<img class="mv-amb" src="${esc(x.amb)}" alt="" aria-hidden="true">` : '';
    if (m.type === 'live') return `<div class="mv-stage" id="mv-stage">${amb}${close}<div class="mv-frame">${playing && x.embed
        ? `<iframe src="${esc(x.embed)}" class="mv-iframe" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${esc(L(m.t))}"></iframe>`
        : `<div class="scene !absolute inset-0">${Scene(x.cover)}</div><span class="mv-shade"></span>${m.img ? '' : '<span class="mcard-livebg"></span>'}
          <span class="mv-live"><span class="live" style="--dot:#fff"></span>${t('m_live')}</span>
          <button type="button" class="mv-play" data-act="mp-toggle" aria-label="${esc(t('play'))}"><i></i><i></i>${ic('play', 'w-9 h-9 ml-1')}</button>
          <span class="mv-cap">${ic(/youtu/.test(m.video || '') ? 'youtube' : 'facebook', 'w-4 h-4')}${/youtu/.test(m.video || '') ? 'YouTube' : 'Facebook'} ${L(['бичлэг', 'video'])} · ${esc(mediaDate(m))}</span>`}</div></div>`;
    if (m.type === 'photo' && x.photos.length) return `<div class="mv-stage" id="mv-stage">${amb}${close}
        <div class="mv-photo" id="ph-main"><img src="${esc(mediaImg(x.photos[ph], 1280))}" alt="${esc(L(m.t))} ${ph + 1}" class="mv-img is-on" decoding="async"></div>
        <span class="mv-count tnum" id="ph-count">${ph + 1} / ${x.photos.length}</span>
        <button type="button" class="mv-fs" data-act="mv-fs" aria-label="${esc(L(['Бүтэн дэлгэцээр', 'Fullscreen']))}" title="${esc(L(['Бүтэн дэлгэцээр', 'Fullscreen']))}">${ic('maximize-2', 'w-[18px] h-[18px]')}</button>
        ${x.photos.length > 1 ? `<button type="button" class="mv-nav mv-prev" data-act="ph" data-d="-1" aria-label="${esc(t('prev'))}">${ic('chevron-left', 'w-6 h-6')}</button><button type="button" class="mv-nav mv-next" data-act="ph" data-d="1" aria-label="${esc(t('next'))}">${ic('chevron-right', 'w-6 h-6')}</button>
        <div class="mv-strip thin-scroll" id="ph-strip">${x.photos.map((u, k) => `<button type="button" class="mv-th ${k === ph ? 'is-on' : ''}" data-act="ph-go" data-k="${k}" aria-label="${k + 1}"><img src="${esc(mediaImg(u, 240))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}</div>`;
    if (m.type === 'podcast') return `<div class="mv-stage mv-pod" id="mv-stage">${amb}${close}<div class="mv-disc"><span class="mv-vinyl"></span><div class="scene mv-art">${Scene(x.cover)}</div></div>
        <p class="mv-pod-cap">${L(['«Нийслэл» подкаст', '"Niislel" podcast'])}</p><div class="mv-eq" aria-hidden="true">${Array.from({ length: 24 }, (_, k) => `<i style="--k:${k}"></i>`).join('')}</div></div>`;
    return `<div class="mv-stage" id="mv-stage">${amb}${close}<div class="mv-poster ${zoom ? 'is-zoom' : ''}" id="mv-poster" data-act="mv-zoom" title="${esc(zoom ? L(['Жижигрүүлэх', 'Zoom out']) : L(['Томруулах', 'Zoom in']))}">${m.img ? `<img src="${esc(m.img)}" alt="${esc(L(m.t))}">` : `<div class="scene w-full aspect-[3/4]">${Scene(x.cover)}</div>`}</div>
        <span class="mv-hint">${ic(zoom ? 'zoom-out' : 'zoom-in', 'w-4 h-4')}${zoom ? L(['Дарж жижигрүүлнэ', 'Click to zoom out']) : L(['Дарж томруулна', 'Click to zoom in'])}</span></div>`;
  };
  const panel = (x) => {
    const rel = MEDIA.map((r, i) => [r, i]).filter(([r]) => r.live && r.type === m.type && r.id !== m.id).slice(0, 4);
    const primary = m.type === 'live' && m.video ? `<a href="${esc(m.video)}" target="_blank" rel="noopener" class="mv-btn mv-btn-p">${ic('play', 'w-[18px] h-[18px]')}${/youtu/.test(m.video) ? L(['YouTube дээр үзэх', 'Watch on YouTube']) : L(['Facebook дээр үзэх', 'Watch on Facebook'])}</a>`
      : `<a href="${esc(x.src)}" target="_blank" rel="noopener" class="mv-btn mv-btn-p">${ic(m.type === 'podcast' ? 'headphones' : 'external-link', 'w-[18px] h-[18px]')}${m.type === 'podcast' ? L(['ulaanbaatar.mn дээр сонсох', 'Listen on ulaanbaatar.mn']) : L(['ulaanbaatar.mn дээр үзэх', 'View on ulaanbaatar.mn'])}</a>`;
    return `<aside class="mv-info">
      <div class="flex items-center justify-between gap-3"><span class="mv-chip">${ic(x.ty.i, 'w-4 h-4')}${t(x.ty.k)}</span><button type="button" class="mv-close hidden lg:grid" data-act="modal-close" aria-label="${esc(t('close'))}">${ic('x', 'w-5 h-5')}</button></div>
      <h2 class="mv-t">${esc(L(m.t))}</h2>
      <div class="mv-meta"><span>${ic('calendar', 'w-4 h-4')}${esc(mvDate(m))}</span><span class="tnum">${ic('eye', 'w-4 h-4')}${num(m.views || 0)} ${L(['үзсэн', 'views'])}</span>${m.type === 'photo' && x.photos.length ? `<span class="tnum">${ic('images', 'w-4 h-4')}${x.photos.length} ${L(['зураг', 'photos'])}</span>` : ''}</div>
      <div class="mv-body thin-scroll">${(m.body || []).length ? m.body.map((p) => `<p>${esc(p)}</p>`).join('') : `<p class="mv-empty">${m.type === 'live' ? L(['Шууд дамжуулалтын бичлэг. Тоглуулах товчийг дарж үзнэ үү.', 'A recorded live stream. Press play to watch.']) : L(['Тайлбар оруулаагүй байна.', 'No description.'])}</p>`}</div>
      <div class="mv-acts">${primary}<button type="button" class="mv-btn mv-btn-i" data-act="mv-copy" title="${esc(L(['Холбоос хуулах', 'Copy link']))}" aria-label="${esc(L(['Холбоос хуулах', 'Copy link']))}">${ic('link', 'w-[18px] h-[18px]')}</button>${m.type === 'live' ? `<a href="${esc(x.src)}" target="_blank" rel="noopener" class="mv-btn mv-btn-i" title="ulaanbaatar.mn" aria-label="ulaanbaatar.mn">${ic('external-link', 'w-[18px] h-[18px]')}</a>` : ''}</div>
      ${rel.length ? `<div class="mv-rel"><p class="mv-rel-h">${L(['Бусад', 'More'])} ${esc(t(x.ty.k).toLowerCase())}</p>${rel.map(([r, i], k) => `<button type="button" class="mv-ri" style="--i:${k}" data-act="mv-go" data-i="${i}"><span class="scene mv-ri-th">${Scene(r.img || mediaFallback(r))}</span><span class="min-w-0"><b>${esc(L(r.t))}</b><span>${esc(mediaDate(r))} · ${num(r.views || 0)}</span></span></button>`).join('')}</div>` : ''}
    </aside>`;
  };
  const render = () => { const x = st(); return `<div class="mv" style="--mc:${x.ty.c}">${stage(x)}${panel(x)}</div>`; };
  // Фото: хуруугаар гүйлгэх; Постер: курсорын байрлалаар томруулах
  const after = (sheet) => {
    const sg = $('#mv-stage', sheet); if (!sg) return;
    if (m.type === 'photo') { let x0 = null; sg.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; }); sg.addEventListener('pointerup', (e) => { if (x0 != null && Math.abs(e.clientX - x0) > 40) MS.ph(e.clientX < x0 ? 1 : -1); x0 = null; }); }
    const pz = $('#mv-poster', sheet); if (pz) pz.addEventListener('pointermove', (e) => { if (!zoom) return; const r = pz.getBoundingClientRect(); pz.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); pz.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
  };
  openModal({ size: 'media', label: L(m.t), render, after });
  const swapTo = (next) => { m = next; ph = 0; playing = false; zoom = false; const v = MODAL && $('.mv', MODAL.sheet); if (v && v.animate && !reduced) v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).finished.then(() => { paintModal(); const n = $('.mv', MODAL.sheet); if (n) n.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }); }); else paintModal(); };
  MS = {
    mpToggle: () => { const x = st(); if (!x.embed) { if (m.video) window.open(m.video, '_blank', 'noopener'); return; } playing = true; paintModal(true); },
    ph: (dlt) => { const n = (m.photos || []).length; if (m.type === 'photo' && n > 1) MS.phGo((ph + dlt + n) % n); },
    phGo: (k) => {
      const photos = m.photos || []; if (!photos[k] || k === ph) return; ph = k;
      const box = $('#ph-main'); if (box) {   // хоёр зураг зөөлөн уусна
        const old = $('.mv-img.is-on', box), img = new Image(); img.className = 'mv-img'; img.alt = `${L(m.t)} ${ph + 1}`; img.decoding = 'async'; img.src = mediaImg(photos[ph], 1280);
        const show = () => { box.appendChild(img); requestAnimationFrame(() => { img.classList.add('is-on'); if (old) { old.classList.remove('is-on'); setTimeout(() => old.remove(), 450); } }); };
        if (img.complete) show(); else { img.onload = show; img.onerror = show; }
      }
      const amb = $('#mv-stage .mv-amb'); if (amb) amb.src = mediaImg(photos[ph], 240);
      const c = $('#ph-count'); if (c) c.textContent = `${ph + 1} / ${photos.length}`;
      $$('#ph-strip .mv-th').forEach((b) => { const on = +b.dataset.k === ph; b.classList.toggle('is-on', on); if (on) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' }); });
      if (photos[ph + 1]) { const pre = new Image(); pre.src = mediaImg(photos[ph + 1], 1280); }   // дараагийнхыг урьдчилан ачаална
    },
    go: (i) => { if (MEDIA[i]) swapTo(MEDIA[i]); },
    zoom: () => { zoom = !zoom; const pz = $('#mv-poster'), h = $('.mv-hint'); if (pz) { pz.classList.toggle('is-zoom', zoom); pz.title = zoom ? L(['Жижигрүүлэх', 'Zoom out']) : L(['Томруулах', 'Zoom in']); } if (h) h.innerHTML = `${ic(zoom ? 'zoom-out' : 'zoom-in', 'w-4 h-4')}${zoom ? L(['Дарж жижигрүүлнэ', 'Click to zoom out']) : L(['Дарж томруулна', 'Click to zoom in'])}`; },
    fs: () => { const sg = $('#mv-stage'); if (!sg) return; if (document.fullscreenElement) document.exitFullscreen(); else if (sg.requestFullscreen) sg.requestFullscreen().catch(() => {}); },
    copy: async () => { const u = NEWS_SRC + m.nid; try { await navigator.clipboard.writeText(u); toast(t('copied'), 'link'); } catch (e) { toast(u, 'link'); } },
  };
}
function openMedia(i) {
  const m = MEDIA[i]; if (!m) return;
  if (m.live) { openMediaLive(m); return; }
  if (/^https?:\/\//.test(m.url || '')) { window.open(m.url, '_blank', 'noopener'); return; }   // admin-аас оруулсан бодит бичлэг
  let playing = false, pos = 0, timer = null, ph = 0, viewers = m.viewers || 0, liveSec = 4333;
  const durS = m.dur ? m.dur.split(':').reduce((a, b) => a * 60 + +b, 0) : 0;
  const fmt = (s) => { s = Math.floor(s); const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ':' + pad(mm) : mm) + ':' + pad(ss); };
  const photoKey = (k) => (k === 0 ? m.img : `mix:mix:${(i + 1) * 97 + k * 13}`);
  const bars = Array.from({ length: 56 }, (_, k) => 25 + Math.round(Math.abs(Math.sin(k * 1.7 + i) * 55 + Math.sin(k * 0.45) * 20)));
  const tick = () => {
    if (m.type === 'live') { liveSec++; viewers = Math.max(900, viewers + Math.round(Math.random() * 10 - 4)); const tm = $('#mp-time'), vw = $('#mp-viewers'); if (tm) tm.textContent = `${t('liveFor')} ${fmt(liveSec)}`; if (vw) vw.textContent = num(viewers); return; }
    pos = Math.min(durS, pos + 1); if (pos >= durS) { playing = false; clearInterval(timer); paintModal(true); return; }
    const tm = $('#mp-time'), bar = $('#mp-bar'); if (tm) tm.textContent = `${fmt(pos)} / ${m.dur}`; if (bar) bar.style.width = (pos / durS) * 100 + '%';
    if (m.type === 'podcast') $$('#pc-wave i').forEach((b, k) => b.classList.toggle('bg-ubred', k / 56 < pos / durS));
  };
  const toggle = () => { playing = !playing; clearInterval(timer); if (playing) timer = setInterval(tick, 1000); paintModal(true); };
  const head = `<p class="text-[13px] text-muted">${esc(L(m.d))}</p><h2 class="mt-1 text-[22px] sm:text-[24px] font-extrabold leading-snug">${esc(L(m.t))}</h2>`;
  const stageVideo = () => `<div class="relative bg-black sm:rounded-t-[8px] overflow-hidden"><div class="scene aspect-video">${Scene(m.img)}</div><div class="absolute inset-0 transition-colors ${playing ? 'bg-black/0' : 'bg-black/30'}"></div>
    ${m.type === 'live' ? `<span class="absolute left-4 top-4 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-ubred text-white text-[13px] font-bold"><span class="live" style="--dot:#fff"></span>${t('m_live')}</span><span class="absolute left-[104px] top-4 h-8 px-3 rounded-full bg-black/55 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}<span id="mp-viewers">${num(viewers)}</span></span>` : ''}
    ${closeBtnImg()}
    <button type="button" class="absolute inset-x-0 top-14 bottom-16 grid place-items-center" data-act="mp-toggle" aria-label="${esc(playing ? t('pause') : t('play'))}"><span class="w-20 h-20 rounded-full bg-white/90 text-[#0B1D45] grid place-items-center shadow-2xl transition-all duration-300 ${playing ? 'opacity-0 scale-75' : ''}">${ic('play', 'w-9 h-9 ml-1')}</span></button>
    <div class="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/80 to-transparent text-white flex items-center gap-3"><button type="button" class="icon-btn hover:bg-white/15" data-act="mp-toggle" aria-label="${esc(playing ? t('pause') : t('play'))}">${ic(playing ? 'pause' : 'play')}</button><span class="text-[13px] tnum whitespace-nowrap" id="mp-time">${m.type === 'live' ? `${t('liveFor')} ${fmt(liveSec)}` : `${fmt(pos)} / ${m.dur}`}</span><div class="flex-1 h-1.5 rounded-full bg-white/25 overflow-hidden"><div class="h-full bg-ubred transition-[width] duration-1000 ease-linear" id="mp-bar" style="width:${m.type === 'live' ? 100 : (pos / durS) * 100}%"></div></div>${ic('volume-2', 'w-5 h-5 opacity-80')}</div></div><div class="px-5 sm:px-7 py-6">${head}</div>`;
  const stagePhoto = () => `<div class="relative bg-black sm:rounded-t-[8px] overflow-hidden"><div class="scene aspect-[16/10]" id="ph-main">${Scene(photoKey(ph))}</div>${closeBtnImg()}
    <button type="button" class="absolute left-3 top-1/2 -translate-y-1/2 icon-btn bg-black/50 text-white hover:bg-black/70" data-act="ph" data-d="-1" aria-label="${esc(t('prev'))}">${ic('chevron-left')}</button><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 icon-btn bg-black/50 text-white hover:bg-black/70" data-act="ph" data-d="1" aria-label="${esc(t('next'))}">${ic('chevron-right')}</button>
    <span class="absolute left-4 bottom-4 h-8 px-3 rounded-full bg-black/55 text-white text-[13px] font-bold inline-flex items-center tnum" id="ph-count">${ph + 1} / ${m.n}</span></div>
    <div class="flex gap-2 overflow-x-auto thin-scroll px-5 sm:px-7 pt-4 pb-1" id="ph-strip">${Array.from({ length: m.n }, (_, k) => `<button type="button" class="scene w-20 h-14 rounded-lg shrink-0 ring-2 ring-offset-2 ring-offset-card transition ${k === ph ? 'ring-ubred' : 'ring-transparent opacity-60 hover:opacity-100'}" data-act="ph-go" data-k="${k}" aria-label="${k + 1}">${Scene(photoKey(k))}</button>`).join('')}</div>
    <div class="px-5 sm:px-7 pt-4 pb-6">${head}<p class="mt-2 text-[13px] text-muted">${t('photoCredit')}</p></div>`;
  const stagePod = () => `<div class="relative">${closeBtnImg().replace('bg-black/45 text-white hover:bg-black/60', 'bg-soft hover:bg-line')}</div><div class="px-5 sm:px-7 pt-8 pb-7 flex flex-col sm:flex-row gap-6 sm:items-center">
    <div class="scene w-40 h-40 rounded-2xl shrink-0 shadow-xl self-center">${Scene(m.img)}</div>
    <div class="flex-1 min-w-0"><p class="text-[13px] font-bold text-ubred">${t('m_podcast')} ${m.ep}</p><h2 class="mt-1 text-[21px] font-extrabold leading-snug">${esc(L(m.t))}</h2><p class="mt-1 text-muted text-[14px]">${esc(L(m.d))}</p>
      <div class="mt-5 flex items-center gap-[3px] h-14" id="pc-wave">${bars.map((h, k) => `<i class="flex-1 rounded-full transition-colors ${k / 56 < pos / durS ? 'bg-ubred' : 'bg-line'}" style="height:${h}%"></i>`).join('')}</div>
      <div class="mt-4 flex items-center gap-3"><button type="button" class="w-12 h-12 rounded-full bg-ink text-card grid place-items-center" data-act="mp-toggle" aria-label="${esc(playing ? t('pause') : t('play'))}">${ic(playing ? 'pause' : 'play', 'w-5 h-5')}</button><span class="text-[13px] tnum text-muted" id="mp-time">${fmt(pos)} / ${m.dur}</span>${playing ? '<span class="eq text-ubred ml-1"><i></i><i></i><i></i><i></i></span>' : ''}</div></div></div>`;
  openModal({ size: 'xl', label: L(m.t), onClose: () => clearInterval(timer), render: () => (m.type === 'photo' ? stagePhoto() : m.type === 'podcast' ? stagePod() : stageVideo()) });
  if (m.type === 'live') { playing = true; timer = setInterval(tick, 1000); paintModal(true); }
  MS = {
    mpToggle: toggle,
    ph: (dlt) => { ph = (ph + dlt + m.n) % m.n; MS.phGo(ph); },
    phGo: (k) => { ph = k; $('#ph-main').innerHTML = Scene(photoKey(ph)); $('#ph-count').textContent = `${ph + 1} / ${m.n}`; $$('#ph-strip [data-k]').forEach((b) => { const on = +b.dataset.k === ph; b.classList.toggle('ring-ubred', on); b.classList.toggle('ring-transparent', !on); b.classList.toggle('opacity-60', !on); }); const strip = $('#ph-strip'), cur = $(`#ph-strip [data-k="${ph}"]`); if (strip && cur) strip.scrollTo({ left: cur.offsetLeft - strip.clientWidth / 2 + 40, behavior: reduced ? 'auto' : 'smooth' }); },
  };
  if (m.type !== 'photo') MS.ph = null;
}

