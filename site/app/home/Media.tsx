'use client';
/* Медиа: нүүрэнд бараан хөдөлгөөнт тууз + 6 хүртэл бичлэгийн тор (bento); /media хуудсанд хайлт, тоо, 3 баганат тор, «Цааш үзэх».
   Өгөгдөл: src/sections/media.js mediaData(). Шүүлтүүр (media-f), хайлт (data-input="mediaQ"), «Цааш үзэх» (media-more), карт (media-open)-ыг features/wiring.js барина. */
import { useEffect, useRef, useState } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';
import { Chips, Swap, type ChipItem } from './parts';

interface MediaCard {
  i: number; k: number; j: number; type: string; feat: boolean; tall: boolean; cls: string; scene: string; liveBg: boolean; play: boolean;
  badge: string; desc: string | null; title: string;
  meta: { date?: string; views?: string; watching?: string; dots?: boolean; dur?: string; durIcon?: string };
}
interface MediaData {
  pg: boolean; filter: string; q: string; count: string; title: string; desc: string; search: string; placeholder: string;
  chips: ChipItem[]; cards: MediaCard[]; empty: string | null;
  more: { text: string; pct: number; label: string } | null;
}

export function Media() {
  const ub = useUB();
  return ub ? <MediaIn ub={ub} /> : null;
}

function MediaIn({ ub }: { ub: UB }) {
  const d = ub.home.media() as MediaData;
  const root = useRef<HTMLDivElement>(null);
  /* Картууд дэлгэцэнд орж ирэхэд дараалан гарч ирнэ (нэг удаа): .media-in → 1.5 секундын дараа .media-done */
  const [shown, setShown] = useState(false), [done, setDone] = useState(false);
  useEffect(() => {
    if (shown) return;
    const g = root.current?.querySelector('#media-grid'), on = () => setShown(true);
    if (!g) return;
    if (!('IntersectionObserver' in window)) { on(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); on(); } }, { threshold: d.pg ? 0.05 : 0.12 });
    io.observe(g);
    return () => io.disconnect();
  }, [shown, d.pg]);
  useEffect(() => { if (!shown) return; const tm = setTimeout(() => setDone(true), 1500); return () => clearTimeout(tm); }, [shown]);
  /* Шүүлтүүр солигдоход картууд дахин гарч ирнэ (.mc-fresh) */
  const [fresh, setFresh] = useState(false), prevF = useRef(d.filter);
  useEffect(() => { if (prevF.current === d.filter) return; prevF.current = d.filter; setFresh(true); }, [d.filter]);
  useEffect(() => { if (!fresh) return; const tm = setTimeout(() => setFresh(false), 1000); return () => clearTimeout(tm); }, [fresh]);
  const anim = `${shown ? 'media-in' : ''} ${done ? 'media-done' : ''}`;

  const cards = d.cards.map((c) => <Card key={c.i} ub={ub} c={c} />);
  if (d.pg) {
    return (
      <div ref={root} className={`max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-24 ${anim}`}>
        <div className="relative w-full sm:max-w-[420px]">
          <Icon ub={ub} n="search" c="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input id="media-q" data-input="mediaQ" type="search" defaultValue={d.q} placeholder={d.placeholder} className="field !pl-11" aria-label={d.search} autoComplete="off" />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" id="media-chips"><Chips act="media-f" items={d.chips} active={d.filter} /></div>
        <p className="mt-6 mb-4 text-[13.5px] text-muted" id="media-count">{d.count}</p>
        <Swap k={d.filter} id="media-grid" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] lg:auto-rows-[280px] gap-5 ${fresh ? 'mc-fresh' : ''}`}>
          {d.empty != null ? <div className="sm:col-span-2 lg:col-span-3 card p-12 text-center text-muted"><Icon ub={ub} n="search-x" c="w-8 h-8 mx-auto mb-3 opacity-60" />{d.empty}</div> : cards}
          {d.more && (
            <div className="media-more sm:col-span-2 lg:col-span-3 flex flex-col items-center gap-3 pt-4">
              <span className="text-[13px] text-muted tnum">{d.more.text}</span>
              <span className="na-prog"><i style={{ width: d.more.pct + '%' }} /></span>
              <button type="button" className="btn btn-ink mt-1" data-act="media-more"><Icon ub={ub} n="chevrons-down" c="w-[18px] h-[18px]" />{d.more.label}</button>
            </div>
          )}
        </Swap>
      </div>
    );
  }
  return (
    <div ref={root} className={`media-band text-white relative overflow-hidden isolate ${anim}`}>
      <MediaBg />
      <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="sec-ttl"><h2 className="h-section text-white">{d.title}</h2><p className="mt-2 text-white/60">{d.desc}</p></div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar min-w-0 -mx-4 px-4 sm:mx-0 sm:px-0" id="media-chips"><Chips act="media-f" items={d.chips} active={d.filter} dark /></div>
        </div>
        <Swap k={d.filter} id="media-grid" className={`mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 auto-rows-[236px] lg:auto-rows-[248px] gap-4 ${fresh ? 'mc-fresh' : ''}`}>
          {d.empty != null ? <p className="sm:col-span-2 lg:col-span-12 py-16 text-center text-white/60">{d.empty}</p> : cards}
        </Swap>
      </div>
    </div>
  );
}

/** Нэг бичлэгийн карт (зураг, төрлийн шошго, тоглуулах товч, гарчиг, огноо/үзсэн/үргэлжлэх хугацаа) */
function Card({ ub, c }: { ub: UB; c: MediaCard }) {
  const pill = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 backdrop-blur text-[12.5px] font-bold', m = c.meta, pod = c.type === 'podcast';
  const badge = c.type === 'live' ? <span className="inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-ubred text-white text-[12.5px] font-bold"><span className="live" style={cssVars({ '--dot': '#fff' })} />{c.badge}</span>
    : pod ? <span className={pill}><span className="eq text-ubyellow"><i /><i /><i /><i /></span>{c.badge}</span>
    : <span className={pill}><Icon ub={ub} n={c.type === 'video' ? 'play' : c.type === 'photo' ? 'images' : 'image'} c="w-3.5 h-3.5" />{c.badge}</span>;
  const meta = m.date != null ? <><span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="calendar" c="w-4 h-4" />{m.date}</span><span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="eye" c="w-4 h-4" />{m.views}</span></>
    : m.watching != null ? <span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="eye" c="w-4 h-4" />{m.watching}</span>
    : m.dots ? <span className="flex gap-1">{[0, 1, 2, 3, 4].map((q) => <i key={q} className={`w-1.5 h-1.5 rounded-full ${q ? 'bg-white/40' : 'bg-white'}`} />)}</span>
    : <span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n={m.durIcon || 'clock-3'} c="w-4 h-4" />{m.dur}</span>;
  return (
    <button type="button" className={c.cls} style={cssVars({ '--i': c.k, '--j': c.j })} data-act="media-open" data-i={c.i}>
      <div className="scene zoom !absolute inset-0" dangerouslySetInnerHTML={{ __html: c.scene }} />
      {c.liveBg && <span className="mcard-livebg" aria-hidden="true" />}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 ${c.feat ? 'via-black/30' : 'via-black/50'} to-black/5`} />
      <div className="absolute left-4 top-4">{badge}</div>
      {c.play && <span className="mcard-play" aria-hidden="true"><Icon ub={ub} n={pod ? 'headphones' : 'play'} c={pod ? 'w-5 h-5' : 'w-6 h-6 ml-0.5'} /></span>}
      <div className={`absolute inset-x-0 bottom-0 p-5 ${c.feat ? 'lg:p-7' : ''}`}>
        {c.desc != null && <p className="text-[13px] text-white/65">{c.desc}</p>}
        <p className={`mt-1 ${c.feat ? 'text-[22px] lg:text-[30px] leading-[1.15] tracking-[-0.02em]' : 'text-[17px] leading-snug'} font-extrabold line-clamp-2`}>{c.title}</p>
        <div className="mt-3 flex items-center gap-3 text-[13px] text-white/75">{meta}</div>
      </div>
    </button>
  );
}

