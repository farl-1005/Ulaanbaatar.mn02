'use client';
/* Толгой: сүлд, нэр, уриа | тэнгэрийн шугам (зураг) | хайлт, хэл, a11y, горим, нэвтрэх, цэс.
   Товчнуудын үйлдлийг (data-act) features/wiring.js барина. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Emblem, Icon, useUB, type UB } from './ub';

export function HeaderBand() {
  const ub = useUB();
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 h-[62px] lg:h-[84px] flex items-center gap-3 lg:gap-6">
      <div id="hb-left" className="shrink-0 min-w-0">{ub && <Logo ub={ub} />}</div>
      {ub ? <Sky ub={ub} /> : <div id="hb-sky" className="hidden lg:block flex-1 min-w-[120px] self-stretch relative sky-mask" aria-hidden="true" />}
      <div id="hb-right" className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 shrink-0">{ub && <Actions ub={ub} />}</div>
    </div>
  );
}

/** Сүлд ба нэр: анх ачаалахад нэг удаа «орох» хөдөлгөөнтэй (styles/06-header-dock.css .logo-intro) */
function Logo({ ub }: { ub: UB }) {
  const [intro, setIntro] = useState(() => ub.state().intro);
  useEffect(() => { if (!intro) return; const tm = setTimeout(() => setIntro(false), 2400); return () => clearTimeout(tm); }, [intro]);
  return (
    <button type="button" data-act="home" className={`logo-btn ${intro ? 'logo-intro' : ''} flex items-center gap-3 text-left`} aria-label={ub.t('homeAria')}>
      <Emblem ub={ub} c="w-10 h-10 lg:w-[52px] lg:h-[52px]" />
      <span className="leading-tight min-w-0">
        <span className="logo-word block font-extrabold text-[19px] lg:text-[24px] tracking-[-0.025em]">{ub.t('brand')}</span>
        <span className="logo-slogan hidden sm:block text-[12px] lg:text-[13px] font-semibold text-ubblue leading-[1.25] max-w-[160px] lg:max-w-none lg:whitespace-nowrap">{ub.t('slogan')}</span>
      </span>
    </button>
  );
}

/** Хотын тэнгэрийн шугам (art/skyline.js): хулганыг дагаж давхаргууд хөдөлнө (setupSkyline) */
function Sky({ ub }: { ub: UB }) {
  const ref = useRef<HTMLDivElement>(null);
  const svg = useMemo(() => ({ __html: ub.skylineSVG('skd') }), [ub]);
  useEffect(() => { if (ref.current) ub.watchSky(ref.current); }, [ub]);
  return <div id="hb-sky" ref={ref} className="hidden lg:block flex-1 min-w-[120px] self-stretch relative sky-mask" aria-hidden="true" dangerouslySetInnerHTML={svg} />;
}

function Actions({ ub }: { ub: UB }) {
  const { t } = ub, s = ub.state(), other = s.lang === 'mn' ? 'en' : 'mn';
  return (
    <>
      <button type="button" data-act="search" className="w-10 h-10 rounded-lg btn-navy grid place-items-center" aria-label={t('search')} title={`${t('search')} (Ctrl K)`}><Icon ub={ub} n="search" c="w-[18px] h-[18px]" /></button>
      <div className="hidden sm:flex h-10 px-3 rounded-lg border border-line items-center gap-2.5 text-[13px] font-bold" role="group" aria-label="Language">
        <button type="button" data-act="lang" data-v="mn" aria-pressed={s.lang === 'mn'} className={`transition-colors ${s.lang === 'mn' ? 'text-ink' : 'text-muted hover:text-ink'}`}>МН</button>
        <span className="w-px h-4 bg-line" />
        <button type="button" data-act="lang" data-v="en" aria-pressed={s.lang === 'en'} className={`transition-colors ${s.lang === 'en' ? 'text-ink' : 'text-muted hover:text-ink'}`}>EN</button>
      </div>
      <button type="button" className="sm:hidden h-10 min-w-[40px] px-2 rounded-lg border border-line text-[13px] font-bold" data-act="lang" data-v={other} aria-label={other === 'en' ? 'English' : 'Монгол'}>{other === 'en' ? 'EN' : 'МН'}</button>
      <span className="hidden md:inline-flex"><A11yBtn ub={ub} /></span>
      <span className="hidden md:inline-flex"><ThemeBtn ub={ub} /></span>
      <span className="hidden md:block"><UserBtn ub={ub} /></span>
      <button type="button" data-act="menu" className="lg:hidden w-10 h-10 rounded-lg border border-line grid place-items-center hover:bg-soft" aria-label={t('menu')}><Icon ub={ub} n="menu" /></button>
    </>
  );
}

