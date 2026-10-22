'use client';
/* Медиа үзэгч (openMedia → openModal({ view: 'MediaPlayer', props: { i } })).
   Бодит бичлэг (ulaanbaatar.mn): зүүн талд бараан «тайз» (Live видео / фото цомог / подкаст / постер), баруун талд мэдээлэл + «Бусад ...».
   Жишээ бичлэг: тоглуулагч (Live, постер), цомог, подкаст — цаг гүйдэг.
   Өгөгдөл: src/features/media-player.js mediaViewData(). Үзэгчийн төлөв (зураг, тоглуулж буй эсэх, томруулалт, цаг) энд. Хаах (modal-close)-ыг features/wiring.js барина. */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { Icon, cssVars, type UB } from '../ub';

interface Tx { close: string; play: string; pause: string; prev: string; next: string; live: string }
interface LiveData {
  i: number; live: true; type: string; color: string; icon: string; chip: string; title: string; date: string; views: string; photosN: string;
  body: string[]; empty: string; img: string; cover: string; amb: string; photos: { big: string; th: string }[];
  embed: string; video: string; capIcon: string; cap: string; src: string; primary: { href: string; icon: string; label: string };
  rel: { i: number; scene: string; title: string; meta: string }[]; relHead: string;
  tx: Tx & { fs: string; zoomIn: string; zoomOut: string; hintIn: string; hintOut: string; copy: string; podCap: string };
}
interface DemoData {
  i: number; live: false; type: string; title: string; desc: string; dur: string; durS: number; viewers: number; ep: string; en: boolean;
  scene: string; photos: string[]; bars: number[];
  tx: Tx & { liveFor: string; photoCredit: string; podcast: string };
}
type ViewData = LiveData | DemoData;

const EASE = 'cubic-bezier(.2,.8,.2,1)';
const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (s: number) => { s = Math.floor(s); const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ':' + pad(mm) : mm) + ':' + pad(ss); };
const num = (n: number, en: boolean) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, en ? ',' : ' ');   // src/core/time.js num()

