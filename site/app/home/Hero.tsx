'use client';
/* Нүүрний эхний хэсэг: шуурхай мэдээ | гол мэдээ ба холбоотой мэдээ | Засаг даргын мэдээ, «Эрсдэл мэдээлэх», «Санал өгөх» | түгээмэл үйлчилгээ.
   Өгөгдөл: src/sections/hero.js heroData(). Товчнуудын үйлдлийг (data-act) features/wiring.js барина. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, LogoMark, cssVars, esc, useUB, type HeroData, type UB } from '../ub';

export function Hero() {
  const ub = useUB();
  return ub ? <HeroIn ub={ub} /> : null;
}

function HeroIn({ ub }: { ub: UB }) {
  const [intro, setIntro] = useState(() => ub.state().intro);   // анх ачаалахад нэг удаа «орох» хөдөлгөөн (styles: .intro .hero-fade)
  useEffect(() => { if (!intro) return; const tm = setTimeout(() => setIntro(false), 2300); return () => clearTimeout(tm); }, [intro]);
  const d = ub.home.hero();
  if (!d) return null;
  const { t } = ub, m = d.main;
  /* .scene > svg (styles/02-components.css): зураг scene-ийн шууд хүүхэд байх ёстой тул шошгыг HTML-ээр нийлүүлнэ */
  const badge = `<span class="absolute left-4 top-4 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white/90 text-[#0B1D45] text-[13px] font-bold"><i class="w-2 h-2 rounded-full" style="background:${esc(m.rubColor)}"></i>${esc(m.rub)}</span>`;
  return (
    <div className={`max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-9 pb-12 lg:pb-16 ${intro ? 'intro' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-7 gap-y-10">
        <article className="md:col-span-2 lg:col-span-6 lg:order-2 min-w-0">
          <button type="button" className="block w-full text-left zoom-on" data-act="news" data-id={m.id} aria-label={m.title}>
            <div className="scene zoom hero-img aspect-[16/9] rounded-[8px]" dangerouslySetInnerHTML={{ __html: m.scene + badge }} />
          </button>
          <div className="hero-fade" style={cssVars({ '--d': '.5s' })}>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5"><Icon ub={ub} n="clock-3" c="w-4 h-4" />{m.ago}</span>
              <span className="inline-flex items-center gap-1.5"><Icon ub={ub} n="book-open" c="w-4 h-4" />{m.minRead}</span>
              <span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="eye" c="w-4 h-4" />{m.views}</span>
            </div>
            <h1 className="mt-3 text-[27px] sm:text-[34px] xl:text-[40px] leading-[1.08] font-extrabold tracking-[-0.028em]"><button type="button" className="text-left hover:text-ubred transition-colors" data-act="news" data-id={m.id}>{m.title}</button></h1>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted max-w-[62ch]">{m.lead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-ink" data-act="news" data-id={m.id}><Icon ub={ub} n="book-open" c="w-[18px] h-[18px]" />{t('read')}</button>
              <button type="button" className="btn btn-ghost" data-act="vote" data-tab="idea"><Icon ub={ub} n="message-square-plus" c="w-[18px] h-[18px]" />{t('cta_vote')}</button>
            </div>
          </div>
          <div className="hero-fade mt-8 pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-4" style={cssVars({ '--d': '.7s' })}>
            {d.rel.map((r) => (
              <button key={r.id} type="button" className="group lift card text-left overflow-hidden flex sm:flex-col zoom-on" data-act="news" data-id={r.id}>
                <div className="scene zoom w-28 sm:w-full shrink-0 aspect-[4/3] sm:aspect-[16/10]" dangerouslySetInnerHTML={{ __html: r.scene }} />
                <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i className="w-2 h-2 rounded-full" style={{ background: r.rubColor }} />{r.rub}</span>
                  <span className="mt-1.5 text-[14.5px] font-bold leading-snug line-clamp-3 group-hover:text-ubred transition-colors">{r.title}</span>
                  <span className="mt-auto pt-3 flex items-center gap-3 text-[12px] text-muted">{r.ago}<span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="eye" c="w-3.5 h-3.5" />{r.views}</span></span>
                </div>
              </button>
            ))}
          </div>
        </article>
        <Breaking ub={ub} d={d} />
        <aside className="lg:col-span-3 lg:order-3 min-w-0 hero-fade" style={cssVars({ '--d': '.4s' })}><Gov ub={ub} d={d} /></aside>
      </div>
      <Quick ub={ub} d={d} />
    </div>
  );
}

/** Шуурхай мэдээ: шинэ мэдээ (features/live-data.js pushBreaking) дээрээс нэмэгдэхэд жагсаалт эхэндээ гүйлгэгдэнэ */
function Breaking({ ub, d }: { ub: UB; d: HeroData }) {
  const { t } = ub, list = useRef<HTMLOListElement>(null), top = d.breaking[0]?.id;
  const fire = useMemo(() => ({ __html: ub.fireIcon() }), [ub]);   // дүрс бүрт шинэ id үүсгэдэг тул нэг удаа
  const first = useRef(top);
  useEffect(() => { if (top !== first.current && list.current) list.current.scrollTop = 0; first.current = top; }, [top]);
  return (
    <aside className="lg:col-span-3 lg:order-1 min-w-0 hero-fade" style={cssVars({ '--d': '.25s' })} aria-label={t('breaking')}>
      <div className="brk-head mb-2 px-1">
        <h2 className="text-[19px] font-extrabold tracking-tight flex items-center gap-2.5"><span className="contents" dangerouslySetInnerHTML={fire} />{t('breaking')}</h2>
        <p className="text-[12.5px] text-muted mt-0.5 pl-[32px]">{t('liveUpd')}</p>
      </div>
      <ol id="brk-list" ref={list} className="space-y-0.5 max-h-[660px] overflow-auto thin-scroll fade-b pb-8 relative">
        {d.breaking.map((b) => (
          <li key={b.id} className={`brk-item ${b.isNew ? 'brk-new' : ''}`}>
            <span className={`brk-time tnum ${b.hot ? 'text-ubred' : 'text-muted'}`}>{b.time}</span>
            <span className={`brk-dot ${b.hot ? 'live' : ''}`} style={cssVars({ '--dot': b.dot, background: b.dot })} />
            <button type="button" className="brk group" data-act="news" data-id={b.id}>
              <span className="flex items-center gap-2 text-[12px] font-semibold text-muted"><span className="truncate">{b.rub}</span>{b.fresh && <span className="badge bg-ubred text-white !h-[18px] !px-1.5 !text-[10.5px]">{t('isNew')}</span>}</span>
              <span className="block mt-0.5 text-[15px] font-semibold leading-snug group-hover:text-ubred transition-colors">{b.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="mt-1 px-1 text-[14px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="hub" data-hub="news">{t('allNews')}<Icon ub={ub} n="chevron-right" c="w-4 h-4" /></button>
    </aside>
  );
}

/** Засаг даргын мэдээ ба хоёр том товч (эрсдэл мэдээлэх, санал өгөх) */
function Gov({ ub, d }: { ub: UB; d: HeroData }) {
  const { t, L } = ub;
  const anim = useMemo(() => ({ siren: { __html: ub.animIcon('siren', 'w-[26px] h-[26px]') }, vote: { __html: ub.animIcon('vote', 'w-[26px] h-[26px]') } }), [ub]);
  const cta = (act: 'report' | 'vote', cls: string, icon: 'siren' | 'vote', title: string, desc: string, meta: string) => (
    <button type="button" className={`cta-card ${cls} group`} data-act={act}>
      <span className="flex items-start justify-between w-full"><span className="cta-ic" dangerouslySetInnerHTML={anim[icon]} /><span className="cta-arrow"><Icon ub={ub} n="arrow-up-right" c="w-[18px] h-[18px]" /></span></span>
      <span className="block mt-4"><b className="block text-[18px] leading-tight tracking-[-0.01em]">{title}</b><span className="block mt-1.5 text-[13.5px] text-white/80 leading-snug">{desc}</span></span>
      <span className="cta-meta"><Icon ub={ub} n={act === 'report' ? 'clock-3' : 'sparkles'} c="w-3.5 h-3.5" />{meta}</span>
      <span className="cta-bg" aria-hidden="true"><svg className="w-full h-full shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ub.icon(icon) }} /></span>
    </button>
  );
  return (
    <>
      <div className="card overflow-hidden">
        <div className="bg-navy text-white p-5 relative overflow-hidden">
          <svg viewBox="0 0 40 40" className="absolute -right-10 -top-10 w-44 h-44 text-white/[.07]" aria-hidden="true"><circle cx="20" cy="20" r="9.6" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M20 2v8M20 30v8M2 20h8M30 20h8M7 7l6 6M27 27l6 6M7 33l6-6M27 13l6-6" stroke="currentColor" strokeWidth="1.2" /></svg>
          <div className="relative flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-white/10 grid place-items-center"><LogoMark ub={ub} c="w-8 h-8" /></span>
            <div className="min-w-0"><h2 className="font-extrabold text-[17px] leading-tight">{t('govNews')}</h2><p className="text-[12.5px] text-white/65 leading-snug mt-0.5">{t('govRole')}</p></div>
          </div>
        </div>
        <ul className="divide-y divide-line">
          {d.gov.map((g) => (
            <li key={g.id}><button type="button" className="w-full text-left px-5 py-4 hover:bg-soft transition-colors" data-act="news" data-id={g.id}><span className="block text-[12.5px] text-muted">{g.ago}</span><span className="block mt-1 text-[14.5px] font-semibold leading-snug">{g.title}</span></button></li>
          ))}
        </ul>
        <button type="button" className="w-full flex items-center justify-between px-5 py-4 border-t border-line text-[14px] font-bold text-ubblue hover:bg-soft transition-colors" data-act="vote" data-tab="idea" data-gov="1">{t('govLetter')}<Icon ub={ub} n="pen-line" c="w-[18px] h-[18px]" /></button>
      </div>
      <div className="grid gap-3 mt-4">
        {cta('report', 'cta-red', 'siren', t('cta_report'), t('reportDesc'), L(['24/7 · ~1 минут', '24/7 · ~1 min']))}
        {cta('vote', 'cta-blue', 'vote', t('cta_vote'), t('voteDesc'), L(['Таны санал хотыг өөрчилнө', 'Your voice shapes the city']))}
      </div>
    </>
  );
}

/** Түгээмэл үйлчилгээ (admin: Тохиргоо → quick) */
function Quick({ ub, d }: { ub: UB; d: HeroData }) {
  const { t } = ub;
  return (
    <div className="quick-rail hero-fade mt-12 lg:mt-14" style={cssVars({ '--d': '.85s' })}>
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="text-[20px] font-extrabold tracking-tight">{t('popularSvc')}</h2>
        <button type="button" className="text-[14px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="hub" data-hub="services">{t('allServices')}<Icon ub={ub} n="chevron-right" c="w-4 h-4" /></button>
      </div>
      <div className="panel !rounded-[8px] overflow-hidden"><div className="grid grid-flow-col auto-cols-[minmax(152px,1fr)] overflow-x-auto no-scrollbar snap-x">
        {d.quick.map((s) => (
          <button key={s.id} type="button" className="group snap-start relative flex flex-col items-start gap-3 p-4 sm:p-5 min-h-[150px] text-left border-r border-line last:border-r-0 hover:bg-soft transition-colors" data-act="svc" data-id={s.id}>
            <span className="w-11 h-11 rounded-[8px] grid place-items-center bg-ubred/10 text-ubred transition-all duration-300 group-hover:bg-ubred group-hover:text-white group-hover:-rotate-6"><Icon ub={ub} n={s.i} c="w-[22px] h-[22px]" /></span>
            <span className="font-bold text-[14.5px] leading-snug pr-3">{s.title}</span>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[12.5px] text-muted"><i className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.mode}</span>
            <Icon ub={ub} n="arrow-up-right" c="w-4 h-4 absolute right-3.5 top-4 text-muted opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
          </button>
        ))}
      </div></div>
    </div>
  );
}