export function LangToggle({ ub }: { ub: UB }) {
  const lang = ub.state().lang;
  return (
    <div className="flex items-center rounded-xl p-0.5 bg-soft border border-line" role="group" aria-label="Language">
      {(['mn', 'en'] as const).map((l) => (
        <button key={l} type="button" data-act="lang" data-v={l} aria-pressed={lang === l} className={`h-8 px-2.5 rounded-[8px] text-[12.5px] font-bold transition-colors ${lang === l ? 'bg-ink text-card' : 'text-muted hover:text-ink'}`}>{l === 'mn' ? 'МН' : 'EN'}</button>
      ))}
    </div>
  );
}

/** Цайвар / харанхуй горим. Икон солигдоход шинэ элемент болно (key) — features/wiring.js-ийн .theme-pop хөдөлгөөн дахин тоглоно. */
export function ThemeBtn({ ub }: { ub: UB }) {
  const d = ub.state().theme === 'dark', lbl = d ? ub.t('themeLight') : ub.t('themeDark');
  return <button type="button" data-act="theme" className="icon-btn !rounded-lg border border-line hover:bg-soft" aria-label={lbl} title={lbl}><Icon key={d ? 'sun' : 'moon'} ub={ub} n={d ? 'sun' : 'moon'} c="w-[19px] h-[19px]" /></button>;
}

export function A11yBtn({ ub }: { ub: UB }) {
  const on = ub.state().a11y, lbl = ub.t('a11yMode');
  return <button type="button" data-act="a11y" aria-pressed={on} className={`icon-btn !rounded-lg border transition-colors ${on ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}`} aria-label={lbl} title={lbl}><Icon ub={ub} n="eye" c="w-[19px] h-[19px]" /></button>;
}

/** Нэвтрэх товч, нэвтэрсэн бол хэрэглэгчийн цэс (нээх / хаахыг features/wiring.js user-menu) */
function UserBtn({ ub }: { ub: UB }) {
  const { t } = ub, s = ub.state();
  if (!s.user) return <button type="button" data-act="login" className="h-10 px-4 rounded-lg btn-navy font-bold text-[14px] inline-flex items-center gap-2"><Icon ub={ub} n="fingerprint" c="w-[18px] h-[18px]" />{t('login')}</button>;
  return (
    <div className="relative" data-userwrap="">
      <button type="button" data-act="user-menu" aria-expanded="false" className="h-10 pl-1 pr-2.5 rounded-lg border border-line hover:bg-soft inline-flex items-center gap-2 transition-colors">
        <span className="w-8 h-8 rounded-md bg-ubred text-white grid place-items-center text-[12.5px] font-extrabold">{s.me.ini}</span>
        <span className="hidden xl:inline text-[14px] font-semibold">{s.me.n}</span>
        <Icon ub={ub} n="chevron-down" c="w-4 h-4 opacity-60" />
      </button>
      <div className="absolute right-0 top-[calc(100%+8px)] w-56 card shadow-2xl p-1.5 text-ink hidden z-[61]" data-usermenu="">
        <button type="button" data-act="my" className="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg hover:bg-soft text-[14px] font-semibold"><Icon ub={ub} n="layout-dashboard" c="w-[18px] h-[18px]" />{t('myCorner')}</button>
        <button type="button" data-act="logout" className="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg hover:bg-soft text-[14px] font-semibold text-ubred"><Icon ub={ub} n="log-out" c="w-[18px] h-[18px]" />{t('logout')}</button>
      </div>
    </div>
  );
}
