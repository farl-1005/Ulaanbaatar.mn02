'use client';
/* Засаг дарга: танилцуулга, «Дараагийн ажил», энэ 7 хоногийн ажлын төрөл | 7 хоногийн тууз ба сонгосон өдрийн хуваарь | Засаг даргын мэдээ.
   Нүүр болон «Хотын тухай» хуудсанд (src/core/pages.js about.secs) ижилхэн зурагдана.
   Өгөгдөл: src/sections/governor.js govData(). Өдөр, 7 хоног солих (data-act="gov-day" | "gov-wk" | "gov-today" | "gov-ics")-ыг features/wiring.js барина.
   Хэсэг дэлгэцэнд харагдаж байх үед л: «орох» хөдөлгөөн (gov-in → gov-done), чимэглэлийн хөдөлгөөн (gov-run), тоолуурыг 30 секунд тутам шинэчилнэ. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, LogoMark, cssVars, useUB, type UB } from '../ub';
import { Raw, Swap } from './parts';

interface GovDay { iso: string; today: boolean; past: boolean; on: boolean; dn: number; aria: string; wd: string; rel: string; dots: string[] }
export interface GovData {
  sec: string; title: string; desc: string; name: string; role: string; reception: string;
  upNext: string; rightNow: string; none: string;
  next: { id: string; date: string; c: string; live: boolean; p: string; title: string; cd: string; when: string; place: string } | null;
  mix: { label: string; total: string; items: { k: string; c: string; t: string; n: number }[] };
  sched: string; range: string; todayL: string; atToday: boolean; prevL: string; nextL: string;
  k: number; days: GovDay[];
  rows: string;
  empty: { ic: string; t: string; d: string };
  legend: { k: string; c: string; i: string; t: string }[];
  change: string;
  newsT: string; allNews: string; news: string[];
  wk: string; key: string; dir: number; n: number;
}

export function Gov() {
  const ub = useUB();
  return ub ? <GovIn ub={ub} /> : null;
}

function GovIn({ ub }: { ub: UB }) {
  const root = useRef<HTMLDivElement>(null), list = useRef<HTMLOListElement>(null);
  const [run, setRun] = useState(false), [shown, setShown] = useState(false), [done, setDone] = useState(false), [, setTick] = useState(0);
  /* Дэлгэцэнд орох/гарах: анх орохдоо нэг удаа «орох» хөдөлгөөн (дахин зурахад давтагдахгүй), харагдаж байх үед 30 секунд тутам дахин зурна */
  useEffect(() => {
    const el = root.current!;
    let tm: ReturnType<typeof setInterval> | undefined, first = true, dt: ReturnType<typeof setTimeout> | undefined;
    const go = (on: boolean) => {
      setRun(on); clearInterval(tm);
      if (!on) return;
      if (first) { first = false; setShown(true); dt = setTimeout(() => setDone(true), 1700); }
      setTick((x) => x + 1); tm = setInterval(() => setTick((x) => x + 1), 30000);
    };
    if (!('IntersectionObserver' in window)) { go(true); return () => { clearInterval(tm); clearTimeout(dt); }; }
    const io = new IntersectionObserver((es) => go(es[es.length - 1].isIntersecting), { rootMargin: '0px 0px -12% 0px' });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(tm); clearTimeout(dt); };
  }, []);
  const d = ub.home.gov() as GovData;
  /* Өдөр / 7 хоног солигдоход (d.n) жагсаалтын мөрүүд дараалан орж ирнэ (styles/08-governor.css .gov-fresh) */
  const n0 = useRef(d.n);
  useLayoutEffect(() => {
    if (n0.current === d.n) return;
    n0.current = d.n;
    const el = list.current; if (!el) return;
    el.classList.add('gov-fresh');
    const tm = setTimeout(() => el.classList.remove('gov-fresh'), 900);
    return () => { clearTimeout(tm); el.classList.remove('gov-fresh'); };
  }, [d.n]);
  return (
    <div ref={root} className={`max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 ${run ? 'gov-run' : ''} ${shown ? 'gov-in' : ''} ${done ? 'gov-done' : ''}`}>
      <div className="gov-rv flex flex-col md:flex-row md:items-end justify-between gap-4" style={cssVars({ '--i': 0 })}>
        <div><span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-ubred"><Icon ub={ub} n="landmark" c="w-4 h-4" />{d.sec}</span>
          <h2 className="h-section mt-2">{d.title}</h2><p className="mt-2 text-muted max-w-[62ch]">{d.desc}</p></div>
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <aside className="gov-id on-navy gov-rv lg:col-span-4" style={cssVars({ '--i': 1 })}>
          <span className="gov-aur gov-aur-a" aria-hidden="true" /><span className="gov-aur gov-aur-b" aria-hidden="true" />
          <div className="flex items-center gap-4">
            <div className="gov-medal" aria-hidden="true">
              <svg viewBox="0 0 120 120" className="gov-ring gov-ring-a"><circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 5.2" strokeLinecap="round" /></svg>
              <svg viewBox="0 0 120 120" className="gov-ring gov-ring-b"><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2.4" strokeDasharray="64 250" strokeLinecap="round" /></svg>
              <span className="gov-core"><LogoMark ub={ub} c="w-10 h-10" /></span>
            </div>
            <div className="min-w-0"><h3 className="text-[22px] font-extrabold leading-tight tracking-[-0.01em]">{d.name}</h3><p className="text-[13px] text-white/70 leading-snug mt-1">{d.role}</p></div>
          </div>
          <div id="gov-next-w" className="mt-6"><Next ub={ub} d={d} /></div>
          <div className="gov-mix">
            <p className="flex items-baseline justify-between gap-3"><span className="text-[12px] font-bold uppercase tracking-[.1em] text-white/55">{d.mix.label}</span><b className="text-[13px] tnum">{d.mix.total}</b></p>
            <span className="gov-mix-bar">{d.mix.items.map((x, i) => <i key={x.k} style={cssVars({ flex: `${x.n} 1 0`, background: x.c, '--i': i })} />)}</span>
            <span className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5">
              {d.mix.items.map((x) => <span key={x.k} className="inline-flex items-center gap-1.5 text-[12.5px] text-white/75"><i className="w-2 h-2 rounded-full" style={{ background: x.c }} />{x.t} <b className="text-white tnum">{x.n}</b></span>)}
            </span>
          </div>
          <p className="mt-5 flex items-start gap-2.5 text-[13.5px] text-white/80 leading-snug"><Icon ub={ub} n="users-round" c="w-[18px] h-[18px] mt-px text-white/60" /><span>{d.reception}</span></p>
        </aside>
        <div className="gov-cal card gov-rv lg:col-span-8" style={cssVars({ '--i': 2 })}>
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5">
            <div className="min-w-0"><p className="text-[12px] font-bold uppercase tracking-[.1em] text-muted">{d.sched}</p><p className="mt-0.5 text-[16px] sm:text-[17px] font-extrabold tnum truncate" id="gov-range">{d.range}</p></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button type="button" className="gov-navb !w-auto px-3 text-[13px] font-bold" data-act="gov-today" hidden={d.atToday}>{d.todayL}</button>
              <button type="button" className="gov-navb" data-act="gov-wk" data-v="-1" aria-label={d.prevL}><Icon ub={ub} n="chevron-left" c="w-[18px] h-[18px]" /></button>
              <button type="button" className="gov-navb" data-act="gov-wk" data-v="1" aria-label={d.nextL}><Icon ub={ub} n="chevron-right" c="w-[18px] h-[18px]" /></button>
            </div>
          </div>
          <Swap id="gov-wk" className="px-3 sm:px-6 mt-4" k={d.wk} dir={d.dir}>
            <div className="gov-days" style={cssVars({ '--k': d.k })}>
              <span className="gov-pill" aria-hidden="true" />
              {d.days.map((x) => (
                <button key={x.iso} type="button" className={`gov-day ${x.today ? 'is-today' : ''} ${x.past ? 'is-past' : ''}`} data-act="gov-day" data-v={x.iso} aria-pressed={x.on} aria-label={x.aria}>
                  <span className="gov-wd">{x.rel ? <><span className="hidden sm:inline">{x.rel}</span><span className="sm:hidden">{x.wd}</span></> : x.wd}</span>
                  <b className="gov-dn tnum">{x.dn}</b>
                  <span className="gov-dots">{x.dots.map((c, i) => <i key={i} style={{ background: c }} />)}</span>
                </button>
              ))}
            </div>
          </Swap>
          {/* Мөрүүд нь govRow() HTML (admin-ы урьдчилан харахад ч хэрэглэгддэг), «Одоо» шугамтай */}
          <Swap k={d.key} dir={d.dir}>
            {d.rows
              ? <ol ref={list} id="gov-list" className="gov-list px-4 sm:px-6 pt-6 pb-6" aria-live="polite" dangerouslySetInnerHTML={{ __html: d.rows }} />
              : <ol ref={list} id="gov-list" className="gov-list px-4 sm:px-6 pt-6 pb-6" aria-live="polite"><li className="gov-empty"><span className="gov-empty-ic" dangerouslySetInnerHTML={{ __html: d.empty.ic }} /><b className="block mt-3 text-[15.5px]">{d.empty.t}</b><span className="block mt-1 text-[13.5px] text-muted">{d.empty.d}</span></li></ol>}
          </Swap>
          <div className="px-4 sm:px-6 py-3.5 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
            {d.legend.map((x) => <span key={x.k} className="inline-flex items-center gap-1.5"><span style={{ color: x.c }}><Icon ub={ub} n={x.i} c="w-3.5 h-3.5" /></span>{x.t}</span>)}
            <span className="sm:ml-auto inline-flex items-center gap-1.5"><Icon ub={ub} n="info" c="w-3.5 h-3.5" />{d.change}</span>
          </div>
        </div>
      </div>
      {d.news.length > 0 && (
        <div className="gov-rv mt-12" style={cssVars({ '--i': 3 })}>
          <div className="flex items-end justify-between gap-4 mb-4"><h3 className="text-[20px] font-extrabold tracking-tight">{d.newsT}</h3><button type="button" className="text-[14px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="hub" data-hub="news">{d.allNews}<Icon ub={ub} n="chevron-right" c="w-4 h-4" /></button></div>
          <Raw className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" html={d.news.join('')} />
        </div>
      )}
    </div>
  );
}

