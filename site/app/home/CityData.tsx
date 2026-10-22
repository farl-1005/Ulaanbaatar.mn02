'use client';
/* «Хотын өгөгдөл»: нүүрэнд агаарын чанар + цаг агаар; /data хуудсанд нэмээд түгжрэл, хүн ам, төсөв.
   Өгөгдөл: src/sections/city-data.js dataData(). Утгыг features/weather.js (IQAir, Open-Meteo, 5 секунд тутмын хэлбэлзэл) шинэчилж renderReact() дуудна.
   AQI, PM2.5-ийн эргэлддэг цифрийг (data-live + data-roll) features/live-data.js setLive() → rollTo() шууд DOM-д эргэлдүүлдэг тул React зөвхөн анх зурна.
   Хэсэг дэлгэцэнд орж ирэхэд <section id="data">-д .drawn (зүү, баганууд, AQI шугам зурагдана), дэлгэцээс гарвал .fx-off (тоосонцор, цас зогсоно). */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Icon, Live, cssVars, useUB, type UB } from '../ub';
import { HomeHead, HomeWrap } from './parts';

interface ChartData {
  p: string; area: string; now: number;
  bands: { y: number; h: number; c: string }[];
  marks: { v: number; y: number; top: number }[];
  pts: ({ hr: string; v: number; top: number; label: string; c: string } | null)[];
  hours: { i: number; hr: string }[];
  foot: { note: string; src: string } | null;
}
interface Sky { tod: string; snow: boolean; rain: boolean; clouds: boolean }
export interface CityDataData {
  home: boolean; title: string; desc: string; liveL: string;
  aqi: {
    v: number; pm25: number; title: string; sub: string; label: string; color: string; advice: string; live: boolean; pm: number;
    pol: { k: string; v: string }[]; mainL: string; main: string; updL: string; upd: string; chart: ChartData;
  };
  weather: {
    title: string; date: string; icon: string; temp: number; text: string; dir: string; windL: string; wind: string; humL: string; hum: string;
    days: { wd: string; icon: string; title: string; mx: number; mn: number }[]; src: string; sky: Sky;
  };
  /* зөвхөн /data хуудсанд */
  updated?: string; clock?: string;
  traffic?: { title: string; v: number; ang: number; busy: string; busiest: string; roads: { n: string; v: number; c: string }[] };
  pop?: { title: string; note: string; tot: number; totS: string; rows: { n: string; w: number; k: string }[] };
  budget?: { title: string; note: string; pct: number; planL: string; actL: string; q: { plan: number; act: number; l: string }[] };
}

const sec = () => document.getElementById('data');
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const OPEN_METEO = '<a href="https://open-meteo.com/" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">Open-Meteo</a>';

export function CityData() {
  const ub = useUB();
  return ub ? <CityDataIn ub={ub} /> : null;
}

function CityDataIn({ ub }: { ub: UB }) {
  const d = ub.home.data() as CityDataData;
  const grid = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(() => !!sec()?.classList.contains('drawn'));
  /* дэлгэцэнд орж ирэхэд нэг удаа: зүү, тоолуур, эргэлдэх цифр (нүүр ↔ /data солигдоход grid шинэ тул дахин) */
  useEffect(() => {
    const g = grid.current, s = sec(); if (!g || !s) return;
    const reveal = () => {
      s.classList.add('drawn'); setDrawn(true);
      const cnt = g.querySelector<HTMLElement>('[data-count]');
      if (cnt && !s.dataset.counted) { s.dataset.counted = '1'; ub.home.countUp(cnt, +cnt.dataset.count!); }
      g.querySelectorAll<HTMLElement>('.rd-s[data-to]').forEach((x) => { x.style.setProperty('--d', x.dataset.to!); x.removeAttribute('data-to'); });   // цифрүүд 0-ээс эргэлдэнэ
    };
    if (s.classList.contains('drawn')) { reveal(); return; }
    if (!('IntersectionObserver' in window)) { reveal(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); reveal(); } }, { threshold: 0.15 });
    io.observe(g);
    return () => io.disconnect();
  }, [ub, d.home]);
  /* цас, тоосонцор: дэлгэцэнд харагдахгүй үед зогсоно (styles/07-effects.css #data.fx-off) */
  useEffect(() => {
    const s = sec(); if (!s || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([en]) => s.classList.toggle('fx-off', !en.isIntersecting));
    io.observe(s);
    return () => io.disconnect();
  }, []);

  const aqi = <div className={`card fx-card p-5 sm:p-6 ${d.home ? 'md:col-span-7' : 'md:col-span-6 lg:col-span-7'}`} data-card="aqi"><AqiCard ub={ub} d={d} /></div>;
  const wx = <div className={`card fx-card p-5 sm:p-6 ${d.home ? 'md:col-span-5' : 'md:col-span-6 lg:col-span-5'} flex flex-col`} data-card="weather"><WeatherCard ub={ub} d={d} /></div>;
  if (d.home) {
    return (
      <div className="on-navy">
        <HomeWrap>
          <HomeHead ub={ub} title={d.title} desc={d.desc} act={{ 'data-act': 'page', 'data-v': 'data' }} />
          <div ref={grid} className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5" id="data-grid">{aqi}{wx}</div>
        </HomeWrap>
      </div>
    );
  }
  return (
    <div className="on-navy"><div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"><div>
      <div className="pg-dup flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="sec-ttl"><h2 className="h-section">{d.title}</h2><p className="mt-2 text-muted max-w-[62ch]">{d.desc}</p></div>
        <span className="live-badge self-start lg:self-auto"><span className="live" style={cssVars({ '--dot': 'rgb(var(--c-green))' })} />{d.updated} <span className="tnum text-ink"><Live k="clocks" v={d.clock!} /></span></span>
      </div>
      <div ref={grid} className="mt-8 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-5" id="data-grid">
        {aqi}{wx}
        <Traffic d={d} drawn={drawn} />
        <Population d={d} />
        <Budget d={d} />
      </div>
    </div></div></div>
  );
}

