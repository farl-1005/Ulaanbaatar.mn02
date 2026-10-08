/* ================= Admin (CMS) UI ================= */
const ADM = { view: 'dash', q: '', f: 'all', edit: null, lang: 'mn', tg: 'all', tOnly: false, map: null, arm: null };
const A_NAV = [
  ['dash', 'layout-dashboard', ['Хянах самбар', 'Dashboard']],
  ['inbox', 'inbox', ['Ирсэн хүсэлт', 'Submissions']],
  ['news', 'newspaper', ['Мэдээ', 'News']],
  ['alerts', 'siren', ['Анхааруулга', 'Alerts']],
  ['events', 'calendar-days', ['Арга хэмжээ', 'Events']],
  ['projects', 'hard-hat', ['Төслүүд', 'Projects']],
  ['services', 'layout-grid', ['Үйлчилгээ', 'Services']],
  ['texts', 'type', ['Гарчиг, текст', 'Headings & text']],
  ['settings', 'settings', ['Тохиргоо', 'Settings']],
];
const ICON_SET = ['triangle-alert', 'siren', 'droplets', 'zap', 'flame', 'wind', 'snowflake', 'construction', 'car-front', 'bus', 'tram-front', 'megaphone', 'info', 'file-text', 'baby', 'recycle', 'circle-parking', 'square-parking', 'map-pinned', 'map', 'hand-heart', 'school', 'graduation-cap', 'hard-hat', 'store', 'gavel', 'scale', 'landmark', 'briefcase', 'receipt-text', 'messages-square', 'building-2', 'database', 'stethoscope', 'house', 'heart', 'trees', 'wifi'];
const REC_L = { skyline: ['Хот', 'City'], road: ['Зам', 'Road'], bus: ['Автобус', 'Bus'], build: ['Барилга', 'Construction'], bridge: ['Гүүр', 'Bridge'], cable: ['Дүүжин зам', 'Cable car'], park: ['Цэцэрлэг', 'Park'], school: ['Сургууль', 'School'], civic: ['Ордон', 'Civic'], heat: ['Дулаан', 'Heating'], air: ['Агаар', 'Air'], ger: ['Гэр хороолол', 'Ger district'], stage: ['Тайз', 'Stage'], sport: ['Спорт', 'Sport'], market: ['Зах', 'Market'], art: ['Урлаг', 'Art'], tech: ['Технологи', 'Tech'] };
const PAL_SW = { day: ['#9FD0FF', '#E9F5FF'], dawn: ['#FFD3BD', '#9A6274'], dusk: ['#1A2768', '#F28A66'], night: ['#060D29', '#FFCF6B'], winter: ['#CADDF2', '#F6FAFE'], green: ['#BDE7D6', '#2D7859'], civic: ['#F6CAC4', '#78293A'], navy: ['#0B1D45', '#27428A'], smog: ['#B9AE9C', '#5C554D'] };
const SCHEMA = {
  news: { icon: 'newspaper', one: ['мэдээ', 'story'], idp: 'n', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Гарчиг', 'Headline'], { req: 1 }],
    ['l', 'bitext', ['Товч агуулга', 'Summary'], { rows: 3 }],
    ['bt', 'bitext', ['Үндсэн текст (догол мөрийг хоосон мөрөөр тусгаарлана)', 'Body (separate paragraphs with a blank line)'], { rows: 6 }],
    ['cat', 'chips', ['Ангилал', 'Category'], { options: () => Object.keys(RUB).map((k) => [k, L(RUB[k].t), RUB[k].c]) }],
    ['img', 'image', ['Зураг', 'Image']],
    ['d', 'datetime', ['Нийтэлсэн огноо', 'Published']],
    ['flags', 'flags', ['Байршил ба төлөв', 'Placement and status'], { options: [['br', ['Шуурхай мэдээнд харуулах', 'Show in the latest feed']], ['zar', ['Зар хэлбэрээр харуулах', 'Show as a notice']], ['draft', ['Ноорог (сайтад гарахгүй)', 'Draft (hidden from the site)']]] }],
    ['src', 'url', ['Эх сурвалжийн холбоос', 'Source link']],
    ['views', 'number', ['Үзэлт', 'Views']],
  ] },
  alerts: { icon: 'siren', one: ['анхааруулга', 'alert'], idp: 'a', title: (x) => L(x.k), fields: [
    ['k', 'bi', ['Гарчиг', 'Label'], { req: 1 }], ['t', 'bi', ['Гүйдэг мөрийн текст', 'Ticker text'], { req: 1 }],
    ['area', 'bi', ['Хамрах хүрээ', 'Affected area']], ['when', 'bi', ['Хугацаа', 'When']], ['adv', 'bitext', ['Зөвлөмж', 'Advice'], { rows: 2 }],
    ['i', 'icon', ['Тэмдэг', 'Icon']], ['flags', 'flags', ['Төлөв', 'Status'], { options: [['off', ['Түр нуух', 'Hide for now']]] }],
  ] },
  events: { icon: 'calendar-days', one: ['арга хэмжээ', 'event'], idp: 'e', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Title'], { req: 1 }], ['c', 'chips', ['Ангилал', 'Category'], { options: () => Object.keys(ECAT).map((k) => [k, L(ECAT[k].t), ECAT[k].c]) }],
    ['date', 'date', ['Огноо', 'Date']], ['tm', 'time', ['Эхлэх цаг', 'Start time']], ['v', 'bi', ['Байршил', 'Venue']], ['price', 'number', ['Үнэ, ₮ (0 бол үнэгүй)', 'Price, ₮ (0 = free)']],
    ['desc', 'bitext', ['Тайлбар', 'Description'], { rows: 3 }], ['img', 'image', ['Зураг', 'Image']], ['pos', 'mappos', ['Газрын зураг дээрх байршил', 'Position on the map']],
  ] },
  projects: { icon: 'hard-hat', one: ['төсөл', 'project'], idp: 'p', title: (x) => L(x.n), fields: [
    ['n', 'bi', ['Төслийн нэр', 'Project name'], { req: 1 }], ['c', 'chips', ['Ангилал', 'Category'], { options: () => Object.keys(PCAT).map((k) => [k, L(PCAT[k].t), PCAT[k].c]) }],
    ['p', 'range', ['Гүйцэтгэл', 'Progress']], ['bud', 'number', ['Төсөв, тэрбум ₮', 'Budget, ₮ bn']], ['due', 'number', ['Дуусах он', 'Completion year']], ['pos', 'mappos', ['Байршил', 'Location']],
  ] },
  services: { icon: 'layout-grid', one: ['үйлчилгээ', 'service'], idp: 's', title: (x) => L(x.t), fields: [
    ['t', 'bi', ['Нэр', 'Name'], { req: 1 }], ['d', 'bi', ['Тайлбар', 'Description']],
    ['g', 'chips', ['Бүлэг', 'Group'], { options: () => [['citizen', L(['Иргэн', 'Residents'])], ['business', L(['Аж ахуйн нэгж', 'Businesses'])], ['esys', L(['Цахим систем', 'E-services'])]] }],
    ['m', 'chips', ['Хэлбэр', 'Mode'], { options: () => [['on', t('online')], ['off', t('inperson')], ['sys', t('system')]] }], ['i', 'icon', ['Тэмдэг', 'Icon']],
  ] },
};
const TGROUPS = [
  ['head', ['Толгой, цэс', 'Header & menu'], /^(brand|slogan|homeAria|home|search|login|menu|close|nav_|cta_|urgent|dismiss|notify|theme|a11y|hotlineShort|weather|cloudy|aqi$|traffic|busy|more)/],
  ['home', ['Нүүр хуудас', 'Home page'], /^(breaking|liveUpd|isNew|allNews|read|minRead|views|gov|report|vote|hub|tab_|f_all|svcSearch|online|inperson|system|noResults|allEvents|sitPromo|popularSvc|allServices|related|helpful|thanks|share|copied|src)/],
  ['svc', ['Амьдралын нөхцөл', 'Life events'], /^(sit|steps|progress|doneOf|markDone|undo|applyOnline|book|nextStep|doneLbl|restart|allDone|stepSent|pickSlot|confirmBook|booked|where|svc|openSys|sysDemo|requestSent)/],
  ['media', ['Медиа', 'Media'], /^(media|m_|watching|photosN|prev|next|play|pause|liveFor|photoCredit)/],
  ['proj', ['Бүтээн байгуулалт', 'Development'], /^(proj|st_|avgProgress|projectsN|completedN|budget$|dueYear|zoom|resetMap|schematic|district|showOnMap)/],
  ['data', ['Хотын өгөгдөл', 'City data'], /^(data|live$|updated|aqi|feels|wind|humidity|congestion|busiest|population|popNote|budgetExec|budgetNote|plan|actual|transit|busesNow|ridersToday|avgWait|onTime|minShort)/],
  ['ev', ['Арга хэмжээ', 'Events'], /^(ev|f_|v_|free|save|saved|unsavedT|noEvents|eventsOn)/],
  ['tr', ['Ил тод байдал', 'Transparency'], /^(tr|docSearch|inForce|tOpen|tEval|tAwarded|daysLeft|closesToday|view$|bid|docNote|tl_|days)/],
  ['about', ['Хотын тухай', 'About'], /^(about|leadership|orgs|founded|area|admin|elevation)/],
  ['foot', ['Хөл хэсэг', 'Footer'], /^(contact|hotline|emergency|fire|police|ambulance|digest|email|subscribe|badEmail|conceptNote|privacy|access|openData|f_services|f_info)/],
  ['forms', ['Маягтууд', 'Forms'], /^(r[A-Z]|rStep|rS\d|locate|tapMap|pickedIn|desc|photo|track|continue|back|submit|needCat|v[A-Z]|poll|voteBtn|voted|totalVotes|yourPick|topic|idea|toGov|needText|dan|scanQr|waiting|regPh|sendCode|codePh|codeSent|signIn|bankPick|demoNote|signedIn|myCorner|logout|loggedOut|hello|my_|s\d|newReq|notifs|payments|pay|paid|due|savedItems|noSaved|kh|hours|residents|households|nearby|reqAgency|myStats|noReq)/],
  ['chat', ['AI туслах', 'Assistant'], /^(chat|thinking|stop|send|restartChat|s_|popular|escClose|bb_)/],
];
const tGroupOf = (k) => { for (const [g, , re] of TGROUPS) if (re.test(k)) return g; return 'other'; };
const colLabel = (c) => { const n = A_NAV.find((x) => x[0] === c); return n ? L(n[2]) : c; };
const ubStamp = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hhmm(d)}`;
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const rseed = () => 1 + Math.floor(Math.random() * 999);

/* ---- shell ---- */
function admModePill() {
  if (CMS.mode === 'api') return `<span class="inline-flex items-center gap-2 text-[12.5px] font-semibold text-greenink"><span class="live" style="--dot:rgb(var(--c-green))"></span>${L(['Сервертэй холбогдсон', 'Connected to server'])}</span>`;
  if (CMS.mode === 'db') return `<span class="inline-flex items-center gap-2 text-[12.5px] font-semibold text-greenink"><span class="live" style="--dot:rgb(var(--c-green))"></span>${L(['Шууд холбогдсон', 'Live'])}</span>`;
  return `<span class="inline-flex items-center gap-2 text-[12.5px] font-semibold text-amberink" title="${esc(L(['Өөрчлөлт зөвхөн энэ хөтөчид хадгалагдана', 'Changes are saved in this browser only']))}"><span class="w-2 h-2 rounded-full bg-ubamber"></span>${L(['Туршилтын горим', 'Demo mode'])}</span>`;
}
function admPrimary() {
  if (SCHEMA[ADM.view]) return `<button type="button" class="btn btn-sm btn-blue" data-act="adm-new">${ic('plus', 'w-4 h-4')}${L(['Нэмэх', 'Add'])} ${L(SCHEMA[ADM.view].one)}</button>`;
  if (ADM.view === 'dash') return `<button type="button" class="btn btn-sm btn-blue" data-act="adm-new" data-col="news">${ic('plus', 'w-4 h-4')}${L(['Мэдээ нэмэх', 'New story'])}</button>`;
  return '';
}
function admShell(body) {
  const cnt = (c) => (c === 'inbox' ? (CMS.inboxNew || '') : SCHEMA[c] ? mergedItems(c).length : c === 'texts' ? Object.keys(CMS.data.texts || {}).length : '');
  const nav = (cls) => A_NAV.map(([v, i, l]) => `<button type="button" class="${cls}" data-act="adm-go" data-v="${v}" aria-current="${ADM.view === v}">${ic(i, 'w-[18px] h-[18px]')}<span class="flex-1 text-left">${esc(L(l))}</span>${cnt(v) !== '' ? `<span class="text-[12px] tnum opacity-60">${cnt(v)}</span>` : ''}</button>`).join('');
  const title = (A_NAV.find((x) => x[0] === ADM.view) || A_NAV[0])[2];
  return `<div class="min-h-[100dvh] lg:grid lg:grid-cols-[264px_minmax(0,1fr)] bg-page text-ink">
    <aside class="hidden lg:flex flex-col bg-navy text-white sticky top-0 h-[100dvh] p-4">
      <button type="button" class="flex items-center gap-3 px-2 py-2" data-act="adm-exit">${logoMark('w-10 h-10')}<span class="text-left leading-tight"><b class="block text-[16px]">${t('brand')}</b><span class="text-[12px] text-white/60">${L(['Удирдлагын систем', 'Content admin'])}</span></span></button>
      <nav class="mt-6 space-y-1">${nav('adm-nav')}</nav>
      <div class="mt-auto rounded-xl bg-white/[.06] border border-white/10 p-3 text-[12.5px] text-white/70 leading-snug">${CMS.mode === 'api' ? L(['Өөрчлөлт серверийн өгөгдлийн санд хадгалагдаж, сайтын бүх зочинд шууд харагдана.', 'Changes are saved to the server database and appear instantly for every visitor.']) : CMS.mode === 'db' ? L(['Өөрчлөлт нэвтэрсэн бүх хэрэглэгчийн дэлгэц дээр шууд шинэчлэгдэнэ.', 'Changes appear instantly for every signed-in viewer.']) : L(['Энэ хувилбарт өөрчлөлт зөвхөн энэ хөтөчид хадгалагдана.', 'In this version changes are saved in this browser only.'])}</div>
      <button type="button" class="mt-3 btn btn-sm bg-white/10 hover:bg-white/15 text-white w-full" data-act="adm-exit">${ic('arrow-left', 'w-4 h-4')}${L(['Сайт руу буцах', 'Back to site'])}</button>
      ${CMS.mode === 'api' ? `<button type="button" class="mt-2 btn btn-sm text-white/70 hover:text-white hover:bg-white/10 w-full" data-act="adm-logout">${ic('log-out', 'w-4 h-4')}${L(['Гарах', 'Sign out'])}</button>` : ''}
    </aside>
    <div class="min-w-0">
      <header class="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-line" style="top:env(safe-area-inset-top,0px)"><div class="h-16 px-4 lg:px-8 flex items-center gap-3">
        <button type="button" class="lg:hidden icon-btn !rounded-lg border border-line" data-act="adm-exit" aria-label="${esc(L(['Сайт руу буцах', 'Back to site']))}">${ic('arrow-left')}</button>
        <h1 class="text-[17px] sm:text-[19px] font-extrabold tracking-tight truncate min-w-0">${esc(L(title))}</h1><span class="hidden sm:inline-flex ml-2">${admModePill()}</span>
        <div class="ml-auto flex items-center gap-2">${admPrimary()}<span class="hidden sm:inline-flex"><button type="button" class="btn btn-sm btn-ghost" data-act="adm-exit">${ic('external-link', 'w-4 h-4')}${L(['Сайтыг харах', 'View site'])}</button></span></div></div>
        <div class="lg:hidden flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-3">${A_NAV.map(([v, i, l]) => `<button type="button" class="chip !h-9 shrink-0" data-act="adm-go" data-v="${v}" aria-pressed="${ADM.view === v}">${ic(i, 'w-4 h-4')}${esc(L(l))}</button>`).join('')}</div>
      </header>
      <div class="p-4 sm:p-6 lg:p-8 max-w-[1180px] adm-view">${body}</div>
    </div></div>`;
}
function renderAdmin() {
  const el = $('#view-admin'); if (!el) return;
  if (CMS.mode === 'pending') { el.innerHTML = `<div class="min-h-[100dvh] grid place-items-center text-muted"><div class="text-center"><span class="typing"><span></span><span></span><span></span></span><p class="mt-3">${L(['Ачаалж байна', 'Loading'])}</p></div></div>`; return; }
  if (!CMS.canEdit && CMS.mode === 'api') { el.innerHTML = admLoginHTML(); setTimeout(() => { const i = $('#adm-pw'); if (i) i.focus(); }, 40); return; }
  if (!CMS.canEdit) {
    el.innerHTML = `<div class="min-h-[100dvh] grid place-items-center p-6"><div class="card max-w-md p-8 text-center"><span class="w-14 h-14 mx-auto rounded-2xl bg-soft grid place-items-center text-ubred">${ic('lock', 'w-7 h-7')}</span><h1 class="mt-4 text-[22px] font-extrabold">${L(['Засах эрх шаардлагатай', 'Editing access required'])}</h1><p class="mt-2 text-muted">${CMS.mode === 'static' ? L(['Удирдлагын хэсгийг ашиглахын тулд claude.ai-д нэвтэрсэн байх шаардлагатай.', 'Sign in to claude.ai to use the admin.']) : L(['Агуулгыг зөвхөн эзэмшигч болон редакторууд засна. Эрх авахын тулд эзэмшигчид хандана уу.', 'Only the owner and editors can change content. Ask the owner for access.'])}</p><button type="button" class="btn btn-ink mt-6" data-act="adm-exit">${ic('arrow-left', 'w-[18px] h-[18px]')}${L(['Сайт руу буцах', 'Back to site'])}</button></div></div>`;
    return;
  }
  const y = window.scrollY;
  el.innerHTML = admShell(ADM.view === 'dash' ? admDash() : ADM.view === 'inbox' ? admInbox() : ADM.view === 'texts' ? admTexts() : ADM.view === 'settings' ? admSettings() : admList(ADM.view));
  window.scrollTo(0, y);
  admAfterRender();
}
function admRefresh() {
  if (S.route !== 'admin') return;
  if (ADM.view === 'texts' && $('[data-tdirty]')) return;
  if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.adm-view input, .adm-view textarea, .adm-view select')) return;
  renderAdmin();
}
async function admAfterRender() {
  const u = CMS.user;
  if (u) {
    const me = await u.me().catch(() => null); const meEl = $('[data-me]'); if (meEl && me && me.name) meEl.textContent = me.name;
    const ids = $$('[data-uid]').map((e) => e.dataset.uid).filter((x) => x && x !== 'local');
    if (ids.length) { const ps = await u.profiles([...new Set(ids)]).catch(() => ({})); $$('[data-uid]').forEach((e) => { const p = ps && ps[e.dataset.uid]; if (p && p.name) e.textContent = p.name; }); }
  }
}

/* ---- dashboard ---- */
function admDash() {
  const news = mergedItems('news'), pub = news.filter((n) => !n.draft), drafts = news.length - pub.length;
  const views = pub.reduce((a, n) => a + (+n.views || 0), 0), alerts = mergedItems('alerts'), act = alerts.filter((a) => !a.off).length;
  const evs = mergedItems('events'), up = evs.filter((e) => (e.date ? dayOffset(e.date) : (typeof e.w === 'number' ? e.w : 0)) >= 0).length;
  const projs = mergedItems('projects'), avg = projs.length ? Math.round(projs.reduce((a, p) => a + (+p.p || 0), 0) / projs.length) : 0;
  const top = pub.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5), maxV = Math.max(1, ...(top.map((n) => +n.views || 0)));
  const kpi = (icon, v, l, sub, go) => `<button type="button" class="card p-5 text-left hover:border-ink/25 transition-colors" data-act="adm-go" data-v="${go}"><span class="w-10 h-10 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center">${ic(icon, 'w-5 h-5')}</span><p class="mt-4 text-[30px] font-extrabold tnum leading-none tracking-tight">${v}</p><p class="mt-1.5 text-[13.5px] font-semibold">${l}</p><p class="text-[12.5px] text-muted">${sub}</p></button>`;
  const act2 = { create: ['нэмлээ', 'added'], update: ['засварлалаа', 'edited'], delete: ['устгалаа', 'deleted'], revert: ['анхны хувилбарт буцаалаа', 'reverted'] };
  const logRows = CMS.log.slice(0, 10).map((e) => { const mins = Math.max(0, Math.round((Date.now() - new Date(e.at).getTime()) / 60000)); return `<li class="flex gap-3 py-3"><span class="w-9 h-9 rounded-lg bg-soft grid place-items-center text-muted shrink-0">${ic(e.action === 'delete' ? 'trash-2' : e.action === 'create' ? 'plus' : 'pencil-line', 'w-4 h-4')}</span><span class="min-w-0"><span class="block text-[14px] leading-snug"><b data-uid="${esc(e.by)}">${e.by === 'local' ? L(['Та', 'You']) : L(['Редактор', 'An editor'])}</b> ${esc(colLabel(e.col).toLowerCase())}: «${esc(e.title || e.id)}» ${esc(L(act2[e.action] || act2.update))}</span><span class="block text-[12.5px] text-muted">${ago(mins)}</span></span></li>`; }).join('');
  return `<div class="rounded-[22px] bg-navy text-white p-6 sm:p-8 relative overflow-hidden"><div class="relative flex flex-col md:flex-row md:items-center gap-5"><div class="flex-1"><p class="text-white/65 text-[14px]">${fDate(today(), true)}</p><h2 class="mt-1 text-[26px] sm:text-[30px] font-extrabold tracking-tight">${L(['Сайн байна уу', 'Hello'])}<span data-me></span></h2><p class="mt-2 text-white/70 max-w-[56ch]">${L(['Мэдээ, анхааруулга, гарчиг, тохиргоог эндээс засна. Хадгалсан даруйд сайт шинэчлэгдэнэ.', 'Edit stories, alerts, headings and settings here. The site updates as soon as you save.'])}</p></div>
    <div class="flex flex-wrap gap-2"><button type="button" class="btn bg-white text-[#0B1D45] hover:bg-white/90" data-act="adm-new" data-col="news">${ic('plus', 'w-[18px] h-[18px]')}${L(['Мэдээ нэмэх', 'New story'])}</button><button type="button" class="btn bg-white/10 hover:bg-white/15 text-white" data-act="adm-new" data-col="alerts">${ic('siren', 'w-[18px] h-[18px]')}${L(['Анхааруулга', 'Alert'])}</button><button type="button" class="btn bg-white/10 hover:bg-white/15 text-white" data-act="adm-go" data-v="texts">${ic('type', 'w-[18px] h-[18px]')}${L(['Гарчиг засах', 'Edit headings'])}</button></div></div></div>
    <div class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">${kpi('newspaper', pub.length, L(['Нийтлэгдсэн мэдээ', 'Published stories']), drafts ? L([`${drafts} ноорог`, `${drafts} drafts`]) : L(['Ноорог алга', 'No drafts']), 'news')}${kpi('eye', num(views), L(['Нийт үзэлт', 'Total views']), L(['Нийтлэгдсэн мэдээнүүдийн', 'Across published stories']), 'news')}${kpi('siren', act, L(['Идэвхтэй анхааруулга', 'Active alerts']), L([`Нийт ${alerts.length}`, `${alerts.length} total`]), 'alerts')}${kpi('hard-hat', avg + '%', L(['Төслийн дундаж явц', 'Avg project progress']), L([`${projs.length} төсөл, ${up} арга хэмжээ`, `${projs.length} projects, ${up} events`]), 'projects')}</div>
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-4"><div class="card p-5 lg:col-span-3"><h3 class="font-bold flex items-center gap-2">${ic('history', 'w-[18px] h-[18px]')}${L(['Сүүлийн өөрчлөлтүүд', 'Recent changes'])}</h3>${logRows ? `<ul class="mt-2 divide-y divide-line">${logRows}</ul>` : `<p class="mt-4 text-[14px] text-muted">${L(['Одоогоор өөрчлөлт хийгдээгүй байна. Эхний мэдээгээ нэмээд үзээрэй.', 'No changes yet. Try adding your first story.'])}</p>`}</div>
    <div class="card p-5 lg:col-span-2"><h3 class="font-bold flex items-center gap-2">${ic('trending-up', 'w-[18px] h-[18px]')}${L(['Хамгийн их уншсан', 'Most read'])}</h3><ul class="mt-4 space-y-3">${top.map((n) => `<li><button type="button" class="w-full text-left" data-act="adm-edit" data-col="news" data-id="${n.id}"><span class="flex justify-between gap-3 text-[13.5px]"><span class="truncate font-semibold min-w-0">${esc(L(n.t))}</span><b class="tnum">${num(n.views || 0)}</b></span><span class="mt-1.5 block h-1.5 rounded-full bg-line overflow-hidden"><span class="block h-full rounded-full bg-ubblue" style="width:${((+n.views || 0) / maxV) * 100}%"></span></span></button></li>`).join('')}</ul></div></div>`;
}

/* ---- lists ---- */
function admBadges(col, x) {
  const b = [];
  if (col === 'news') { if (x.id === HERO_ID) b.push(['b-red', L(['Гол мэдээ', 'Lead'])]); if (x.id === FEATURED_ID) b.push(['b-blue', L(['Онцлох', 'Featured'])]); if (x.br) b.push(['b-mute', L(['Шуурхай', 'Latest feed'])]); if (GOV.includes(x.id)) b.push(['b-mute', L(['Засаг дарга', 'Governor'])]); if (x.zar) b.push(['b-off', L(['Зар', 'Notice'])]); if (x.draft) b.push(['b-off', L(['Ноорог', 'Draft'])]); }
  if (col === 'alerts') b.push(x.off ? ['b-mute', L(['Нуусан', 'Hidden'])] : ['b-on', L(['Идэвхтэй', 'Active'])]);
  if (x._new) b.push(['b-on', L(['Шинэ', 'New'])]); else if (x._edited) b.push(['b-blue', L(['Засварласан', 'Edited'])]);
  return b.map(([c, l]) => `<span class="badge ${c}">${esc(l)}</span>`).join('');
}
function admThumb(col, x) {
  if (col === 'news' || col === 'events') return x.zar ? `<span class="w-[72px] h-12 rounded-lg bg-ubyellow/25 text-amberink grid place-items-center shrink-0">${ic('megaphone', 'w-5 h-5')}</span>` : `<span class="scene w-[72px] h-12 rounded-lg shrink-0">${Scene(x.img)}</span>`;
  if (col === 'projects') { const c = PCAT[x.c] || PCAT.transport; return pctRing(Math.round(+x.p || 0), 44, 4.5, c.c, 11); }
  return `<span class="w-11 h-11 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center shrink-0">${ic(x.i || 'file-text', 'w-5 h-5')}</span>`;
}
function admMeta(col, x) {
  if (col === 'news') { const r = RUB[x.cat] || RUB.city, d = parseUB(x.d); return `<span class="inline-flex items-center gap-1.5"><i class="w-2 h-2 rounded-full" style="background:${r.c}"></i>${esc(L(r.t))}</span><span>${d ? fDate(d) + ', ' + hhmm(d) : ''}</span><span class="inline-flex items-center gap-1 tnum">${ic('eye', 'w-3.5 h-3.5')}${num(x.views || 0)}</span>`; }
  if (col === 'alerts') return `<span class="truncate">${esc(L(x.t))}</span>`;
  if (col === 'events') { const d = x.date ? evDate(dayOffset(x.date)) : evDate(x.w); const c = ECAT[x.c] || ECAT.civic; return `<span class="inline-flex items-center gap-1.5"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><span>${fDate(d, true)}, ${esc(x.tm || '')}</span><span class="truncate">${esc(L(x.v || ['', '']))}</span>`; }
  if (col === 'projects') { const c = PCAT[x.c] || PCAT.transport; return `<span>${esc(L(c.t))}</span><span>${bn(+x.bud || 0)}</span><span>${x.due || ''}</span>`; }
  return `<span>${esc(L(x.d || ['', '']))}</span>`;
}
function admList(col) {
  const q = ADM.q.trim().toLowerCase();
  let items = mergedItems(col);
  if (col === 'news') items.sort((a, b) => (parseUB(b.d) || 0) - (parseUB(a.d) || 0));
  if (q) items = items.filter((x) => JSON.stringify([x.t, x.n, x.k, x.l, x.v, x.d]).toLowerCase().includes(q));
  const F = { news: [['all', ['Бүгд', 'All']], ['pub', ['Нийтлэгдсэн', 'Published']], ['draft', ['Ноорог', 'Drafts']], ['br', ['Шуурхай', 'Latest feed']], ['edited', ['Засварласан', 'Edited']]], alerts: [['all', ['Бүгд', 'All']], ['on', ['Идэвхтэй', 'Active']], ['off', ['Нуусан', 'Hidden']]] }[col];
  const fn = { pub: (x) => !x.draft, draft: (x) => x.draft, br: (x) => x.br, edited: (x) => x._edited || x._new, on: (x) => !x.off, off: (x) => x.off }[ADM.f];
  if (F && fn) items = items.filter(fn);
  const rows = items.map((x) => `<li class="adm-row group">
      <button type="button" class="flex items-center gap-4 flex-1 min-w-0 text-left" data-act="adm-edit" data-col="${col}" data-id="${x.id}">${admThumb(col, x)}<span class="min-w-0 flex-1"><span class="block font-semibold text-[15px] leading-snug truncate group-hover:text-ubblue transition-colors">${esc(SCHEMA[col].title(x) || L(['(гарчиггүй)', '(untitled)']))}</span><span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">${admMeta(col, x)}</span><span class="mt-1.5 flex flex-wrap gap-1.5">${admBadges(col, x)}</span></span></button>
      <span class="flex items-center gap-1 shrink-0">${col === 'alerts' ? `<label class="mr-2 inline-flex items-center gap-2 text-[12.5px] text-muted" title="${esc(L(['Сайт дээр харуулах', 'Show on site']))}"><input type="checkbox" class="adm-switch" data-alert-toggle="${x.id}" ${x.off ? '' : 'checked'}/></label>` : ''}<button type="button" class="icon-btn !rounded-lg hover:bg-soft" data-act="adm-edit" data-col="${col}" data-id="${x.id}" aria-label="${esc(L(['Засах', 'Edit']))}">${ic('pencil-line', 'w-[18px] h-[18px]')}</button><button type="button" class="icon-btn !rounded-lg hover:bg-soft text-muted hover:text-ubred" data-act="adm-del-row" data-col="${col}" data-id="${x.id}" aria-label="${esc(L(['Устгах', 'Delete']))}">${ic('trash-2', 'w-[18px] h-[18px]')}</button></span></li>`).join('');
  return `<div class="flex flex-col md:flex-row md:items-center gap-3 mb-4"><div class="relative md:w-80">${ic('search', 'w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input type="search" class="field !h-10 !pl-10 !text-[14px]" placeholder="${esc(L(['Хайх', 'Search']))}" value="${esc(ADM.q)}" data-adm-q aria-label="${esc(L(['Хайх', 'Search']))}"/></div>
    ${F ? `<div class="flex gap-1.5 overflow-x-auto no-scrollbar">${F.map(([v, l]) => `<button type="button" class="chip !h-9 shrink-0" data-act="adm-filter" data-v="${v}" aria-pressed="${ADM.f === v}">${esc(L(l))}</button>`).join('')}</div>` : ''}<span class="md:ml-auto text-[13px] text-muted">${L([`${items.length} бичлэг`, `${items.length} items`])}</span></div>
    ${items.length ? `<ul class="card divide-y divide-line overflow-hidden">${rows}</ul>` : `<div class="card p-10 text-center text-muted">${ic('inbox', 'w-8 h-8 mx-auto mb-3 opacity-60')}${L(['Илэрц алга', 'Nothing here'])}</div>`}`;
}

/* ---- editor ---- */
function admForEdit(col, x) {
  const d = cloneJ(x); delete d._edited; delete d._new;
  if (col === 'news') { if (!d.bt && Array.isArray(d.b)) d.bt = [d.b.map((p) => p[0]).join('\n\n'), d.b.map((p) => p[1]).join('\n\n')]; delete d.b; }
  if (col === 'events' && !d.date) d.date = isoDay(evDate(d.w));
  if (col === 'events' && !d.desc) d.desc = cloneJ(EVDESC[d.c] || ['', '']);
  return d;
}
function admBlank(col) {
  const now = ubNow();
  return {
    news: { t: ['', ''], l: ['', ''], bt: ['', ''], cat: 'city', d: ubStamp(now), img: 'skyline:day:' + rseed(), br: 1, views: 0 },
    alerts: { k: ['', ''], t: ['', ''], area: ['', ''], when: ['', ''], adv: ['', ''], i: 'triangle-alert' },
    events: { t: ['', ''], c: 'civic', date: isoDay(addDays(today(), 1)), tm: '18:00', v: ['', ''], price: 0, desc: ['', ''], img: 'civic:day:' + rseed(), x: 560, y: 285 },
    projects: { n: ['', ''], c: 'transport', p: 0, bud: 0, due: now.getFullYear() + 1, x: 560, y: 300 },
    services: { t: ['', ''], d: ['', ''], g: 'citizen', m: 'on', i: 'file-text' },
  }[col];
}
function admField(f, doc) {
  const [k, type, label, o = {}] = f;
  const lab = `<span class="adm-label">${esc(L(label))}${o.req ? ' <span class="text-ubred">*</span>' : ''}</span>`;
  const bi = (tag, rows) => ['mn', 'en'].map((lg, i) => { const v = esc((doc[k] || [])[i] || ''); const ph = lg === 'mn' ? 'Монгол' : 'English'; return tag === 'input' ? `<input class="field" data-k="${k}" data-i="${i}" data-lg="${lg}" value="${v}" placeholder="${ph}" ${ADM.lang !== lg ? 'hidden' : ''}/>` : `<textarea class="field" rows="${rows}" data-k="${k}" data-i="${i}" data-lg="${lg}" placeholder="${ph}" ${ADM.lang !== lg ? 'hidden' : ''}>${v}</textarea>`; }).join('');
  switch (type) {
    case 'bi': return `<label class="block">${lab}${bi('input')}</label>`;
    case 'bitext': return `<label class="block">${lab}${bi('textarea', o.rows || 3)}</label>`;
    case 'chips': return `<div>${lab}<div class="flex flex-wrap gap-2">${o.options().map(([v, l, c]) => `<button type="button" class="chip !h-9" data-act="adm-pick" data-k="${k}" data-v="${v}" aria-pressed="${doc[k] === v}">${c ? `<i class="w-2 h-2 rounded-full" style="background:${c}"></i>` : ''}${esc(l)}</button>`).join('')}</div></div>`;
    case 'number': return `<label class="block">${lab}<input type="number" class="field" data-k="${k}" value="${doc[k] == null ? '' : doc[k]}"/></label>`;
    case 'range': return `<div>${lab}<div class="flex items-center gap-4"><input type="range" min="0" max="100" class="flex-1 accent-[#1D5BFF]" data-k="${k}" value="${doc[k] || 0}"/><b class="tnum w-14 text-right text-[18px]" data-rv="${k}">${doc[k] || 0}%</b></div></div>`;
    case 'date': return `<label class="block">${lab}<input type="date" class="field" data-k="${k}" value="${esc(doc[k] || '')}"/></label>`;
    case 'time': return `<label class="block">${lab}<input type="time" class="field" data-k="${k}" value="${esc(doc[k] || '')}"/></label>`;
    case 'datetime': return `<label class="block">${lab}<input type="datetime-local" class="field" data-k="${k}" value="${esc(String(doc[k] || '').replace(' ', 'T'))}"/></label>`;
    case 'url': return `<label class="block">${lab}<input type="url" class="field" data-k="${k}" value="${esc(doc[k] || '')}" placeholder="https://"/></label>`;
    case 'flags': return `<div>${lab}<div class="rounded-xl border border-line divide-y divide-line">${o.options.map(([fk, fl]) => `<label class="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer"><span class="text-[14px] font-semibold">${esc(L(fl))}</span><input type="checkbox" class="adm-switch" data-flag="${fk}" ${doc[fk] ? 'checked' : ''}/></label>`).join('')}</div></div>`;
    case 'icon': return `<div>${lab}<div class="grid grid-cols-8 sm:grid-cols-10 gap-1.5">${ICON_SET.map((n) => `<button type="button" class="aspect-square rounded-lg border grid place-items-center transition-colors ${doc.i === n ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}" data-act="adm-icon" data-v="${n}" aria-pressed="${doc.i === n}" aria-label="${n}">${ic(n, 'w-[18px] h-[18px]')}</button>`).join('')}</div></div>`;
    case 'image': { const cur = doc.img || 'skyline:day:1', parts = cur.indexOf('media:') === 0 ? [] : cur.split(':');
      return `<div>${lab}<div class="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-4"><div class="scene rounded-xl aspect-[16/10]" id="adm-imgprev">${Scene(cur)}</div><div class="space-y-3">
        <div class="flex flex-wrap gap-1.5">${Object.keys(REC_L).map((r) => `<button type="button" class="chip !h-8 !px-3 !text-[12.5px]" data-act="adm-img-rec" data-v="${r}" aria-pressed="${parts[0] === r}">${esc(L(REC_L[r]))}</button>`).join('')}</div>
        <div class="flex flex-wrap gap-2">${Object.keys(PAL_SW).map((p) => `<button type="button" class="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-card ${parts[1] === p ? 'ring-ubblue' : 'ring-transparent'}" style="background:linear-gradient(135deg,${PAL_SW[p][0]},${PAL_SW[p][1]})" data-act="adm-img-pal" data-v="${p}" aria-label="${p}"></button>`).join('')}</div>
        <div class="flex flex-wrap gap-2"><button type="button" class="btn btn-sm btn-ghost" data-act="adm-img-roll">${ic('shuffle', 'w-4 h-4')}${L(['Өөр хувилбар', 'Another version'])}</button><label class="btn btn-sm btn-ghost cursor-pointer">${ic('upload', 'w-4 h-4')}${L(['Зураг оруулах', 'Upload photo'])}<input type="file" accept="image/*" class="sr-only" id="adm-upload"/></label></div></div></div></div>`; }
    case 'mappos': return `<div>${lab}<div id="adm-map" class="h-[260px] rounded-2xl overflow-hidden border border-line"></div><p class="mt-2 text-[13px] text-muted" id="adm-posinfo">${esc(L(['Газрын зураг дээр дарж байршлыг сонгоно.', 'Tap the map to set the position.']))} ${doc.x != null ? esc(L(inDistrict(doc.x, doc.y).n)) : ''}</p></div>`;
    default: return '';
  }
}
function admPreview() {
  const e = ADM.edit; if (!e) return ''; const d = e.doc, ph = L(['Гарчиг энд харагдана', 'Your headline appears here']);
  const tt = (a) => (a && (a[0] || a[1]) ? a : [ph, ph]);
  if (e.col === 'news') return newsCard(Object.assign({}, d, { id: 'prev', ago: 1, views: +d.views || 0, t: tt(d.t), l: d.l || ['', ''] }), false);
  if (e.col === 'events') { const w = dayOffset(d.date); return evCard(Object.assign({}, d, { id: 'prev', w, d: evDate(w), t: tt(d.t), v: d.v || ['', ''] })); }
  if (e.col === 'services') return svcTile(Object.assign({}, d, { id: 'prev', t: tt(d.t), d: d.d || ['', ''] }));
  if (e.col === 'projects') { const c = PCAT[d.c] || PCAT.transport; return `<div class="card p-4 flex items-center gap-3">${pctRing(Math.round(+d.p || 0), 56, 6, c.c, 13)}<div class="min-w-0"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug">${esc(L(tt(d.n)))}</p><p class="text-[12.5px] text-muted">${bn(+d.bud || 0)}, ${d.due || ''}</p></div></div>`; }
  return `<div class="ticker rounded-xl p-3 flex items-start gap-2 text-[14px]">${ic(d.i || 'triangle-alert', 'w-4 h-4 mt-0.5')}<span><b>${esc(L(tt(d.k)))}.</b> ${esc(L(d.t || ['', '']))}</span></div>`;
}
let admPrevT = null;
function admPrevUpdate() { clearTimeout(admPrevT); admPrevT = setTimeout(() => { const el = $('#adm-prev'); if (el) el.innerHTML = admPreview(); }, 120); }
function admEditorHTML() {
  const e = ADM.edit, sc = SCHEMA[e.col], ttl = e.isNew ? L(['Шинэ', 'New']) + ' ' + L(sc.one) : L(['Засах', 'Edit']) + ': ' + (sc.title(e.doc) || '');
  return `${modalHead(ttl, '', sc.icon, 'bg-ubblue/10 text-ubblue')}
    <div class="px-5 sm:px-7 pt-4 flex flex-wrap items-center justify-between gap-3">${tabs('admlang', [['mn', 'Монгол'], ['en', 'English']], ADM.lang, { label: 'Language' })}${Chat.fn ? `<button type="button" class="btn btn-sm btn-ghost" data-act="adm-ai">${ic('sparkles', 'w-4 h-4')}${L(['AI-аар англи руу орчуулах', 'Translate to English with AI'])}</button>` : ''}</div>
    <div class="px-5 sm:px-7 pt-5 pb-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_268px] gap-7"><form id="adm-form" class="space-y-5" novalidate>${sc.fields.map((f) => admField(f, e.doc)).join('')}</form>
    <aside class="hidden lg:block"><div class="sticky top-24"><p class="adm-label">${L(['Сайт дээр ингэж харагдана', 'How it looks on the site'])}</p><div id="adm-prev" class="pointer-events-none select-none">${admPreview()}</div></div></aside></div>
    <div class="sticky bottom-0 z-10 bg-card/95 backdrop-blur border-t border-line px-5 sm:px-7 py-3 flex flex-wrap items-center gap-2">${e.isNew ? '' : `<button type="button" class="btn btn-sm btn-ghost !text-ubred" data-act="adm-del">${ic('trash-2', 'w-4 h-4')}${L(['Устгах', 'Delete'])}</button>`}${e.edited ? `<button type="button" class="btn btn-sm btn-ghost" data-act="adm-revert">${ic('rotate-ccw', 'w-4 h-4')}${L(['Анхны хувилбар', 'Revert'])}</button>` : ''}<span class="flex-1"></span><span class="text-[13px] text-ubred" id="adm-err" role="alert"></span><button type="button" class="btn btn-ghost" data-act="modal-close">${L(['Болих', 'Cancel'])}</button><button type="button" class="btn btn-blue" data-act="adm-save">${ic('check', 'w-[18px] h-[18px]')}${L(['Хадгалах', 'Save'])}</button></div>`;
}
function admOpen(col, id) {
  const sc = SCHEMA[col]; if (!sc) return;
  let doc, edited = false;
  if (id) { const it = mergedItems(col).find((x) => x.id === id); if (!it) return; edited = !!it._edited; doc = admForEdit(col, it); }
  else doc = admBlank(col);
  ADM.edit = { col, id: id || sc.idp + Date.now().toString(36), isNew: !id, doc, edited };
  openModal({ size: 'xl', label: L(sc.one), render: admEditorHTML, after: admEditorAfter, onClose: () => { if (ADM.map) { ADM.map.destroy(); ADM.map = null; } ADM.edit = null; } });
}
function admEditorAfter(sh) {
  const form = $('#adm-form', sh); if (!form) return;
  form.addEventListener('input', (ev) => {
    const el = ev.target, k = el.dataset.k, e = ADM.edit; if (!k || !e) return;
    if (el.dataset.i != null) { const arr = Array.isArray(e.doc[k]) ? e.doc[k].slice() : ['', '']; arr[+el.dataset.i] = el.value; e.doc[k] = arr; }
    else if (el.type === 'number' || el.type === 'range') { e.doc[k] = el.value === '' ? null : +el.value; const rv = $(`[data-rv="${k}"]`, sh); if (rv) rv.textContent = el.value + '%'; }
    else if (el.type === 'datetime-local') e.doc[k] = el.value.replace('T', ' ');
    else e.doc[k] = el.value;
    admPrevUpdate();
  });
  form.addEventListener('change', (ev) => { const el = ev.target; if (el.dataset.flag && ADM.edit) { ADM.edit.doc[el.dataset.flag] = el.checked ? 1 : 0; admPrevUpdate(); } if (el.id === 'adm-upload') admUpload(el.files && el.files[0]); });
  const mapEl = $('#adm-map', sh);
  if (mapEl) {
    if (ADM.map) ADM.map.destroy();
    const d = ADM.edit.doc;
    ADM.map = new MapView(mapEl, { cluster: false, points: () => (d.x != null ? [{ id: 'pos', x: d.x, y: d.y, c: '#D81E34', i: 'map-pin' }] : []), onPick: (x, y) => { d.x = Math.round(x); d.y = Math.round(y); ADM.map.recluster(true); const info = $('#adm-posinfo'); if (info) info.textContent = L(['Сонгосон байршил:', 'Selected:']) + ' ' + L(inDistrict(d.x, d.y).n); } });
  }
}
function admSetImg(key) { const e = ADM.edit; if (!e) return; e.doc.img = key; const p = $('#adm-imgprev'); if (p) p.innerHTML = Scene(key); const parts = key.indexOf('media:') === 0 ? [] : key.split(':'); $$('[data-act="adm-img-rec"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === parts[0]))); $$('[data-act="adm-img-pal"]').forEach((b) => { b.classList.toggle('ring-ubblue', b.dataset.v === parts[1]); b.classList.toggle('ring-transparent', b.dataset.v !== parts[1]); }); admPrevUpdate(); }
async function admUpload(file) {
  if (!file || !ADM.edit) return;
  try {
    const url = URL.createObjectURL(file), img = new Image(); img.src = url; await img.decode();
    let w = Math.min(1280, img.naturalWidth), h = Math.round(img.naturalHeight * (w / img.naturalWidth)), q = 0.82, src = '';
    for (let tries = 0; tries < 6; tries++) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); src = c.toDataURL('image/webp', q); if (src.length < 230000) break; q -= 0.1; if (q < 0.5) { w = Math.round(w * 0.75); h = Math.round(h * 0.75); q = 0.75; } }
    URL.revokeObjectURL(url);
    if (src.length >= 250000) { toast(L(['Зураг хэт том байна', 'The image is too large']), 'triangle-alert'); return; }
    const mid = 'm' + Date.now().toString(36);
    await cmsWrite('media', mid, Object.assign({ id: mid, src, w, h, name: String(file.name || '').slice(0, 80) }, stamp()));
    CMS.data.media[mid] = { id: mid, src, w, h };
    admSetImg('media:' + mid); toast(L(['Зураг орууллаа', 'Photo uploaded']), 'image');
  } catch (er) { toast(cmsErr(er), 'triangle-alert'); }
}
async function admSave() {
  const e = ADM.edit; if (!e) return; const sc = SCHEMA[e.col], d = e.doc, err = $('#adm-err');
  const miss = sc.fields.filter((f) => f[3] && f[3].req && !((d[f[0]] || [])[0] || '').trim());
  if (miss.length) { if (err) err.textContent = L(['Монгол хэл дээрх заавал бөглөх талбарыг бөглөнө үү', 'Fill in the required Mongolian fields']) + ': ' + miss.map((f) => L(f[2])).join(', '); if (ADM.lang !== 'mn') admLang('mn'); return; }
  if (e.col === 'projects') d.p = Math.max(0, Math.min(100, Math.round(+d.p || 0)));
  if (e.col === 'news') { d.views = +d.views || 0; if (!d.d) d.d = ubStamp(ubNow()); }
  if (e.col === 'events') d.price = Math.max(0, +d.price || 0);
  const btn = $('[data-act="adm-save"]'); if (btn) btn.disabled = true;
  try { await cmsSave(e.col, e.id, d, sc.title(d), e.isNew ? 'create' : 'update'); closeModal(); toast(L(['Хадгаллаа. Сайт шинэчлэгдлээ.', 'Saved. The site is updated.']), 'circle-check'); }
  catch (er) { if (err) err.textContent = cmsErr(er); if (btn) btn.disabled = false; }
}
function admLang(v) { ADM.lang = v; selectTab('admlang', v); $$('#adm-form [data-lg]').forEach((el) => { el.hidden = el.dataset.lg !== v; }); }
async function admTranslate(btn) {
  const e = ADM.edit, fn = Chat.fn; if (!e || !fn || typeof fn.json !== 'function') return;
  const keys = SCHEMA[e.col].fields.filter((f) => f[1] === 'bi' || f[1] === 'bitext').map((f) => f[0]).filter((k) => ((e.doc[k] || [])[0] || '').trim());
  if (!keys.length) { toast(L(['Эхлээд монгол текстээ бичнэ үү', 'Write the Mongolian text first']), 'info'); return; }
  const src = {}; keys.forEach((k) => { src[k] = e.doc[k][0]; });
  const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>${L(['Орчуулж байна', 'Translating'])}`;
  try {
    const out = await fn.json(`Translate each value of this JSON from Mongolian (Cyrillic) into clear, natural English for an official city government website. Keep names, numbers, dates and paragraph breaks (blank lines). Return only JSON with exactly the same keys.\n\n${JSON.stringify(src)}`, { modelTier: 'quick', cache: false });
    keys.forEach((k) => { if (out && typeof out[k] === 'string') { const arr = (e.doc[k] || ['', '']).slice(); arr[1] = out[k]; e.doc[k] = arr; const inp = $(`#adm-form [data-k="${k}"][data-i="1"]`); if (inp) inp.value = out[k]; } });
    admLang('en'); admPrevUpdate(); toast(L(['Орчууллаа. Шалгаад хадгална уу.', 'Translated. Review, then save.']), 'sparkles');
  } catch (er) { toast(L(['Орчуулж чадсангүй', "Couldn't translate"]), 'triangle-alert'); }
  btn.disabled = false; btn.innerHTML = old;
}
function armed(key, btn, okLabel) {
  if (ADM.arm === key) { ADM.arm = null; return true; }
  ADM.arm = key; const old = btn.innerHTML; btn.innerHTML = `${ic('triangle-alert', 'w-4 h-4')}${okLabel || L(['Дахин дарж баталгаажуулна', 'Click again to confirm'])}`;
  setTimeout(() => { if (ADM.arm === key) { ADM.arm = null; if (document.contains(btn)) btn.innerHTML = old; } }, 3500);
  return false;
}

