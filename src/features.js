/* ================= Shared ================= */
let MS = {};
let currentSec = 'hero';
const RAGENCY = { pothole: ['Нийслэлийн Авто замын газар', 'City Roads Department'], light: ['Гэрэлтүүлгийн алба', 'Street Lighting Office'], waste: ['Дүүргийн Тохижилтын алба', 'District Services Office'], water: ['Ус сувгийн удирдах газар', 'Water Supply and Sewerage Authority'], building: ['Онцгой байдлын газар', 'Emergency Management Agency'], other: ['Нийслэлийн Засаг даргын Тамгын газар', 'City Hall'], service: ['Иргэний үйлчилгээний төв', 'City service centre'] };
const NOTE_NEW = ['Хүлээн авлаа. 30 минутын дотор хариуцах байгууллагад шилжинэ.', 'Received. It will be routed within 30 minutes.'];
function debounce(fn, ms) { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; }
function endOfMonth() { const d = today(); return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
const newReqId = () => 'UB-2026-' + (48400 + Math.floor(Math.random() * 500));
function addRequest(cat, ttl, place) {
  const id = newReqId();
  S.requests.unshift({ id, cat, st: 0, ago: 0, ttl, place: place || ME.addr, ag: RAGENCY[cat] || RAGENCY.other, note: NOTE_NEW });
  store.set('requests', S.requests);
  if (S.route === 'my') renderMy();
  return id;
}
const closeBtnImg = () => `<button type="button" class="absolute right-3 top-3 icon-btn bg-black/45 text-white hover:bg-black/60 backdrop-blur" data-act="modal-close" aria-label="${esc(t('close'))}">${ic('x')}</button>`;

/* ================= Readers ================= */
function newsAction(n) {
  const b = (act, icon, label, extra = '') => `<button type="button" class="btn btn-ghost mt-6" data-act="${act}" ${extra}>${ic(icon, 'w-[18px] h-[18px]')}${label}</button>`;
  if (n.act === 'biz') return b('go', 'briefcase', L(['Бизнес эхлүүлэх алхмууд', 'Steps to start a business']), 'data-sec="situations" data-sit="business"');
  if (n.act === 'map') return b('go', 'map-pinned', t('showOnMap'), `data-sec="projects" data-pid="${n.pid}"`);
  if (n.act === 'events') return b('go', 'calendar-days', t('allEvents'), 'data-sec="events"');
  if (n.act === 'data') return b('go', 'activity', t('nav_data'), 'data-sec="data" data-hl="aqi"');
  if (n.act === 'tr') return b('go', 'scroll-text', t('nav_open'), 'data-sec="transparency"');
  if (n.act === 'idea') return b('vote', 'message-square-plus', t('cta_vote'), 'data-tab="idea" data-topic="plan"');
  if (n.act === 'poll') return b('vote', 'vote', t('vPoll'), 'data-tab="poll"');
  return '';
}
/* ---- Мэдээний дэлгэрэнгүй хуудас (/news/<id>, сервергүй үед #news/<id>) ---- */
function openNews(id) {
  if (!NEWS_BY[id]) return;
  if (MODAL) closeModal(true);
  closeMenu();
  if (S.route === 'home') S.homeY = window.scrollY;
  S.newsId = id; S.newsFb = false;
  try { if ((PRETTY ? location.pathname : location.hash) !== newsHref(id)) history.pushState({ ubNews: 1 }, '', newsHref(id)); } catch (e) { /* ignore */ }
  setRoute('news');
}
function newsBack() {
  if (history.state && history.state.ubNews) history.back(); else setRoute('home');
}
window.addEventListener('popstate', () => {
  const id = urlNewsId();
  if (id && NEWS_BY[id]) { S.newsId = id; S.newsFb = false; setRoute('news'); }
  else if (/^#admin(\/|$)/.test(location.hash)) { admFromHash(location.hash); if (S.route !== 'admin') setRoute('admin'); else renderAdmin(); }
  else if (S.route === 'news') setRoute('home');
});
function newsMins(n) {
  if (n.mins) return n.mins;
  const words = [n.l].concat(n.b || []).map((x) => L(x) || '').join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
function newsFbHTML() {
  return `<div id="nfb" class="mt-10 rounded-[18px] bg-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><b class="block text-[16px]">${t('helpful')}</b><span class="text-[13.5px] text-muted">${L(['Таны санал мэдээллийг сайжруулахад тусална.', 'Your answer helps us improve.'])}</span></div>
    <span class="flex flex-wrap gap-2">${S.newsFb ? `<span class="text-[14px] text-greenink font-semibold inline-flex items-center gap-1.5 h-9">${ic('circle-check', 'w-4 h-4')}${t('thanks')}</span>` : `<button type="button" class="btn btn-sm btn-ghost bg-card" data-act="nfb">${ic('thumbs-up', 'w-4 h-4')}${t('yes')}</button><button type="button" class="btn btn-sm btn-ghost bg-card" data-act="nfb">${ic('thumbs-down', 'w-4 h-4')}${t('no')}</button>`}</span></div>`;
}
function newsShare(n, cls = '') {
  const url = encodeURIComponent(newsUrl(n));
  const b = (inner, label, attrs) => `<${attrs.startsWith('href') ? 'a' : 'button type="button"'} class="icon-btn border border-line hover:bg-soft" aria-label="${esc(label)}" title="${esc(label)}" ${attrs}>${inner}</${attrs.startsWith('href') ? 'a' : 'button'}>`;
  return `<div class="flex items-center gap-2 ${cls}">
    ${b(ic('link', 'w-[18px] h-[18px]'), t('share'), `data-act="copy-link" data-id="${n.id}"`)}
    ${b('<span class="text-[15px] font-extrabold leading-none">f</span>', 'Facebook', `href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener"`)}
    ${b('<span class="text-[14px] font-extrabold leading-none">𝕏</span>', 'X', `href="https://x.com/intent/post?url=${url}&text=${encodeURIComponent(L(n.t))}" target="_blank" rel="noopener"`)}
    ${b(ic('printer', 'w-[18px] h-[18px]'), L(['Хэвлэх', 'Print']), 'data-act="print"')}</div>`;
}
function newsSideItem(x, i) {
  return `<li><button type="button" class="group w-full flex items-start gap-3 py-3 text-left" data-act="news" data-id="${x.id}">${i != null ? `<span class="w-7 text-[22px] font-extrabold leading-none text-ubred/80 tnum shrink-0">${i + 1}</span>` : x.img ? `<span class="scene w-[72px] h-14 rounded-lg shrink-0">${Scene(x.img)}</span>` : ''}<span class="min-w-0"><span class="block text-[14.5px] font-semibold leading-snug line-clamp-3 group-hover:text-ubred transition-colors">${esc(L(x.t))}</span><span class="mt-1 flex items-center gap-3 text-[12px] text-muted">${ago(x.ago || 0)}<span class="inline-flex items-center gap-1 tnum">${ic('eye', 'w-3.5 h-3.5')}${num(x.views || 0)}</span></span></span></button></li>`;
}
function renderNewsPage() {
  const n = NEWS_BY[S.newsId];
  if (!n) { setRoute('home'); return; }
  const r = RUB[n.cat] || RUB.city;
  const list = NEWS.slice().sort((a, b) => a.ago - b.ago);
  const idx = list.findIndex((x) => x.id === n.id);
  const newer = idx > 0 ? list[idx - 1] : null, older = idx >= 0 ? list[idx + 1] : null;
  const rel = (n.rel || NEWS.filter((x) => x.cat === n.cat && x.id !== n.id).slice(0, 3).map((x) => x.id)).map((x) => NEWS_BY[x]).filter(Boolean);
  const top = NEWS.filter((x) => x.id !== n.id && !x.zar).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const latest = list.filter((x) => x.id !== n.id && !rel.includes(x)).slice(0, 4);
  const when = n.ts ? fDate(n.ts, true) + ', ' + hhmm(n.ts) : ago(n.ago || 0);
  const enOnlyMn = EN() && n.live;   // бодит мэдээний бүтэн текст зөвхөн монголоор байдаг
  const paras = enOnlyMn ? (n.sumEn || []).map((x) => [x, x]) : (n.b || []);
  const photo = /^(assets|https:)/.test(n.img || '');
  // Эхний догол мөр: онцлох оршил (standfirst), бусад нь үндсэн текст. Ганц догол мөртэй бол энгийн текст.
  const intro = paras.length > 1 ? `<p class="news-intro">${esc(Lf(paras[0]))}</p>` : '';
  const rest = (paras.length > 1 ? paras.slice(1) : paras).map((p) => `<p>${esc(Lf(p))}</p>`).join('');
  const body = intro || rest ? `${intro}<div class="news-text">${rest}</div>` : '';
  const nav = (x, dir) => x ? `<button type="button" class="group card lift p-4 sm:p-5 text-left flex flex-col gap-2 ${dir > 0 ? 'sm:items-end sm:text-right' : ''}" data-act="news" data-id="${x.id}"><span class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">${dir < 0 ? ic('arrow-left', 'w-4 h-4') : ''}${dir < 0 ? L(['Өмнөх мэдээ', 'Previous']) : L(['Дараагийн мэдээ', 'Next'])}${dir > 0 ? ic('arrow-right', 'w-4 h-4') : ''}</span><span class="text-[15px] font-bold leading-snug line-clamp-2 group-hover:text-ubred transition-colors">${esc(L(x.t))}</span></button>` : '<span class="hidden sm:block"></span>';
  document.title = L(n.t) + ' · ulaanbaatar.mn';
  $('#view-news').innerHTML = `<div class="fixed inset-x-0 top-0 h-[3px] z-[70] pointer-events-none" aria-hidden="true"><div id="nprog" class="h-full bg-ubred origin-left" style="transform:scaleX(0)"></div></div>
  <div class="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 view-in">
    <nav class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-muted" aria-label="${L(['Байршил', 'Breadcrumb'])}">
      <button type="button" class="font-semibold hover:text-ink inline-flex items-center gap-1.5 mr-2" data-act="news-back">${ic('arrow-left', 'w-4 h-4')}${L(['Буцах', 'Back'])}</button>
      <span class="w-px h-4 bg-line mr-2" aria-hidden="true"></span>
      <button type="button" class="hover:text-ink" data-act="home">${t('home')}</button>${ic('chevron-right', 'w-3.5 h-3.5 opacity-60')}
      <button type="button" class="hover:text-ink" data-act="go" data-sec="hub" data-hub="news">${L(['Мэдээ', 'News'])}</button>${ic('chevron-right', 'w-3.5 h-3.5 opacity-60')}
      <button type="button" class="hover:text-ink font-semibold" style="color:${r.c}" data-act="go" data-sec="hub" data-hub="news" data-cat="${n.cat}">${esc(L(r.t))}</button>
    </nav>

    <header class="news-head mt-6 lg:mt-8" style="--rc:${r.c}"><div class="news-head-in">
      <div class="flex flex-wrap items-center gap-2">
        <span class="badge" style="background:${r.c}1A;color:${r.c}"><i class="w-2 h-2 rounded-full" style="background:${r.c}"></i>${esc(L(r.t))}</span>
        ${n.br ? `<span class="badge b-red">${ic('zap', 'w-3.5 h-3.5')}${L(['Шуурхай', 'Breaking'])}</span>` : ''}
        ${n.zar ? `<span class="badge b-off">${ic('megaphone', 'w-3.5 h-3.5')}${esc(L(RUB.zar.t))}</span>` : ''}
      </div>
      <h1 class="mt-4 max-w-[920px] text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance">${esc(L(n.t))}</h1>
      <p class="mt-4 sm:mt-5 max-w-[820px] text-[17px] sm:text-[19px] leading-relaxed text-ink/70 text-pretty">${esc(Lf(n.l))}</p>
      <div class="mt-6 pt-5 border-t border-line flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="w-11 h-11 rounded-full bg-ubred text-white grid place-items-center shrink-0">${ic('landmark', 'w-5 h-5')}</span>
          <div class="leading-tight"><b class="block text-[14.5px]">${L(['Нийслэлийн Засаг даргын Тамгын газар', "Capital City Governor's Office"])}</b>
          <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted"><span class="inline-flex items-center gap-1">${ic('calendar', 'w-3.5 h-3.5')}${when}</span><span class="inline-flex items-center gap-1">${ic('clock-3', 'w-3.5 h-3.5')}${newsMins(n)} ${L(['мин унших', 'min read'])}</span><span class="inline-flex items-center gap-1 tnum">${ic('eye', 'w-3.5 h-3.5')}${num(n.views || 0)} ${t('views')}</span></span></div>
        </div>
        ${newsShare(n)}
      </div></div>
      ${n.img ? `<figure class="news-head-fig"><div class="scene aspect-[16/9] lg:aspect-[21/9]">${Scene(n.img)}</div><figcaption class="news-cap">${ic('camera', 'w-3.5 h-3.5')}${photo ? L(['Зураг: ulaanbaatar.mn', 'Photo: ulaanbaatar.mn']) : L(['Зураг: чимэглэл', 'Image: illustration'])}</figcaption></figure>` : ''}
    </header>


    <div class="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-10 xl:gap-12">
      <article id="nbody" class="min-w-0 w-full max-w-[760px] mx-auto lg:max-w-none lg:mx-0">
        ${enOnlyMn ? `<p class="mb-6 rounded-xl bg-soft px-4 py-3 text-[14px] text-muted flex gap-2.5">${ic('languages', 'w-5 h-5 shrink-0')}<span>The full article is published in Mongolian only.${n.sumEn && n.sumEn.length ? ' Below is an English summary.' : ''} <button type="button" class="font-semibold text-ink underline underline-offset-2" data-act="lang" data-v="mn">Read in Mongolian</button></span></p>` : ''}
        <div class="news-paper">
        ${body}
        ${newsAction(n)}
        ${n.d ? `<div class="mt-8 rounded-[18px] border border-line p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><p class="flex gap-3 text-[14px] text-muted leading-relaxed">${ic('info', 'w-5 h-5 shrink-0')}<span>${n.live ? L(['Эх сурвалж: Нийслэлийн Засаг даргын Тамгын газар, ulaanbaatar.mn', "Source: Capital City Governor's Office, ulaanbaatar.mn"]) : t('srcNote')}</span></p><a class="btn btn-sm btn-ghost shrink-0" href="${NEWS_SRC}${n.id.slice(1)}" target="_blank" rel="noopener">${ic('external-link', 'w-4 h-4')}${t('srcLink')}</a></div>` : ''}
        ${CMS.canEdit ? `<button type="button" class="btn btn-sm btn-ghost mt-4" data-act="adm-site-edit" data-col="news" data-id="${n.id}">${ic('pencil-line', 'w-4 h-4')}${L(['Энэ мэдээг засах', 'Edit this story'])}</button>` : ''}
        <div class="mt-8 pt-6 border-t border-line flex flex-wrap items-center gap-2"><span class="text-[13px] text-muted mr-1">${L(['Шошго:', 'Tags:'])}</span>
          <button type="button" class="chip" data-act="go" data-sec="hub" data-hub="news" data-cat="${n.cat}">#${esc(L(r.t))}</button><span class="chip">#${L(['Улаанбаатар', 'Ulaanbaatar'])}</span><span class="chip">#${L(['Нийслэл', 'Capital'])}</span></div>
        </div>
        ${newsFbHTML()}
        <div class="mt-6 flex items-center justify-between gap-3 lg:hidden"><span class="text-[14px] font-semibold">${L(['Хуваалцах', 'Share'])}</span>${newsShare(n)}</div>
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">${nav(older, -1)}${nav(newer, 1)}</div>
      </article>

      <aside class="space-y-5 lg:sticky lg:top-[88px] self-start">
        <div class="card p-5"><h2 class="font-extrabold text-[16px] flex items-center gap-2">${ic('flame', 'w-[18px] h-[18px] text-ubred')}${L(['Их уншсан', 'Most read'])}</h2><ol class="mt-1 divide-y divide-line">${top.map((x, i) => newsSideItem(x, i)).join('')}</ol></div>
        ${latest.length ? `<div class="card p-5"><h2 class="font-extrabold text-[16px] flex items-center gap-2">${ic('newspaper', 'w-[18px] h-[18px] text-ubblue')}${L(['Сүүлийн мэдээ', 'Latest'])}</h2><ul class="mt-1 divide-y divide-line">${latest.map((x) => newsSideItem(x)).join('')}</ul></div>` : ''}
        <div class="rounded-[18px] bg-navy text-white p-5"><span class="w-10 h-10 rounded-xl bg-white/10 grid place-items-center">${ic('message-square-warning', 'w-5 h-5')}</span><b class="block mt-3 text-[16px]">${L(['Асуудал анзаарсан уу?', 'Spotted a problem?'])}</b><p class="mt-1 text-[13.5px] text-white/70 leading-relaxed">${L(['Хотод тулгамдсан асуудлыг шууд мэдээлж, явцыг нь хянаарай.', 'Report a city issue and track it to resolution.'])}</p><button type="button" class="btn btn-red btn-sm mt-4" data-act="report">${ic('plus', 'w-4 h-4')}${L(['Мэдээлэх', 'Report'])}</button></div>
      </aside>
    </div>

    ${rel.length ? `<section class="mt-16 pt-10 border-t border-line"><div class="flex items-end justify-between gap-4"><h2 class="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.02em]">${t('related')}</h2><button type="button" class="btn btn-sm btn-ghost" data-act="go" data-sec="hub" data-hub="news">${L(['Бүх мэдээ', 'All news'])}${ic('arrow-right', 'w-4 h-4')}</button></div><div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${rel.map((x) => newsCard(x, false)).join('')}</div></section>` : ''}
  </div>`;
  newsProgress();
  renderSeason(true);
}
/* ================= Улирлын эффект (мэдээ унших хуудсанд): навч, цас, дэлбээ, алтан тоосонцор =================
   Хуудасны дэвсгэр дээр, мэдээний картуудын АРД унана (текстийг дардаггүй). Admin → Тохиргоо → «Улирлын эффект». */
const SEASON_L = { auto: ['Автомат', 'Auto'], spring: ['Хавар', 'Spring'], summer: ['Зун', 'Summer'], autumn: ['Намар', 'Autumn'], winter: ['Өвөл', 'Winter'], off: ['Унтраах', 'Off'] };
const SEASON_IC = { auto: 'calendar', spring: 'flower-2', summer: 'sun', autumn: 'leaf', winter: 'snowflake', off: 'circle-off' };
function seasonByDate() { const m = ubNow().getMonth(); return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter'; }
function seasonNow() { const s = (SET && SET.season) || 'auto'; return s === 'auto' ? seasonByDate() : s; }
function renderSeason(on) {
  let el = $('#season');
  const s = on && !reduced && !S.a11y ? seasonNow() : 'off';
  if (s === 'off' || !SEASON_L[s]) { if (el) { el.innerHTML = ''; el.dataset.season = 'off'; } return; }
  if (!el) { el = document.createElement('div'); el.id = 'season'; el.setAttribute('aria-hidden', 'true'); document.body.prepend(el); }
  if (el.dataset.season === s && el.childElementCount) return;   // ижил улирал бол хөдөлгөөнийг дахин эхлүүлэхгүй
  el.dataset.season = s; el.className = 'season-' + s;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const leafA = (c, d) => `<svg viewBox="0 0 24 24"><path d="M12 1.5C6.5 6 4.2 10.4 5.2 15c.9 4 3.9 6.4 6.8 7.5 2.9-1.1 5.9-3.5 6.8-7.5 1-4.6-1.3-9-6.8-13.5z" fill="${c}"/><path d="M12 4v18M12 10l-3.2-2.4M12 14l3.4-2.6M12 17.5l-3-2.2" stroke="${d}" stroke-width=".9" stroke-linecap="round" fill="none"/></svg>`;
  const leafB = (c, d) => `<svg viewBox="0 0 24 24"><path d="M12 1.8l1.6 4.4 3.6-2.2-.8 4.6 4.4-.6-2.6 3.6 3 1.6-4.4 1.4.6 2.6-3.8-1.2L12 22l-1.6-5.8-3.8 1.2.6-2.6-4.4-1.4 3-1.6-2.6-3.6 4.4.6-.8-4.6 3.6 2.2z" fill="${c}"/><path d="M12 21.5V7" stroke="${d}" stroke-width=".9" stroke-linecap="round"/></svg>`;
  const autumn = [['#FACC15', '#A16207'], ['#F4B400', '#B07D00'], ['#FBBF24', '#B45309'], ['#EAB308', '#854D0E'], ['#FDE047', '#A16207'], ['#F59E0B', '#B45309'], ['#EA580C', '#9A3412']];   // голдуу шар, цөөн улбар
  const cfg = {   // [тоо, унах(с), найгах далайц(px), найгах(с), хэмжээ(px), эргэх(с), дүрс]
    autumn: [18, [14, 26], [30, 90], [3, 6], [16, 30], [3, 7], () => { const [c, d] = pick(autumn); return Math.random() < 0.55 ? leafA(c, d) : leafB(c, d); }],
    winter: [42, [10, 20], [12, 40], [3, 6], [3, 8], [4, 8], () => '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>'],   // өнгө: input.css (цайвар горимд цэнхэрдүү, харанхуйд цагаан)
    spring: [16, [16, 28], [40, 100], [3, 7], [10, 18], [3, 6], () => `<svg viewBox="0 0 24 24"><path d="M12 2c3.6 3.4 5 8.2 0 20-5-11.8-3.6-16.6 0-20z" fill="${pick(['#F9A8D4', '#F472B6', '#FBCFE8', '#FDA4AF', '#F9A8D4'])}"/></svg>`],
    summer: [22, [18, 30], [20, 60], [4, 8], [3, 6], [2, 4], () => '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD45C"/></svg>'],
  }[s];
  const r = (a) => (a[0] + Math.random() * (a[1] - a[0])).toFixed(1);
  // өргөн дэлгэцэнд 75% нь контентын (1140px) хоёр хажуугийн хоосон зайд: картын ард нуугдаж үрэгдэхгүй
  const m = Math.max(0, ((innerWidth - 1140) / 2 / innerWidth) * 100);
  const xPos = () => (m > 4 && Math.random() < 0.75 ? (Math.random() < 0.5 ? Math.random() * m : 100 - Math.random() * m) : Math.random() * 100).toFixed(1);
  el.innerHTML = Array.from({ length: cfg[0] }, () => {
    const t = r(cfg[1]);
    return `<span class="sf" style="--x:${xPos()}%;--t:${t}s;--dl:${(-Math.random() * t).toFixed(1)}s"><span class="sw" style="--sw:${r(cfg[2])}px;--st:${r(cfg[3])}s"><span class="lf" style="--s:${r(cfg[4])}px;--r:${r(cfg[5])}s;--a0:${Math.round(Math.random() * 360)}deg;--a1:${Math.round(Math.random() * 360 + 180)}deg;--ry:${Math.round(Math.random() * 120 + 60)}deg">${cfg[6]()}</span></span></span>`;
  }).join('');
}
function newsProgress() {
  const bar = $('#nprog'), a = $('#nbody'); if (!bar || !a || S.route !== 'news') return;
  const r = a.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
  bar.style.transform = `scaleX(${Math.min(1, Math.max(0, total > 0 ? -r.top / total : 1))})`;
}
window.addEventListener('scroll', () => { if (S.route === 'news') requestAnimationFrame(newsProgress); }, { passive: true });
function openGov(i) {
  const g = GOV[i];
  openModal({ size: 'md', render: () => `${modalHead(t('govNews'), t('govRole'), 'landmark', 'bg-navy text-white')}<article class="px-5 sm:px-7 py-6"><p class="text-[13px] text-muted">${ago(g.ago)}</p><h3 class="mt-2 text-[22px] font-extrabold leading-snug">${esc(L(g.t))}</h3><p class="mt-3 text-[16px] leading-relaxed text-ink/85">${esc(L(g.l))}</p><button type="button" class="btn btn-ghost mt-6" data-act="vote" data-tab="idea" data-gov="1">${ic('pen-line', 'w-[18px] h-[18px]')}${t('govLetter')}</button></article>` });
}
function openAlert(id) {
  const a = ALERTS.find((x) => x.id === id); if (!a) return;
  openModal({ size: 'md', render: () => `${modalHead(L(a.k), t('urgent'), a.i, 'bg-ubyellow text-[#261E00]')}<div class="px-5 sm:px-7 py-6 space-y-4">${[[t('affected'), 'map-pin', a.area], [t('period'), 'clock-3', a.when], [t('advice'), 'lightbulb', a.adv]].map(([l, i, v]) => `<div class="flex gap-3"><span class="w-10 h-10 rounded-xl bg-soft grid place-items-center shrink-0">${ic(i, 'w-5 h-5 text-muted')}</span><div><p class="text-[13px] text-muted">${l}</p><p class="text-[15px] font-semibold leading-snug">${esc(Lf(v))}</p></div></div>`).join('')}<button type="button" class="btn btn-ink w-full !mt-6" data-act="notify">${ic('bell-ring', 'w-[18px] h-[18px]')}${t('notify')}</button></div>` });
}

/* ================= Services & booking ================= */
function openService(id) {
  const s = ALL_SVC.find((x) => x.id === id); if (!s) return;
  const steps = s.m === 'on' ? [['ДАН-аар нэвтэрнэ', 'Sign in with DAN'], ['Мэдээллээ шалгаж баталгаажуулна', 'Check and confirm your details'], ['Хүсэлтээ илгээж, хариугаа Миний буланд авна', 'Send the request and get the answer in My page']]
    : s.m === 'off' ? [['Цагаа онлайнаар захиална', 'Book a time online'], ['Иргэний үнэмлэх, холбогдох баримтаа бүрдүүлнэ', 'Bring your ID and documents'], ['Захиалсан цагтаа очиж үйлчлүүлнэ', 'Visit at your booked time']]
    : [['Системд ДАН-аар нэвтэрнэ', 'Sign in with DAN'], ['Үйлчилгээгээ сонгоно', 'Choose a service'], ['Явцаа системээс хянана', 'Track progress in the system']];
  openModal({ size: 'md', label: L(s.t), render: () => `${modalHead(L(s.t), esc(L(s.d)), s.i, 'bg-ubblue/10 text-ubblue')}<div class="px-5 sm:px-7 py-6">
    <div class="flex items-center gap-2">${modeBadge(s.m)}</div>
    <div class="mt-4 grid grid-cols-2 gap-3 text-[13.5px]"><div class="rounded-xl bg-soft p-3"><p class="text-muted">${t('svcTime')}</p><b>${s.m === 'off' ? L(['1 өдөр', '1 day']) : L(['5–10 минут', '5–10 min'])}</b></div><div class="rounded-xl bg-soft p-3"><p class="text-muted">${t('svcFee')}</p><b>${t('svcFree')}</b></div></div>
    <p class="mt-6 font-bold">${t('svcSteps')}</p><ol class="mt-3 space-y-3">${steps.map((x, i) => `<li class="flex gap-3"><span class="w-7 h-7 rounded-full bg-ink text-card grid place-items-center text-[13px] font-bold shrink-0">${i + 1}</span><span class="pt-0.5 text-[14.5px]">${esc(L(x))}</span></li>`).join('')}</ol>
    <p class="mt-6 font-bold">${t('svcDocs')}</p><p class="mt-1.5 text-[14px] text-muted">${L(['Иргэний үнэмлэх эсвэл ДАН баталгаажуулалт', 'Your ID card or a DAN sign-in'])}</p>
    <div class="mt-7">${s.m === 'sys' ? `<button type="button" class="btn btn-blue w-full" data-act="sys-open">${ic('external-link', 'w-[18px] h-[18px]')}${t('openSys')}</button>` : s.m === 'on' ? `<button type="button" class="btn btn-blue w-full" data-act="svc-apply" data-id="${s.id}">${ic('send', 'w-[18px] h-[18px]')}${t('applyOnline')}</button>` : `<button type="button" class="btn btn-ink w-full" data-act="svc-book" data-id="${s.id}">${ic('calendar-clock', 'w-[18px] h-[18px]')}${t('book')}</button>`}</div></div>` });
}
function svcApply(id) {
  const s = ALL_SVC.find((x) => x.id === id);
  const doIt = () => { addRequest('service', s.t); closeModal(); toast(t('requestSent'), 'send'); };
  if (!S.user) openLogin(doIt); else doIt();
}
function openBooking(o) {
  const days = []; let d = today();
  while (days.length < 5) { d = addDays(d, 1); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d); }
  const slots = ['09:30', '10:30', '11:30', '14:00', '15:30', '16:30'];
  let di = 0, si = null;
  const taken = (a, b) => (a * 7 + b * 3) % 5 === 0;
  openModal({ size: 'md', label: t('book'), render: () => `${modalHead(t('book'), esc(L(o.t)), 'calendar-clock', 'bg-ink text-card')}<div class="px-5 sm:px-7 py-6">
    <p class="text-[13.5px] text-muted flex items-center gap-2">${ic('map-pin', 'w-4 h-4')}${esc(L(['Сүхбаатар дүүргийн иргэний үйлчилгээний төв', 'Sükhbaatar District service centre']))}</p>
    <p class="mt-5 font-bold">${t('pickSlot')}</p>
    <div class="mt-3 grid grid-cols-5 gap-2">${days.map((x, i) => `<button type="button" class="rounded-xl border py-2 text-center transition-colors ${i === di ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}" data-act="bk-day" data-i="${i}" aria-pressed="${i === di}"><span class="block text-[12px] font-semibold opacity-70">${EN() ? EN_WD[x.getDay()] : MN_WDS[x.getDay()]}</span><b class="block text-[17px] tnum">${x.getDate()}</b></button>`).join('')}</div>
    <div class="mt-3 grid grid-cols-3 gap-2">${slots.map((s, j) => { const tk = taken(di, j); return `<button type="button" ${tk ? 'disabled' : ''} class="h-11 rounded-xl border text-[14px] font-semibold tnum transition-colors ${tk ? 'border-line text-muted/50 line-through cursor-not-allowed' : j === si ? 'bg-ubblue text-white border-transparent' : 'border-line hover:bg-soft'}" data-act="bk-slot" data-j="${j}" aria-pressed="${j === si}">${s}</button>`; }).join('')}</div>
    <button type="button" class="btn btn-blue w-full mt-6" data-act="bk-ok" ${si == null ? 'disabled' : ''}>${ic('calendar-check', 'w-[18px] h-[18px]')}${t('confirmBook')}</button></div>` });
  MS = {
    bkDay: (i) => { di = i; si = null; paintModal(true); },
    bkSlot: (j) => { si = j; paintModal(true); },
    bkOk: () => { if (si == null) return; closeModal(); toast(`${t('booked')}: ${fDate(days[di], true)}, ${slots[si]}`, 'calendar-check'); if (o.onDone) o.onDone(); },
  };
}
function stepApply(i) {
  const s = SITS.find((x) => x.id === S.sit), st = s.steps[i];
  if (st.m === 'off') { openBooking({ t: st.t, onDone: () => toggleStep(i, true) }); return; }
  const doIt = () => { addRequest('service', st.t); toggleStep(i, true); toast(t('stepSent'), 'send'); };
  if (!S.user) openLogin(doIt); else doIt();
}

/* ================= DAN sign-in ================= */
const DAN_URL = 'https://sso.gov.mn/login';
function openLogin(after) {
  closeMenu();
  window.open(DAN_URL, '_blank', 'noopener'); return;
  let tab = 'app', stage = 0, timer = null;
  const finish = () => {
    clearTimeout(timer); stage = 9; paintModal();
    setTimeout(() => { S.user = { on: 1 }; store.set('user', S.user); closeModal(); renderHeader(); setActiveNav(currentSec); toast(t('signedIn'), 'fingerprint'); if (after) after(); }, 950);
  };
  const body = () => {
    if (tab === 'app') return `<div class="mx-auto w-48 h-48 rounded-2xl border border-line p-2 bg-white">${qrSVG(11)}</div><p class="mt-4 text-center font-semibold">${t('scanQr')}</p><p class="mt-1.5 flex justify-center items-center gap-2 text-[13.5px] text-muted"><span class="typing"><span></span><span></span><span></span></span>${t('waiting')}</p>`;
    if (tab === 'code') return stage < 1
      ? `<label class="block text-[13.5px] font-semibold mb-2" for="dan-reg">${t('regPh')}</label><input id="dan-reg" class="field tnum uppercase" placeholder="УБ90011234" autocomplete="off"/><button type="button" class="btn btn-ink w-full mt-4" data-act="dan-send">${t('sendCode')}</button>`
      : `<p class="text-[13.5px] text-greenink font-semibold flex items-center gap-2">${ic('circle-check', 'w-4 h-4')}${t('codeSent')}</p><label class="block text-[13.5px] font-semibold mt-4 mb-2" for="dan-code">${t('codePh')}</label><input id="dan-code" class="field tnum tracking-[.4em] text-center !text-[20px]" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code"/><button type="button" class="btn btn-blue w-full mt-4" data-act="dan-ok">${t('signIn')}</button>`;
    return `<div class="rounded-2xl bg-soft p-5 text-center">${ic('landmark', 'w-9 h-9 mx-auto text-ubblue')}<p class="mt-3 text-[14.5px] font-semibold">${L(['Өөрийн банкны апп руу шилжиж нэвтрэлтээ баталгаажуулна.', 'You will confirm the sign-in in your bank app.'])}</p></div><button type="button" class="btn btn-ink w-full mt-4" data-act="dan-ok">${ic('external-link', 'w-[18px] h-[18px]')}${L(['Банкны апп нээх', 'Open bank app'])}</button>`;
  };
  openModal({ size: 'sm', label: t('danTitle'), onClose: () => clearTimeout(timer),
    render: () => {
      if (stage === 9) return `<div class="p-10 text-center"><span class="w-16 h-16 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop">${ic('check', 'w-8 h-8', 2.6)}</span><p class="mt-4 text-[19px] font-extrabold">${t('signedIn')}</p><p class="text-muted mt-1">${esc(L(ME.n))}</p></div>`;
      return `${modalHead(t('danTitle'), t('danDesc'), 'fingerprint', 'bg-navy text-white')}<div class="px-5 sm:px-7 py-6">${tabs('dan', [['app', t('danApp')], ['code', t('danCode')], ['bank', t('danBank')]], tab, { cls: 'w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2 [&>button]:text-[13.5px]' })}<div class="mt-6" id="dan-body">${body()}</div><p class="mt-6 text-[12.5px] text-muted flex items-center gap-2">${ic('info', 'w-4 h-4')}${t('demoNote')}</p></div>`;
    },
    after: () => { if (tab === 'app' && stage === 0) { clearTimeout(timer); timer = setTimeout(finish, 4200); } } });
  MS = {
    danTab: (v) => { const order = ['app', 'code', 'bank'], dir = order.indexOf(v) > order.indexOf(tab) ? 1 : -1; tab = v; stage = 0; clearTimeout(timer); selectTab('dan', v); swap($('#dan-body'), body(), dir); if (v === 'app') timer = setTimeout(finish, 4200); },
    danSend: () => { stage = 1; $('#dan-body').innerHTML = body(); setTimeout(() => { const c = $('#dan-code'); if (c) c.focus(); }, 40); },
    danOk: finish,
  };
}

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
  openModal({ size: 'md', label: t('vTitle'), render: () => `${modalHead(t('vTitle'), '', 'vote', 'bg-ubblue text-white')}<div class="px-5 sm:px-7 py-6">${tabs('vote', [['poll', t('vPoll'), 'chart-bar-big'], ['idea', t('vIdea'), 'message-square-plus']], cur, { cls: 'w-full [&>button]:flex-1 [&>button]:justify-center' })}<div id="v-body" class="mt-6">${body()}</div></div>`,
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

/* ================= Media player ================= */
function openMedia(i) {
  const m = MEDIA[i]; if (!m) return;
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
  const stageVideo = () => `<div class="relative bg-black sm:rounded-t-[24px] overflow-hidden"><div class="scene aspect-video">${Scene(m.img)}</div><div class="absolute inset-0 transition-colors ${playing ? 'bg-black/0' : 'bg-black/30'}"></div>
    ${m.type === 'live' ? `<span class="absolute left-4 top-4 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-ubred text-white text-[13px] font-bold"><span class="live" style="--dot:#fff"></span>${t('m_live')}</span><span class="absolute left-[104px] top-4 h-8 px-3 rounded-full bg-black/55 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}<span id="mp-viewers">${num(viewers)}</span></span>` : ''}
    ${closeBtnImg()}
    <button type="button" class="absolute inset-x-0 top-14 bottom-16 grid place-items-center" data-act="mp-toggle" aria-label="${esc(playing ? t('pause') : t('play'))}"><span class="w-20 h-20 rounded-full bg-white/90 text-[#0B1D45] grid place-items-center shadow-2xl transition-all duration-300 ${playing ? 'opacity-0 scale-75' : ''}">${ic('play', 'w-9 h-9 ml-1')}</span></button>
    <div class="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/80 to-transparent text-white flex items-center gap-3"><button type="button" class="icon-btn hover:bg-white/15" data-act="mp-toggle" aria-label="${esc(playing ? t('pause') : t('play'))}">${ic(playing ? 'pause' : 'play')}</button><span class="text-[13px] tnum whitespace-nowrap" id="mp-time">${m.type === 'live' ? `${t('liveFor')} ${fmt(liveSec)}` : `${fmt(pos)} / ${m.dur}`}</span><div class="flex-1 h-1.5 rounded-full bg-white/25 overflow-hidden"><div class="h-full bg-ubred transition-[width] duration-1000 ease-linear" id="mp-bar" style="width:${m.type === 'live' ? 100 : (pos / durS) * 100}%"></div></div>${ic('volume-2', 'w-5 h-5 opacity-80')}</div></div><div class="px-5 sm:px-7 py-6">${head}</div>`;
  const stagePhoto = () => `<div class="relative bg-black sm:rounded-t-[24px] overflow-hidden"><div class="scene aspect-[16/10]" id="ph-main">${Scene(photoKey(ph))}</div>${closeBtnImg()}
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

/* ================= Documents, tenders, events ================= */
function openDoc(type, i) {
  const d = DOCS[type][i]; if (!d) return;
  if (/^https?:\/\//.test(d.url || '')) { window.open(d.url, '_blank', 'noopener'); return; }   // admin-аас оруулсан баримтын холбоос
  const date = addDays(today(), -d.ago);
  if (type === 'tender') { openTender(d, date); return; }
  const res = type === 'res';
  const hdr = res ? L(['НИЙСЛЭЛИЙН ИРГЭДИЙН ТӨЛӨӨЛӨГЧДИЙН ХУРЛЫН ТОГТООЛ', 'RESOLUTION OF THE CITY COUNCIL']) : L(['НИЙСЛЭЛИЙН ЗАСАГ ДАРГЫН ЗАХИРАМЖ', 'ORDER OF THE GOVERNOR OF THE CAPITAL CITY']);
  const clauses = [
    [res ? 'Нийслэлийн хөгжлийн бодлого, иргэдийн саналыг үндэслэн ТОГТООХ нь:' : 'Нийслэлийн хөгжлийн бодлого, иргэдийн саналыг үндэслэн ЗАХИРАМЖЛАХ нь:', res ? 'Based on the city development policy and residents\u2019 input, IT IS RESOLVED:' : 'Based on the city development policy and residents\u2019 input, IT IS ORDERED:'],
    ['1. Энэхүү шийдвэрийн хэрэгжилтийг хангаж ажиллахыг холбогдох газар, агентлагуудад даалгасугай.', '1. The relevant departments and agencies shall implement this decision.'],
    ['2. Хэрэгжилтийн явцыг улирал бүр иргэдэд нээлттэй мэдээлэхийг Тамгын газарт үүрэг болгосугай.', '2. City Hall shall report progress to residents every quarter.'],
    ['3. Энэхүү шийдвэрийг нийтэлсэн өдрөөс эхлэн дагаж мөрдсүгэй.', '3. This decision takes effect on the day of publication.'],
  ];
  openModal({ size: 'lg', label: d.no, render: () => `${modalHead(d.no, fDate(date), res ? 'scroll-text' : 'stamp', 'bg-soft text-ubblue')}<div class="p-4 sm:p-8 bg-soft"><div class="paper rounded-lg mx-auto max-w-[560px] px-6 sm:px-12 py-10 text-[13.5px] leading-relaxed">
    <div class="flex justify-center">${logoMark('w-12 h-12')}</div><p class="mt-4 text-center font-extrabold tracking-wide text-[12.5px] text-[#111827]">${hdr}</p>
    <div class="mt-5 flex justify-between gap-3 text-[12px] text-gray-500"><span>${fDate(date)}</span><span class="font-bold text-gray-800 tnum">${esc(d.no)}</span><span>${L(['Улаанбаатар хот', 'Ulaanbaatar'])}</span></div>
    <p class="mt-6 text-center font-bold text-[15px] leading-snug text-[#111827]">${esc(L(d.t))}</p>
    <div class="mt-6 space-y-3 text-gray-700">${clauses.map((c) => `<p>${esc(L(c))}</p>`).join('')}</div>
    <div class="mt-5 space-y-2" aria-hidden="true">${[92, 100, 84, 96, 60].map((w) => `<span class="block h-2 rounded bg-gray-200" style="width:${w}%"></span>`).join('')}</div>
    <div class="mt-10 flex items-end justify-between text-[12px] text-gray-500"><span>${res ? L(['ХУРЛЫН ДАРГА', 'CHAIR OF THE COUNCIL']) : L(['ЗАСАГ ДАРГА', 'GOVERNOR'])}</span><span class="w-28 border-b border-gray-400"></span></div></div>
    <p class="mt-4 text-center text-[13px] text-muted">${t('docNote')}</p></div>` });
}
function openTender(d, date) {
  const cur = d.st === 'open' ? 1 : d.st === 'eval' ? 2 : 3;
  const steps = [[t('tl_pub'), fDate(date)], [t('tl_bids'), fDate(addDays(today(), d.st === 'open' ? d.left : -Math.max(1, d.ago - 21)))], [t('tl_eval'), ''], [t('tl_contract'), '']];
  openModal({ size: 'md', label: L(d.t), render: () => `${modalHead(L(d.t), esc(d.no), 'gavel', 'bg-soft text-ubblue')}<div class="px-5 sm:px-7 py-6">
    <div class="grid grid-cols-2 gap-3 text-[13.5px]"><div class="rounded-xl bg-soft p-3"><p class="text-muted">${t('budget')}</p><b class="tnum">${mln(d.bud)}</b></div><div class="rounded-xl bg-soft p-3"><p class="text-muted mb-1">${L(['Төлөв', 'Status'])}</p>${tenderBadge(d)}</div></div>
    <ol class="mt-6">${steps.map((s, i) => `<li class="flex gap-3 relative ${i < 3 ? 'pb-5' : ''}">${i < 3 ? `<span class="absolute left-[11px] top-7 bottom-0 w-0.5 ${i < cur ? 'bg-ubgreen' : 'bg-line'}"></span>` : ''}<span class="relative w-6 h-6 rounded-full grid place-items-center shrink-0 ${i < cur ? 'bg-ubgreen text-white' : i === cur ? 'bg-ubblue text-white' : 'bg-line'}">${i < cur ? ic('check', 'w-3.5 h-3.5', 3) : ''}</span><span><b class="block text-[14.5px]">${s[0]}</b>${s[1] ? `<span class="text-[13px] text-muted">${s[1]}</span>` : ''}</span></li>`).join('')}</ol>
    ${d.st === 'open' ? `<button type="button" class="btn btn-blue w-full mt-2" data-act="bid">${ic('file-signature', 'w-[18px] h-[18px]')}${t('bidBtn')}</button>` : ''}</div>` });
}
function openEvent(id) {
  const e = EVENTS.find((x) => x.id === id); if (!e) return;
  const d = evDate(e.w), c = ECAT[e.c];
  openModal({ size: 'md', label: L(e.t), render: () => { const saved = S.evSaved.includes(id);
    return `<div class="relative"><div class="scene aspect-[16/8] sm:rounded-t-[24px]">${Scene(e.img)}</div>${closeBtnImg()}</div><div class="px-5 sm:px-7 py-6"><span class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><h2 class="mt-2 text-[24px] font-extrabold leading-tight">${esc(L(e.t))}</h2>
    <div class="mt-4 grid gap-2.5 text-[14.5px]"><p class="flex items-center gap-3">${ic('calendar-days', 'w-5 h-5 text-muted')}${fDate(d, true)}, ${esc(e.tm)}</p><p class="flex items-center gap-3">${ic('map-pin', 'w-5 h-5 text-muted')}${esc(L(e.v))}</p><p class="flex items-center gap-3">${ic('ticket', 'w-5 h-5 text-muted')}${e.price ? money(e.price) : t('free')}</p></div>
    <p class="mt-5 text-[15px] leading-relaxed text-ink/85">${esc(L(e.desc && (e.desc[0] || e.desc[1]) ? e.desc : (EVDESC[e.c] || ['', ''])))}</p>
    <div class="mt-6 flex flex-wrap gap-2"><button type="button" class="btn ${saved ? 'btn-ghost' : 'btn-ink'}" data-act="ev-save" data-id="${id}" aria-pressed="${saved}">${ic(saved ? 'bookmark-check' : 'bookmark', 'w-[18px] h-[18px]')}${saved ? t('saved') : t('save')}</button><button type="button" class="btn btn-ghost" data-act="ev-onmap" data-id="${id}">${ic('map', 'w-[18px] h-[18px]')}${t('showOnMap')}</button></div></div>`; } });
}
function toggleSave(id) {
  const has = S.evSaved.includes(id);
  S.evSaved = has ? S.evSaved.filter((x) => x !== id) : S.evSaved.concat(id); store.set('evSaved', S.evSaved);
  toast(has ? t('unsavedT') : t('savedT'), has ? 'bookmark' : 'bookmark-check');
  repaintEvents(); if (MODAL) paintModal(true); if (S.route === 'my') renderMy();
}

/* ================= My page ================= */
function reqCard(r) {
  const c = RCAT[r.cat] || RCAT.other, title = r.ttl ? L(r.ttl) : L(c.t), stc = ['b-mute', 'b-blue', 'b-off', 'b-on'][r.st];
  return `<div class="card p-5"><div class="flex flex-wrap items-start justify-between gap-3"><div class="flex items-start gap-3 min-w-0"><span class="w-11 h-11 rounded-xl bg-soft grid place-items-center text-ubred shrink-0">${ic(c.i, 'w-5 h-5')}</span><div class="min-w-0"><b class="block text-[16px] leading-snug">${esc(title)}</b><span class="block text-[13px] text-muted mt-0.5">${esc(Lf(r.place))}</span><span class="block text-[12.5px] text-muted tnum mt-0.5">${r.id}, ${r.ago ? fDate(addDays(today(), -r.ago)) : t('todayRange')}</span></div></div><span class="badge ${stc}">${t('s' + r.st)}</span></div>
    <ol class="mt-5 grid grid-cols-4 gap-1.5">${[0, 1, 2, 3].map((i) => `<li><span class="block h-1.5 rounded-full ${i <= r.st ? (r.st === 3 ? 'bg-ubgreen' : 'bg-ubblue') : 'bg-line'}"></span><span class="block mt-2 text-[11.5px] sm:text-[12px] leading-tight ${i === r.st ? 'font-bold' : 'text-muted'}">${t('s' + i)}</span></li>`).join('')}</ol>
    <p class="mt-4 text-[13.5px] text-muted flex gap-2">${ic('info', 'w-4 h-4 mt-0.5')}<span>${esc(Lf(r.note))} ${t('reqAgency')}: ${esc(L(r.ag))}.</span></p></div>`;
}
function myPanel() {
  if (S.myTab === 'req') return `<div class="flex items-center justify-between gap-3 mb-5"><h2 class="font-extrabold text-[19px]">${t('my_req')}</h2><button type="button" class="btn btn-sm btn-red" data-act="report">${ic('plus', 'w-4 h-4')}${t('newReq')}</button></div>${S.requests.length ? `<div class="space-y-3">${S.requests.map(reqCard).join('')}</div>` : `<div class="card p-10 text-center text-muted">${t('noReq')}</div>`}`;
  if (S.myTab === 'kh') return `<div class="grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="card p-5"><p class="text-[13px] text-muted">${esc(L(ME.addr))}</p><div class="mt-4 flex items-center gap-3"><span class="w-12 h-12 rounded-2xl bg-ubblue/10 text-ubblue grid place-items-center">${ic('user-round', 'w-6 h-6')}</span><div><p class="text-[13px] text-muted">${t('khGov')}</p><b>${esc(L(KHOROO.gov))}</b></div></div>
      <dl class="mt-5 grid grid-cols-2 gap-3 text-[13.5px]"><div class="rounded-xl bg-soft p-3"><dt class="text-muted">${t('residents')}</dt><dd class="font-extrabold tnum text-[18px]">${num(KHOROO.res)}</dd></div><div class="rounded-xl bg-soft p-3"><dt class="text-muted">${t('households')}</dt><dd class="font-extrabold tnum text-[18px]">${num(KHOROO.hh)}</dd></div><div class="rounded-xl bg-soft p-3 col-span-2"><dt class="text-muted">${t('hours')}</dt><dd class="font-bold">${esc(L(KHOROO.hours))}</dd></div></dl></div>
    <div class="card p-5"><h3 class="font-bold">${t('nearby')}</h3><ul class="mt-3 space-y-1">${KHOROO.near.map(([n, i, dd]) => `<li class="flex items-center gap-3 p-2 rounded-xl"><span class="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred shrink-0">${ic(i, 'w-[18px] h-[18px]')}</span><span class="flex-1 text-[14px] font-semibold leading-snug">${esc(L(n))}</span><span class="text-[13px] text-muted tnum">${EN() ? dd.replace('м', 'm') : dd}</span></li>`).join('')}</ul></div>
    <div class="card p-5"><h3 class="font-bold">${t('khNotices')}</h3><ul class="mt-3 space-y-3">${KHOROO.notices.map((n) => `<li class="flex gap-3 text-[14px] leading-snug"><span class="w-2 h-2 rounded-full bg-ubyellow mt-1.5 shrink-0"></span>${esc(Lf(n))}</li>`).join('')}</ul></div></div>`;
  const notes = [['wind', ['Өнөө орой 20:00 цагаас агаарын чанар муудах төлөвтэй.', 'Air quality is expected to worsen after 20:00 tonight.'], 12, 'data-act="go" data-sec="data" data-hl="aqi"'], ['list-checks', ['UB-2026-48127 дугаартай хүсэлт тань «Явцад байна» төлөвт шилжлээ.', 'Request UB-2026-48127 is now in progress.'], 95, 'data-act="tab" data-tabs="my" data-v="req"'], ['megaphone', KHOROO.notices[0], 300, 'data-act="tab" data-tabs="my" data-v="kh"'], ['vote', ['Хорооны хөгжлийн сангийн санал асуулга нээгдлээ.', 'The khoroo development fund poll is open.'], 1500, 'data-act="vote"']];
  const saved = EVENTS.filter((e) => S.evSaved.includes(e.id));
  return `<div class="grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="lg:col-span-2 space-y-5">
    <div class="card p-5"><h3 class="font-bold flex items-center gap-2">${ic('bell', 'w-[18px] h-[18px]')}${t('notifs')}</h3><ul class="mt-2 divide-y divide-line">${notes.map(([i, tx, a, act]) => `<li><button type="button" class="w-full flex items-start gap-3 py-3 text-left group" ${act}><span class="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred shrink-0">${ic(i, 'w-[18px] h-[18px]')}</span><span class="flex-1"><span class="block text-[14.5px] font-semibold leading-snug group-hover:text-ubblue transition-colors">${esc(Lf(tx))}</span><span class="block text-[12.5px] text-muted mt-0.5">${ago(a)}</span></span>${ic('chevron-right', 'w-4 h-4 text-muted mt-2')}</button></li>`).join('')}</ul></div>
    <div class="card p-5"><h3 class="font-bold flex items-center gap-2">${ic('wallet', 'w-[18px] h-[18px]')}${t('payments')}</h3><ul class="mt-2 divide-y divide-line">${PAYMENTS.map((p) => { const paid = p.paid || S.paid.includes(p.id); return `<li class="py-3 flex items-center justify-between gap-3"><span><b class="block text-[14.5px]">${esc(L(p.t))}</b><span class="text-[13px] ${paid ? 'text-greenink' : 'text-muted'}">${paid ? t('paid') : t('due', { d: fDate(endOfMonth()) })}</span></span><span class="flex items-center gap-3"><b class="tnum">${money(p.amt)}</b>${paid ? ic('circle-check', 'w-5 h-5 text-ubgreen') : `<button type="button" class="btn btn-sm btn-blue" data-act="pay" data-id="${p.id}">${t('pay')}</button>`}</span></li>`; }).join('')}</ul></div></div>
    <div class="card p-5 self-start"><h3 class="font-bold flex items-center gap-2">${ic('bookmark', 'w-[18px] h-[18px]')}${t('savedItems')}</h3>${saved.length ? `<div class="mt-3 space-y-2">${saved.map((e) => evRow(e)).join('')}</div>` : `<p class="mt-3 text-[14px] text-muted leading-relaxed">${t('noSaved')}</p>`}</div></div>`;
}
function renderMy() {
  if (!S.user) return;
  const open = S.requests.filter((r) => r.st < 3).length, due = PAYMENTS.filter((p) => !p.paid && !S.paid.includes(p.id)).length;
  $('#view-my').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 view-in">
    <button type="button" class="text-[14px] font-semibold text-muted hover:text-ink inline-flex items-center gap-1.5" data-act="home">${ic('arrow-left', 'w-4 h-4')}${t('home')}</button>
    <div class="mt-4 panel overflow-hidden"><div class="bg-navy text-white p-6 sm:p-8"><div class="flex flex-col md:flex-row md:items-center gap-5">
      <span class="w-16 h-16 rounded-2xl bg-ubred grid place-items-center text-[22px] font-extrabold shrink-0">${esc(L(ME.ini))}</span>
      <div class="flex-1 min-w-0"><h1 class="text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight">${t('hello', { n: esc(L(ME.n)) })}</h1><p class="text-white/65 mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[14px]"><span class="inline-flex items-center gap-1.5">${ic('map-pin', 'w-4 h-4')}${esc(L(ME.addr))}</span><span class="inline-flex items-center gap-1.5 tnum">${ic('id-card', 'w-4 h-4')}${ME.reg}</span></p></div>
      <div class="grid grid-cols-3 gap-2 md:w-[360px]">${[[open, t('myStats1')], [2, t('myStats2')], [due, t('myStats3')]].map(([v, l]) => `<div class="rounded-xl bg-white/[.08] border border-white/10 p-3"><p class="text-[24px] font-extrabold tnum leading-none">${v}</p><p class="text-[12px] text-white/60 mt-1.5 leading-tight">${l}</p></div>`).join('')}</div></div></div>
    <div class="px-4 sm:px-8 border-b border-line">${tabs('my', [['over', t('my_over'), 'layout-dashboard'], ['req', t('my_req'), 'list-checks'], ['kh', t('my_kh'), 'house']], S.myTab, { line: 1 })}</div>
    <div id="my-panel" class="p-4 sm:p-8">${myPanel()}</div></div></div>`;
  initTabs($('#view-my'));
}
function setMyTab(v) {
  if (v === S.myTab) return;
  const order = ['over', 'req', 'kh'], dir = order.indexOf(v) > order.indexOf(S.myTab) ? 1 : -1;
  S.myTab = v; selectTab('my', v); swap($('#my-panel'), myPanel(), dir);
}

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
  if (m.role === 'user') return `<div class="flex justify-end"><div class="max-w-[85%] rounded-2xl rounded-tr-md bg-ubblue text-white px-3.5 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">${esc(m.text)}</div></div>`;
  const body = m.text ? md(m.streaming ? stripTags(m.text) : m.text) : m.streaming ? `<span class="inline-flex items-center gap-2 text-muted text-[13.5px]"><span class="typing"><span></span><span></span><span></span></span>${t('thinking')}</span>` : '';
  return `<div class="flex gap-2.5" data-msg="${i}">${botAvatar()}<div class="max-w-[85%] min-w-0"><div class="rounded-2xl rounded-tl-md bg-card border border-line px-3.5 py-2.5 text-[14.5px] leading-relaxed break-words ${body ? '' : 'hidden'}" data-body>${body}</div>${m.err ? `<p class="mt-1.5 text-[12.5px] text-ubred">${esc(m.err)}</p>` : ''}${m.acts && m.acts.length ? `<div class="mt-2 flex flex-wrap gap-1.5">${m.acts.map((a) => `<button type="button" class="chip !h-8 !text-[13px] !px-3 !text-ubblue" data-act="chat-do" data-v="${esc(a)}">${ic(actIcon(a), 'w-4 h-4')}${esc(actLabel(a))}</button>`).join('')}</div>` : ''}</div></div>`;
}
function chatMsgs() {
  const greet = `<div class="flex gap-2.5">${botAvatar()}<div class="max-w-[88%]"><div class="rounded-2xl rounded-tl-md bg-card border border-line px-3.5 py-2.5 text-[14.5px] leading-relaxed">${esc(t('chatGreet'))}</div><div class="mt-2 flex flex-wrap gap-1.5">${CHAT_CHIPS.map((c) => `<button type="button" class="chip !h-8 !text-[13px] !px-3" data-act="chat-ask" data-v="${esc(L(c))}">${esc(L(c))}</button>`).join('')}</div></div></div>`;
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
  const cols = ['#D81E34', '#1D5BFF', '#FFC524', '#10A36A'];
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
  const avg = Math.round(PROJECTS.reduce((a, p) => a + p.p, 0) / PROJECTS.length);
  return `You are "AI туслах", the assistant on ulaanbaatar.mn, the Ulaanbaatar city portal. This is a design concept, so all data below is illustrative.
Reply in ${lang} unless the user clearly writes in another language; then use theirs.
Keep answers short: 2-5 sentences, or up to 5 bullet lines starting with "- ". No headings, no tables, no emojis.
Use only the facts below. If something is not covered, say you don't have that information and suggest the 1200 citizen hotline (24/7). Never invent phone numbers, prices, laws, names or dates.
If anyone may be in danger, tell them to call 101 (fire), 102 (police) or 103 (ambulance) first.
When one page feature would help, end with exactly one action tag on its own line, chosen from: [[report]] [[vote]] [[services]] [[data]] [[events]] [[transparency]] [[login]] [[situation:ID]] (ID is one of birth, marriage, home, business, retire, move).

Facts (Ulaanbaatar time ${clock()}, ${today().getMonth() + 1}-р сарын ${today().getDate()}):
- Weather ${S.temp}°C, cloudy, wind 4 m/s. Air quality AQI ${S.aqi} (moderate), PM2.5 about ${pm25()} µg/m³; yellow air alert from 20:00 tonight. Advice: children, older adults and people with breathing conditions should limit long outdoor activity.
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

/* ================= Global wiring ================= */
function onTab(name, v) {
  if (name === 'hub') setHub(v); else if (name === 'svc') setSvcTab(v); else if (name === 'evview') setEvView(v); else if (name === 'tr') setTr(v);
  else if (name === 'my') { if (S.route !== 'my') { S.myTab = v; setRoute('my'); } else setMyTab(v); }
  else if (name === 'dan' && MS.danTab) MS.danTab(v); else if (name === 'vote' && MS.vTab) MS.vTab(v);
}
async function copyLink(id) {
  const url = newsUrl(NEWS_BY[id] || { id });
  try { await navigator.clipboard.writeText(url); toast(t('copied'), 'link'); } catch (e) { toast(url, 'link'); }
}
document.addEventListener('click', (e) => {
  const um = $('[data-usermenu]'); if (um && !e.target.closest('[data-userwrap]')) um.classList.add('hidden');
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, d = el.dataset;
  switch (a) {
    case 'home': if (S.route !== 'home') setRoute('home'); closeMenu(); setHash(''); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); break;
    case 'lang': setLang(d.v); break;
    case 'a11y': { S.a11y = !S.a11y; store.set('a11y', S.a11y); applyA11y(); renderHeader(); renderTicker(); setActiveNav(currentSec); const mb = $('#mmenu [data-act="a11y"]'); if (mb) mb.outerHTML = a11yBtn(); toast(S.a11y ? t('a11yOn') : t('a11yOff'), 'eye'); setTimeout(() => initTabs(), 60); break; }
    case 'theme': { S.theme = S.theme === 'dark' ? 'light' : 'dark'; store.set('theme', S.theme);
      const br = el.getBoundingClientRect(), origin = { x: br.left + br.width / 2, y: br.top + br.height / 2 };
      applyTheme(true, () => { renderHeader(); setActiveNav(currentSec); const n = $('#navbar'), s = $('#nav-sentinel'); if (n && s) n.classList.toggle('stuck', s.getBoundingClientRect().top < 0); const mb = $('#mmenu [data-act="theme"]'); if (mb) mb.outerHTML = themeBtn(false); $$('[data-act="theme"] svg').forEach((ico) => ico.classList.add('theme-pop')); }, origin);
      break; }
    case 'search': openSearch(); break;
    case 'sq': SQ.q = d.v; SQ.idx = 0; $('#sq').value = d.v; sqRender(); $('#sq').focus(); break;
    case 'sq-scope': SQ.scope = d.v; SQ.idx = 0; sqRender(); $('#sq').focus(); break;
    case 'sq-clear': SQ.q = ''; SQ.idx = 0; $('#sq').value = ''; sqRender(); $('#sq').focus(); break;
    case 'sq-recent-del': store.set('recentQ', sqRecent().filter((x) => x !== d.v)); sqRender(); break;
    case 'sq-ai': { const q = SQ.q.trim(); sqAddRecent(q); closeModal(true); toggleChat(true); if (q) setTimeout(() => chatSend(q), 420); break; }
    case 'sgo': searchGo(d.type, d.id); break;
    case 'menu': openMenu(); break;
    case 'menu-close': closeMenu(); break;
    case 'acc': { const p = $(`[data-acc="${d.i}"]`), open = el.getAttribute('aria-expanded') === 'true'; p.classList.toggle('hidden', open); el.setAttribute('aria-expanded', String(!open)); el.querySelector('svg').style.transform = open ? '' : 'rotate(180deg)'; break; }
    case 'login': closeMenu(); openLogin(); break;
    case 'logout': S.user = null; store.set('user', null); renderHeader(); setActiveNav(currentSec); if (S.route === 'my') setRoute('home'); toast(t('loggedOut'), 'log-out'); break;
    case 'user-menu': { const m = $('[data-usermenu]'); m.classList.toggle('hidden'); el.setAttribute('aria-expanded', String(!m.classList.contains('hidden'))); break; }
    case 'my': closeMenu(); $('[data-usermenu]') && $('[data-usermenu]').classList.add('hidden'); setRoute('my'); break;
    case 'go': go(Object.assign({}, d)); break;
    case 'report': closeMenu(); if (MODAL) closeModal(true); openReport(); break;
    case 'vote': closeMenu(); if (MODAL) closeModal(true); openVote(d.tab || 'poll', { topic: d.topic, gov: d.gov }); break;
    case 'ticker-close': { const tk = $('#ticker'); if (!reduced && tk.animate) tk.animate([{ height: tk.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'ease-in' }).finished.then(() => { S.tickerOn = false; renderTicker(); }); else { S.tickerOn = false; renderTicker(); } break; }
    case 'alert': openAlert(d.id); break;
    case 'notify': closeModal(); toast(t('notifyOn'), 'bell-ring'); break;
    case 'news': openNews(d.id); break;
    case 'news-back': newsBack(); break;
    case 'ext-link': if (/^https?:\/\//.test(d.href || '')) { closeMenu(); window.open(d.href, '_blank', 'noopener'); } break;
    case 'nfb': S.newsFb = true; { const b = $('#nfb'); if (b) b.outerHTML = newsFbHTML(); } toast(t('thanks'), 'heart'); break;
    case 'print': window.print(); break;
    case 'gov': openGov(+d.i); break;
    case 'fb': if (MS.fb) MS.fb(); break;
    case 'copy-link': copyLink(d.id); break;
    case 'tab': onTab(d.tabs, d.v); break;
    case 'news-cat': setNewsCat(d.v); break;
    case 'svc': openService(d.id); break;
    case 'svc-apply': svcApply(d.id); break;
    case 'svc-book': { const s = ALL_SVC.find((x) => x.id === d.id); openBooking({ t: s.t }); break; }
    case 'sys-open': toast(t('sysDemo'), 'external-link'); break;
    case 'sit': setSit(d.v); break;
    case 'sit-toggle': toggleStep(+d.i); break;
    case 'sit-reset': { const prev = (S.sitDone[S.sit] || []).slice(); S.sitDone[S.sit] = []; store.set('sitDone', S.sitDone); paintSit(prev); break; }
    case 'sit-apply': stepApply(+d.i); break;
    case 'media-f': setMediaF(d.v); break;
    case 'media-scroll': { const tr = $('#media-track'); tr.scrollBy({ left: +d.d * tr.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' }); break; }
    case 'media-open': openMedia(+d.i); break;
    case 'mp-toggle': if (MS.mpToggle) MS.mpToggle(); break;
    case 'ph': if (MS.ph) MS.ph(+d.d); break;
    case 'ph-go': if (MS.phGo) MS.phGo(+d.k); break;
    case 'proj-st': setProjSt(d.v); break;
    case 'proj': selectProject(d.id, true); break;
    case 'proj-close': S.projSel = null; selectProject(null, false); break;
    case 'ev-f': setEvF(d.v); break;
    case 'cal-day': S.calDay = d.k; $('#ev-panel').innerHTML = calHTML(); break;
    case 'cal-m': { let [y, m] = S.calYM; m += +d.d; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } S.calYM = [y, m]; $('#ev-panel').innerHTML = calHTML(); break; }
    case 'ev-open': openEvent(d.id); break;
    case 'ev-save': toggleSave(d.id); break;
    case 'ev-onmap': closeModal(true); S.evSel = d.id; scrollToSec('events'); if (S.evView !== 'map') { S.evView = 'list'; setEvView('map'); setTimeout(() => selectEv(d.id, true), 520); } else selectEv(d.id, true); break;
    case 'ev-mapsel': selectEv(d.id, true); break;
    case 'ev-mapclose': selectEv(null, false); break;
    case 'doc': openDoc(d.type, +d.i); break;
    case 'bid': { const fin = () => { closeModal(); toast(t('bidSent'), 'file-signature'); }; if (!S.user) openLogin(fin); else fin(); break; }
    case 'pay': S.paid.push(d.id); store.set('paid', S.paid); renderMy(); toast(t('paidT'), 'wallet'); break;
    case 'modal-close': closeModal(); break;
    case 'bk-day': MS.bkDay(+d.i); break;
    case 'bk-slot': MS.bkSlot(+d.j); break;
    case 'bk-ok': MS.bkOk(); break;
    case 'dan-send': MS.danSend(); break;
    case 'dan-ok': MS.danOk(); break;
    case 'r-cat': MS.rCat(d.v); break;
    case 'r-next': MS.rNext(); break;
    case 'r-back': MS.rBack(); break;
    case 'r-locate': MS.rLocate(); break;
    case 'r-track': MS.rTrack(); break;
    case 'v-pick': MS.vPick(+d.i); break;
    case 'v-cast': MS.vCast(); break;
    case 'v-topic': MS.vTopic(d.v); break;
    case 'v-send': MS.vSend(); break;
    case 'chat-toggle': toggleChat(); break;
    case 'chat-ask': chatSend(d.v); break;
    case 'chat-do': runAct(d.v); break;
    case 'chat-stop': if (Chat.ctl) Chat.ctl.abort(); break;
    case 'chat-reset': if (Chat.ctl) Chat.ctl.abort(); S.chat = []; Chat.busy = false; paintChat(); break;
    default: break;
  }
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.input === 'svcQ') { S.svcQ = el.value; $('#svc-grid').innerHTML = svcGrid(); }
  else if (el.dataset.input === 'trQ') { S.trQ = el.value; $('#tr-panel').innerHTML = trRows(true); }   // хайх үед дахин хөдөлгөөнгүй
  else if (el.id === 'chat-in') autoGrow(el);
});
document.addEventListener('submit', (e) => {
  const f = e.target; e.preventDefault();
  if (f.dataset.form === 'chat') chatSend($('#chat-in').value);
  else if (f.dataset.form === 'digest') { const inp = f.querySelector('input'), msg = $('[data-digest-msg]'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { msg.textContent = t('badEmail'); inp.focus(); return; } if (CMS.mode === 'api') { apiCall('/submit/digest', { method: 'POST', body: { email: inp.value.trim() } }).then(() => { msg.textContent = t('subscribed'); inp.value = ''; }).catch((er) => { msg.textContent = submitErr(er); }); return; } msg.textContent = t('subscribed'); inp.value = ''; }
  else if (f.dataset.form === 'adm-login') admLogin(f);
});
document.addEventListener('keydown', (e) => {
  if (e.target.id === 'chat-in' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); chatSend(e.target.value); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
  if (e.key === 'Escape') { if (MODAL) { closeModal(); return; } if ($('#mmenu')) { closeMenu(); return; } if (S.chatOpen) { toggleChat(false); return; } const nav = $('#navbar'); if (nav && nav._close) nav._close(); return; }
  if (MODAL && $('#sq') && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key) && !e.isComposing) {
    if (e.key === 'Enter') { const x = SQ.items[SQ.idx]; if (x) { e.preventDefault(); searchGo(x.type, x.id); } else if (SQ.q.trim() && e.target.id === 'sq') { e.preventDefault(); $('[data-act="sq-ai"]') && $('[data-act="sq-ai"]').click(); } return; }
    if (SQ.items.length) { e.preventDefault(); sqMove(e.key === 'ArrowDown' ? 1 : -1); }
    return;
  }
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.matches && e.target.matches('[role="tab"]')) {
    const btns = $$('[role="tab"]', e.target.closest('[data-tablist]')), i = btns.indexOf(e.target), n = btns[(i + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
    e.preventDefault(); n.focus(); n.click(); return;
  }
  if (MS && MS.ph && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(e.target.matches && e.target.matches('input, textarea'))) MS.ph(e.key === 'ArrowRight' ? 1 : -1);
});

/* ================= Live data ================= */
function pushBreaking() {
  if (S.incoming >= INCOMING.length) return;
  const n = INCOMING[S.incoming++];
  S.breaking.forEach((b) => { b.fresh = false; });
  S.breaking.unshift({ id: n.id, ts: ubNow(), fresh: true });
  const l = $('#brk-list'); if (l) { l.innerHTML = breakingHTML(n.id); l.scrollTop = 0; }
}
/* data-roll-тэй (Хотын өгөгдөл) бол цифр эргэлдэнэ, бусад нь шууд солигдоно */
function setLive(key, v) { $$(`[data-live="${key}"]`).forEach((el) => { if (el.hasAttribute('data-roll')) rollTo(el, v); else el.textContent = v; }); }
function startLive() {
  setInterval(() => {
    if (document.hidden) return;
    if (Math.random() < 0.55) S.aqi = Math.max(84, Math.min(91, S.aqi + (Math.random() < 0.5 ? -1 : 1)));
    S.buses = Math.max(1000, Math.min(1052, S.buses + Math.round(Math.random() * 6 - 3)));
    setLive('aqi', S.aqi); setLive('pm25', pm25()); setLive('buses', num(S.buses));
    $$('[data-live="clocks"]').forEach((el) => { el.textContent = clock(true); });
    updAqiChart();
  }, 5000);
  setInterval(() => {
    if (document.hidden) return;
    S.riders += 3 + Math.floor(Math.random() * 12);
    setLive('riders', num(S.riders));
    $$('[data-live="clock"]').forEach((el) => { el.textContent = clock(); });
  }, 1000);
  setInterval(() => { if (!document.hidden) pushBreaking(); }, 22000);
  setInterval(() => { const l = $('#brk-list'); if (l && !document.hidden) l.innerHTML = breakingHTML(); }, 60000);
}

/* ================= Init ================= */
function renderAll() {
  renderHeader(); renderTicker(); renderHero(); renderHub(); renderSits(); renderMedia(); renderProjects(); renderData(); renderEvents(); renderTr(); renderAbout(); renderFooter(); renderRail(); renderBottomBar(); renderChat();
  if (S.route === 'my') renderMy();
  if (S.route === 'news') renderNewsPage();
  initTabs(); setActiveNav(currentSec);
  const n = $('#navbar'), s = $('#nav-sentinel'); if (n && s) n.classList.toggle('stuck', s.getBoundingClientRect().top < 0);
  $('#skip-link').textContent = L(['Үндсэн агуулга руу шилжих', 'Skip to main content']);
  document.documentElement.lang = EN() ? 'en' : 'mn';
  if (S.route !== 'news') document.title = siteTitle();
}
function siteTitle() { return EN() ? 'ulaanbaatar.mn · City portal (concept)' : 'ulaanbaatar.mn · Нийслэлийн портал (концепц)'; }
function setLang(l) {
  if (l === S.lang) return;
  S.lang = l; store.set('lang', l); closeMenu();
  const y = window.scrollY; renderAll(); if (MODAL) paintModal(true); window.scrollTo(0, y);
}
function setupObservers() {
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([en]) => { const n = $('#navbar'); if (n) n.classList.toggle('stuck', !en.isIntersecting && en.boundingClientRect.top < 0); }).observe($('#nav-sentinel'));
  const io = new IntersectionObserver((es) => { es.forEach((en) => { if (en.isIntersecting) { currentSec = en.target.id; if (S.route === 'home') setActiveNav(currentSec); } }); }, { rootMargin: '-40% 0px -55% 0px' });
  ['hero', 'hub', 'situations', 'media', 'projects', 'data', 'events', 'transparency', 'about'].forEach((id) => io.observe(document.getElementById(id)));
}
function showChatTip() {
  if (Chat.seen || S.chatOpen) return;
  const tip = $('#chat-tip'); if (!tip) return;
  tip.classList.remove('hidden'); setTimeout(() => tip.classList.add('hidden'), 7000);
}
function init() {
  applyTheme(false);
  applyA11y();
  S.intro = !reduced;
  const now = ubNow();
  S.breaking = NEWS.filter((n) => n.br).map((n) => ({ id: n.id, ts: n.ts || new Date(now.getTime() - n.ago * 60000) })).sort((a, b) => b.ts - a.ts);
  S.riders = Math.min(940000, Math.max(0, ((now.getHours() - 5) * 60 + now.getMinutes()) * 820));
  if (S.user && !S.user.on) S.user = { on: 1 };
  renderAll();
  setupSkyline();
  initCMS();
  setTimeout(() => { S.intro = false; const h = $('#hero > div'); if (h) h.classList.remove('intro'); }, 2300);
  setupObservers(); startLive(); initChatCapability();
  const h = decodeURIComponent((location.hash || '').slice(1)), nid = urlNewsId();
  const sk = $('#skip-link'); if (sk) sk.addEventListener('click', (e) => { e.preventDefault(); $('#main').focus(); });   // <base href="/"> үед #main нүүр рүү үсрэхгүй
  if (nid) {
    if (PRETTY && h.startsWith('news/')) try { history.replaceState(null, '', newsHref(nid)); } catch (e) { /* ignore */ }   // хуучин #news/<id> холбоос
    if (NEWS_BY[nid]) { S.newsId = nid; setRoute('news'); } else S.pendingNews = nid;   // admin-аас нэмсэн мэдээ: CMS ачаалагдсаны дараа нээнэ (src/cms.js)
  }
  else if (h === 'my' && S.user) setRoute('my');
  else if (h === 'admin' || h.startsWith('admin/')) { admFromHash(h); setRoute('admin'); }
  else if (['hub', 'situations', 'media', 'projects', 'data', 'events', 'transparency', 'about'].includes(h)) setTimeout(() => scrollToSec(h), 450);
  window.addEventListener('resize', debounce(() => initTabs(), 150));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { initTabs(); const nav = $('#navbar'); if (nav && nav._moveInd) setActiveNav(currentSec); });
  setTimeout(showChatTip, 6500);
}
init();