function LiveBadge({ label, color }: { label: string; color: string }) {
  return <span className="live-badge"><span className="live" style={cssVars({ '--dot': color })} />{label}</span>;
}

/** Эргэлддэг цифр: анх нэг удаа зурна (хэсэг хараахан харагдаагүй бол 0-ээс), дараа нь setLive() → rollTo() DOM-д шууд эргэлдүүлнэ.
    Утга өөрчлөгдөхөд React дарж бичвэл эргэлдэх хөдөлгөөн тасарна, тиймээс HTML-ийг дахин үүсгэхгүй. */
function Roll({ ub, k, v, c }: { ub: UB; k: string; v: number; c?: string }) {
  const [html] = useState(() => ({ __html: ub.home.roll(v, !sec()?.classList.contains('drawn')) as string }));
  return c ? <p className={c} data-live={k} data-roll="" dangerouslySetInnerHTML={html} /> : <span data-live={k} data-roll="" dangerouslySetInnerHTML={html} />;
}

/** «Таны амьсгалж буй агаар»: AQI ихсэх тусам тоосонцор олширч, өнгө нь AQI ангиллын өнгө */
function PmField({ n, color }: { n: number; color: string }) {
  const dots = useMemo(() => Array.from({ length: n }, () => ({
    '--x': rnd(0, 100).toFixed(1) + '%', '--y': rnd(0, 100).toFixed(1) + '%', '--s': rnd(2, 6).toFixed(1) + 'px', '--t': rnd(9, 20).toFixed(1) + 's', '--dl': (-rnd(0, 20)).toFixed(1) + 's',
    '--dx': Math.round(rnd(-46, 46)) + 'px', '--dy': Math.round(rnd(-34, 34)) + 'px', '--o': rnd(0.16, 0.5).toFixed(2),
  }) as CSSProperties), [n]);
  return <div className="pm-field" aria-hidden="true" style={cssVars({ '--pc': color })}>{dots.map((s, i) => <i key={i} style={s} />)}</div>;
}

/** Цаг агаарын амьд тэнгэр: цас, бороо, үүл, шөнө од */
function SkyFx({ sky }: { sky: Sky }) {
  const { tod, snow, rain, clouds } = sky;
  const fx = useMemo(() => ({
    rain: rain ? Array.from({ length: 40 }, () => cssVars({ '--x': rnd(0, 100).toFixed(1) + '%', '--t': rnd(0.6, 1.1).toFixed(2) + 's', '--dl': (-rnd(0, 1.2)).toFixed(2) + 's', '--o': rnd(0.25, 0.6).toFixed(2) })) : [],
    snow: snow ? Array.from({ length: 36 }, () => cssVars({ '--x': rnd(0, 100).toFixed(1) + '%', '--s': rnd(2, 5).toFixed(1) + 'px', '--t': rnd(8, 16).toFixed(1) + 's', '--dl': (-rnd(0, 16)).toFixed(1) + 's', '--dx': Math.round(rnd(-36, 36)) + 'px', '--o': rnd(0.3, 0.85).toFixed(2) })) : [],
    stars: tod === 'night' ? Array.from({ length: 18 }, () => cssVars({ '--x': rnd(2, 98).toFixed(1) + '%', '--y': rnd(3, 42).toFixed(1) + '%', '--t': rnd(2, 5).toFixed(1) + 's', '--dl': (-rnd(0, 5)).toFixed(1) + 's' })) : [],
  }), [tod, snow, rain]);
  return (
    <div className={`sky sky-${tod}`} aria-hidden="true">
      <span className="sky-glow" />
      {fx.stars.map((s, i) => <b key={'s' + i} style={s} />)}
      {clouds && <><span className="sky-cloud sky-c1" /><span className="sky-cloud sky-c2" /></>}
      {fx.snow.map((s, i) => <i key={'n' + i} style={s} />)}
      {fx.rain.map((s, i) => <i key={'r' + i} className="rd" style={s} />)}
    </div>
  );
}