/* ---- headings & text ---- */
function admTexts() {
  const q = ADM.q.trim().toLowerCase();
  const keys = Object.keys(DEF.texts).filter((k) => (ADM.tg === 'all' || tGroupOf(k) === ADM.tg) && (!ADM.tOnly || CMS.data.texts[k]) && (!q || (k + ' ' + I[k][0] + ' ' + I[k][1]).toLowerCase().includes(q)));
  const groups = [['all', ['Бүгд', 'All']]].concat(TGROUPS.map(([g, l]) => [g, l]), [['other', ['Бусад', 'Other']]]);
  return `<p class="text-muted max-w-[70ch] mb-5">${L(['Сайтын бүх гарчиг, товч, тайлбарын текстийг эндээс монгол, англи хэлээр засна. Хадгалсан даруйд сайт шинэчлэгдэнэ.', 'Edit every heading, button and label on the site in Mongolian and English. The site updates as soon as you save.'])}</p>
    <div class="flex flex-col md:flex-row md:items-center gap-3 mb-3"><div class="relative md:w-80">${ic('search', 'w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input type="search" class="field !h-10 !pl-10 !text-[14px]" placeholder="${esc(L(['Текст хайх', 'Search text']))}" value="${esc(ADM.q)}" data-adm-q/></div><label class="inline-flex items-center gap-2 text-[14px] font-semibold"><input type="checkbox" class="adm-switch" data-adm-tonly ${ADM.tOnly ? 'checked' : ''}/>${L(['Зөвхөн өөрчилсөн', 'Changed only'])}</label><span class="md:ml-auto text-[13px] text-muted">${L([`${keys.length} текст`, `${keys.length} texts`])}</span></div>
    <div class="flex gap-1.5 overflow-x-auto no-scrollbar mb-4">${groups.map(([g, l]) => `<button type="button" class="chip !h-9 shrink-0" data-act="adm-tgroup" data-v="${g}" aria-pressed="${ADM.tg === g}">${esc(L(l))}</button>`).join('')}</div>
    <div class="card overflow-hidden"><div class="hidden md:grid grid-cols-[170px_1fr_1fr_112px] gap-3 px-4 py-2.5 bg-soft border-b border-line text-[12.5px] font-bold text-muted"><span>${L(['Түлхүүр', 'Key'])}</span><span>Монгол</span><span>English</span><span></span></div>
    <ul class="divide-y divide-line">${keys.slice(0, 400).map((k) => { const over = !!CMS.data.texts[k]; return `<li class="grid md:grid-cols-[170px_1fr_1fr_112px] gap-2 md:gap-3 px-4 py-3 items-start" data-trow="${k}"><span class="text-[12.5px] text-muted break-all pt-2">${esc(k)}${over ? `<span class="badge b-blue ml-1.5 !h-5">${L(['Өөрчилсөн', 'Changed'])}</span>` : ''}</span><textarea rows="1" class="field !h-auto !py-2 !text-[14px] min-h-[40px]" data-tk="${k}" data-ti="0" aria-label="${esc(k)} MN">${esc(I[k][0])}</textarea><textarea rows="1" class="field !h-auto !py-2 !text-[14px] min-h-[40px]" data-tk="${k}" data-ti="1" aria-label="${esc(k)} EN">${esc(I[k][1])}</textarea><span class="flex gap-1"><button type="button" class="btn btn-sm btn-blue flex-1" data-act="adm-tsave" data-k="${k}" disabled>${L(['Хадгалах', 'Save'])}</button>${over ? `<button type="button" class="icon-btn !w-9 !h-9 !rounded-lg hover:bg-soft" data-act="adm-treset" data-k="${k}" title="${esc(L(['Анхны утга', 'Restore default']))}" aria-label="${esc(L(['Анхны утга', 'Restore default']))}">${ic('rotate-ccw', 'w-4 h-4')}</button>` : ''}</span></li>`; }).join('')}</ul></div>`;
}

