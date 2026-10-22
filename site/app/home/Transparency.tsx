'use client';
/* «Ил тод байдал»: 4 тоо + Тогтоол / Захирамж / Тендер табтай самбар (хайлт, жагсаалт). Нүүр болон /transparency хуудсанд.
   Өгөгдөл: src/sections/transparency.js trData(). Таб (S.tr) → setTr(), хайлт (S.trQ, data-input="trQ") → features/wiring.js → renderReact().
   Хэсэг дэлгэцийн доод 20%-аас дээш орж ирэхэд <section id="transparency">-д .tr-in: тоо гүйж, мөрүүд дараалан гарна (styles/05-search.css). */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';
import { HomeHead, HomeWrap, Swap } from './parts';

interface TrState { cls: string; text: string; i?: string; live?: boolean }
export interface TrData {
  home: boolean; title: string; desc: string;
  stats: { i: string; v: number; dec: number; text: string; suf: string; l: string; c: string }[];
  openData: string; updated: string; time: string;
  tabs: { v: string; l: string; i: string; n: number }[];
  tr: string; q: string; search: string; kind: { i: string; c: string }; tender: boolean;
  sum: [icon: string, value: string, label: string][] | null;
  count: string; newest: string; empty: [string, string];
  rows: { i: number; no: string; title: string; fresh: string; date: string; st: TrState; ext: boolean; bar: { bud: string; pct: number; c: string } | null }[];
}

const ORDER = ['res', 'ord', 'tender'];
const sec = () => document.getElementById('transparency');

export function Transparency() {
  const ub = useUB();
  return ub ? <TrIn ub={ub} /> : null;
}

function TrIn({ ub }: { ub: UB }) {
  const d = ub.home.tr() as TrData;
  /* тоо гүйх, мөрүүд дараалан гарах: нэг удаа (нүүр ↔ хуудас солигдоход дахин ажиглана) */
  useEffect(() => {
    const s = sec(); if (!s || s.classList.contains('tr-in')) return;
    const go = () => { s.classList.add('tr-in'); s.querySelectorAll<HTMLElement>('[data-to]').forEach((el) => ub.home.trCount(el)); };
    if (!('IntersectionObserver' in window)) { go(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '0px 0px -20% 0px' });
    io.observe(s);
    return () => io.disconnect();
  }, [ub, d.home]);

  if (d.home) {
    return (
      <HomeWrap>
        <HomeHead ub={ub} title={d.title} desc={d.desc} act={{ 'data-act': 'page', 'data-v': 'transparency' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {d.stats.map((x) => (
            <div key={x.i} className="card p-5 relative overflow-hidden">
              <StatTop ub={ub} x={x} />
              <p className="mt-4 text-[28px] font-extrabold tnum leading-none tracking-tight">{x.text}<span className="text-[17px] font-bold">{x.suf}</span></p>
              <p className="text-[13px] text-muted mt-2 leading-snug">{x.l}</p>
            </div>
          ))}
        </div>
        <Panel ub={ub} d={d} />
      </HomeWrap>
    );
  }
  /* тоо: хэсэг харагдсаны дараа (tr-in) шууд эцсийн утга, өмнө нь 0 — trCount() textContent-ийг шууд өөрчилдөг тул HTML-ээр */
  const shown = !!sec()?.classList.contains('tr-in');
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="sec-ttl">
          <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-greenink"><span className="live" style={cssVars({ '--dot': 'rgb(var(--c-green))' })} />{d.openData}</span>
          <h2 className="h-section mt-2">{d.title}</h2><p className="mt-2 text-muted max-w-[62ch]">{d.desc}</p>
        </div>
        <p className="text-[13px] text-muted inline-flex items-center gap-2 shrink-0"><Icon ub={ub} n="refresh-cw" c="w-4 h-4" />{d.updated} <b className="text-ink tnum">{d.time}</b></p>
      </div>
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {d.stats.map((x, i) => (
          <div key={x.i} className="tr-kpi card lift p-5 relative overflow-hidden" style={cssVars({ '--i': i })}>
            <StatTop ub={ub} x={x} />
            <p className="mt-4 text-[28px] sm:text-[30px] font-extrabold tnum leading-none tracking-tight"><span data-to={x.v} data-dec={x.dec} dangerouslySetInnerHTML={{ __html: shown ? x.text : '0' }} /><span className="text-[17px] font-bold">{x.suf}</span></p>
            <p className="text-[13px] text-muted mt-2 leading-snug">{x.l}</p>
          </div>
        ))}
      </div>
      <Panel ub={ub} d={d} />
    </div>
  );
}

function StatTop({ ub, x }: { ub: UB; x: TrData['stats'][number] }) {
  return (
    <>
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `rgb(${x.c})` }} />
      <span className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `rgb(${x.c} / .1)`, color: `rgb(${x.c})` }}><Icon ub={ub} n={x.i} /></span>
    </>
  );
}

