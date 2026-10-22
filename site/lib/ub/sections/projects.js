import { Scene, inDistrict } from '../art/scene.js';
import { renderReact } from '../core/bridge.js';
import { $, esc, ic, reduced } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { openModal } from '../core/modal.js';
import { ring } from '../core/motion.js';
import { L, S, t } from '../core/state.js';
import { bn } from '../core/time.js';
import { MEGA_STAGE, PCAT, PROJECTS } from '../data/projects.js';
import { mediaImg } from '../features/media-player.js';
import { MAPS, MapView } from './map-view.js';
/* ================= Projects ================= */
export const pStatus = (p) => (p.p >= 100 ? 'done' : p.p < 20 ? 'planned' : 'progress');
/* Бодит мега төсөл (ulaanbaatar.mn): ангиллаар шүүнэ; жишээ төсөл: төлвөөр */
export const projLive = () => PROJECTS.some((p) => p.live);
export function projFiltered() { return PROJECTS.filter((p) => S.projSt === 'all' || (PCAT[S.projSt] ? p.c === S.projSt : pStatus(p) === S.projSt)); }
export function pctRing(p, size, stroke, color, fs) { return `<span class="relative grid place-items-center shrink-0">${ring(p, size, stroke, color)}<b class="absolute tnum" style="font-size:${fs}px">${p}%</b></span>`; }
/* Гүйцэтгэл мэдэгдэж байвал цагираг, үгүй бол ангиллын тэмдэг */
export function projBadge(p, size, stroke, fs) { const c = PCAT[p.c] || PCAT.transport; return p.p != null ? pctRing(p.p, size, stroke, c.c, fs) : `<span class="grid place-items-center shrink-0 rounded-full" style="width:${size}px;height:${size}px;background:${c.c}14;color:${c.c};box-shadow:inset 0 0 0 ${stroke / 2}px ${c.c}33">${ic(c.i, size > 50 ? 'w-6 h-6' : 'w-5 h-5')}</span>`; }
export const mpDate = (d) => { const m = String(d || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[1]}.${m[2]}.${m[3]}` : ''; };
export const mpImg = (u, w) => (u ? (typeof mediaImg === 'function' ? mediaImg(u, w) : u) : '');
/* ipiu.mn: үе шатны шошго, төсөв (сая $), хугацаа */
export const mpStage = (p) => (p.stage && MEGA_STAGE[p.stage] ? `<span class="mp-stage" style="--sc:${MEGA_STAGE[p.stage][2]}">${esc(L(MEGA_STAGE[p.stage]))}</span>` : '');
export const mpUsd = (v) => (v == null ? '' : v >= 1000 ? L([`${(v / 1000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} тэрбум $`, `$${(v / 1000).toFixed(2).replace(/\.?0+$/, '')} bn`]) : L([`${String(+v.toFixed(1)).replace('.', ',')} сая $`, `$${+v.toFixed(1)} m`]));
export const mpYears = (p) => (p.from && p.due ? `${p.from}–${p.due}` : p.due ? String(p.due) : '');
export function projPopup(id) {
  const p = PROJECTS.find((x) => x.id === id), c = PCAT[p.c], z = inDistrict(p.x, p.y), st = pStatus(p);
  if (p.live) {   // бодит төсөл: гүйцэтгэл (мэдээнд бичигдсэн бол), сүүлийн мэдээ, «Дэлгэрэнгүй»
    const u = (p.ups || [])[0];
    return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3">${projBadge(p, 56, 6, 13)}<div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(p.n))}</p><p class="text-[12.5px] text-muted mt-0.5">${(p.ups || []).length} ${L(['мэдээ', 'updates'])}${u ? ' · ' + L(['сүүлд', 'latest']) + ' ' + mpDate(u.d) : ''}</p>${p.ipOwn ? `<p class="mt-1.5 flex flex-wrap items-center gap-1.5">${mpStage(p)}${p.budUsd != null ? `<span class="text-[12px] font-semibold tnum">${esc(mpUsd(p.budUsd))}</span>` : ''}${mpYears(p) ? `<span class="text-[12px] text-muted tnum">· ${mpYears(p)}</span>` : ''}</p>` : ''}</div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="proj-close" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div>
      ${u ? `<button type="button" class="mt-3 w-full flex gap-3 items-center text-left rounded-lg bg-soft p-2 hover:bg-line/60 transition-colors" data-act="proj-open" data-id="${p.id}">${u.img ? `<img src="${esc(mpImg(u.img, 240))}" alt="" loading="lazy" class="w-16 h-12 rounded-md object-cover shrink-0">` : ''}<span class="text-[12.5px] font-semibold leading-snug line-clamp-2">${esc(u.t)}</span></button>` : ''}
      <button type="button" class="btn btn-sm btn-ink w-full mt-3" data-act="proj-open" data-id="${p.id}">${L(['Дэлгэрэнгүй', 'Details'])}${ic('arrow-right', 'w-4 h-4')}</button></div>`;
  }
  return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3">${pctRing(p.p, 56, 6, c.c, 13)}<div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(p.n))}</p><p class="text-[12.5px] text-muted mt-0.5">${esc(L(z.n))} ${L(['дүүрэг', 'District'])}</p></div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="proj-close" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div>
    <div class="mt-3 grid grid-cols-3 gap-2 text-[12px]"><div class="rounded-lg bg-soft p-2"><p class="text-muted">${t('budget')}</p><b class="tnum text-[12.5px]">${bn(p.bud)}</b></div><div class="rounded-lg bg-soft p-2"><p class="text-muted">${t('dueYear')}</p><b class="tnum text-[12.5px]">${esc(p.due)}</b></div><div class="rounded-lg bg-soft p-2"><p class="text-muted">${L(['Төлөв', 'Status'])}</p><b class="text-[12.5px]">${t(st === 'done' ? 'st_done' : st === 'planned' ? 'st_planned' : 'st_progress')}</b></div></div></div>`;
}
/* «24 мега төсөл» хэсгийг site/app/home/Projects.tsx зурна. Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ.
   Бодит төсөлтэй үед «24 мега төсөл» хуудсанд (/projects) ангиллын chip, карт, «Газрын зураг дээр» гарчиг нэмэгдэнэ. */
export function projData() {
  const known = PROJECTS.filter((p) => p.p != null), avg = known.length ? Math.round(known.reduce((a, p) => a + p.p, 0) / known.length) : 0, done = known.filter((p) => p.p >= 100).length;
  const live = projLive(), nUps = PROJECTS.reduce((a, p) => a + (p.ups || []).length, 0), page = live && S.route === 'page' && S.page === 'projects', list = projFiltered();
  const stats = [[PROJECTS.length, L(['мега төсөл', 'flagship projects'])]].concat(live
    ? (PROJECTS.some((p) => p.budUsd != null) ? [[mpUsd(PROJECTS.reduce((a, p) => a + (p.ipOwn && p.budUsd ? p.budUsd : 0), 0)), L(['нийт төсөв (ipiu.mn)', 'total budget (ipiu.mn)'])]] : []).concat([[nUps, L(['явцын мэдээ', 'progress updates'])]])
    : [[avg + '%', t('avgProgress')], [done, L(['ашиглалтад орсон', 'completed'])]]);
  const catChips = [['all', `${t('f_all')} · ${PROJECTS.length}`]].concat(Object.keys(PCAT).filter((k) => PROJECTS.some((p) => p.c === k)).map((k) => [k, `${L(PCAT[k].t)} · ${PROJECTS.filter((p) => p.c === k).length}`, PCAT[k].c]));
  return {
    title: t('projTitle'), desc: t('projDesc'), page, st: S.projSt,
    stats: stats.map(([v, l]) => [String(v), l]),
    chips: catChips,
    side: live ? catChips : [['all', t('f_all')], ['progress', t('st_progress')], ['done', t('st_done')], ['planned', t('st_planned')]],
    count: `${list.length} ${L(['төсөл', 'projects'])}`,
    head: { list: L(['Төслүүд', 'Projects']), map: L(['Газрын зураг дээр', 'On the map']) },
    noResults: t('noResults'),
    legend: Object.values(PCAT).map((c) => ({ c: c.c, t: L(c.t) })),
    list: list.map((p) => { const c = PCAT[p.c], z = inDistrict(p.x, p.y);
      const sub = p.live ? [p.stage && MEGA_STAGE[p.stage] ? L(MEGA_STAGE[p.stage]) : L(c.t), mpYears(p), p.ups && p.ups.length ? `${p.ups.length} ${L(['мэдээ', 'updates'])}` : ''].filter(Boolean).join(' · ') : `${L(z.n)}, ${L(c.t)}`;
      return { id: p.id, sel: p.id === S.projSel, name: L(p.n), sub, badge: projBadge(p, 44, 4.5, 11) }; }),
    cards: page ? list.map(projCard) : [],
    /* Газрын зургийг дахин үүсгэх түлхүүр: хэл эсвэл төслийн өгөгдөл (CMS, live-data) өөрчлөгдөхөд */
    mapKey: S.lang + '|' + PROJECTS.map((p) => `${p.id}:${p.c}:${p.p}:${p.x},${p.y}`).join(','),
  };
}
/* «24 мега төсөл» хуудасны карт: мэдээний карттай ижил хэлбэр (сүүлийн зураг, ангилал, нэр, сүүлийн мэдээ, гүйцэтгэл) */
export function projCard(p) {
  const c = PCAT[p.c] || PCAT.transport, u = (p.ups || [])[0], img = (p.ups || []).find((x) => x.img);
  /* .scene > svg: зураг/Scene ба хувийн шошгыг нэг HTML болгож .scene-ийн шууд хүүхэд болгоно */
  const media = (p.ipOwn && p.ipiu.img ? `<img src="${esc(p.ipiu.img)}" alt="" loading="lazy" decoding="async">` : img ? `<img src="${esc(mpImg(img.img, 1280))}" alt="" loading="lazy" decoding="async">` : Scene('build:day:' + (p.x % 97)))
    + (p.p != null ? `<span class="mpc-pct tnum" style="--mc:${c.c}">${p.p}%</span>` : '');
  return {
    id: p.id, color: c.c, cat: L(c.t), media, name: L(p.n),
    stage: p.stage && MEGA_STAGE[p.stage] ? { t: L(MEGA_STAGE[p.stage]), c: MEGA_STAGE[p.stage][2] } : null,
    text: p.ipOwn && L(p.ipiu.tagline) ? L(p.ipiu.tagline) : u ? u.t : '',
    bar: p.p != null && p.ipOwn ? Math.min(100, p.p) : null,
    usd: p.budUsd != null ? mpUsd(p.budUsd) : '', years: mpYears(p), date: u ? mpDate(u.d) : '', nUps: (p.ups || []).length,
  };
}
HOME.projects = projData;
/* Газрын зураг (#proj-map): React ref-ээр дуудна; цэвэрлэх функц буцаана (useEffect cleanup) */
HOME.projMap = (el) => {
  if (MAPS.proj) MAPS.proj.destroy();
  const m = MAPS.proj = new MapView(el, { points: () => projFiltered().map((p) => ({ id: p.id, x: p.x, y: p.y, c: PCAT[p.c].c, i: PCAT[p.c].i, tag: p.p != null ? p.p + '%' : '', v: p.p || 0, label: L(p.n) })), sel: S.projSel, onSelect: (id) => selectProject(id, false), popup: projPopup });
  return () => { m.destroy(); if (MAPS.proj === m) MAPS.proj = null; };
};
/* Мега төслийн дэлгэрэнгүй цонхыг site/app/modals/Project.tsx зурна: ulaanbaatar.mn-ийн явцын мэдээ бүгд (огноо, зураг, товч текст),
   ipiu.mn-ийн албан ёсны мэдээлэл (тоон үзүүлэлт, ажлын хэсгийн явц, үзүүлэлт, он дараалал) эсвэл гүйцэтгэл эх өгүүлбэртэйгээ. Задласан мэдээг цонх өөрөө барина. */
export function openProject(id) {
  const p = PROJECTS.find((x) => x.id === id); if (!p) return;
  openModal({ size: 'lg', label: L(p.n), view: 'Project', props: { id } });
}
HOME.projectModal = (id) => {
  const p = PROJECTS.find((x) => x.id === id); if (!p) return null;
  const c = PCAT[p.c] || PCAT.transport, ups = p.ups || [], ip = p.ipiu, heroNews = ups.find((u) => u.img);
  const hero = p.ipOwn && ip.img ? ip.img : heroNews ? mpImg(heroNews.img, 1280) : '';
  const own = p.ipOwn;
  return {
    color: c.c, hero, scene: hero ? '' : Scene('build:day:' + (p.x % 97)), close: t('close'),
    cat: { i: c.i, t: L(c.t) }, title: L(p.n),
    years: own ? mpYears(p) : '', nUps: `${ups.length} ${L(['явцын мэдээ', 'progress updates'])}`, latest: ups[0] ? `${L(['Сүүлд', 'Latest'])}: ${mpDate(ups[0].d)}` : '',
    official: ip ? {
      head: own ? L(['Албан ёсны мэдээлэл', 'Official data']) : L(['Холбогдох төсөл', 'Related project']) + ': ' + L(ip.short),
      src: `https://www.ipiu.mn/projects/?slug=${encodeURIComponent(ip.slug)}`, desc: L(ip.desc),
      kpi: own ? [[L(['Нийт гүйцэтгэл', 'Overall progress']), ip.prog != null ? ip.prog + '%' : '—'], [L(['Төсөв', 'Budget']), ip.budUsd != null ? mpUsd(ip.budUsd) : '—'], [L(['Хугацаа', 'Timeline']), mpYears(p) || '—'], [L(['Үе шат', 'Stage']), p.stage && MEGA_STAGE[p.stage] ? L(MEGA_STAGE[p.stage]) : '—']] : [],
      bar: own && ip.prog != null ? Math.min(100, ip.prog) : null,
      parts: ip.parts.map((x) => ({ l: L(x.l), v: +x.v.toFixed(1), w: Math.min(100, x.v) })),
      metrics: ip.metrics.map((m) => ({ l: L(m.l), v: m.v })),
      tlHead: L(['Он дараалал', 'Timeline']), timeline: ip.timeline.map((x) => ({ d: x.d, t: L(x.t), n: L(x.n) })),
    } : null,
    pct: !ip && p.pct ? { head: L(['Гүйцэтгэл (сүүлийн мэдээгээр)', 'Progress (latest report)']), v: p.pct.v, src: `«${p.pct.src}» · ${mpDate(p.pct.d)}` } : null,
    upsHead: L(['Явцын мэдээ', 'Progress updates']), readFull: L(['ulaanbaatar.mn дээр бүтнээр унших', 'Read in full on ulaanbaatar.mn']), source: L(['Эх сурвалж', 'Source']),
    ups: ups.map((u) => ({ id: u.id, date: mpDate(u.d), title: u.t, thumb: u.img ? mpImg(u.img, 240) : '', img: u.img ? mpImg(u.img, 1280) : '', body: u.b || [], href: `https://ulaanbaatar.mn/mega-project/${encodeURIComponent(u.id)}` })),
  };
};
export function selectProject(id, pan) {
  S.projSel = id; renderReact();   // жагсаалтын сонголтыг Projects.tsx дахин зурна
  if (MAPS.proj) MAPS.proj.select(id, pan !== false);
  const list = $('#proj-list'), btn = list && id && list.querySelector(`[data-id="${id}"]`);
  if (btn) list.scrollTo({ top: btn.offsetTop - list.clientHeight / 2 + 30, behavior: reduced ? 'auto' : 'smooth' });
}
export function setProjSt(v) {
  S.projSt = v;
  if (S.projSel && !projFiltered().some((p) => p.id === S.projSel)) S.projSel = null;
  renderReact();   // chip, жагсаалт, карт (Swap), тоо
  if (MAPS.proj) { MAPS.proj.sel = S.projSel; MAPS.proj.recluster(true); }
}
