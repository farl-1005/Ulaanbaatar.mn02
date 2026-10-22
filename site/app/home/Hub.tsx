'use client';
/* Хаб: нүүрэнд мэдээ / үйлчилгээ / арга хэмжээ таб; /news хуудсанд бүх мэдээ (хайлт, ангилал, эрэмбэ, «Цааш үзэх»); /services хуудсанд үйлчилгээний таб, хайлт.
   Өгөгдөл: src/sections/hub.js hubData(). Таб, ангилал (data-act="tab" | "news-cat"), хайлт (data-input="newsQ" | "svcQ"), «Цааш үзэх» (data-act="news-more")-ийг features/wiring.js барина. */
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';
import { Chips, ModeBadge, Swap, Tabs, type ChipItem } from './parts';

interface HubNews { id: string; zar: boolean; title: string; lead: string; scene: string; rub: string; rubColor: string; ago: string; views: string }
interface HubSvc { id: string; i: string; title: string; desc: string; m: string }
interface HubData {
  hub: string; page: 'news' | 'services' | null; zarLabel: string;
  season: { s: string; fx: boolean } | null;
  cats: ChipItem[]; newsCat: string; svcTab: string; svcQ: string; newsSort: string; newsQ: string;
  all?: { key: string; q: string; feat: boolean; cards: HubNews[]; more: boolean; type: string; summary: string; count: string; pct: number };
  news?: HubNews[]; newsTotal?: string;
  svc?: HubSvc[];
  events?: string[];
}

const HUBS = ['news', 'services', 'events'], SVC = ['citizen', 'business', 'esys'];

/** Утга өөрчлөгдөхөд хөдөлгөөний чиглэл (order дахь байрлалаар): 1 баруун, -1 зүүн. ge: ижил үед 1 */
function useDir(v: string, order: string[], ge?: boolean) {
  const prev = useRef(v);
  useLayoutEffect(() => { prev.current = v; });
  const a = order.indexOf(v), b = order.indexOf(prev.current);
  return a > b || (ge && a === b) ? 1 : -1;
}

export function Hub() {
  const ub = useUB();
  return ub ? <HubIn ub={ub} /> : null;
}

function HubIn({ ub }: { ub: UB }) {
  const d = ub.home.hub() as HubData;
  const dir = useDir(d.hub, HUBS);
  const { t, L } = ub;
  if (d.page === 'news') return <NewsAll ub={ub} d={d} />;
  if (d.page === 'services') return <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-14 lg:pb-20"><div id="hub-panel"><SvcPanel ub={ub} d={d} /></div></div>;
  const more = (k: string, label: string) => <div className="mt-6"><button type="button" className="btn btn-ghost" data-act="page" data-v={k}>{label}<Icon ub={ub} n="arrow-right" c="w-[18px] h-[18px]" /></button></div>;
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-20"><div className="border-t border-line pt-10 lg:pt-14">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7">
        <div><h2 className="h-section">{t('hubTitle')}</h2><p className="mt-2 text-muted max-w-[60ch]">{t('hubDesc')}</p></div>
        <Tabs ub={ub} name="hub" items={[['news', t('tab_news'), 'newspaper'], ['services', t('tab_services'), 'layout-grid'], ['events', t('tab_events'), 'calendar-days']]} active={d.hub} lg label={t('hubTitle')} cls="self-start lg:self-auto" />
      </div>
      <Swap k={d.hub} dir={dir} id="hub-panel">
        {d.hub === 'news' ? (
          <Season ub={ub} d={d}>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0" id="news-chips"><Chips act="news-cat" items={d.cats} active={d.newsCat} /></div>
            <Swap k={d.newsCat} id="news-grid">
              {d.news!.length
                ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{d.news!.map((n, i) => <NewsCard key={n.id} ub={ub} d={d} n={n} feat={i === 0 && d.newsCat === 'all'} />)}</div>
                : <p className="text-muted py-10 text-center">{t('noResults')}</p>}
            </Swap>
            {more('news', `${t('allNews')} (${d.newsTotal})`)}
          </Season>
        ) : d.hub === 'services' ? (
          <><SvcPanel ub={ub} d={d} />{more('services', L(['Бүх үйлчилгээ', 'All services']))}</>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dangerouslySetInnerHTML={{ __html: (d.events || []).join('') }} />
            <div className="mt-6"><button type="button" className="btn btn-ghost" data-act="go" data-sec="events"><Icon ub={ub} n="calendar-days" c="w-[18px] h-[18px]" />{t('allEvents')}</button></div>
          </>
        )}
      </Swap>
    </div></div>
  );
}

