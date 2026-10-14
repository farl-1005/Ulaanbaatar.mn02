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
  if (S.route === 'page') { S.pageY = window.scrollY; S.pageFor = S.page; }
  S.newsId = id; S.newsFb = false;
  try { if ((PRETTY ? location.pathname : location.hash) !== newsHref(id)) history.pushState({ ubNews: 1 }, '', newsHref(id)); } catch (e) { /* ignore */ }
  setRoute('news');
}
function newsBack() {
  if (history.state && history.state.ubNews) history.back(); else setRoute('home');
}
window.addEventListener('popstate', () => {
  const id = urlNewsId(), pk = urlPage();
  if (id && NEWS_BY[id]) { S.newsId = id; S.newsFb = false; setRoute('news'); }
  else if (pk) { if (S.route !== 'page' || S.page !== pk) { S.page = pk; if (pk === 'services') S.hub = 'services'; else if (pk === 'news') S.hub = 'news'; setRoute('page'); } }
  else if (/^#admin(\/|$)/.test(location.hash)) { admFromHash(location.hash); if (S.route !== 'admin') setRoute('admin'); else renderAdmin(); }
  else if (PRETTY && !/^\/(index\.html)?$/.test(location.pathname)) { if (S.route !== '404') setRoute('404'); }
  else if (S.route === 'news' || S.route === 'page' || S.route === '404') setRoute('home');
});
/* ---- 404 «Хуудас олдсонгүй»: сервер <meta name="ubmn-404"> гэж тэмдэглэсэн, эсвэл мэдээ олдоогүй үед ---- */
function render404() {
  const links = MENU.map((m) => [pageOf({ sec: m.sec }), m]).filter(([k]) => k);
  $('#view-404').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 view-in"><div class="max-w-[640px] mx-auto text-center">
    <div class="scene mx-auto w-full max-w-[520px] aspect-[16/7] rounded-[22px] overflow-hidden">${Scene('skyline:dusk:44')}</div>
    <p class="mt-8 text-[72px] sm:text-[96px] leading-none font-extrabold tnum tracking-[-0.04em] text-ubred">404</p>
    <h1 class="mt-3 text-[26px] sm:text-[32px] font-extrabold tracking-tight">${L(['Хуудас олдсонгүй', 'Page not found'])}</h1>
    <p class="mt-3 text-muted leading-relaxed">${L(['Таны хайсан хуудас устсан, нэр нь өөрчлөгдсөн эсвэл хаяг буруу бичигдсэн байж магадгүй.', 'The page may have been removed or renamed, or the address may be mistyped.'])}</p>
    <p class="mt-2 text-[13px] text-muted break-all tnum">${esc(decodeURI(location.pathname))}</p>
    <div class="mt-7 flex flex-wrap justify-center gap-2.5"><button type="button" class="btn btn-ink" data-act="home">${ic('house', 'w-[18px] h-[18px]')}${t('home')}</button><button type="button" class="btn btn-ghost" data-act="search">${ic('search', 'w-[18px] h-[18px]')}${L(['Сайтаас хайх', 'Search the site'])}</button></div>
    <div class="mt-10 pt-8 border-t border-line"><p class="text-[13px] font-semibold text-muted">${L(['Эсвэл эндээс эхлээрэй', 'Or start here'])}</p>
      <div class="mt-4 flex flex-wrap justify-center gap-2">${links.map(([k, m]) => `<button type="button" class="chip" data-act="page" data-v="${k}">${menuLabel(m)}</button>`).join('')}</div></div>
  </div></div>`;
}
function newsMins(n) {
  if (n.mins) return n.mins;
  const words = [n.l].concat(n.b || []).map((x) => L(x) || '').join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
function newsFbHTML() {
  return `<div id="nfb" class="mt-10 rounded-[8px] bg-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><b class="block text-[16px]">${t('helpful')}</b><span class="text-[13.5px] text-muted">${L(['Таны санал мэдээллийг сайжруулахад тусална.', 'Your answer helps us improve.'])}</span></div>
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
  <div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 view-in">
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


    <div class="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-10 xl:gap-12">
      <article id="nbody" class="min-w-0 w-full max-w-[760px] mx-auto lg:max-w-none lg:mx-0">
        ${enOnlyMn ? `<p class="mb-6 rounded-xl bg-soft px-4 py-3 text-[14px] text-muted flex gap-2.5">${ic('languages', 'w-5 h-5 shrink-0')}<span>The full article is published in Mongolian only.${n.sumEn && n.sumEn.length ? ' Below is an English summary.' : ''} <button type="button" class="font-semibold text-ink underline underline-offset-2" data-act="lang" data-v="mn">Read in Mongolian</button></span></p>` : ''}
        <div class="news-paper">
        ${body}
        ${newsAction(n)}
        ${n.d ? `<div class="mt-8 rounded-[8px] border border-line p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><p class="flex gap-3 text-[14px] text-muted leading-relaxed">${ic('info', 'w-5 h-5 shrink-0')}<span>${n.live ? L(['Эх сурвалж: Нийслэлийн Засаг даргын Тамгын газар, ulaanbaatar.mn', "Source: Capital City Governor's Office, ulaanbaatar.mn"]) : t('srcNote')}</span></p><a class="btn btn-sm btn-ghost shrink-0" href="${NEWS_SRC}${n.id.slice(1)}" target="_blank" rel="noopener">${ic('external-link', 'w-4 h-4')}${t('srcLink')}</a></div>` : ''}
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
        <div class="rounded-[8px] bg-navy text-white p-5"><span class="w-10 h-10 rounded-xl bg-white/10 grid place-items-center">${ic('message-square-warning', 'w-5 h-5')}</span><b class="block mt-3 text-[16px]">${L(['Асуудал анзаарсан уу?', 'Spotted a problem?'])}</b><p class="mt-1 text-[13.5px] text-white/70 leading-relaxed">${L(['Хотод тулгамдсан асуудлыг шууд мэдээлж, явцыг нь хянаарай.', 'Report a city issue and track it to resolution.'])}</p><button type="button" class="btn btn-red btn-sm mt-4" data-act="report">${ic('plus', 'w-4 h-4')}${L(['Мэдээлэх', 'Report'])}</button></div>
      </aside>
    </div>

    ${rel.length ? `<section class="mt-16 pt-10 border-t border-line"><div class="flex items-end justify-between gap-4"><h2 class="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.02em]">${t('related')}</h2><button type="button" class="btn btn-sm btn-ghost" data-act="go" data-sec="hub" data-hub="news">${L(['Бүх мэдээ', 'All news'])}${ic('arrow-right', 'w-4 h-4')}</button></div><div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${rel.map((x) => newsCard(x, false)).join('')}</div></section>` : ''}
  </div>`;
  newsProgress();
  renderSeason(true);
}