/** Агаарын чанарын карт (IQAir ирэхэд features/weather.js paintAir() → renderReact()) */
function AqiCard({ ub, d }: { ub: UB; d: CityDataData }) {
  const a = d.aqi;
  return (
    <>
      <PmField n={a.pm} color={a.color} />
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[17px]">{a.title}</h3><p className="text-[13px] text-muted">{a.sub}</p></div><LiveBadge label={d.liveL} color={a.color} /></div>
      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <div><Roll ub={ub} k="aqi" v={a.v} c="text-[60px] leading-[.9] font-extrabold tnum tracking-tight" /><p className="mt-2 font-bold" style={{ color: a.color }}>{a.label}</p></div>
        <p className="text-[13.5px] text-muted max-w-[36ch] leading-snug">{a.advice}</p>
        {a.live ? (
          <div className="ml-auto grid grid-cols-2 gap-x-5 gap-y-1 text-[13px]">
            {a.pol.map((p) => <PolRow key={p.k} k={p.k} v={p.v} />)}
            <span className="text-muted">{a.mainL}</span><b>{a.main}</b>
            <span className="text-muted">{a.updL}</span><b className="tnum">{a.upd}</b>
          </div>
        ) : (
          <div className="ml-auto grid grid-cols-2 gap-x-5 gap-y-1 text-[13px]">
            <span className="text-muted">PM2.5</span><b className="tnum"><Roll ub={ub} k="pm25" v={a.pm25} /> µg/m³</b>
            <span className="text-muted">PM10</span><b className="tnum">58 µg/m³</b>
            <span className="text-muted">NO2</span><b className="tnum">21 ppb</b>
          </div>
        )}
      </div>
      <div className="mt-5 pl-5"><AqiChart c={a.chart} /></div>
    </>
  );
}
function PolRow({ k, v }: { k: string; v: string }) {
  return <><span className="text-muted">{k}</span><b className="tnum">{v}</b></>;
}

/** AQI 24 цаг: өнгөт бүс, шугам, одоогийн цэг; хулганаар заахад тухайн цагийн утга */
function AqiChart({ c }: { c: ChartData }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState<number | null>(null);
  const move = (cx: number) => { const r = wrap.current!.getBoundingClientRect(); setHov(Math.max(0, Math.min(23, Math.round(((cx - r.left) / r.width) * 23)))); };
  const pt = hov == null ? null : c.pts[hov];
  return (
    <>
      <div className="relative" id="aqi-wrap" ref={wrap} onPointerMove={(e) => move(e.clientX)} onPointerLeave={() => setHov(null)}>
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-[170px] block overflow-visible" role="img" aria-label="AQI, 24h">
          <defs><linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F08C1A" stopOpacity=".38" /><stop offset="1" stopColor="#F08C1A" stopOpacity="0" /></linearGradient></defs>
          {c.bands.map((b) => <rect key={b.c} x="0" y={b.y} width="600" height={b.h} fill={b.c} opacity=".07" />)}
          {c.marks.map((m) => <line key={m.v} x1="0" x2="600" y1={m.y} y2={m.y} stroke="rgb(var(--c-line))" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />)}
          <path className="aqi-area" id="aqi-area" d={c.area} fill="url(#aqiFill)" />
          <path className="aqi-line" id="aqi-line" pathLength={1} d={c.p} fill="none" stroke="#F08C1A" strokeWidth="3" strokeLinecap="round" />
          <line id="aqi-x" x1={pt ? (hov! / 23) * 600 : 0} x2={pt ? (hov! / 23) * 600 : 0} y1="0" y2="200" stroke="rgb(var(--c-ink))" strokeOpacity=".3" vectorEffect="non-scaling-stroke" style={pt ? undefined : { display: 'none' }} />
        </svg>
        <span id="aqi-now" className="absolute w-3 h-3 rounded-full bg-[#F08C1A] ring-4 ring-[#F08C1A]/25 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: '100%', top: c.now + '%' }} />
        <div id="aqi-tip" className="absolute -translate-x-1/2 -translate-y-full -mt-3 card !rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold shadow-lg pointer-events-none whitespace-nowrap" style={pt ? { left: (hov! / 23) * 100 + '%', top: pt.top + '%' } : { display: 'none' }}>
          {pt && <><span className="text-muted font-semibold">{pt.hr}</span> AQI {pt.v} <span style={{ color: pt.c }}>{pt.label}</span></>}
        </div>
        {c.marks.map((m) => <span key={m.v} className="absolute -left-1 text-[10.5px] text-muted tnum -translate-y-1/2 bg-card pr-1" style={{ top: m.top + '%' }}>{m.v}</span>)}
      </div>
      <div className="relative h-4 mt-2 text-[11.5px] text-muted tnum">
        {c.hours.map((h) => <span key={h.i} className={`absolute ${h.i === 23 ? '-translate-x-full' : '-translate-x-1/2'}`} style={{ left: (h.i / 23) * 100 + '%' }}>{h.hr}</span>)}
      </div>
      {c.foot && <p className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11.5px] text-muted"><span>{c.foot.note}</span><span dangerouslySetInnerHTML={{ __html: c.foot.src }} /></p>}
    </>
  );
}

