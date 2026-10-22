'use client';
/* Мега төслийн дэлгэрэнгүй цонх: зураг, ангилал, нэр, ipiu.mn-ийн албан ёсны мэдээлэл эсвэл гүйцэтгэл, явцын мэдээний жагсаалт (дарахад задарна).
   Нээх: src/sections/projects.js openProject(id). Өгөгдөл: ub.home.projectModal(id). Задласан мэдээг энэ цонх өөрөө (useState) барина. */
import { useEffect, useRef, useState } from 'react';
import { Icon, cssVars, type UB } from '../ub';


interface Up { id: string; date: string; title: string; thumb: string; img: string; body: string[]; href: string }
interface Official {
  head: string; src: string; desc: string; kpi: [string, string][]; bar: number | null;
  parts: { l: string; v: number; w: number }[]; metrics: { l: string; v: string }[];
  tlHead: string; timeline: { d: string; t: string; n: string }[];
}
interface ProjData {
  color: string; hero: string; scene: string; close: string; cat: { i: string; t: string }; title: string;
  years: string; nUps: string; latest: string; official: Official | null;
  pct: { head: string; v: number; src: string } | null;
  upsHead: string; readFull: string; source: string; ups: Up[];
}

export function Project({ ub, id }: { ub: UB; id: string }) {
  const p = ub.home.projectModal(id) as ProjData | null;
  const [open, setOpen] = useState<string | null>(() => (p && p.ups.length ? p.ups[0].id : null));
  const list = useRef<HTMLOListElement>(null), first = useRef(true);
  useEffect(() => {   // задласан мэдээг харагдах хэсэгт гүйлгэнэ
    if (first.current) { first.current = false; return; }
    const el = list.current && list.current.querySelector('.mp-u.is-open');
    if (el) el.scrollIntoView({ block: 'nearest', behavior: ub.state().reduced ? 'auto' : 'smooth' });
  }, [open, ub]);
  if (!p) return null;
  const o = p.official;
  return (
    <div className="mp" style={cssVars({ '--mc': p.color })}>
      <div className="mp-hero">
        {p.hero ? <img src={p.hero} alt="" className="mp-hero-img" /> : <div className="scene !absolute inset-0" dangerouslySetInnerHTML={{ __html: p.scene }} />}
        <span className="mp-hero-shade" />
        <button type="button" className="mp-x" data-act="modal-close" aria-label={p.close}><Icon ub={ub} n="x" c="w-5 h-5" /></button>
        <div className="mp-hero-in">
          <span className="mp-chip"><Icon ub={ub} n={p.cat.i} c="w-4 h-4" />{p.cat.t}</span>
          <h2 className="mp-t">{p.title}</h2>
          <p className="mp-meta">
            {p.years && <span><Icon ub={ub} n="calendar-range" c="w-4 h-4" />{p.years}</span>}
            <span><Icon ub={ub} n="newspaper" c="w-4 h-4" />{p.nUps}</span>
            {p.latest && <span><Icon ub={ub} n="calendar" c="w-4 h-4" />{p.latest}</span>}
          </p>
        </div>
      </div>
      {o ? (
        <div className="mp-off">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="mp-h">{o.head}</p>
            <a href={o.src} target="_blank" rel="noopener" className="text-[12.5px] font-semibold text-muted hover:text-ink inline-flex items-center gap-1">ipiu.mn<Icon ub={ub} n="arrow-up-right" c="w-3.5 h-3.5" /></a>
          </div>
          {o.desc && <p className="mt-2 text-[14.5px] leading-relaxed text-ink/80">{o.desc}</p>}
          {o.kpi.length > 0 && <div className="mp-kpis">{o.kpi.map(([l, v], i) => <div key={i} style={cssVars({ '--i': i })}><span>{l}</span><b className="tnum">{v}</b></div>)}</div>}
          {o.bar != null && <span className="mp-bar"><i style={{ width: o.bar + '%' }} /></span>}
          {o.parts.length > 0 && (
            <div className="mp-parts">
              {o.parts.map((x, k) => (
                <div key={k}><span className="flex justify-between gap-3 text-[13px]"><span className="text-muted">{x.l}</span><b className="tnum">{x.v}%</b></span><span className="mp-pbar"><i style={{ width: x.w + '%' }} /></span></div>
              ))}
            </div>
          )}
          {o.metrics.length > 0 && <dl className="mp-metrics">{o.metrics.map((m, k) => <div key={k}><dt>{m.l}</dt><dd>{m.v}</dd></div>)}</dl>}
          {o.timeline.length > 0 && (
            <>
              <p className="mp-h mt-6">{o.tlHead}</p>
              <ol className="mp-tl">{o.timeline.map((x, k) => <li key={k}><span className="mp-tl-d tnum">{x.d}</span><b>{x.t}</b>{x.n && <p>{x.n}</p>}</li>)}</ol>
            </>
          )}
        </div>
      ) : p.pct ? (
        <div className="mp-pct">
          <div className="flex items-center justify-between gap-3"><b className="text-[14px]">{p.pct.head}</b><b className="text-[22px] tnum" style={{ color: p.color }}>{p.pct.v}%</b></div>
          <span className="mp-bar"><i style={{ width: p.pct.v + '%' }} /></span>
          <p className="mt-2 text-[13px] text-muted leading-snug">{p.pct.src}</p>
        </div>
      ) : null}
      <div className="mp-list-w">
        <p className="mp-h">{p.upsHead}</p>
        <ol className="mp-list" ref={list}>
          {p.ups.map((u, k) => {
            const on = u.id === open;
            return (
              <li key={u.id} className={`mp-u ${on ? 'is-open' : ''}`} style={cssVars({ '--i': Math.min(k, 10) })}>
                <button type="button" className="mp-u-h" aria-expanded={on} onClick={() => setOpen((x) => (x === u.id ? null : u.id))}>
                  <span className="mp-dot" aria-hidden="true" />{u.thumb && <img src={u.thumb} alt="" loading="lazy" className="mp-u-th" />}
                  <span className="min-w-0 flex-1"><span className="block text-[12px] text-muted tnum">{u.date}</span><b className="block mt-0.5 text-[14.5px] leading-snug">{u.title}</b></span>
                  <Icon ub={ub} n="chevron-down" c="mp-chev w-4 h-4 text-muted shrink-0" />
                </button>
                {on && (
                  <div className="mp-u-b">
                    {u.img && <img src={u.img} alt={u.title} loading="lazy" className="mp-u-img" />}
                    {u.body.map((x, j) => <p key={j}>{x}</p>)}
                    <a href={u.href} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ubblue hover:underline">{p.readFull}<Icon ub={ub} n="arrow-up-right" c="w-4 h-4" /></a>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[12.5px] text-muted">{p.source}: <a href="https://ulaanbaatar.mn/mega-project" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-ink">ulaanbaatar.mn/mega-project</a></p>
      </div>
    </div>
  );
}
