import { renderReact } from './bridge.js';
import { PRETTY, setActiveNav, setHash } from './header.js';
import { $ } from './helpers.js';
import { initTabs } from './motion.js';
import { PAGES, pageHref, pageView, pgT } from './pages.js';
import { L, S } from './state.js';
import { openLogin } from '../features/dan-login.js';
import { siteTitle } from '../features/init.js';
import { renderMy } from '../features/my-page.js';
import { render404, renderNewsPage } from '../features/news-reader.js';
import { renderSeason } from '../features/season.js';
/* ================= Routing & scroll ================= */
export function setRoute(r) {
  if (r === 'my' && !S.user) { openLogin(() => setRoute('my')); return; }
  const was = S.route; S.route = r;
  $('#view-home').hidden = r !== 'home' && r !== 'page'; $('#view-my').hidden = r !== 'my'; $('#view-news').hidden = r !== 'news'; $('#view-404').hidden = r !== '404';
  if (r !== 'news' && r !== 'page') document.title = siteTitle();
  if (r === 'my') { renderMy(); window.scrollTo(0, 0); setHash('my'); }
  else if (r === 'news') { renderNewsPage(); window.scrollTo(0, 0); }
  else if (r === '404') { render404(); document.title = L(['Хуудас олдсонгүй', 'Page not found']) + ' · ulaanbaatar.mn'; window.scrollTo(0, 0); }
  else if (r === 'page') {   // тусдаа хуудас: толгой + тухайн хэсгүүд (шинэ төлөвөөр дахин зурна)
    const P = PAGES[S.page];
    pageView(true); renderReact();   // толгой ба хэсгүүдийг React (site/app/home/) шинэ төлөвөөр дахин зурна
    document.title = pgT(P) + ' · ulaanbaatar.mn';
    try { if ((PRETTY ? location.pathname + location.hash : location.hash) !== pageHref(S.page)) history.pushState({ ubPage: S.page }, '', pageHref(S.page)); } catch (e) { /* ignore */ }
    requestAnimationFrame(() => initTabs($('#view-home')));
    window.scrollTo(0, was === 'news' && S.pageFor === S.page && S.pageY != null ? S.pageY : 0);   // мэдээнээс буцахад хуудсандаа байсан газраа
  }
  else {
    pageView(false);
    if (PRETTY && location.pathname !== '/') { try { history.pushState(null, '', '/'); } catch (e) { /* ignore */ } }   // /news/<id>, /news ...-ээс нүүр рүү: "Буцах" дарахад буцаж очно
    else if (/^#(my|news\/|\/)/.test(location.hash)) setHash('');
    renderReact();
    initTabs($('#view-home'));   // хуудсанд өөр хэлбэртэй байсан хэсгүүдийг нүүрнийх нь болгоно
    if ((was === 'news' || was === 'page') && S.homeY != null) window.scrollTo(0, S.homeY);   // нүүрний байрлалаа сэргээнэ
  }
  if (r !== 'news') renderSeason(false);   // улирлын эффект зөвхөн мэдээ унших хуудсанд (if/else гинжийн ГАДНА)
  setActiveNav(r === 'my' ? 'my' : r === 'news' ? 'hub' : r === 'page' ? 'page' : 'hero');
}