/** Табтай самбар: таб (баримтын тоотой) + хайлт, жагсаалт */
function Panel({ ub, d }: { ub: UB; d: TrData }) {
  /* таб солигдвол мөрүүд дахин дараалан гарна, хайх үед хөдөлгөөнгүй (tr-quiet); шилжих чиглэл */
  const prev = useRef({ tr: d.tr, q: d.q, quiet: false, dir: 0 });
  const p = prev.current;
  if (p.tr !== d.tr) { p.dir = ORDER.indexOf(d.tr) > ORDER.indexOf(p.tr) ? 1 : -1; p.quiet = false; }
  else if (p.q !== d.q) p.quiet = true;
  p.tr = d.tr; p.q = d.q;
  return (
    <div className="mt-6 card overflow-hidden">
      <div className="px-4 sm:px-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-x-6">
        <TrTabs ub={ub} d={d} />
        <div className="md:w-80 pb-3 md:pb-0"><div className="relative">
          <Icon ub={ub} n="search" c="w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          {/* утгыг features/wiring.js уншина (S.trQ); React дарж бичихгүй */}
          <input type="search" id="tr-q" data-input="trQ" defaultValue={d.q} placeholder={d.search} className="field !h-10 !pl-10 !text-[14px]" aria-label={d.search} autoComplete="off" />
        </div></div>
      </div>
      <Swap k={d.tr} dir={p.dir} id="tr-panel"><Rows ub={ub} d={d} quiet={p.quiet} /></Swap>
    </div>
  );
}

/** Доогуур зураастай таб, таб бүрт баримтын тоо (parts.tsx Tabs-тай ижил, data-act="tab" data-tabs="tr" → setTr) */
function TrTabs({ ub, d }: { ub: UB; d: TrData }) {
  const ref = useRef<HTMLDivElement>(null), placed = useRef(false);
  const sig = d.tabs.map((x) => x.l).join('|');
  useLayoutEffect(() => { ub.placePill(ref.current!, placed.current); placed.current = true; }, [ub, d.tr, sig]);
  return (
    <div ref={ref} className="uline" role="tablist" data-tablist="tr" aria-label="">
      <span className="uline-bar" data-pill="" />
      {d.tabs.map((x) => (
        <button key={x.v} type="button" className="uline-btn" role="tab" data-act="tab" data-tabs="tr" data-v={x.v} aria-selected={x.v === d.tr} tabIndex={x.v === d.tr ? 0 : -1}>
          <Icon ub={ub} n={x.i} c="w-[18px] h-[18px]" /><span>{x.l}</span>
          <span className="ml-1 min-w-[22px] h-[20px] px-1.5 rounded-full bg-soft border border-line text-[11.5px] font-bold tnum grid place-items-center">{x.n}</span>
        </button>
      ))}
    </div>
  );
}