/** Цаг агаарын карт (Open-Meteo): өнөөдөр + дараагийн 5 хоног. 10 минут тутам features/weather.js paintWeather() → renderReact(). */
function WeatherCard({ ub, d }: { ub: UB; d: CityDataData }) {
  const w = d.weather;
  return (
    <>
      <SkyFx sky={w.sky} />
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[17px]">{w.title}</h3><p className="text-[13px] text-muted">{w.date}</p></div><LiveBadge label={d.liveL} color="#145095" /></div>
      <div className="mt-4 flex items-center gap-5">
        <span className="wx-ic w-20 h-20 rounded-3xl bg-ubblue/10 text-ubblue grid place-items-center"><Icon ub={ub} n={w.icon} c="w-11 h-11" sw={1.6} /></span>
        <div><p className="text-[56px] leading-none font-extrabold tnum tracking-tight">{w.temp}°</p><p className="font-semibold text-muted mt-1">{w.text}</p></div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 text-[13.5px]">
        <div className="rounded-xl bg-soft p-3 flex items-center gap-2" title={w.dir}><Icon ub={ub} n="wind" c="w-[18px] h-[18px] text-muted" /><span className="text-muted">{w.windL}</span><b className="ml-auto tnum">{w.wind}</b></div>
        <div className="rounded-xl bg-soft p-3 flex items-center gap-2"><Icon ub={ub} n="droplet" c="w-[18px] h-[18px] text-muted" /><span className="text-muted">{w.humL}</span><b className="ml-auto tnum">{w.hum}</b></div>
      </div>
      <div className="mt-auto pt-5 grid grid-cols-5 gap-1 text-center">
        {w.days.map((x, i) => (
          <div key={i} className="rounded-xl py-2" title={x.title}><p className="text-[12px] font-semibold text-muted">{x.wd}</p><Icon ub={ub} n={x.icon} c="w-6 h-6 mx-auto my-1.5 text-ink/80" sw={1.7} /><p className="text-[13px] font-bold tnum">{x.mx}°</p><p className="text-[12px] text-muted tnum">{x.mn}°</p></div>
        ))}
      </div>
      {w.src && <p className="mt-3 text-[11.5px] text-muted text-right">{w.src}: <span dangerouslySetInnerHTML={{ __html: OPEN_METEO }} /></p>}
    </>
  );
}

