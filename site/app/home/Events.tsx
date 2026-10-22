'use client';
/* «Арга хэмжээ»: нүүрэнд ойрын 4 арга хэмжээ; /events хуудсанд жагсаалт | хуанли | газрын зураг, шүүлтүүр (бүгд, өнөөдөр, амралтын өдөр, үнэгүй).
   Өгөгдөл: src/sections/events.js eventsData(). Картууд нь evCard() HTML (data-evcard: src/core/pages.js тодруулна).
   Таб (evview), шүүлтүүр (ev-f), хуанлийн өдөр/сар (cal-day, cal-m), хадгалах (ev-save), зураг дээрх сонголт (ev-mapsel)-ыг features/wiring.js барина. */
import { useLayoutEffect, useRef } from 'react';
import { Icon, useUB, type UB } from '../ub';
import { Chips, HomeHead, HomeWrap, Raw, Swap, Tabs, type ChipItem, type TabItem } from './parts';

interface CalData {
  title: string; prev: string; next: string; lead: number; wds: string[];
  days: { k: string; dn: number; on: boolean; label: string; dots: string[]; cls: string }[];
  selTitle: string; selCount: string; rows: string; empty: string;
}
interface EventsData {
  title: string; desc: string; all: string; home: boolean;
  /** нүүрэнд: evCard() HTML */
  cards?: string[];
  view: 'list' | 'cal' | 'map'; dir: number; filter: string; tabs: TabItem[]; chips: ChipItem[]; emptyF: string;
  /** жагсаалт: evCard() HTML-үүд нийлсэн; зураг: evRow() HTML-үүд нийлсэн */
  list: string; rows: string; cal: CalData | null;
}

export function Events() {
  const ub = useUB();
  if (!ub) return null;
  const d = ub.home.events() as EventsData;
  if (d.home) {
    return (
      <HomeWrap card>
        <HomeHead ub={ub} title={d.title} desc={d.desc} act={{ 'data-act': 'page', 'data-v': 'events' }} label={d.all} />
        {/* утсанд хажуу тийш гүйлгэнэ */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {(d.cards || []).map((h, k) => <Raw key={k} className="w-[80%] shrink-0 snap-start sm:w-auto" html={h} />)}
        </div>
      </HomeWrap>
    );
  }
  return (
    <div className="bg-card border-y border-line"><div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="sec-ttl"><h2 className="h-section">{d.title}</h2><p className="mt-2 text-muted">{d.desc}</p></div>
        <Tabs ub={ub} name="evview" items={d.tabs} active={d.view} label={d.title} cls="self-start lg:self-auto" />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" id="ev-filters"><Chips act="ev-f" items={d.chips} active={d.filter} /></div>
      <Swap k={d.view + '|' + d.filter} dir={d.dir} id="ev-panel" className="mt-6">
        {d.view === 'cal' && d.cal ? <Cal ub={ub} c={d.cal} />
          : d.view === 'map' ? <EvMap ub={ub} d={d} />
          : d.list ? <Raw className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" html={d.list} />
          : <div className="card p-10 text-center text-muted"><Icon ub={ub} n="calendar-x" c="w-8 h-8 mx-auto mb-3 opacity-60" />{d.emptyF}</div>}
      </Swap>
    </div></div>
  );
}

/** Хуанли: сарын тор (өдөр бүрт арга хэмжээний өнгөт цэг) ба сонгосон өдрийн жагсаалт */
function Cal({ ub, c }: { ub: UB; c: CalData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <b className="text-[18px]">{c.title}</b>
          <div className="flex gap-1">
            <button type="button" className="icon-btn hover:bg-soft" data-act="cal-m" data-d="-1" aria-label={c.prev}><Icon ub={ub} n="chevron-left" /></button>
            <button type="button" className="icon-btn hover:bg-soft" data-act="cal-m" data-d="1" aria-label={c.next}><Icon ub={ub} n="chevron-right" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-bold text-muted mb-1">{c.wds.map((w, i) => <span key={i}>{w}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: c.lead }, (_, i) => <span key={'e' + i} />)}
          {c.days.map((x) => (
            <button key={x.k} type="button" className={x.cls} data-act="cal-day" data-k={x.k} aria-pressed={x.on} aria-label={x.label}>
              <span className="tnum">{x.dn}</span>
              <span className="flex gap-0.5 h-1.5">{x.dots.map((col, i) => <i key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: col }} />)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5">
        <p className="font-extrabold text-[18px]">{c.selTitle}</p>
        <p className="text-[13.5px] text-muted mb-4">{c.selCount}</p>
        {c.rows ? <Raw className="space-y-3" html={c.rows} /> : <div className="card p-8 text-center text-muted"><Icon ub={ub} n="calendar-x" c="w-8 h-8 mx-auto mb-3 opacity-60" />{c.empty}</div>}
      </div>
    </div>
  );
}

/** Газрын зураг: #ev-map-ийг src/sections/map-view.js MapView өөрөө зурна (React хүүхэд өгөхгүй). Шүүлтүүр, хэл солигдоход дахин үүсгэнэ. */
function EvMap({ ub, d }: { ub: UB; d: EventsData }) {
  const host = useRef<HTMLDivElement>(null), lang = ub.state().lang;
  useLayoutEffect(() => (host.current ? ub.home.evMap(host.current) : undefined), [ub, d.filter, lang]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 min-w-0"><div id="ev-map" ref={host} className="rounded-[8px] overflow-hidden border border-line h-[400px] sm:h-[500px]" /></div>
      {d.rows ? <Raw className="lg:col-span-4 space-y-3 lg:max-h-[500px] overflow-auto thin-scroll p-0.5" id="ev-maplist" html={d.rows} />
        : <div className="lg:col-span-4 space-y-3 lg:max-h-[500px] overflow-auto thin-scroll p-0.5" id="ev-maplist"><p className="text-muted p-6 text-center">{d.emptyF}</p></div>}
    </div>
  );
}