/** Улирлын хүрээ (features/season.js): картуудын ард унах тоосонцор + доод талд модтой ландшафт. Улиралгүй (унтраасан) үед хүрээгүй. */
function Season({ ub, d, children }: { ub: UB; d: HubData; children: ReactNode }) {
  return d.season ? <SeasonWrap ub={ub} s={d.season.s} fx={d.season.fx}>{children}</SeasonWrap> : <>{children}</>;
}
function SeasonWrap({ ub, s, fx, children }: { ub: UB; s: string; fx: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const flakes = useMemo(() => (fx ? (ub.home.seasonFlakes(s) as string) : ''), [ub, s, fx]);   // санамсаргүй байрлал: дахин зурахад хөдөлгөөн тасрахгүй
  const trees = useMemo(() => ub.home.seasonTrees(s) as string, [ub, s]);
  useEffect(() => ub.home.seasonObserve(ref.current), [ub]);   // --fall, --k: хэсгийн өндрөөр
  return (
    <div ref={ref} className={`ssn-wrap season-${s}`} data-ssn="">
      {fx && <div className="ssn-fx" aria-hidden="true" dangerouslySetInnerHTML={{ __html: flakes }} />}
      <div className="ssn-body">{children}</div>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: trees }} />
    </div>
  );
}

/** Мэдээний карт (src/sections/hub.js newsCard()-тэй ижил тэмдэглэгээ). na: /news хуудсанд шинээр нэмэгдсэн картын «орох» хөдөлгөөн (styles/10-pages.css .na-grid) */
function NewsCard({ ub, d, n, feat, na }: { ub: UB; d: HubData; n: HubNews; feat?: boolean; na?: { on: boolean; i: number } }) {
  const extra = na ? { 'data-na': na.on ? 1 : 0, style: cssVars({ '--i': na.i }) } : {};
  const hov = 'group-hover:text-ubred transition-colors';
  const meta = <span className="mt-auto pt-4 flex items-center gap-4 text-[12.5px] text-muted">{n.ago}<span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="eye" c="w-4 h-4" />{n.views}</span></span>;
  const rub = <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i className="w-2 h-2 rounded-full" style={{ background: n.rubColor }} />{n.rub}</span>;
  if (n.zar) return (
    <button type="button" {...extra} className="group lift card text-left p-5 flex flex-col relative overflow-hidden" data-act="news" data-id={n.id}>
      <span className="absolute inset-x-0 top-0 h-1 bg-ubyellow" />
      <span className="flex items-center gap-2.5 text-[12.5px] font-semibold text-muted"><span className="w-8 h-8 rounded-lg bg-ubyellow/25 text-amberink grid place-items-center"><Icon ub={ub} n="megaphone" c="w-[18px] h-[18px]" /></span>{d.zarLabel}</span>
      <span className={`mt-3 text-[17px] font-bold leading-snug ${hov}`}>{n.title}</span>
      <span className="mt-2 text-[14px] text-muted leading-relaxed line-clamp-3">{n.lead}</span>{meta}
    </button>
  );
  if (feat) return (
    <button type="button" {...extra} className="group lift card text-left overflow-hidden sm:col-span-2 grid grid-cols-1 sm:grid-cols-2" data-act="news" data-id={n.id}>
      <div className="scene zoom aspect-[16/10] sm:aspect-auto sm:h-full min-h-[220px]" dangerouslySetInnerHTML={{ __html: n.scene }} />
      <div className="p-6 flex flex-col">{rub}<span className={`mt-3 text-[24px] font-extrabold leading-[1.14] tracking-[-0.022em] ${hov}`}>{n.title}</span><span className="mt-3 text-[15px] text-muted leading-relaxed line-clamp-4">{n.lead}</span>{meta}</div>
    </button>
  );
  return (
    <button type="button" {...extra} className="group lift card text-left overflow-hidden flex flex-col" data-act="news" data-id={n.id}>
      <div className="scene zoom aspect-[16/10]" dangerouslySetInnerHTML={{ __html: n.scene }} />
      <div className="p-5 flex flex-col flex-1">{rub}<span className={`mt-2.5 text-[17px] font-bold leading-snug line-clamp-3 ${hov}`}>{n.title}</span>{meta}</div>
    </button>
  );
}

/** Хайлтын талбар. Бичихийг features/wiring.js (data-input) барьдаг тул удирдлагагүй (uncontrolled): төлөв гаднаас өөрчлөгдвөл (таб солиход цэвэрлэх) утгыг шууд онооно. */
function Search({ ub, id, input, value, ph, label, cls }: { ub: UB; id: string; input: string; value: string; ph: string; label: string; cls: string }) {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => { const el = ref.current!; if (el.value !== value) el.value = value; }, [value]);
  return (
    <div className={`relative w-full ${cls}`}>
      <Icon ub={ub} n="search" c="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input ref={ref} id={id} data-input={input} type="search" defaultValue={value} placeholder={ph} className="field !pl-11" aria-label={label} autoComplete="off" />
    </div>
  );
}