/** Түгжрэл (0–10): зүү хэсэг харагдах үед байрандаа эргэнэ */
function Traffic({ d, drawn }: { d: CityDataData; drawn: boolean }) {
  const x = d.traffic!;
  return (
    <div className="card p-5 sm:p-6 md:col-span-3 lg:col-span-4" data-card="traffic">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[17px]">{x.title}</h3><p className="text-[13px] text-muted">0–10</p></div><LiveBadge label={d.liveL} color="rgb(var(--c-amber))" /></div>
      <div className="mt-3 mx-auto w-[210px]">
        <svg viewBox="0 0 200 108" className="w-full" aria-hidden="true">
          <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#10A36A" /><stop offset=".5" stopColor="#E5A800" /><stop offset="1" stopColor="#D81E34" /></linearGradient></defs>
          <path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="rgb(var(--c-line))" strokeWidth="14" strokeLinecap="round" />
          <path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="url(#gg)" strokeWidth="14" strokeLinecap="round" opacity=".9" />
          <g className="needle" data-ang={x.ang} style={{ transformOrigin: '100px 100px', transform: `rotate(${drawn ? x.ang : -90}deg)` }}><path d="M100 100 L100 34" stroke="rgb(var(--c-ink))" strokeWidth="4" strokeLinecap="round" /></g>
          <circle cx="100" cy="100" r="7" fill="rgb(var(--c-ink))" />
        </svg>
        <p className="text-center -mt-1"><b className="text-[30px] font-extrabold tnum">{x.v}</b><span className="text-muted font-semibold">/10</span> <span className="text-[13px] font-semibold text-amberink">{x.busy}</span></p>
      </div>
      <p className="mt-4 text-[13px] font-semibold text-muted">{x.busiest}</p>
      <ul className="mt-2 space-y-2.5">
        {x.roads.map((r) => (
          <li key={r.n}><div className="flex justify-between text-[13.5px]"><span>{r.n}</span><b className="tnum">{r.v}</b></div><div className="mt-1 h-1.5 rounded-full bg-line overflow-hidden"><div className="hbar h-full rounded-full" style={{ width: r.v * 10 + '%', background: r.c }} /></div></li>
        ))}
      </ul>
    </div>
  );
}

/** Хүн ам: нийт тоо 0-ээс өснө (countUp textContent-ийг шууд өөрчилдөг тул HTML-ээр) */
function Population({ d }: { d: CityDataData }) {
  const x = d.pop!;
  return (
    <div className="card p-5 sm:p-6 md:col-span-3 lg:col-span-4" data-card="pop">
      <h3 className="font-bold text-[17px]">{x.title}</h3><p className="text-[13px] text-muted">{x.note}</p>
      <p className="mt-3 text-[40px] leading-none font-extrabold tnum tracking-tight" data-count={x.tot} dangerouslySetInnerHTML={{ __html: x.totS }} />
      <ul className="mt-5 space-y-2">
        {x.rows.map((r) => (
          <li key={r.n} className="grid grid-cols-[minmax(0,118px)_1fr_auto] items-center gap-3 text-[13px]"><span className="truncate">{r.n}</span><span className="h-2 rounded-full bg-line overflow-hidden"><span className="hbar block h-full rounded-full bg-ubblue" style={{ width: r.w + '%' }} /></span><b className="tnum text-[12.5px]">{r.k}</b></li>
        ))}
      </ul>
    </div>
  );
}

/** Төсвийн гүйцэтгэл: хувь (цагираг) ба улирал бүрийн төлөвлөгөө / гүйцэтгэл */
function Budget({ d }: { d: CityDataData }) {
  const x = d.budget!, size = 96, stroke = 10, r = (size - stroke) / 2, len = 2 * Math.PI * r;
  return (
    <div className="card p-5 sm:p-6 md:col-span-6 lg:col-span-4" data-card="budget">
      <h3 className="font-bold text-[17px]">{x.title}</h3><p className="text-[13px] text-muted">{x.note}</p>
      <div className="mt-4 flex items-center gap-5">
        <span className="relative grid place-items-center">
          {/* src/core/motion.js ring()-тэй ижил */}
          <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }} aria-hidden="true">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth={stroke} />
            <circle className="ring-fg" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-blue))" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={len.toFixed(2)} strokeDashoffset={(len * (1 - x.pct / 100)).toFixed(2)} />
          </svg>
          <b className="absolute text-[22px] font-extrabold tnum">{x.pct}%</b>
        </span>
        <div className="text-[13px] space-y-1.5"><p className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-[2px] bg-line" />{x.planL}</p><p className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-[2px] bg-ubblue" />{x.actL}</p></div>
      </div>
      <div className="mt-5 h-[110px] flex items-end gap-4">
        {x.q.map((q, i) => (
          <div key={q.l} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div className="w-full flex items-end gap-1 h-full"><span className="bar-grow flex-1 rounded-t-[6px] bg-line" style={{ height: q.plan + '%' }} /><span className="bar-grow flex-1 rounded-t-[6px] bg-ubblue" style={{ height: q.act + '%', transitionDelay: 0.1 + i * 0.08 + 's' }} /></div>
            <span className="text-[11.5px] text-muted font-semibold">{q.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
