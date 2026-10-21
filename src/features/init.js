/* ================= Init ================= */
function renderAll() {
  renderChrome(); renderTicker(); renderHero(); renderHub(); renderGov(); renderSits(); renderMedia(); renderProjects(); renderData(); renderEvents(); renderTr(); renderAbout(); paintToTop(); if (S.route === 'page') renderPageHero(); renderRail(); renderChat();
  if (S.route === 'my') renderMy();
  if (S.route === 'news') renderNewsPage();
  if (S.route === '404') render404();   // хэл солиход
  initTabs(); setActiveNav(currentSec);
  const n = $('#navbar'), s = $('#nav-sentinel'); if (n && s) n.classList.toggle('stuck', s.getBoundingClientRect().top < 0);
  $('#skip-link').textContent = L(['Үндсэн агуулга руу шилжих', 'Skip to main content']);
  document.documentElement.lang = EN() ? 'en' : 'mn';
  if (S.route === 'page' && PAGES[S.page]) document.title = pgT(PAGES[S.page]) + ' · ulaanbaatar.mn';
  else if (S.route === '404') document.title = L(['Хуудас олдсонгүй', 'Page not found']) + ' · ulaanbaatar.mn';
  else if (S.route !== 'news') document.title = siteTitle();
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
  ['hero', 'hub', 'gov', 'situations', 'media', 'projects', 'data', 'events', 'transparency', 'about'].forEach((id) => io.observe(document.getElementById(id)));
}
function showChatTip() {
  if (Chat.seen || S.chatOpen) return;
  const tip = $('#chat-tip'); if (!tip) return;
  tip.classList.remove('hidden'); setTimeout(() => tip.classList.add('hidden'), 7000);
}
function init() {
  wireEvents(); watchHistory();   // товч, маягт, хөтчийн «Буцах» (features/wiring.js, features/news-reader.js)
  window.addEventListener('scroll', () => {   // цэсний уншилтын зураас, мэдээ уншилтын явц
    if (!dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; dockProgress(); });
    if (S.route === 'news') requestAnimationFrame(newsProgress);
  }, { passive: true });
  applyTheme(false);
  applyA11y();
  S.intro = !reduced;
  const now = ubNow();
  S.breaking = NEWS.filter((n) => n.br).map((n) => ({ id: n.id, ts: n.ts || new Date(now.getTime() - n.ago * 60000) })).sort((a, b) => b.ts - a.ts);
  if (S.user && !S.user.on) S.user = { on: 1 };
  renderAll();
  setupSkyline();
  initCMS();
  setTimeout(() => { S.intro = false; const h = $('#hero > div'); if (h) h.classList.remove('intro'); }, 2300);
  setupObservers(); startLive(); initChatCapability(); setupToTop();
  loadWeather(); loadAir(); setInterval(() => { if (!document.hidden) { loadWeather(); loadAir(); } }, 600e3);
  document.addEventListener('visibilitychange', () => { if (document.hidden) return; if (Date.now() - WX_AT > 600e3) loadWeather(); if (Date.now() - AIR_AT > 600e3) loadAir(); });
  const h = decodeURIComponent((location.hash || '').slice(1)), nid = urlNewsId();
  const sk = $('#skip-link'); if (sk) sk.addEventListener('click', (e) => { e.preventDefault(); $('#main').focus(); });   // <base href="/"> үед #main нүүр рүү үсрэхгүй
  if (document.querySelector('meta[name="ubmn-404"]')) setRoute('404');   // сервер: ийм хуудас/мэдээ алга
  else if (nid) {
    if (PRETTY && h.startsWith('news/')) try { history.replaceState(null, '', newsHref(nid)); } catch (e) { /* ignore */ }   // хуучин #news/<id> холбоос
    if (NEWS_BY[nid]) { S.newsId = nid; setRoute('news'); } else S.pendingNews = nid;   // admin-аас нэмсэн мэдээ: CMS ачаалагдсаны дараа нээнэ (src/core/cms.js)
  }
  else if (urlPage()) { S.page = urlPage(); if (S.page === 'services') S.hub = 'services'; setRoute('page'); }
  else if (h === 'my' && S.user) setRoute('my');
  else if (h === 'admin' || h.startsWith('admin/')) openAdmin(h.slice(6));   // хуучин /#admin холбоос → /admin
  else if (PAGE_ONLY.includes(h)) openPage(h, { sec: h });   // хуучин /#about холбоос
  else if (['hub', 'gov', 'situations', 'media', 'projects', 'data', 'events', 'transparency'].includes(h)) setTimeout(() => scrollToSec(h), 450);
  window.addEventListener('resize', debounce(() => initTabs(), 150));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { initTabs(); const nav = $('#navbar'); if (nav && nav._moveInd) setActiveNav(currentSec); });
  setTimeout(showChatTip, 6500);
}
init();