/* ---- login (backend горим) ---- */
function admLoginHTML() {
  return `<div class="min-h-[100dvh] grid place-items-center p-6 bg-page"><form data-form="adm-login" class="card w-full max-w-sm p-8" autocomplete="on">
    <div class="flex justify-center">${logoMark('w-14 h-14')}</div>
    <h1 class="mt-4 text-center text-[22px] font-extrabold">${L(['Удирдлагын хэсэг', 'Content admin'])}</h1>
    <p class="mt-1 text-center text-[14px] text-muted">${L(['Үргэлжлүүлэхийн тулд админы нууц үгээ оруулна уу.', 'Enter the admin password to continue.'])}</p>
    <input type="text" name="username" value="admin" autocomplete="username" class="hidden" tabindex="-1" aria-hidden="true"/>
    <label class="block mt-6 text-[13.5px] font-semibold mb-2" for="adm-pw">${L(['Нууц үг', 'Password'])}</label>
    <input id="adm-pw" name="password" type="password" class="field" autocomplete="current-password" required/>
    <p id="adm-pw-err" class="mt-2 min-h-[20px] text-[13px] font-semibold text-ubred" role="alert"></p>
    <button type="submit" class="btn btn-ink w-full mt-2">${ic('log-in', 'w-[18px] h-[18px]')}${L(['Нэвтрэх', 'Sign in'])}</button>
    <button type="button" class="btn btn-ghost w-full mt-2" data-act="adm-exit">${ic('arrow-left', 'w-[18px] h-[18px]')}${L(['Сайт руу буцах', 'Back to site'])}</button>
    <p class="mt-5 text-[12.5px] text-muted text-center leading-relaxed">${L(['Нууц үг төслийн .env файлын ADMIN_PASSWORD-д байна.', 'The password is ADMIN_PASSWORD in the project’s .env file.'])}</p>
  </form></div>`;
}
async function admLogin(form) {
  const pw = form.password.value, err = $('#adm-pw-err'), btn = form.querySelector('[type="submit"]');
  if (!pw) return;
  btn.disabled = true; err.textContent = '';
  try { await cmsLogin(pw); toast(L(['Амжилттай нэвтэрлээ', 'Signed in']), 'circle-check'); }
  catch (e) { btn.disabled = false; err.textContent = e.code === 'too_many_attempts' ? L(['Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу.', 'Too many attempts. Try again in 15 minutes.']) : e.code === 'wrong_password' ? L(['Нууц үг буруу байна', 'Wrong password']) : cmsErr(e); form.password.select(); }
}

