'use client';
/* Үндсэн цэс: хөвөгч «dock» капсул (том дэлгэцэнд). Шингэн тодруулга (pill), мега цэс, гэрэлтэх хүрээ,
   доод ирмэгт уншилтын явцыг харуулах алхан хээ (src/core/header.js dockProgress). Загвар: src/styles/06-header-dock.css */
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Emblem, Icon, cssVars, itemAct, useUB, type UB } from './ub';

const NAV_EASE = 'cubic-bezier(.22, 1, .36, 1)';
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Хуучин код (Esc, хуудас солих, src/core/header.js setActiveNav) #navbar дээрх эдгээрийг дуудна */
type NavEl = HTMLElement & { _close?: () => void; _moveInd?: () => void };

export function Dock() {
  const ub = useUB();
  const nav = useRef<NavEl>(null), mega = useRef<HTMLDivElement>(null), card = useRef<HTMLDivElement>(null), body = useRef<HTMLDivElement>(null), caret = useRef<HTMLSpanElement>(null), pill = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(-1);         // нээлттэй мега цэс
  const [shown, setShown] = useState(-1);       // мега цэсний агуулга (хаагдах үед ч харагдсаар)
  const st = useRef({ open: -1, hover: false, timer: 0 as unknown as ReturnType<typeof setTimeout>, pillOn: false });

  /* Шингэн тодруулга: шинэ зүйл рүү шилжихдээ эхлээд хоёуланг нь хамрах хүртэл сунаж, дараа нь хумигдана */
  const pillTo = (btn: HTMLElement | null) => {
    const p = pill.current, s = st.current; if (!p) return;
    if (!btn) { p.style.opacity = '0'; s.pillOn = false; return; }
    const x = (btn.parentElement as HTMLElement).offsetLeft, w = btn.offsetWidth;
    const cs = getComputedStyle(p), x0 = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform).m41, w0 = parseFloat(cs.width) || w;
    p.getAnimations().forEach((a) => a.cancel());
    p.style.width = w + 'px'; p.style.transform = `translateX(${x}px)`;
    if (s.pillOn && !reduced() && Math.abs(x0 - x) > 1) {
      const l = Math.min(x0, x), r = Math.max(x0 + w0, x + w);
      // 1) 200мс: хоёуланг нь бүрхтэл сунана  2) 280мс: шинэ байрлалдаа зөөлөн хумигдана
      p.animate([
        { transform: `translateX(${x0}px)`, width: w0 + 'px', easing: 'cubic-bezier(.45, 0, .25, 1)' },
        { transform: `translateX(${l}px)`, width: r - l + 'px', offset: 0.42, easing: NAV_EASE },
        { transform: `translateX(${x}px)`, width: w + 'px' },
      ], { duration: 480 });
    }
    p.style.opacity = '1'; s.pillOn = true;
  };
  const placeCaret = (btn: HTMLElement) => {
    const r = btn.getBoundingClientRect(), m = mega.current!.getBoundingClientRect();
    caret.current!.style.transform = `translateX(${Math.round(r.left + r.width / 2 - m.left - 7)}px) rotate(45deg)`;
  };
  const openMenu = (i: number, byHover: boolean) => {
    const s = st.current, c = caret.current!;
    clearTimeout(s.timer);
    if (s.open === i) { if (!byHover) s.hover = false; return; }
    const prev = s.open, btn = nav.current!.querySelector<HTMLElement>(`.nav-btn[data-menu="${i}"]`)!;
    s.hover = byHover; s.open = i;
    if (prev < 0) {
      flushSync(() => { setShown(i); setOpen(i); });
      c.style.transition = 'none'; placeCaret(btn); void c.offsetWidth; c.style.transition = '';
    } else {   // нээлттэй үед өөр цэс рүү: өндөр нь зөөлөн өөрчлөгдөж, агуулга чиглэлээрээ гулсана
      const h0 = card.current!.offsetHeight;
      flushSync(() => { setShown(i); setOpen(i); });
      const h1 = card.current!.offsetHeight;
      if (!reduced()) {
        const dir = i > prev ? 1 : -1;
        card.current!.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 380, easing: NAV_EASE });
        body.current!.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: NAV_EASE });
      }
      placeCaret(btn);
    }
    pillTo(btn);
  };
  const close = () => { st.current.open = -1; setOpen(-1); pillTo(null); };

  useEffect(() => {
    const n = nav.current; if (!n || !ub) return;
    n._close = close;
    n._moveInd = () => { if (st.current.open < 0) pillTo(null); };
  });
  const ready = !!ub;
  useEffect(() => { if (ready) window.UB!.dockProgress(); }, [ready]);
  useEffect(() => () => clearTimeout(st.current.timer), []);

  if (!ub) return null;
  const menu = ub.menu(), { t } = ub;

  const onOver = (e: MouseEvent) => {
    const el = e.target as HTMLElement, b = el.closest<HTMLElement>('.nav-btn[data-menu]');
    if (b) openMenu(+b.dataset.menu!, true); else if (el.closest('#mega')) clearTimeout(st.current.timer);
  };
  const onClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement, b = el.closest<HTMLElement>('.nav-btn[data-menu]');
    if (b) {
      const i = +b.dataset.menu!, pk = menu[i]?.page;
      if (pk) { close(); ub.openPage(pk); return; }
      if (st.current.open === i && !st.current.hover) close(); else openMenu(i, false);
    } else if (el.closest('[data-act="go"], [data-act="ext-link"]')) close();
  };
  const m = menu[shown];

  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8">
      <nav className="dock" id="navbar" aria-label="Main" ref={nav}
        onMouseOver={onOver} onClick={onClick}
        onMouseLeave={() => { st.current.timer = setTimeout(close, 160); }}
        onBlur={(e) => { if (!nav.current!.contains(e.relatedTarget as Node)) close(); }}
        onPointerMove={(e) => { const n = nav.current!, r = n.getBoundingClientRect(); n.style.setProperty('--mx', Math.round(e.clientX - r.left) + 'px'); n.style.setProperty('--my', Math.round(e.clientY - r.top) + 'px'); }}>
        <span className="dock-glass" aria-hidden="true"><i /></span>
        <div className="dock-in">
          <button type="button" data-act="home" className="mini-logo shrink-0" tabIndex={-1} aria-hidden="true"><Emblem ub={ub} c="w-[34px] h-[34px]" /></button>
          <ul className="dock-items" id="nav-items">
            <li className="nav-pill" id="nav-pill" aria-hidden="true" ref={pill} />
            <li className="nav-home-li"><button type="button" className="nav-btn nav-home" data-act="home"><Icon ub={ub} n="house" c="w-[17px] h-[17px]" /><span>{ub.L(['Нүүр', 'Home'])}</span></button></li>
            {menu.map((g, i) => (
              <li key={i} className="flex">
                <button type="button" className="nav-btn" data-menu={i} aria-expanded={open === i} aria-haspopup="true"><span>{g.label}</span><Icon ub={ub} n="chevron-down" c="nav-chev w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2 pl-3 shrink-0">
            <button type="button" data-act="search" className="dock-search" aria-label={t('search')} title={`${t('search')} (Ctrl K)`}><Icon ub={ub} n="search" c="w-[18px] h-[18px]" /></button>
          </div>
          <div className={`mega${open >= 0 ? ' open' : ''}`} id="mega" role="region" ref={mega}>
            <span className="mega-caret" aria-hidden="true" ref={caret} />
            <div className="mega-card" ref={card}><div className="mega-body" ref={body}>
              {m && (
                <div key={shown} className="p-4 xl:p-5 grid grid-cols-12 gap-4 xl:gap-5">
                  <div className="col-span-8 grid grid-cols-2 gap-1 content-start">
                    {m.items.map((it, k) => (
                      <button key={k} type="button" className="mega-item" style={cssVars({ '--i': k })} {...itemAct(it)}>
                        <span className="mega-ic"><Icon ub={ub} n={it.i} /></span>
                        <span className="min-w-0 flex-1"><b className="block text-[15px] leading-snug">{it.t}</b><span className="block text-[13px] text-muted leading-snug mt-0.5">{it.d}</span></span>
                        <span className="mega-go"><Icon ub={ub} n={it.href ? 'arrow-up-right' : 'arrow-right'} c="w-4 h-4" /></span>
                      </button>
                    ))}
                  </div>
                  <div className="col-span-4 mega-feat" style={cssVars({ '--i': m.items.length })} dangerouslySetInnerHTML={{ __html: ub.megaFeat(shown) }} />
                </div>
              )}
            </div></div>
          </div>
        </div>
        <span className="dock-orn" aria-hidden="true"><i /><i className="dock-orn-fill" /></span>
      </nav>
    </div>
  );
}