/** «Дараагийн ажил» / «Яг одоо» карт: дарахад тухайн өдрийг нээж, ажлыг тодруулна */
function Next({ ub, d }: { ub: UB; d: GovData }) {
  const e = d.next;
  if (!e) return <div className="gov-next is-none"><p className="gov-next-l">{d.upNext}</p><p className="mt-2 text-[15px] font-semibold text-white/80">{d.none}</p></div>;
  return (
    <button type="button" className={`gov-next ${e.live ? 'is-live' : ''}`} style={cssVars({ '--c': e.c })} data-act="gov-day" data-v={e.date} data-id={e.id}>
      <span className="flex items-center justify-between gap-3">
        <span className="gov-next-l">{e.live ? <><i className="live" style={cssVars({ '--dot': '#FF6B7D' })} />{d.rightNow}</> : d.upNext}</span>
        <span className="gov-next-cd tnum">{e.cd}</span>
      </span>
      <b className="block mt-2.5 text-[17px] leading-snug">{e.title}</b>
      <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/70">
        <span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="clock-3" c="w-4 h-4" />{e.when}</span>
        {e.place && <span className="inline-flex items-center gap-1.5 min-w-0"><Icon ub={ub} n="map-pin" c="w-4 h-4" /><span className="truncate">{e.place}</span></span>}
      </span>
      {e.live && <span className="gov-next-bar"><i style={{ transform: `scaleX(${e.p})` }} /></span>}
    </button>
  );
}
