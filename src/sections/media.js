/* ================= Media ================= */
const MEDIA_F = ['all', 'live', 'photo', 'poster', 'podcast'];
/* Медиа хэсэгт хамгийн ихдээ 6 бичлэг (admin-ы «Дараалал» бага нь эхэнд). Бүгд нэг дор харагдах тор (bento):
   6 бичлэгтэй үед эхнийх нь том (2 мөр), бусад нь баруун талд 2, доор 3. Шүүлтүүрээр цөөрвөл тоонд нь тааруулж байрлана. */
const MEDIA_MAX = 6;
const MSPAN = { 4: 'lg:col-span-4', 5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 12: 'lg:col-span-12' };
const MLAYOUT = { 1: [12], 2: [6, 6], 3: [4, 4, 4], 4: [7, 5, 5, 7], 5: [7, 5, 4, 4, 4], 6: [7, 5, 5, 4, 4, 4] };
/* Бодит медиа: огноо (2026.06.27), нүүр зураггүй Live-д хотын шөнийн чимэглэл */
function mediaDate(m) { const d = parseUB(m.date || ''); return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : ''; }
function mediaFallback(m) {   // id-аас тогтвортой: Live бүр өөр дүр зураг (ордон, тайз, хот, гүүр...) шөнийн өнгөөр
  const seed = (+String(m.nid || m.id || '').replace(/\D/g, '').slice(-4) || 7);
  if (m.type === 'live') return ['civic', 'stage', 'skyline', 'bridge', 'sport', 'road'][seed % 6] + ':' + ['navy', 'night', 'dusk'][Math.floor(seed / 6) % 3] + ':' + (seed % 97);
  return (m.type === 'podcast' ? 'ger:dusk:' : 'skyline:dusk:') + (seed % 97);
}
/* /media хуудсанд: «Мэдээ мэдээлэл» хуудастай ижил (цайвар дэвсгэр, хайлт, ангилал, тоо, 3 баганат тор), бүх бичлэг хязгааргүй */
const mediaPg = () => S.route === 'page' && S.page === 'media';
function mediaList() {
  const q = mediaPg() ? S.mediaQ.trim().toLowerCase() : '';
  let list = MEDIA.map((m, i) => ({ m, i })).filter(({ m }) => S.media === 'all' || m.type === S.media);
  if (q) list = list.filter(({ m }) => (L(m.t) + ' ' + L(m.d || ['', ''])).toLowerCase().includes(q));
  return mediaPg() ? list : list.slice(0, MEDIA_MAX);
}
const MEDIA_STEP = 12;
function mediaCountText() { const n = mediaList().length, q = S.mediaQ.trim(); return q ? L([`«${q}»: ${n} илэрц`, `“${q}”: ${n} results`]) : L([`Нийт ${n} бичлэг`, `${n} items`]); }
function mediaCards(fromN = 0) {
  const pg = mediaPg(), all = mediaList(), list = pg ? all.slice(0, S.mediaN || MEDIA_STEP) : all;   // хуудсанд 12-оор, «Цааш үзэх»
  if (!list.length) return pg ? `<div class="sm:col-span-2 lg:col-span-3 card p-12 text-center text-muted">${ic('search-x', 'w-8 h-8 mx-auto mb-3 opacity-60')}${t('noResults')}</div>` : `<p class="sm:col-span-2 lg:col-span-12 py-16 text-center text-white/60">${L(['Энэ төрлийн медиа алга', 'Nothing in this category yet'])}</p>`;
  const n = list.length, spans = MLAYOUT[n] || [], firstWide = n % 2 === 1 || n === 6, lastWide = (n - (firstWide ? 1 : 0)) % 2 === 1;
  return list.map(({ m, i }, k) => {
    let feat, tall, cls;
    if (pg) {   // мэдээний хуудас шиг эхнийх нь том; 3 баганат тор сүүлийн мөрөнд ганц карт үлдээхгүйгээр дүүрэхээр: n%3=2 → өргөн, n%3=0 → 2×2
      feat = k === 0 && S.media === 'all' && !S.mediaQ.trim() && n % 3 !== 1; tall = feat && n % 3 === 0;
      cls = feat ? 'sm:col-span-2' + (tall ? ' lg:row-span-2' : '') : '';
    }
    else {
      feat = k === 0 && (n === 6 || n === 1 || n === 5); tall = k === 0 && n === 6;
      cls = [MSPAN[spans[k]], k === 0 && firstWide ? 'sm:col-span-2' : '', tall ? 'sm:row-span-2' : '', k === n - 1 && lastWide && k ? 'sm:col-span-2' : ''].join(' ');
    }
    const pill = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 backdrop-blur text-[12.5px] font-bold';
    const badge = m.type === 'live' ? `<span class="inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-ubred text-white text-[12.5px] font-bold"><span class="live" style="--dot:#fff"></span>${t('m_live')}</span>`
      : m.type === 'video' ? `<span class="${pill}">${ic('play', 'w-3.5 h-3.5')}${t('m_video')}</span>`
      : m.type === 'photo' ? `<span class="${pill}">${ic('images', 'w-3.5 h-3.5')}${m.n ? t('photosN', { n: m.n }) : t('m_photo')}</span>`
      : m.type === 'poster' ? `<span class="${pill}">${ic('image', 'w-3.5 h-3.5')}${t('m_poster')}</span>`
      : `<span class="${pill}"><span class="eq text-ubyellow"><i></i><i></i><i></i><i></i></span>${t('m_podcast')}${m.ep ? ' ' + m.ep : ''}</span>`;
    // Бодит (ulaanbaatar.mn) бичлэг: огноо + үзсэн тоо. Жишээ бичлэг: өмнөх шиг
    const meta = m.live ? `<span class="inline-flex items-center gap-1.5 tnum">${ic('calendar', 'w-4 h-4')}${esc(mediaDate(m))}</span><span class="inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}${num(m.views || 0)}</span>`
      : m.type === 'live' ? `<span class="inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}${t('watching', { n: num(m.viewers || 0) })}</span>`
      : m.type === 'photo' ? `<span class="flex gap-1">${[0, 1, 2, 3, 4].map((q) => `<i class="w-1.5 h-1.5 rounded-full ${q ? 'bg-white/40' : 'bg-white'}"></i>`).join('')}</span>`
      : `<span class="inline-flex items-center gap-1.5 tnum">${ic(m.type === 'podcast' ? 'headphones' : 'clock-3', 'w-4 h-4')}${m.dur || ''}</span>`;
    const play = m.type === 'video' || m.type === 'live' || m.type === 'podcast', cover = m.img || mediaFallback(m);
    return `<button type="button" class="mcard ${pg && k >= fromN && fromN ? 'mc-more' : ''} ${feat ? 'mcard-feat' : ''} ${tall ? 'mcard-tall' : ''} ${m.type === 'live' ? 'mcard-live' : ''} group zoom-on ${cls}" style="--i:${k};--j:${Math.max(0, k - fromN)}" data-act="media-open" data-i="${i}"><div class="scene zoom !absolute inset-0">${Scene(cover)}</div>${m.live && !m.img && m.type === 'live' ? '<span class="mcard-livebg" aria-hidden="true"></span>' : ''}<div class="absolute inset-0 bg-gradient-to-t from-black/90 ${feat ? 'via-black/30' : 'via-black/50'} to-black/5"></div>
      <div class="absolute left-4 top-4">${badge}</div>
      ${play ? `<span class="mcard-play" aria-hidden="true">${ic(m.type === 'podcast' ? 'headphones' : 'play', m.type === 'podcast' ? 'w-5 h-5' : 'w-6 h-6 ml-0.5')}</span>` : ''}
      <div class="absolute inset-x-0 bottom-0 p-5 ${feat ? 'lg:p-7' : ''}">${m.live ? '' : `<p class="text-[13px] text-white/65">${esc(L(m.d))}</p>`}<p class="mt-1 ${feat ? 'text-[22px] lg:text-[30px] leading-[1.15] tracking-[-0.02em]' : 'text-[17px] leading-snug'} font-extrabold line-clamp-2">${esc(L(m.t))}</p><div class="mt-3 flex items-center gap-3 text-[13px] text-white/75">${meta}</div></div></button>`;
  }).join('') + (pg && all.length > list.length ? `<div class="media-more sm:col-span-2 lg:col-span-3 flex flex-col items-center gap-3 pt-4"><span class="text-[13px] text-muted tnum">${L([`${all.length} бичлэгээс ${list.length}-г үзлээ`, `Showing ${list.length} of ${all.length}`])}</span><span class="na-prog"><i style="width:${Math.round((list.length / all.length) * 100)}%"></i></span><button type="button" class="btn btn-ink mt-1" data-act="media-more">${ic('chevrons-down', 'w-[18px] h-[18px]')}${L(['Цааш үзэх', 'Load more'])}</button></div>` : '');
}
function renderMedia() {
  const sec = $('#media');
  if (mediaPg()) {
    if (MEDIA_IO) MEDIA_IO.disconnect();
    sec.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-24">
      <div class="relative w-full sm:max-w-[420px]">${ic('search', 'w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input id="media-q" data-input="mediaQ" type="search" value="${esc(S.mediaQ)}" placeholder="${esc(L(['Медиа хайх...', 'Search media...']))}" class="field !pl-11" aria-label="${esc(L(['Медиа хайх', 'Search media']))}" autocomplete="off"/></div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" id="media-chips">${chips('media-f', MEDIA_F.map((v) => [v, v === 'all' ? t('f_all') : t('m_' + v)]), S.media)}</div>
      <p class="mt-6 mb-4 text-[13.5px] text-muted" id="media-count">${esc(mediaCountText())}</p>
      <div id="media-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] lg:auto-rows-[280px] gap-5">${mediaCards()}</div></div>`;
    if (!sec.classList.contains('media-in')) observeOnce($('#media-grid'), () => { sec.classList.add('media-in'); setTimeout(() => sec.classList.add('media-done'), 1500); }, 0.05);
    return;
  }
  sec.innerHTML = `<div class="media-band text-white relative overflow-hidden isolate">${mediaBg()}<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div class="sec-ttl"><h2 class="h-section text-white">${t('mediaTitle')}</h2><p class="mt-2 text-white/60">${t('mediaDesc')}</p></div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar min-w-0 -mx-4 px-4 sm:mx-0 sm:px-0" id="media-chips">${chips('media-f', MEDIA_F.map((v) => [v, v === 'all' ? t('f_all') : t('m_' + v)]), S.media, true)}</div></div>
    <div id="media-grid" class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[236px] lg:auto-rows-[248px] gap-4">${mediaCards()}</div></div></div>`;
  // Картууд дэлгэцэнд орж ирэхэд дараалан гарч ирнэ (нэг удаа)
  if (!sec.classList.contains('media-in')) observeOnce($('#media-grid'), () => { sec.classList.add('media-in'); setTimeout(() => sec.classList.add('media-done'), 1500); }, 0.12);
  // хөдөлгөөнт дэвсгэр: дэлгэцэнд харагдахгүй үед зогсоно
  if (MEDIA_IO) MEDIA_IO.disconnect();
  const bg = $('#media .media-bg');
  if (bg && 'IntersectionObserver' in window) { MEDIA_IO = new IntersectionObserver(([en]) => bg.classList.toggle('is-off', !en.isIntersecting)); MEDIA_IO.observe(bg); }
}
/* Медиа хэсгийн хөдөлгөөнт вектор дэвсгэр: туйлын туяа (3 гэрэлтэлт), урсах дууны долгион, дамжуулалтын цагираг. styles/07-effects.css .mb-* */
let MEDIA_IO = null;
function mediaBg() {
  // Q/T муруйгаар синус долгион; 2880 өргөн (2 үе) тул -50% шилжихэд тасралтгүй давтагдана
  const wave = (y, a, len) => { let d = `M0 ${y} Q${len / 4} ${y - a} ${len / 2} ${y}`; for (let x = len; x <= 2880; x += len / 2) d += ` T${x} ${y}`; return d; };
  const lines = [[150, 26, 480, 'a'], [190, 40, 720, 'b'], [228, 18, 360, 'c'], [262, 34, 576, 'b'], [300, 22, 480, 'a']];
  return `<div class="media-bg" aria-hidden="true">
    <i class="mb-blob mb-b1"></i><i class="mb-blob mb-b2"></i><i class="mb-blob mb-b3"></i>
    <svg class="mb-waves" viewBox="0 0 1440 420" preserveAspectRatio="none"><defs><linearGradient id="mbw" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      ${lines.map(([y, a, len, c], k) => `<g class="mb-line mb-l${k + 1}"><path class="mb-${c}" d="${wave(y, a, len)}"/></g>`).join('')}</svg>
    <span class="mb-rings"><i></i><i></i><i></i></span>
  </div>`;
}
function setMediaF(v) {
  S.media = v; S.mediaN = MEDIA_STEP; $$('[data-act="media-f"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  const g = $('#media-grid'), c = $('#media-count'); if (c) c.textContent = mediaCountText();
  swap(g, mediaCards(), 0, (el) => { el.classList.add('mc-fresh'); setTimeout(() => el.classList.remove('mc-fresh'), 1000); });
}