/* Хөдөлгөөнт вектор дэвсгэр: туйлын туяа (3 гэрэлтэлт), урсах дууны долгион, дамжуулалтын цагираг (styles/07-effects.css .mb-*).
   Дэлгэцэнд харагдахгүй үед зогсоно (.is-off). Q/T муруйгаар синус долгион; 2880 өргөн (2 үе) тул -50% шилжихэд тасралтгүй давтагдана. */
const wave = (y: number, a: number, len: number) => { let d = `M0 ${y} Q${len / 4} ${y - a} ${len / 2} ${y}`; for (let x = len; x <= 2880; x += len / 2) d += ` T${x} ${y}`; return d; };
const LINES: [number, number, number, string][] = [[150, 26, 480, 'a'], [190, 40, 720, 'b'], [228, 18, 360, 'c'], [262, 34, 576, 'b'], [300, 22, 480, 'a']];
function MediaBg() {
  const ref = useRef<HTMLDivElement>(null), [off, setOff] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([en]) => setOff(!en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`media-bg ${off ? 'is-off' : ''}`} aria-hidden="true">
      <i className="mb-blob mb-b1" /><i className="mb-blob mb-b2" /><i className="mb-blob mb-b3" />
      <svg className="mb-waves" viewBox="0 0 1440 420" preserveAspectRatio="none">
        <defs><linearGradient id="mbw" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".3" stopColor="#fff" /><stop offset=".7" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        {LINES.map(([y, a, len, c], k) => <g key={k} className={`mb-line mb-l${k + 1}`}><path className={`mb-${c}`} d={wave(y, a, len)} /></g>)}
      </svg>
      <span className="mb-rings"><i /><i /><i /></span>
    </div>
  );
}