/* ---- inbox: иргэдийн илгээсэн маягтууд ---- */
const SUB_KIND = { report: ['siren', 'text-ubred bg-ubred/10', ['Эрсдэл мэдээлэл', 'Hazard report']], idea: ['message-square-plus', 'text-ubblue bg-ubblue/10', ['Санал хүсэлт', 'Idea']], digest: ['mail', 'text-greenink bg-ubgreen/10', ['Имэйл бүртгэл', 'Newsletter']] };
const SUB_ST = [['new', ['Шинэ', 'New'], 'b-red'], ['progress', ['Шийдвэрлэж буй', 'In progress'], 'b-blue'], ['done', ['Шийдвэрлэсэн', 'Resolved'], 'b-on'], ['rejected', ['Татгалзсан', 'Rejected'], 'b-mute']];
let inboxBusy = false;
async function admInboxLoad() {
  if (inboxBusy || CMS.mode !== 'api') return; inboxBusy = true;
  try { ADM.inbox = (await apiCall('/submissions')).list; ADM.inboxErr = null; } catch (e) { ADM.inboxErr = cmsErr(e); }
  inboxBusy = false;
  if (S.route === 'admin' && ADM.view === 'inbox') admRefresh();
}
function admInboxChanged() { if (S.route === 'admin' && ADM.view === 'inbox') admInboxLoad(); else ADM.inbox = null; }
function admInbox() {
  if (CMS.mode !== 'api') return `<div class="card p-10 text-center text-muted">${ic('server-off', 'w-8 h-8 mx-auto mb-3 opacity-60')}${L(['Иргэдийн илгээсэн маягтууд зөвхөн сервертэй (npm run dev эсвэл npm start) үед хадгалагдана.', 'Submissions are only stored when the site runs with its server (npm run dev or npm start).'])}</div>`;
  if (!ADM.inbox) { admInboxLoad(); return `<div class="card p-10 text-center text-muted"><span class="typing"><span></span><span></span><span></span></span></div>`; }
  const f = ADM.ibf || 'all', all = ADM.inbox, list = f === 'all' ? all : SUB_KIND[f] ? all.filter((x) => x.kind === f) : all.filter((x) => x.status === f);
  const chip = (v, label, n) => `<button type="button" class="chip !h-9" data-act="adm-inbox-f" data-v="${v}" aria-pressed="${f === v}">${label}<span class="tnum opacity-60">${n}</span></button>`;
  const when = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${fDate(d)}, ${hhmm(d)}`; };
  const row = (x) => {
    const k = SUB_KIND[x.kind] || SUB_KIND.idea, dt = x.data || {}, rc = x.kind === 'report' ? (RCAT[dt.cat] || RCAT.other) : null;
    const title = x.kind === 'report' ? L(rc.t) : x.kind === 'digest' ? dt.email : ((TOPICS.find((tp) => tp[0] === dt.topic) || [])[EN() ? 2 : 1] || L(k[2]));
    const text = x.kind === 'report' ? dt.desc : x.kind === 'idea' ? dt.text : '';
    return `<li class="card p-5"><div class="flex flex-wrap items-start gap-4">
      <span class="w-11 h-11 rounded-xl grid place-items-center shrink-0 ${k[1]}">${ic(rc ? rc.i : k[0], 'w-5 h-5')}</span>
      <div class="flex-1 min-w-0"><div class="flex flex-wrap items-center gap-x-3 gap-y-1"><b class="text-[15.5px] break-all">${esc(title)}</b><span class="text-[12.5px] text-muted tnum">${esc(x.id)}</span>${dt.gov ? `<span class="badge b-blue">${L(['Засаг даргад', 'To the Governor'])}</span>` : ''}</div>
        <p class="mt-1 text-[12.5px] text-muted flex flex-wrap gap-x-3">${esc(L(k[2]))}<span>${when(x.created_at)}</span>${dt.dist ? `<span class="inline-flex items-center gap-1">${ic('map-pin', 'w-3.5 h-3.5')}${esc(dt.dist)}</span>` : ''}</p>
        ${text ? `<p class="mt-3 text-[14.5px] leading-relaxed whitespace-pre-wrap">${esc(text)}</p>` : ''}
        ${dt.photo ? `<a href="${esc(dt.photo)}" target="_blank" rel="noopener" class="mt-3 inline-block"><img src="${esc(dt.photo)}" alt="${esc(L(['Иргэний оруулсан зураг', 'Submitted photo']))}" class="w-40 h-28 rounded-xl object-cover border border-line" loading="lazy"/></a>` : ''}</div>
      <div class="flex items-center gap-2 shrink-0">${x.kind === 'digest' ? '' : `<select class="field !h-9 !py-0 !text-[13.5px] !w-auto" data-sub-status="${esc(x.id)}" aria-label="${esc(L(['Төлөв', 'Status']))}">${SUB_ST.map(([v, l]) => `<option value="${v}" ${x.status === v ? 'selected' : ''}>${esc(L(l))}</option>`).join('')}</select>`}
        <button type="button" class="icon-btn !rounded-lg border border-line text-muted hover:text-ubred" data-act="adm-sub-del" data-id="${esc(x.id)}" aria-label="${esc(L(['Устгах', 'Delete']))}" title="${esc(L(['Устгах', 'Delete']))}">${ic('trash-2', 'w-4 h-4')}</button></div>
    </div></li>`;
  };
  return `${ADM.inboxErr ? `<p class="mb-4 text-ubred font-semibold">${esc(ADM.inboxErr)}</p>` : ''}
    <div class="flex flex-wrap gap-2 mb-5">${chip('all', L(['Бүгд', 'All']), all.length)}${Object.entries(SUB_KIND).map(([v, k]) => chip(v, L(k[2]), all.filter((x) => x.kind === v).length)).join('')}<span class="w-px bg-line mx-1"></span>${SUB_ST.slice(0, 3).map(([v, l]) => chip(v, L(l), all.filter((x) => x.status === v && x.kind !== 'digest').length)).join('')}</div>
    ${list.length ? `<ul class="space-y-3">${list.map(row).join('')}</ul>` : `<div class="card p-10 text-center text-muted">${ic('inbox', 'w-8 h-8 mx-auto mb-3 opacity-60')}${L(['Одоогоор хүсэлт ирээгүй байна', 'Nothing here yet'])}</div>`}`;
}
document.addEventListener('change', async (e) => {
  const sel = e.target.closest && e.target.closest('[data-sub-status]'); if (!sel) return;
  const id = sel.dataset.subStatus, st = sel.value; sel.disabled = true;
  try { await apiCall('/submissions/' + encodeURIComponent(id), { method: 'PATCH', body: { status: st } }); const it = (ADM.inbox || []).find((x) => x.id === id); if (it) it.status = st; toast(L(['Төлөв шинэчлэгдлээ', 'Status updated']), 'circle-check'); }
  catch (er) { toast(cmsErr(er), 'triangle-alert'); }
  sel.disabled = false;
});

/* ---- settings ---- */
function admSettings() {
  const news = mergedItems('news').filter((n) => !n.draft).sort((a, b) => (parseUB(b.d) || 0) - (parseUB(a.d) || 0));
  const opt = (sel, noZar) => news.filter((n) => !noZar || !n.zar).map((n) => `<option value="${n.id}" ${n.id === sel ? 'selected' : ''}>${esc(L(n.t))}</option>`).join('');
  const role = CMS.mode === 'api' ? L(['Админ', 'Admin']) : CMS.mode === 'db' ? (CMS.isOwner ? L(['Эзэмшигч', 'Owner']) : L(['Редактор', 'Editor'])) : L(['Туршилтын хэрэглэгч', 'Demo user']);
  return `<div class="grid grid-cols-1 lg:grid-cols-5 gap-5"><div class="card p-6 lg:col-span-3 space-y-5"><h2 class="text-[18px] font-extrabold">${L(['Нүүр хуудас', 'Home page'])}</h2>
      <label class="block"><span class="adm-label">${L(['Гол мэдээ', 'Lead story'])}</span><select class="field" data-set="heroId">${opt(HERO_ID, true)}</select></label>
      <label class="block"><span class="adm-label">${L(['«Өнөөдөр хотод» хэсгийн онцлох мэдээ', 'Featured story in "Today in the city"'])}</span><select class="field" data-set="featuredId">${opt(FEATURED_ID, true)}</select></label>
      <div><span class="adm-label">${L(['Засаг даргын мэдээ (3 хүртэл)', "Governor's news (up to 3)"])}</span><div class="rounded-xl border border-line max-h-[260px] overflow-auto thin-scroll divide-y divide-line">${news.map((n) => `<label class="flex items-center gap-3 px-4 py-2.5 cursor-pointer"><input type="checkbox" class="w-[18px] h-[18px] accent-[#1D5BFF]" data-gov="${n.id}" ${GOV.includes(n.id) ? 'checked' : ''}/><span class="text-[14px] leading-snug">${esc(L(n.t))}</span></label>`).join('')}</div></div>
      <label class="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3"><span><b class="block text-[14.5px]">${L(['Яаралтай анхааруулгын мөр', 'Urgent alert ticker'])}</b><span class="text-[13px] text-muted">${L(['Шар гүйдэг мөрийг сайт дээр харуулах', 'Show the yellow ticker on the site'])}</span></span><input type="checkbox" class="adm-switch" data-set="tickerOn" ${SET.tickerOn !== false ? 'checked' : ''}/></label>
      <div class="flex justify-end"><button type="button" class="btn btn-blue" data-act="adm-set-save">${ic('check', 'w-[18px] h-[18px]')}${L(['Тохиргоог хадгалах', 'Save settings'])}</button></div></div>
    <div class="lg:col-span-2 space-y-5"><div class="card p-6"><h2 class="text-[18px] font-extrabold">${L(['Систем', 'System'])}</h2><dl class="mt-4 space-y-3 text-[14px]"><div class="flex justify-between gap-3"><dt class="text-muted">${L(['Холболт', 'Connection'])}</dt><dd>${admModePill()}</dd></div><div class="flex justify-between gap-3"><dt class="text-muted">${L(['Таны эрх', 'Your role'])}</dt><dd class="font-semibold">${role}</dd></div><div class="flex justify-between gap-3"><dt class="text-muted">${L(['Өөрчилсөн бичлэг', 'Changed records'])}</dt><dd class="font-semibold tnum">${CMS_COLS.reduce((a, c) => a + Object.keys(CMS.data[c] || {}).length, 0)}</dd></div></dl>
      <p class="mt-4 text-[13px] text-muted leading-relaxed">${CMS.mode === 'api' ? L(['Мэдээлэл серверийн SQLite өгөгдлийн санд (data/ub.sqlite) хадгалагдана. Сайтын зочид уншина, зөвхөн нэвтэрсэн админ засна.', 'Content is stored in the server\u2019s SQLite database (data/ub.sqlite). Visitors read it; only a signed-in admin can change it.']) : CMS.mode === 'db' ? L(['Мэдээлэл энэ хуудасны хамгаалалттай санд хадгалагдана. Үзэгчид уншина, зөвхөн эзэмшигч, редакторууд засна.', 'Content is stored in this page\u2019s protected database. Viewers read it; only the owner and editors change it.']) : L(['Энэ туршилтын горимд өөрчлөлт таны хөтчийн санах ойд хадгалагдана.', 'In demo mode, changes are stored in your browser.'])}</p></div>
      ${CMS.mode === 'local' || CMS.isOwner ? `<div class="card p-6 border-ubred/30"><h2 class="text-[18px] font-extrabold text-ubred">${L(['Аюултай бүс', 'Danger zone'])}</h2><p class="mt-2 text-[13.5px] text-muted">${L(['Бүх засвар, нэмсэн бичлэг, оруулсан зургийг устгаж, сайтыг анхны агуулгад нь буцаана.', 'Remove every edit, added item and uploaded photo, returning the site to its original content.'])}</p><button type="button" class="btn btn-sm btn-ghost !text-ubred mt-4" data-act="adm-wipe">${ic('trash-2', 'w-4 h-4')}${L(['Бүх өөрчлөлтийг арилгах', 'Remove all changes'])}</button></div>` : ''}</div></div>`;
}

/* ---- events ---- */
document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, d = el.dataset;
  if (a === 'admin') { closeMenu(); if (MODAL) closeModal(true); setRoute('admin'); return; }
  if (a === 'adm-site-edit') { closeModal(true); ADM.view = d.col; setRoute('admin'); admOpen(d.col, d.id); return; }
  if (a.indexOf('adm-') !== 0 && !(a === 'tab' && d.tabs === 'admlang')) return;
  if (a === 'tab') { admLang(d.v); return; }
  switch (a) {
    case 'adm-exit': setRoute('home'); window.scrollTo(0, 0); break;
    case 'adm-logout': await cmsLogout(); toast(L(['Удирдлагаас гарлаа', 'Signed out of admin']), 'log-out'); break;
    case 'adm-inbox-f': ADM.ibf = d.v; renderAdmin(); break;
    case 'adm-sub-del': { if (!armed('sub-' + d.id, el)) break; try { await apiCall('/submissions/' + encodeURIComponent(d.id), { method: 'DELETE' }); ADM.inbox = (ADM.inbox || []).filter((x) => x.id !== d.id); renderAdmin(); toast(L(['Устгалаа', 'Deleted']), 'trash-2'); } catch (e) { toast(cmsErr(e), 'triangle-alert'); } break; }
    case 'adm-go': ADM.view = d.v; ADM.q = ''; ADM.f = 'all'; renderAdmin(); window.scrollTo(0, 0); break;
    case 'adm-new': if (d.col) { ADM.view = d.col; renderAdmin(); } admOpen(d.col || ADM.view); break;
    case 'adm-edit': admOpen(d.col, d.id); break;
    case 'adm-filter': ADM.f = d.v; renderAdmin(); break;
    case 'adm-tgroup': ADM.tg = d.v; renderAdmin(); break;
    case 'adm-pick': if (ADM.edit) { ADM.edit.doc[d.k] = d.v; $$(`[data-act="adm-pick"][data-k="${d.k}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === d.v))); admPrevUpdate(); } break;
    case 'adm-icon': if (ADM.edit) { ADM.edit.doc.i = d.v; $$('[data-act="adm-icon"]').forEach((b) => { const on = b.dataset.v === d.v; b.setAttribute('aria-pressed', String(on)); b.classList.toggle('bg-ink', on); b.classList.toggle('text-card', on); b.classList.toggle('border-transparent', on); b.classList.toggle('border-line', !on); }); admPrevUpdate(); } break;
    case 'adm-img-rec': case 'adm-img-pal': case 'adm-img-roll': { if (!ADM.edit) break; const cur = ADM.edit.doc.img || 'skyline:day:1', p = cur.indexOf('media:') === 0 ? ['skyline', 'day', rseed()] : cur.split(':'); if (a === 'adm-img-rec') p[0] = d.v; if (a === 'adm-img-pal') p[1] = d.v; if (a === 'adm-img-roll') p[2] = rseed(); admSetImg(`${p[0]}:${p[1] || 'day'}:${p[2] || rseed()}`); break; }
    case 'adm-save': admSave(); break;
    case 'adm-ai': admTranslate(el); break;
    case 'adm-del': { const e = ADM.edit; if (!e || !armed('del-' + e.id, el)) break; try { await cmsRemove(e.col, e.id, SCHEMA[e.col].title(e.doc)); closeModal(); toast(L(['Устгалаа', 'Deleted']), 'trash-2'); } catch (er) { toast(cmsErr(er), 'triangle-alert'); } break; }
    case 'adm-del-row': { if (!armed('row-' + d.id, el, '')) { el.classList.add('!text-ubred', 'bg-ubred/10'); break; } const it = mergedItems(d.col).find((x) => x.id === d.id); try { await cmsRemove(d.col, d.id, it ? SCHEMA[d.col].title(it) : d.id); toast(L(['Устгалаа', 'Deleted']), 'trash-2'); } catch (er) { toast(cmsErr(er), 'triangle-alert'); } break; }
    case 'adm-revert': { const e = ADM.edit; if (!e) break; try { await cmsRevert(e.col, e.id, SCHEMA[e.col].title(e.doc)); closeModal(); toast(L(['Анхны хувилбарт буцаалаа', 'Reverted to the original']), 'rotate-ccw'); } catch (er) { toast(cmsErr(er), 'triangle-alert'); } break; }
    case 'adm-tsave': { const k = d.k, mn = $(`[data-tk="${k}"][data-ti="0"]`).value, en = $(`[data-tk="${k}"][data-ti="1"]`).value; el.disabled = true; try { await cmsSave('texts', k, { mn, en }, k, 'update'); $$(`[data-trow="${k}"] [data-tdirty]`).forEach((x) => x.removeAttribute('data-tdirty')); toast(L(['Текст шинэчлэгдлээ', 'Text updated']), 'circle-check'); } catch (er) { el.disabled = false; toast(cmsErr(er), 'triangle-alert'); } break; }
    case 'adm-treset': try { await cmsRevert('texts', d.k, d.k); toast(L(['Анхны утгад буцлаа', 'Default restored']), 'rotate-ccw'); } catch (er) { toast(cmsErr(er), 'triangle-alert'); } break;
    case 'adm-set-save': { const gov = $$('[data-gov]').filter((x) => x.checked).map((x) => x.dataset.gov).slice(0, 3); const body = { heroId: $('[data-set="heroId"]').value, featuredId: $('[data-set="featuredId"]').value, gov, tickerOn: $('[data-set="tickerOn"]').checked }; try { await cmsSave('settings', 'main', body, L(['Тохиргоо', 'Settings']), 'update'); toast(L(['Тохиргоо хадгалагдлаа', 'Settings saved']), 'circle-check'); } catch (er) { toast(cmsErr(er), 'triangle-alert'); } break; }
    case 'adm-wipe': { if (!armed('wipe', el)) break; el.disabled = true; try { for (const c of CMS_COLS) for (const id of Object.keys(CMS.data[c] || {})) await cmsDelete(c, id); toast(L(['Сайт анхны агуулгадаа буцлаа', 'The site is back to its original content']), 'rotate-ccw'); } catch (er) { toast(cmsErr(er), 'triangle-alert'); } el.disabled = false; break; }
    default: break;
  }
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (el.hasAttribute && el.hasAttribute('data-adm-q')) { ADM.q = el.value; const pos = el.selectionStart; renderAdmin(); const n = $('[data-adm-q]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* type=search */ } } return; }
  if (el.dataset && el.dataset.tk) { el.setAttribute('data-tdirty', '1'); const b = $(`[data-act="adm-tsave"][data-k="${el.dataset.tk}"]`); if (b) b.disabled = false; }
});
document.addEventListener('change', async (ev) => {
  const el = ev.target;
  if (el.dataset && el.dataset.alertToggle) { const it = mergedItems('alerts').find((x) => x.id === el.dataset.alertToggle); if (!it) return; const doc = admForEdit('alerts', it); doc.off = el.checked ? 0 : 1; try { await cmsSave('alerts', it.id, doc, L(it.k), 'update'); toast(el.checked ? L(['Анхааруулга сайт дээр гарлаа', 'Alert is live']) : L(['Анхааруулгыг нуулаа', 'Alert hidden']), 'siren'); } catch (er) { el.checked = !el.checked; toast(cmsErr(er), 'triangle-alert'); } }
  if (el.hasAttribute && el.hasAttribute('data-adm-tonly')) { ADM.tOnly = el.checked; renderAdmin(); }
  if (el.dataset && el.dataset.gov) { const n = $$('[data-gov]').filter((x) => x.checked).length; if (n > 3) { el.checked = false; toast(L(['Хамгийн ихдээ 3 мэдээ сонгоно', 'Pick up to 3 stories']), 'info'); } }
});