function Rows({ ub, d, quiet }: { ub: UB; d: TrData; quiet: boolean }) {
  return (
    <>
      {d.sum && (
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-soft/60 border-b border-line grid grid-cols-3 gap-3 sm:gap-4">
          {d.sum.map(([icn, v, l]) => (
            <div key={icn} className="flex items-center gap-3 min-w-0">
              <span className="hidden sm:grid w-9 h-9 rounded-lg bg-card border border-line place-items-center text-muted shrink-0"><Icon ub={ub} n={icn} c="w-[18px] h-[18px]" /></span>
              <span className="min-w-0"><b className="block text-[13.5px] sm:text-[15px] tnum leading-tight">{v}</b><span className="block text-[11.5px] sm:text-[12.5px] text-muted leading-snug">{l}</span></span>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 sm:px-6 py-2.5 text-[12.5px] text-muted border-b border-line flex items-center justify-between">
        <span>{d.count}</span><span className="hidden sm:inline-flex items-center gap-1.5"><Icon ub={ub} n="arrow-down-wide-narrow" c="w-3.5 h-3.5" />{d.newest}</span>
      </div>
      {/* таб солигдоход жагсаалт шинээр үүсч мөрүүд дахин дараалан гарна */}
      {d.rows.length ? (
        <ul key={d.tr} className={`divide-y divide-line ${quiet ? 'tr-quiet' : ''}`}>{d.rows.map((r, idx) => <Row key={r.i} ub={ub} d={d} r={r} idx={idx} />)}</ul>
      ) : (
        <div className="p-12 text-center">
          <span className="w-14 h-14 mx-auto rounded-2xl bg-soft grid place-items-center text-muted"><Icon ub={ub} n="search-x" c="w-7 h-7" /></span>
          <p className="mt-4 font-semibold">{d.empty[0]}</p><p className="mt-1 text-[13.5px] text-muted">{d.empty[1]}</p>
        </div>
      )}
    </>
  );
}

function Row({ ub, d, r, idx }: { ub: UB; d: TrData; r: TrData['rows'][number]; idx: number }) {
  const k = d.kind;
  return (
    <li className="tr-row" style={cssVars({ '--i': idx })}>
      <button type="button" className="group w-full text-left px-4 sm:px-6 py-4 grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-3 items-center hover:bg-soft/70 transition-colors" data-act="doc" data-type={d.tr} data-i={r.i}>
        <span className="tr-ic w-11 h-11 rounded-xl grid place-items-center shrink-0 self-start md:self-center" style={{ background: `rgb(${k.c} / .1)`, color: `rgb(${k.c})` }}><Icon ub={ub} n={k.i} /></span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="tnum text-[12.5px] font-bold px-2 py-0.5 rounded-md border border-line bg-card" dangerouslySetInnerHTML={{ __html: r.no }} />
            {r.fresh && <span className="badge b-red !h-5 !px-1.5 !text-[11px]">{r.fresh}</span>}
            <span className="text-[12.5px] text-muted">{r.date}</span>
          </span>
          <span className="block mt-1.5 text-[15.5px] font-semibold leading-snug group-hover:text-ubblue transition-colors" dangerouslySetInnerHTML={{ __html: r.title }} />
          {r.bar && (
            <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-[14px] font-extrabold tnum"><Icon ub={ub} n="banknote" c="w-4 h-4 text-muted" />{r.bar.bud}</span>
              <span className="flex items-center gap-2 flex-1 min-w-[160px] max-w-[300px]">
                <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><span className="tr-bar block h-full rounded-full" style={cssVars({ '--w': r.bar.pct + '%', background: r.bar.c })} /></span>
                <span className="text-[12px] text-muted tnum w-9 text-right">{r.bar.pct}%</span>
              </span>
            </span>
          )}
        </span>
        <span className="col-start-2 md:col-start-auto flex items-center justify-between md:justify-end gap-3">
          <span className={`badge ${r.st.cls}`}>{r.st.live ? <span className="live !w-1.5 !h-1.5" style={cssVars({ '--dot': 'currentColor' })} /> : <Icon ub={ub} n={r.st.i!} c="w-3.5 h-3.5" />}{r.st.text}</span>
          <span className="tr-go w-8 h-8 rounded-full border border-line grid place-items-center text-muted shrink-0"><Icon ub={ub} n={r.ext ? 'arrow-up-right' : 'arrow-right'} c="w-4 h-4" /></span>
        </span>
      </button>
    </li>
  );
}