/** Цонх нээлттэй үед ← → сумаар зураг солино (input, textarea-д бичиж байхад биш) */
function useArrows(on: boolean, step: (d: number) => void) {
  const fn = useRef(step); fn.current = step;
  useEffect(() => {
    if (!on) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const el = e.target as Element | null;
      if (el && el.matches && el.matches('input, textarea, [role="tab"]')) return;
      fn.current(e.key === 'ArrowRight' ? 1 : -1);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [on]);
}

export function MediaPlayer({ ub, i }: { ub: UB; i: number }) {
  const lang = ub.state().lang;
  const d = useMemo(() => ub.home.mediaView(i) as ViewData | null, [ub, i, lang]);
  if (!d) return null;
  return d.live ? <MediaLive ub={ub} i0={i} /> : <MediaDemo ub={ub} d={d} />;
}

/* ================= Бодит медиа ================= */
function MediaLive({ ub, i0 }: { ub: UB; i0: number }) {
  const [i, setI] = useState(i0), [ph, setPh] = useState(0), [playing, setPlaying] = useState(false), [zoom, setZoom] = useState(false);
  const s = ub.state(), lang = s.lang;
  const d = useMemo(() => ub.home.mediaView(i) as LiveData, [ub, i, lang]);
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), strip = useRef<HTMLDivElement>(null), swapped = useRef(false);
  const n = d.photos.length, isPhoto = d.type === 'photo' && n > 0;

  /* «Бусад ...»: хуучныг бүдгэрүүлээд шинийг доороос гаргана (.mv key-гээр шинэ элемент болно) */
  const go = (k: number) => {
    const set = () => { swapped.current = true; flushSync(() => { setI(k); setPh(0); setPlaying(false); setZoom(false); }); };
    const v = root.current;
    if (v && v.animate && !s.reduced) v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }).finished.then(set, () => {});
    else set();
  };
  useLayoutEffect(() => {
    if (!swapped.current) return;
    swapped.current = false;
    const v = root.current;
    if (v && v.animate && !ub.state().reduced) v.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE });
  }, [i, ub]);

  const step = (dl: number) => { if (d.type === 'photo' && n > 1) setPh((p) => (p + dl + n) % n); };
  useArrows(d.type === 'photo' && n > 1, step);
  /* Зураг солигдоход: идэвхтэй жижиг зургийг голлуулж, дараагийнхыг урьдчилан ачаална */
  const phPrev = useRef(ph);
  useEffect(() => {
    if (!isPhoto) return;
    if (phPrev.current !== ph) {
      const b = strip.current?.querySelector<HTMLElement>('.mv-th.is-on');
      if (b) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: ub.state().reduced ? 'auto' : 'smooth' });
    }
    phPrev.current = ph;
    if (d.photos[ph + 1]) { const pre = new Image(); pre.src = d.photos[ph + 1].big; }
  }, [ph, isPhoto, d, ub]);

  const mpToggle = () => { if (!d.embed) { if (d.video) window.open(d.video, '_blank', 'noopener'); return; } setPlaying(true); };
  const fs = () => { const sg = stage.current; if (!sg) return; if (document.fullscreenElement) document.exitFullscreen(); else if (sg.requestFullscreen) sg.requestFullscreen().catch(() => {}); };
  /* Фото: хуруугаар гүйлгэх */
  const x0 = useRef<number | null>(null);
  const swipe = isPhoto ? {
    onPointerDown: (e: PointerEvent) => { if (e.pointerType !== 'mouse') x0.current = e.clientX; },
    onPointerUp: (e: PointerEvent) => { const a = x0.current; if (a != null && Math.abs(e.clientX - a) > 40) step(e.clientX < a ? 1 : -1); x0.current = null; },
  } : {};

  const tx = d.tx, amb = isPhoto ? d.photos[ph].th : d.amb;
  const close = <button type="button" className="mv-x lg:hidden" data-act="modal-close" aria-label={tx.close}><Icon ub={ub} n="x" c="w-5 h-5" /></button>;
  const ambImg = amb ? <img className="mv-amb" src={amb} alt="" aria-hidden="true" /> : null;

  let stageEl;
  if (d.type === 'live') stageEl = (
    <div className="mv-stage" id="mv-stage" ref={stage}>{ambImg}{close}
      <div className="mv-frame">
        {playing && d.embed
          ? <iframe src={d.embed} className="mv-iframe" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen title={d.title} />
          : <>
            <div className="scene !absolute inset-0" dangerouslySetInnerHTML={{ __html: d.cover }} /><span className="mv-shade" />{d.img ? null : <span className="mcard-livebg" />}
            <span className="mv-live"><span className="live" style={cssVars({ '--dot': '#fff' })} />{tx.live}</span>
            <button type="button" className="mv-play" onClick={mpToggle} aria-label={tx.play}><i /><i /><Icon ub={ub} n="play" c="w-9 h-9 ml-1" /></button>
            <span className="mv-cap"><Icon ub={ub} n={d.capIcon} c="w-4 h-4" />{d.cap}</span>
          </>}
      </div>
    </div>
  );
  else if (isPhoto) stageEl = (
    <div className="mv-stage" id="mv-stage" ref={stage} {...swipe}>{ambImg}{close}
      <PhotoMain src={d.photos[ph].big} alt={`${d.title} ${ph + 1}`} />
      <span className="mv-count tnum" id="ph-count">{ph + 1} / {n}</span>
      <button type="button" className="mv-fs" onClick={fs} aria-label={tx.fs} title={tx.fs}><Icon ub={ub} n="maximize-2" c="w-[18px] h-[18px]" /></button>
      {n > 1 ? <>
        <button type="button" className="mv-nav mv-prev" onClick={() => step(-1)} aria-label={tx.prev}><Icon ub={ub} n="chevron-left" c="w-6 h-6" /></button>
        <button type="button" className="mv-nav mv-next" onClick={() => step(1)} aria-label={tx.next}><Icon ub={ub} n="chevron-right" c="w-6 h-6" /></button>
        <div className="mv-strip thin-scroll" id="ph-strip" ref={strip}>
          {d.photos.map((p, k) => (
            <button key={k} type="button" className={`mv-th ${k === ph ? 'is-on' : ''}`} data-k={k} onClick={() => setPh(k)} aria-label={String(k + 1)}><img src={p.th} alt="" loading="lazy" /></button>
          ))}
        </div>
      </> : null}
    </div>
  );
  else if (d.type === 'podcast') stageEl = (
    <div className="mv-stage mv-pod" id="mv-stage" ref={stage}>{ambImg}{close}
      <div className="mv-disc"><span className="mv-vinyl" /><div className="scene mv-art" dangerouslySetInnerHTML={{ __html: d.cover }} /></div>
      <p className="mv-pod-cap">{tx.podCap}</p>
      <div className="mv-eq" aria-hidden="true">{Array.from({ length: 24 }, (_, k) => <i key={k} style={cssVars({ '--k': k })} />)}</div>
    </div>
  );
  else stageEl = (   // постер: дарж томруулна, курсорын байрлалаар гүйлгэнэ
    <div className="mv-stage" id="mv-stage" ref={stage}>{ambImg}{close}
      <div className={`mv-poster ${zoom ? 'is-zoom' : ''}`} id="mv-poster" onClick={() => setZoom((z) => !z)} title={zoom ? tx.zoomOut : tx.zoomIn}
        onPointerMove={(e) => {
          if (!zoom) return;
          const el = e.currentTarget, r = el.getBoundingClientRect();
          el.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
          el.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        }}>
        {d.img ? <img src={d.img} alt={d.title} /> : <div className="scene w-full aspect-[3/4]" dangerouslySetInnerHTML={{ __html: d.cover }} />}
      </div>
      <span className="mv-hint"><Icon ub={ub} n={zoom ? 'zoom-out' : 'zoom-in'} c="w-4 h-4" />{zoom ? tx.hintOut : tx.hintIn}</span>
    </div>
  );

  return (
    <div className="mv" key={d.i} ref={root} style={cssVars({ '--mc': d.color })}>
      {stageEl}
      <aside className="mv-info">
        <div className="flex items-center justify-between gap-3">
          <span className="mv-chip"><Icon ub={ub} n={d.icon} c="w-4 h-4" />{d.chip}</span>
          <button type="button" className="mv-close hidden lg:grid" data-act="modal-close" aria-label={tx.close}><Icon ub={ub} n="x" c="w-5 h-5" /></button>
        </div>
        <h2 className="mv-t">{d.title}</h2>
        <div className="mv-meta">
          <span><Icon ub={ub} n="calendar" c="w-4 h-4" />{d.date}</span>
          <span className="tnum"><Icon ub={ub} n="eye" c="w-4 h-4" />{d.views}</span>
          {isPhoto && d.photosN ? <span className="tnum"><Icon ub={ub} n="images" c="w-4 h-4" />{d.photosN}</span> : null}
        </div>
        <div className="mv-body thin-scroll">
          {d.body.length ? d.body.map((p, k) => <p key={k}>{p}</p>) : <p className="mv-empty">{d.empty}</p>}
        </div>
        <div className="mv-acts">
          <a href={d.primary.href} target="_blank" rel="noopener" className="mv-btn mv-btn-p"><Icon ub={ub} n={d.primary.icon} c="w-[18px] h-[18px]" />{d.primary.label}</a>
          <button type="button" className="mv-btn mv-btn-i" onClick={() => ub.home.mediaCopy(d.i)} title={tx.copy} aria-label={tx.copy}><Icon ub={ub} n="link" c="w-[18px] h-[18px]" /></button>
          {d.type === 'live' ? <a href={d.src} target="_blank" rel="noopener" className="mv-btn mv-btn-i" title="ulaanbaatar.mn" aria-label="ulaanbaatar.mn"><Icon ub={ub} n="external-link" c="w-[18px] h-[18px]" /></a> : null}
        </div>
        {d.rel.length ? (
          <div className="mv-rel">
            <p className="mv-rel-h">{d.relHead}</p>
            {d.rel.map((r, k) => (
              <button key={r.i} type="button" className="mv-ri" style={cssVars({ '--i': k })} onClick={() => go(r.i)}>
                <span className="scene mv-ri-th" dangerouslySetInnerHTML={{ __html: r.scene }} />
                <span className="min-w-0"><b>{r.title}</b><span>{r.meta}</span></span>
              </button>
            ))}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

/** Цомгийн том зураг: шинэ зураг ачаалагдмагц хуучинтайгаа зөөлөн уусна (.mv-img.is-on) */
function PhotoMain({ src, alt }: { src: string; alt: string }) {
  const [layers, setLayers] = useState([{ id: 0, src, alt, on: true }]);
  const cur = useRef(src), ids = useRef(0);
  useEffect(() => {
    if (cur.current === src) return;
    cur.current = src;
    const id = ++ids.current, img = new Image();
    let dead = false, r1 = 0, r2 = 0, tm: ReturnType<typeof setTimeout> | undefined;
    const show = () => {
      if (dead) return;
      setLayers((l) => [...l, { id, src, alt, on: false }]);
      r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => {   // шинэ зураг opacity:0-ээр зурагдсаны дараа асаана
        if (dead) return;
        setLayers((l) => l.map((x) => ({ ...x, on: x.id === id })));
        tm = setTimeout(() => setLayers((l) => l.filter((x) => x.on)), 450);
      }); });
    };
    img.decoding = 'async'; img.src = src;
    if (img.complete) show(); else { img.onload = show; img.onerror = show; }
    return () => { dead = true; cancelAnimationFrame(r1); cancelAnimationFrame(r2); if (tm) clearTimeout(tm); img.onload = img.onerror = null; };
  }, [src, alt]);
  return (
    <div className="mv-photo" id="ph-main">
      {layers.map((x) => <img key={x.id} src={x.src} alt={x.alt} className={`mv-img${x.on ? ' is-on' : ''}`} decoding="async" />)}
    </div>
  );
}