/** /news хуудас: бүх мэдээ */
function NewsAll({ ub, d }: { ub: UB; d: HubData }) {
  const { t, L } = ub, a = d.all!;
  /* Зөвхөн шинээр нэмэгдсэн карт «орж» ирнэ: шүүлтүүр/эрэмбэ солиход бүгд (тор шинээр), «Цааш үзэх»-эд нэмэгдсэн нь, хайлт бичих үед хөдөлгөөнгүй */
  const prev = useRef<{ key: string; q: string; n: number; from: number } | null>(null), p = prev.current;
  const from = !p || p.key !== a.key ? 0 : p.q !== a.q ? Infinity : a.cards.length > p.n ? p.n : p.from;
  useLayoutEffect(() => { prev.current = { key: a.key, q: a.q, n: a.cards.length, from }; });
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Search ub={ub} id="news-q" input="newsQ" value={d.newsQ} ph={L(['Мэдээ хайх...', 'Search news...'])} label={L(['Мэдээ хайх', 'Search news'])} cls="sm:max-w-[420px]" />
        <Tabs ub={ub} name="nsort" items={[['new', L(['Шинэ нь эхэндээ', 'Newest']), 'clock-3'], ['top', L(['Их уншсан', 'Most read']), 'flame']]} active={d.newsSort} label={L(['Эрэмбэ', 'Sort'])} cls="self-start sm:self-auto" />
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" id="news-chips"><Chips act="news-cat" items={d.cats} active={d.newsCat} /></div>
      <div className="mt-6">
        <Season ub={ub} d={d}>
          <Swap k={a.key} id="news-grid">
            {a.cards.length ? (
              <>
                <p className="mb-4 text-[13.5px] text-muted">{a.type && <><b className="text-ink">{a.type}</b> · </>}{a.summary}</p>
                <div key={a.key} className="na-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {a.cards.map((n, i) => <NewsCard key={n.id} ub={ub} d={d} n={n} feat={a.feat && i === 0} na={{ on: i >= from, i: Math.max(0, i - (from === Infinity ? i : from)) }} />)}
                </div>
                <div className="mt-10 flex flex-col items-center gap-3">
                  <span className="text-[13px] text-muted tnum">{a.count}</span><span className="na-prog"><i style={{ width: a.pct + '%' }} /></span>
                  {a.more && <button type="button" className="btn btn-ink mt-1" data-act="news-more"><Icon ub={ub} n="chevrons-down" c="w-[18px] h-[18px]" />{L(['Цааш үзэх', 'Load more'])}</button>}
                </div>
              </>
            ) : <div className="card p-12 text-center text-muted"><Icon ub={ub} n="search-x" c="w-8 h-8 mx-auto mb-3 opacity-60" />{t('noResults')}</div>}
          </Swap>
        </Season>
      </div>
    </div>
  );
}

/** Үйлчилгээ: Иргэн / Аж ахуйн нэгж / Цахим системүүд таб, хайлт (хайх үед бүх табаас) */
function SvcPanel({ ub, d }: { ub: UB; d: HubData }) {
  const { t, L } = ub, list = d.svc || [];
  const dir = useDir(d.svcTab, SVC, true);
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Tabs ub={ub} name="svc" items={[['citizen', L(['Иргэн', 'Residents']), 'user-round'], ['business', L(['Аж ахуйн нэгж', 'Businesses']), 'briefcase'], ['esys', L(['Цахим системүүд', 'E-services']), 'monitor-smartphone']]} active={d.svcTab} label={t('tab_services')} />
        <Search ub={ub} id="svc-q" input="svcQ" value={d.svcQ} ph={t('svcSearch')} label={t('svcSearch')} cls="md:w-80" />
      </div>
      <Swap k={d.svcTab} dir={dir} id="svc-grid">
        {list.length
          ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{list.map((s) => <SvcTile key={s.id} ub={ub} s={s} />)}</div>
          : <div className="card p-10 text-center text-muted"><Icon ub={ub} n="search-x" c="w-8 h-8 mx-auto mb-3 opacity-60" />{t('noResults')}</div>}
      </Swap>
      <div className="mt-6 rounded-[8px] bg-card border border-line p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="w-12 h-12 rounded-2xl bg-ubred/10 text-ubred grid place-items-center shrink-0"><Icon ub={ub} n="route" c="w-6 h-6" /></span>
        <div className="flex-1"><b className="block text-[16px]">{t('sitPromoT')}</b><span className="text-[14px] text-muted">{t('sitPromoD')}</span></div>
        <button type="button" className="btn btn-ink" data-act="go" data-sec="situations">{t('sitPromoB')}</button>
      </div>
    </>
  );
}

/** Үйлчилгээний хавтан (src/sections/hub.js svcTile(), modeBadge()-тэй ижил тэмдэглэгээ) */
function SvcTile({ ub, s }: { ub: UB; s: HubSvc }) {
  return (
    <button type="button" className="lift lift-blue card p-4 sm:p-5 text-left flex flex-col gap-3 h-full" data-act="svc" data-id={s.id}>
      <span className="w-11 h-11 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center"><Icon ub={ub} n={s.i} c="w-[22px] h-[22px]" /></span>
      <span className="font-bold text-[15.5px] leading-snug">{s.title}</span>
      <span className="text-[13.5px] text-muted leading-snug line-clamp-2">{s.desc}</span>
      <span className="mt-auto pt-1"><ModeBadge ub={ub} m={s.m} /></span>
    </button>
  );
}
