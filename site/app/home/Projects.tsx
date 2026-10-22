'use client';
/* «24 мега төсөл»: тоон үзүүлэлт, газрын зураг (src/sections/map-view.js MapView), шүүлтүүр ба жагсаалт.
   «24 мега төсөл» хуудсанд (бодит төсөлтэй үед) ангиллын chip ба картууд нэмэгдэнэ.
   Өгөгдөл: src/sections/projects.js projData(). Сонголт (S.projSel), шүүлтүүр (S.projSt): selectProject, setProjSt (features/wiring.js). */
import { useEffect, useRef } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';
import { Chips, Swap, type ChipItem } from './parts';

export interface ProjCard {
  id: string; color: string; cat: string; media: string; name: string;
  stage: { t: string; c: string } | null; text: string; bar: number | null;
  usd: string; years: string; date: string; nUps: number;
}
export interface ProjectsData {
  title: string; desc: string; page: boolean; st: string;
  stats: [string, string][];
  chips: ChipItem[]; side: ChipItem[];
  count: string; head: { list: string; map: string }; noResults: string;
  legend: { c: string; t: string }[];
  list: { id: string; sel: boolean; name: string; sub: string; badge: string }[];
  cards: ProjCard[];
  mapKey: string;
}

export function Projects() {
  const ub = useUB();
  if (!ub) return null;
  const d = ub.home.projects() as ProjectsData;
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
      <div className="pg-dup flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="sec-ttl"><h2 className="h-section">{d.title}</h2><p className="mt-2 text-muted max-w-[62ch]">{d.desc}</p></div>
        <div className="flex flex-wrap gap-x-9 gap-y-3">
          {d.stats.map(([v, l]) => <div key={l}><p className="text-[30px] font-extrabold tnum leading-none tracking-tight">{v}</p><p className="text-[13px] text-muted mt-1.5">{l}</p></div>)}
        </div>
      </div>
      {d.page && (
        <>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-3"><h3 className="text-[20px] font-extrabold tracking-tight">{d.head.list}</h3><span className="text-[13px] text-muted" id="mpc-count">{d.count}</span></div>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"><Chips act="proj-st" items={d.chips} active={d.st} /></div>
          <Swap k={d.st} id="mp-cards" className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {d.cards.length ? d.cards.map((c, k) => <Card key={c.id} ub={ub} c={c} k={k} />) : <p className="sm:col-span-2 lg:col-span-4 card p-10 text-center text-muted">{d.noResults}</p>}
          </Swap>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-3"><h3 className="text-[20px] font-extrabold tracking-tight">{d.head.map}</h3></div>
        </>
      )}
      <div className={`${d.page ? 'mt-4' : 'mt-8'} grid grid-cols-1 lg:grid-cols-12 gap-5`}>
        <div className="lg:col-span-8 relative min-w-0">
          <ProjMap ub={ub} k={d.mapKey} />
          <div className="absolute left-3 top-3 card !rounded-xl px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold max-w-[calc(100%-80px)] shadow-lg pointer-events-none z-[7]">
            {d.legend.map((c) => <span key={c.c + c.t} className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full" style={{ background: c.c }} />{c.t}</span>)}
          </div>
        </div>
        <div className="lg:col-span-4 min-w-0 card flex flex-col lg:h-[600px] min-h-0 overflow-hidden">
          <div className="p-3 border-b border-line flex gap-2 overflow-x-auto no-scrollbar" id="proj-chips"><Chips act="proj-st" items={d.side} active={d.st} /></div>
          <ul id="proj-list" className="relative flex-1 overflow-auto thin-scroll p-2 max-h-[420px] lg:max-h-none">
            {d.list.length ? d.list.map((p) => (
              <li key={p.id}>
                <button type="button" className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors ${p.sel ? 'bg-soft ring-1 ring-line' : 'hover:bg-soft'}`} data-act="proj" data-id={p.id} aria-pressed={p.sel}>
                  <span className="contents" dangerouslySetInnerHTML={{ __html: p.badge }} />
                  <span className="min-w-0 flex-1"><b className="block text-[14.5px] leading-snug truncate">{p.name}</b><span className="block text-[12.5px] text-muted truncate">{p.sub}</span></span>
                  <Icon ub={ub} n="chevron-right" c="w-4 h-4 text-muted" />
                </button>
              </li>
            )) : <li className="p-6 text-center text-muted">{d.noResults}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Газрын зураг: MapView нь imperative (host-ийн innerHTML-ийг өөрөө удирдана), React зөвхөн хоосон #proj-map-ийг зурна.
 *  Нэг удаа үүсгэж, хэл эсвэл төслийн өгөгдөл (k) өөрчлөгдөхөд устгаад дахин үүсгэнэ. Шүүлтүүр, сонголтыг setProjSt / selectProject шууд дамжуулна. */
function ProjMap({ ub, k }: { ub: UB; k: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ub.home.projMap(ref.current!) as () => void, [ub, k]);
  return <div id="proj-map" ref={ref} className="rounded-[8px] overflow-hidden border border-line h-[440px] sm:h-[520px] lg:h-[600px]" />;
}

/** «24 мега төсөл» хуудасны карт */
function Card({ ub, c, k }: { ub: UB; c: ProjCard; k: number }) {
  return (
    <button type="button" className="mpc group lift card text-left overflow-hidden flex flex-col zoom-on" style={cssVars({ '--i': Math.min(k, 12) })} data-act="proj-open" data-id={c.id}>
      {/* .scene > svg: зураг/Scene ба хувийн шошго нь .scene-ийн шууд хүүхэд */}
      <div className="scene zoom aspect-[16/10] relative" dangerouslySetInnerHTML={{ __html: c.media }} />
      <div className="p-5 flex flex-col flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.cat}</span>
          {c.stage && <span className="mp-stage" style={cssVars({ '--sc': c.stage.c })}>{c.stage.t}</span>}
        </span>
        <span className="mt-2.5 text-[17px] font-bold leading-snug group-hover:text-ubred transition-colors">{c.name}</span>
        {c.text && <span className="mt-2 text-[13.5px] text-muted leading-snug line-clamp-2">{c.text}</span>}
        {c.bar != null && <span className="mpc-bar" style={cssVars({ '--mc': c.color })}><i style={{ width: `${c.bar}%` }} /></span>}
        <span className="mt-auto pt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
          {c.usd && <span className="inline-flex items-center gap-1 tnum font-semibold text-ink"><Icon ub={ub} n="banknote" c="w-4 h-4 text-muted" />{c.usd}</span>}
          {c.years ? <span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="calendar-range" c="w-4 h-4" />{c.years}</span>
            : c.date ? <span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="calendar" c="w-4 h-4" />{c.date}</span> : null}
          <span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="newspaper" c="w-4 h-4" />{c.nUps}</span>
        </span>
      </div>
    </button>
  );
}