/* ================= Жишээ медиа (сервергүй / анхны агуулга) ================= */
function MediaDemo({ ub, d }: { ub: UB; d: DemoData }) {
  const live = d.type === 'live', tx = d.tx;
  const [playing, setPlaying] = useState(live), [pos, setPos] = useState(0), [ph, setPh] = useState(0);
  const [viewers, setViewers] = useState(d.viewers), [liveSec, setLiveSec] = useState(4333);
  /* Цаг: Live — үргэлжилсэн хугацаа, үзэгчид; бусад — байрлал (дуусахад зогсоно) */
  useEffect(() => {
    if (!playing) return;
    const tm = setInterval(() => {
      if (live) { setLiveSec((x) => x + 1); setViewers((v) => Math.max(900, v + Math.round(Math.random() * 10 - 4))); return; }
      setPos((p) => Math.min(d.durS, p + 1));
    }, 1000);
    return () => clearInterval(tm);
  }, [playing, live, d.durS]);
  useEffect(() => { if (!live && playing && pos >= d.durS) setPlaying(false); }, [live, playing, pos, d.durS]);
  const toggle = () => setPlaying((p) => !p);
  const frac = d.durS ? pos / d.durS : 0;

  const n = d.photos.length, isPhoto = d.type === 'photo';
  const step = (dl: number) => { if (n) setPh((p) => (p + dl + n) % n); };
  useArrows(isPhoto && n > 0, step);
  const strip = useRef<HTMLDivElement>(null), phPrev = useRef(ph);
  useEffect(() => {   // идэвхтэй жижиг зургийг голлуулна
    if (phPrev.current === ph) return;
    phPrev.current = ph;
    const st = strip.current, b = st?.querySelector<HTMLElement>(`[data-k="${ph}"]`);
    if (st && b) st.scrollTo({ left: b.offsetLeft - st.clientWidth / 2 + 40, behavior: ub.state().reduced ? 'auto' : 'smooth' });
  }, [ph, ub]);

  const closeBtn = (cls: string) => <button type="button" className={`absolute right-3 top-3 icon-btn ${cls} backdrop-blur`} data-act="modal-close" aria-label={tx.close}><Icon ub={ub} n="x" /></button>;
  const head = <><p className="text-[13px] text-muted">{d.desc}</p><h2 className="mt-1 text-[22px] sm:text-[24px] font-extrabold leading-snug">{d.title}</h2></>;
  const pl = playing ? tx.pause : tx.play;

  if (isPhoto) return (
    <>
      <div className="relative bg-black sm:rounded-t-[8px] overflow-hidden">
        <div className="scene aspect-[16/10]" id="ph-main" dangerouslySetInnerHTML={{ __html: d.photos[ph] || d.scene }} />
        {closeBtn('bg-black/45 text-white hover:bg-black/60')}
        <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 icon-btn bg-black/50 text-white hover:bg-black/70" onClick={() => step(-1)} aria-label={tx.prev}><Icon ub={ub} n="chevron-left" /></button>
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 icon-btn bg-black/50 text-white hover:bg-black/70" onClick={() => step(1)} aria-label={tx.next}><Icon ub={ub} n="chevron-right" /></button>
        <span className="absolute left-4 bottom-4 h-8 px-3 rounded-full bg-black/55 text-white text-[13px] font-bold inline-flex items-center tnum" id="ph-count">{ph + 1} / {n}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto thin-scroll px-5 sm:px-7 pt-4 pb-1" id="ph-strip" ref={strip}>
        {d.photos.map((sc, k) => (
          <button key={k} type="button" className={`scene w-20 h-14 rounded-lg shrink-0 ring-2 ring-offset-2 ring-offset-card transition ${k === ph ? 'ring-ubred' : 'ring-transparent opacity-60 hover:opacity-100'}`}
            data-k={k} onClick={() => setPh(k)} aria-label={String(k + 1)} dangerouslySetInnerHTML={{ __html: sc }} />
        ))}
      </div>
      <div className="px-5 sm:px-7 pt-4 pb-6">{head}<p className="mt-2 text-[13px] text-muted">{tx.photoCredit}</p></div>
    </>
  );

  if (d.type === 'podcast') return (
    <>
      <div className="relative">{closeBtn('bg-soft hover:bg-line')}</div>
      <div className="px-5 sm:px-7 pt-8 pb-7 flex flex-col sm:flex-row gap-6 sm:items-center">
        <div className="scene w-40 h-40 rounded-2xl shrink-0 shadow-xl self-center" dangerouslySetInnerHTML={{ __html: d.scene }} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-ubred">{tx.podcast} {d.ep}</p>
          <h2 className="mt-1 text-[21px] font-extrabold leading-snug">{d.title}</h2>
          <p className="mt-1 text-muted text-[14px]">{d.desc}</p>
          <div className="mt-5 flex items-center gap-[3px] h-14" id="pc-wave">
            {d.bars.map((h, k) => <i key={k} className={`flex-1 rounded-full transition-colors ${k / 56 < frac ? 'bg-ubred' : 'bg-line'}`} style={{ height: h + '%' }} />)}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button type="button" className="w-12 h-12 rounded-full bg-ink text-card grid place-items-center" onClick={toggle} aria-label={pl}><Icon ub={ub} n={playing ? 'pause' : 'play'} c="w-5 h-5" /></button>
            <span className="text-[13px] tnum text-muted" id="mp-time">{fmt(pos)} / {d.dur}</span>
            {playing ? <span className="eq text-ubred ml-1"><i /><i /><i /><i /></span> : null}
          </div>
        </div>
      </div>
    </>
  );

  return (   // видео тоглуулагч (Live, постер)
    <>
      <div className="relative bg-black sm:rounded-t-[8px] overflow-hidden">
        <div className="scene aspect-video" dangerouslySetInnerHTML={{ __html: d.scene }} />
        <div className={`absolute inset-0 transition-colors ${playing ? 'bg-black/0' : 'bg-black/30'}`} />
        {live ? <>
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-ubred text-white text-[13px] font-bold"><span className="live" style={cssVars({ '--dot': '#fff' })} />{tx.live}</span>
          <span className="absolute left-[104px] top-4 h-8 px-3 rounded-full bg-black/55 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="eye" c="w-4 h-4" /><span id="mp-viewers">{num(viewers, d.en)}</span></span>
        </> : null}
        {closeBtn('bg-black/45 text-white hover:bg-black/60')}
        <button type="button" className="absolute inset-x-0 top-14 bottom-16 grid place-items-center" onClick={toggle} aria-label={pl}>
          <span className={`w-20 h-20 rounded-full bg-white/90 text-[#0B1D45] grid place-items-center shadow-2xl transition-all duration-300 ${playing ? 'opacity-0 scale-75' : ''}`}><Icon ub={ub} n="play" c="w-9 h-9 ml-1" /></span>
        </button>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-10 bg-gradient-to-t from-black/80 to-transparent text-white flex items-center gap-3">
          <button type="button" className="icon-btn hover:bg-white/15" onClick={toggle} aria-label={pl}><Icon ub={ub} n={playing ? 'pause' : 'play'} /></button>
          <span className="text-[13px] tnum whitespace-nowrap" id="mp-time">{live ? `${tx.liveFor} ${fmt(liveSec)}` : `${fmt(pos)} / ${d.dur}`}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/25 overflow-hidden"><div className="h-full bg-ubred transition-[width] duration-1000 ease-linear" id="mp-bar" style={{ width: (live ? 100 : frac * 100) + '%' }} /></div>
          <Icon ub={ub} n="volume-2" c="w-5 h-5 opacity-80" />
        </div>
      </div>
      <div className="px-5 sm:px-7 py-6">{head}</div>
    </>
  );
}
