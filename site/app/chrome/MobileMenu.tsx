'use client';
/* Гар утас: доод мөрний цэс ба бүтэн дэлгэцийн цэс (drawer). Цэсийг src/core/bridge.js openMenu() / closeMenu() нээж хаана. */
import { useEffect, useState } from 'react';
import { A11yBtn, LangToggle, ThemeBtn } from './Header';
import { Icon, LogoMark, itemAct, useUB, type UB } from '../ub';

/** Доод мөр: идэвхтэйг (aria-current) src/core/header.js setActiveNav тэмдэглэнэ */
export function BottomBar() {
  const ub = useUB();
  if (!ub) return null;
  const { t } = ub;
  const it = (bb: string, icon: string, label: string, act: Record<string, string>) => (
    <button type="button" className="bb-item" data-bb={bb} {...act} aria-current="false"><Icon ub={ub} n={icon} c="w-[22px] h-[22px]" /><span>{label}</span></button>
  );
  return (
    <nav className="bbar lg:hidden" aria-label="Mobile"><div className="grid grid-cols-5 h-[64px] max-w-lg mx-auto">
      {it('home', 'house', t('bb_home'), { 'data-act': 'go', 'data-sec': 'hero' })}
      {it('services', 'layout-grid', t('bb_services'), { 'data-act': 'go', 'data-sec': 'hub', 'data-hub': 'services' })}
      <button type="button" className="bb-item !text-ink" data-act="report" aria-label={t('cta_report')}>
        <span className="-mt-7 w-[54px] h-[54px] rounded-full bg-ubred text-white grid place-items-center shadow-[0_12px_24px_-10px_rgb(var(--c-red))] ring-4 ring-page" dangerouslySetInnerHTML={{ __html: ub.animIcon('siren', 'w-6 h-6') }} />
        <span>{t('bb_report')}</span>
      </button>
      {it('news', 'newspaper', t('bb_news'), { 'data-act': 'go', 'data-sec': 'hub', 'data-hub': 'news' })}
      {it('my', 'circle-user-round', t('bb_my'), { 'data-act': 'my' })}
    </div></nav>
  );
}

/** Бүтэн дэлгэцийн цэс: нээгдэхэд гулсаж орж ирнэ (.ovl.open), хаахад 380мс-ийн дараа алга болно */
export function MobileMenu() {
  const ub = useUB(), want = !!ub?.menuOpen;
  const [mounted, setMounted] = useState(false), [visible, setVisible] = useState(false);
  useEffect(() => {
    if (want) {
      setMounted(true);
      let r2 = 0; const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setVisible(true)); });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    setVisible(false);
    const tm = setTimeout(() => setMounted(false), 380);
    return () => clearTimeout(tm);
  }, [want]);
  if (!ub || !mounted) return null;
  return (
    <div className={`ovl${visible ? ' open' : ''}`} id="mmenu" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) ub.closeMenu(); }}>
      <Drawer ub={ub} />
    </div>
  );
}

function Drawer({ ub }: { ub: UB }) {
  const { t, L } = ub, s = ub.state();
  const [acc, setAcc] = useState<number[]>([]);
  const toggle = (i: number) => setAcc((a) => (a.includes(i) ? a.filter((x) => x !== i) : [...a, i]));
  return (
    <div className="drawer">
      <div className="flex items-center justify-between px-5 h-16 border-b border-line">
        <span className="flex items-center gap-3"><LogoMark ub={ub} c="w-9 h-9" /><b className="text-[17px]">{t('brand')}</b></span>
        <button type="button" className="icon-btn hover:bg-soft" data-act="menu-close" aria-label={t('close')}><Icon ub={ub} n="x" /></button>
      </div>
      <div className="p-5 space-y-5">
        <button type="button" data-act="search" className="w-full h-12 rounded-xl border border-line bg-soft flex items-center gap-3 px-4 text-muted"><Icon ub={ub} n="search" />{t('searchPh')}</button>
        <div className="grid grid-cols-1 gap-2">
          <button type="button" className="cta-pill cta-red !h-12 justify-center" data-act="report"><span className="cta-pill-ic" dangerouslySetInnerHTML={{ __html: ub.animIcon('siren', 'w-5 h-5') }} />{t('cta_report')}</button>
          <button type="button" className="cta-pill cta-blue !h-12 justify-center" data-act="vote"><span className="cta-pill-ic" dangerouslySetInnerHTML={{ __html: ub.animIcon('vote', 'w-5 h-5') }} />{t('cta_vote')}</button>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {ub.menu().map((m, i) => {
            const on = acc.includes(i);
            return (
              <div key={i}>
                <button type="button" className="w-full h-14 flex items-center justify-between font-bold text-[16px]" aria-expanded={on} onClick={() => toggle(i)}>
                  {m.label}<span className="inline-flex transition-transform" style={on ? { transform: 'rotate(180deg)' } : undefined}><Icon ub={ub} n="chevron-down" c="w-5 h-5" /></span>
                </button>
                <div className={`${on ? '' : 'hidden '}pb-3 space-y-1`}>
                  {m.page && <button type="button" className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-soft font-bold text-[14.5px] text-left" data-act="page" data-v={m.page}>{L(['Бүгдийг үзэх', 'See all'])}<Icon ub={ub} n="arrow-right" c="w-[18px] h-[18px] text-ubred" /></button>}
                  {m.items.map((it, k) => (
                    <button key={k} type="button" className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-soft text-left" {...itemAct(it)}>
                      <span className="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred"><Icon ub={ub} n={it.i} c="w-[18px] h-[18px]" /></span>
                      <span className="text-[14.5px] font-semibold">{it.t}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><LangToggle ub={ub} /><ThemeBtn ub={ub} /><A11yBtn ub={ub} /></div>
          {s.user
            ? <button type="button" className="btn btn-sm btn-ghost" data-act="my">{t('myCorner')}</button>
            : <button type="button" className="btn btn-sm btn-ink" data-act="login"><Icon ub={ub} n="fingerprint" c="w-4 h-4" />{t('login')}</button>}
        </div>
      </div>
    </div>
  );
}
