'use client';
/* Тусдаа хуудасны толгой (#page-hero: /news, /services, /events ...): байршил, гарчиг, тайлбар, 3 тоо (эсвэл «Хотын өгөгдөл»-д цаг + нарны нум), хуудасны цэсийн холбоосууд.
   Өгөгдөл: src/core/pages.js pageHeroData(). Нүүрэнд #page-hero нуугдана (pageView). Холбоос дарахыг features/wiring.js барина (data-act="go" | "home" | "page"). */
import { Fragment, useLayoutEffect, useRef } from 'react';
import { Icon, Live, cssVars, itemAct, useUB, type MenuItem } from '../ub';

interface Stat { v: string; l: string; live: string }
interface Sun { up: boolean; done: string; x: string; y: string; rise: string; set: string; mid: string }
interface PageHeroData {
  k: string; c: string; i: string; dark: string;
  home: string; crumbLabel: string; top: { k: string; label: string } | null;
  title: string; desc: string;
  stats: Stat[];
  clock: { live: string; date: string; time: string; sun: Sun } | null;
  links: (MenuItem & { on: boolean })[];
}

export function PageHero() {
  const ub = useUB();
  const ref = useRef<HTMLDivElement>(null);
  const d = ub ? (ub.home.pageHero() as PageHeroData | null) : null;
  const bg = d ? d.dark : '';
  // бараан хэсэгтэй хуудсанд толгой нь (бүтэн өргөнөөрөө, section#page-hero) тэр дэвсгэртэйгээ нэг үргэлжилнэ
  useLayoutEffect(() => { const sec = ref.current?.parentElement; if (sec) sec.style.background = bg; }, [bg, d?.k]);
  if (!ub || !d) return null;
  const crumbs = [
    <button key="home" type="button" data-act="home">{d.home}</button>,
    d.top && <button key="top" type="button" data-act="page" data-v={d.top.k}>{d.top.label}</button>,
    <span key="cur" aria-current="page">{d.title}</span>,
  ].filter(Boolean);
  return (
    <div ref={ref} className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-5 lg:pt-7">
      <div key={d.k} className={`pg-hero ${d.dark ? 'is-dark' : ''}`} style={cssVars({ '--pc': d.c })}>
        <span className="pg-aur" aria-hidden="true" />
        <span className="pg-big" aria-hidden="true">
          <svg className="w-full h-full shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ub.icon(d.i) }} />
        </span>
        <nav className="pg-crumbs" aria-label={d.crumbLabel}>
          {crumbs.map((c, i) => <Fragment key={i}>{i > 0 && <Icon ub={ub} n="chevron-right" c="w-3.5 h-3.5 opacity-50" />}{c}</Fragment>)}
        </nav>
        <div className="pg-main">
          <div className="min-w-0"><span className="pg-ic"><Icon ub={ub} n={d.i} c="w-6 h-6" /></span><h1 className="pg-t">{d.title}</h1><p className="pg-d">{d.desc}</p></div>
          {d.clock ? <DataClock ub={ub} c={d.clock} /> : (
            <dl className="pg-stats">
              {d.stats.map((s, i) => <div key={i} style={cssVars({ '--i': i })}><dt>{s.l}</dt><dd className="tnum">{s.live ? <Live k={s.live} v={s.v} /> : s.v}</dd></div>)}
            </dl>
          )}
        </div>
        <div className="pg-links" id="pg-links">
          {d.links.map((it, k) => (
            <button key={k} type="button" className="pg-link" style={cssVars({ '--i': k })} {...itemAct(it)} aria-current={it.on ? 'true' : 'false'}><Icon ub={ub} n={it.i} c="w-4 h-4" />{it.t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** «Хотын өгөгдөл»: секунд тоолох цаг (features/weather.js data-live="clocks"-ийг секунд тутам шинэчилнэ) + өдрийн нарны нум */
function DataClock({ ub, c }: { ub: NonNullable<ReturnType<typeof useUB>>; c: NonNullable<PageHeroData['clock']> }) {
  const s = c.sun, night = s.up ? '' : 'is-night';
  return (
    <div className="dclock">
      <p className="dclock-top"><span className="live" style={cssVars({ '--dot': '#33D69F' })} />{c.live}<span className="opacity-50">·</span><span>{c.date}</span></p>
      <p className="dclock-t tnum" data-live="clocks" dangerouslySetInnerHTML={{ __html: c.time }} />
      <div id="dsun">
        <svg viewBox="0 0 260 74" className="dsun-arc" aria-hidden="true">
          <defs><linearGradient id="dsg" x1="0" x2="1"><stop offset="0" stopColor="#FFB547" /><stop offset="1" stopColor="#FF6B5A" /></linearGradient></defs>
          <path className="dsun-track" d="M12 66Q130 -26 248 66" />
          <path className="dsun-done" d="M12 66Q130 -26 248 66" pathLength={100} style={{ strokeDasharray: `${s.done} 100` }} />
          <line x1="0" y1="66.5" x2="260" y2="66.5" className="dsun-hz" />
          <circle className={`dsun-glow ${night}`} cx={s.x} cy={s.y} r="13" />
          <circle className={`dsun-dot ${night}`} cx={s.x} cy={s.y} r="6" />
        </svg>
        <div className="dsun-meta tnum"><span><Icon ub={ub} n="sunrise" c="w-4 h-4" />{s.rise}</span><span className="dsun-mid">{s.mid}</span><span>{s.set}<Icon ub={ub} n="sunset" c="w-4 h-4" /></span></div>
      </div>
    </div>
  );
}
