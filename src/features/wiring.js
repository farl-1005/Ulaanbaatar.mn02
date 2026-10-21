/* ================= Global wiring ================= */
function onTab(name, v) {
  if (name === 'hub') setHub(v); else if (name === 'nsort') setNewsSort(v); else if (name === 'svc') setSvcTab(v); else if (name === 'evview') setEvView(v); else if (name === 'tr') setTr(v);
  else if (name === 'my') { if (S.route !== 'my') { S.myTab = v; setRoute('my'); } else setMyTab(v); }
  else if (name === 'dan' && MS.danTab) MS.danTab(v); else if (name === 'vote' && MS.vTab) MS.vTab(v);
}
async function copyLink(id) {
  const url = newsUrl(NEWS_BY[id] || { id });
  try { await navigator.clipboard.writeText(url); toast(t('copied'), 'link'); } catch (e) { toast(url, 'link'); }
}
/* Сайтын бүх товч, маягт, гарын товчлуурыг нэг дор барина (init() дуудна) */
function wireEvents() {
  document.addEventListener('click', (e) => {
    const um = $('[data-usermenu]'); if (um && !e.target.closest('[data-userwrap]')) um.classList.add('hidden');
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, d = el.dataset;
    switch (a) {
      case 'page': openPage(d.v, d.cat ? { cat: d.cat } : {}); break;
      case 'org-cat': setOrgCat(d.v); break;
      case 'org-all': { S.orgAll = true; const g = $('#org-grid'); if (g) swap(g, orgGrid(), 0); break; }
      case 'media-more': { const from = S.mediaN; S.mediaN += MEDIA_STEP; const g = $('#media-grid'); if (g) g.innerHTML = mediaCards(from); break; }
      case 'news-more': { const from = S.newsN; S.newsN += NEWS_STEP; const g = $('#news-grid'); if (g) g.innerHTML = newsGridAll(from); break; }
      case 'home': S.homeY = 0; if (S.route !== 'home') setRoute('home'); closeMenu(); setHash(''); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); break;
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
      case 'gov-day': govSetDay(d.v, d.id); break;
      case 'gov-wk': govSetWeek(+d.v); break;
      case 'gov-today': GV.w = 0; GV.d = null; govSetWeek(0); break;
      case 'gov-ics': govIcs(d.id); break;
      case 'gov-book': openBooking({ t: ['Засаг даргын иргэдийн хүлээн авалт', "Governor's citizen reception"], place: ['Нийслэлийн Засаг даргын Тамгын газар, Иргэний танхим', 'City Hall, Civic Hall'], wd: 2 }); break;
      case 'sys-open': toast(t('sysDemo'), 'external-link'); break;
      case 'sit': setSit(d.v); break;
      case 'sit-toggle': toggleStep(+d.i); break;
      case 'sit-reset': { const prev = (S.sitDone[S.sit] || []).slice(); S.sitDone[S.sit] = []; store.set('sitDone', S.sitDone); paintSit(prev); break; }
      case 'sit-apply': stepApply(+d.i); break;
      case 'media-f': setMediaF(d.v); break;
      case 'media-open': openMedia(+d.i); break;
      case 'mp-toggle': if (MS.mpToggle) MS.mpToggle(); break;
      case 'ph': if (MS.ph) MS.ph(+d.d); break;
      case 'ph-go': if (MS.phGo) MS.phGo(+d.k); break;
      case 'mv-go': if (MS && MS.go) MS.go(+d.i); break;
      case 'mv-zoom': if (MS && MS.zoom) MS.zoom(); break;
      case 'mv-fs': if (MS && MS.fs) MS.fs(); break;
      case 'mv-copy': if (MS && MS.copy) MS.copy(); break;
      case 'proj-st': setProjSt(d.v); break;
      case 'proj': if (S.projSel === d.id && PROJECTS.some((p) => p.id === d.id && p.live)) openProject(d.id); else selectProject(d.id, true); break;   // сонгосон төслийг дахин дарахад дэлгэрэнгүй
      case 'proj-open': openProject(d.id); break;
      case 'mp-up': if (MS && MS.mpUp) MS.mpUp(d.id); break;
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
    else if (el.dataset.input === 'mediaQ') { S.mediaQ = el.value; S.mediaN = MEDIA_STEP; $('#media-grid').innerHTML = mediaCards(); $('#media-count').textContent = mediaCountText(); }
    else if (el.dataset.input === 'newsQ') { S.newsQ = el.value; S.newsN = NEWS_STEP; $('#news-grid').innerHTML = newsGridAll(1e9); }   // бичих үед дахин хөдөлгөөнгүй
    else if (el.dataset.input === 'trQ') { S.trQ = el.value; $('#tr-panel').innerHTML = trRows(true); }   // хайх үед дахин хөдөлгөөнгүй
    else if (el.id === 'chat-in') autoGrow(el);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target; e.preventDefault();
    if (f.dataset.form === 'chat') chatSend($('#chat-in').value);
    else if (f.dataset.form === 'digest') { const inp = f.querySelector('input'), msg = $('[data-digest-msg]'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { msg.textContent = t('badEmail'); inp.focus(); return; } if (CMS.mode === 'api') { apiCall('/submit/digest', { method: 'POST', body: { email: inp.value.trim() } }).then(() => { msg.textContent = t('subscribed'); inp.value = ''; }).catch((er) => { msg.textContent = submitErr(er); }); return; } msg.textContent = t('subscribed'); inp.value = ''; }
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
}

