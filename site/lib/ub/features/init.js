import { setupSkyline } from '../art/skyline.js';
import { closeMenu, renderReact } from '../core/bridge.js';
import { initCMS } from '../core/cms.js';
import { PRETTY, applyA11y, applyTheme, newsHref, queueDockProgress, setActiveNav, urlNewsId } from '../core/header.js';
import { $, reduced, store } from '../core/helpers.js';
import { MODAL, paintModal } from '../core/modal.js';
import { initTabs } from '../core/motion.js';
import { PAGES, PAGE_ONLY, openPage, pgT, scrollToSec, urlPage } from '../core/pages.js';
import { setRoute } from '../core/router.js';
import { EN, L, NEWS_BY, S } from '../core/state.js';
import { ubNow } from '../core/time.js';
import { NEWS } from '../data/news.js';
import { initChatCapability, showChatTip } from './assistant.js';
import { renderMy } from './my-page.js';
import { openAdmin, render404, renderNewsPage, watchHistory } from './news-reader.js';
import { newsProgress } from './season.js';
import { currentSec, debounce, setCurrentSec } from './shared.js';
import { AIR_AT, WX_AT, loadAir, loadWeather, startLive } from './weather.js';
import { wireEvents } from './wiring.js';
/* ================= Init ================= */
export function renderAll() {
  renderReact();   // header, нүүрний хэсгүүд, footer, AI туслах: React (site/app/)
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
export function siteTitle() { return EN() ? 'ulaanbaatar.mn · City portal (concept)' : 'ulaanbaatar.mn · Нийслэлийн портал (концепц)'; }
export function setLang(l) {
  if (l === S.lang) return;
  S.lang = l; store.set('lang', l); closeMenu();
  const y = window.scrollY; renderAll(); if (MODAL) paintModal(true); window.scrollTo(0, y);
}
export function setupObservers() {
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([en]) => { const n = $('#navbar'); if (n) n.classList.toggle('stuck', !en.isIntersecting && en.boundingClientRect.top < 0); }).observe($('#nav-sentinel'));
  const io = new IntersectionObserver((es) => { es.forEach((en) => { if (en.isIntersecting) { setCurrentSec(en.target.id); if (S.route === 'home') setActiveNav(currentSec); } }); }, { rootMargin: '-40% 0px -55% 0px' });
  ['hero', 'hub', 'gov', 'situations', 'media', 'projects', 'data', 'events', 'transparency', 'about'].forEach((id) => io.observe(document.getElementById(id)));
}
export function init() {
  wireEvents(); watchHistory();   // товч, маягт, хөтчийн «Буцах» (features/wiring.js, features/news-reader.js)
  window.addEventListener('scroll', () => {   // цэсний уншилтын зураас, мэдээ уншилтын явц
    queueDockProgress();
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
  setTimeout(() => { S.intro = false; }, 2300);   // нүүрний «орох» хөдөлгөөн (site/app/home/Hero.tsx)
  setupObservers(); startLive(); initChatCapability();
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
