'use client';
/* Мэдээ унших хуудас (#view-news). Өгөгдөл: src/features/news-reader.js newsPageData() (HOME.newsPage).
   app.js ачаалагдахаас өмнө (useUB() === null) эсвэл мэдээний хуудас нээгдээгүй үед сервер бэлдсэн текстийг (children — JS-гүй робот уншина) хэвээр харуулна:
   сервер ба анхны client зураг ижил тул hydration зөрөхгүй. Товчнуудыг (news, news-back, nfb, print, copy-link, go, vote, report ...) features/wiring.js барина.
   Уншилтын явц (#nprog, #nbody): features/season.js newsProgress(). */
import type { ReactNode } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';
import { Raw } from '../home/parts';

interface Side { id: string; title: string; ago: string; views: string; scene: string }
interface NewsPage {
  id: string; cat: string; title: string; lead: string; rub: string; rubColor: string; br: boolean; zar: string;
  when: string; mins: string; views: string; img: string; photo: boolean; enOnlyMn: boolean; sumEn: boolean;
  intro: string; paras: string[];
  action: { icon: string; label: string; attrs: Record<string, string> } | null;
  src: { live: boolean; href: string } | null;
  fb: boolean;
  share: { fb: string; x: string };
  older: { id: string; title: string } | null; newer: { id: string; title: string } | null;
  top: Side[]; latest: Side[]; rel: string[];
}

export function NewsView({ children }: { children?: ReactNode }) {
  const ub = useUB();
  const d = ub && ub.state().route === 'news' ? (ub.home.newsPage() as NewsPage | null) : null;
  return ub && d ? <NewsIn key={d.id} ub={ub} d={d} /> : <>{children}</>;   // key: өөр мэдээ нээхэд «view-in» хөдөлгөөн дахин
}

function NewsIn({ ub, d }: { ub: UB; d: NewsPage }) {
  const { t, L } = ub;
  const go = { 'data-act': 'go', 'data-sec': 'hub', 'data-hub': 'news' };
  return (
    <>
      <div className="fixed inset-x-0 top-0 h-[3px] z-[70] pointer-events-none" aria-hidden="true"><div id="nprog" className="h-full bg-ubred origin-left" style={{ transform: 'scaleX(0)' }} /></div>
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 view-in">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] text-muted" aria-label={L(['Байршил', 'Breadcrumb'])}>
          <button type="button" className="font-semibold hover:text-ink inline-flex items-center gap-1.5 mr-2" data-act="news-back"><Icon ub={ub} n="arrow-left" c="w-4 h-4" />{L(['Буцах', 'Back'])}</button>
          <span className="w-px h-4 bg-line mr-2" aria-hidden="true" />
          <button type="button" className="hover:text-ink" data-act="home">{t('home')}</button><Icon ub={ub} n="chevron-right" c="w-3.5 h-3.5 opacity-60" />
          <button type="button" className="hover:text-ink" {...go}>{L(['Мэдээ', 'News'])}</button><Icon ub={ub} n="chevron-right" c="w-3.5 h-3.5 opacity-60" />
          <button type="button" className="hover:text-ink font-semibold" style={{ color: d.rubColor }} {...go} data-cat={d.cat}>{d.rub}</button>
        </nav>

        <header className="news-head mt-6 lg:mt-8" style={cssVars({ '--rc': d.rubColor })}><div className="news-head-in">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge" style={{ background: d.rubColor + '1A', color: d.rubColor }}><i className="w-2 h-2 rounded-full" style={{ background: d.rubColor }} />{d.rub}</span>
            {d.br && <span className="badge b-red"><Icon ub={ub} n="zap" c="w-3.5 h-3.5" />{L(['Шуурхай', 'Breaking'])}</span>}
            {d.zar && <span className="badge b-off"><Icon ub={ub} n="megaphone" c="w-3.5 h-3.5" />{d.zar}</span>}
          </div>
          <h1 className="mt-4 max-w-[920px] text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance">{d.title}</h1>
          <p className="mt-4 sm:mt-5 max-w-[820px] text-[17px] sm:text-[19px] leading-relaxed text-ink/70 text-pretty">{d.lead}</p>
          <div className="mt-6 pt-5 border-t border-line flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-full bg-ubred text-white grid place-items-center shrink-0"><Icon ub={ub} n="landmark" c="w-5 h-5" /></span>
              <div className="leading-tight"><b className="block text-[14.5px]">{L(['Нийслэлийн Засаг даргын Тамгын газар', "Capital City Governor's Office"])}</b>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1"><Icon ub={ub} n="calendar" c="w-3.5 h-3.5" />{d.when}</span>
                  <span className="inline-flex items-center gap-1"><Icon ub={ub} n="clock-3" c="w-3.5 h-3.5" />{d.mins} {L(['мин унших', 'min read'])}</span>
                  <span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="eye" c="w-3.5 h-3.5" />{d.views} {t('views')}</span>
                </span></div>
            </div>
            <Share ub={ub} d={d} />
          </div></div>
          {d.img && <figure className="news-head-fig"><Raw className="scene aspect-[16/9] lg:aspect-[21/9]" html={d.img} /><figcaption className="news-cap"><Icon ub={ub} n="camera" c="w-3.5 h-3.5" />{d.photo ? L(['Зураг: ulaanbaatar.mn', 'Photo: ulaanbaatar.mn']) : L(['Зураг: чимэглэл', 'Image: illustration'])}</figcaption></figure>}
        </header>

        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-10 xl:gap-12">
          <article id="nbody" className="min-w-0 w-full max-w-[760px] mx-auto lg:max-w-none lg:mx-0">
            {d.enOnlyMn && <p className="mb-6 rounded-xl bg-soft px-4 py-3 text-[14px] text-muted flex gap-2.5"><Icon ub={ub} n="languages" c="w-5 h-5 shrink-0" /><span>The full article is published in Mongolian only.{d.sumEn ? ' Below is an English summary.' : ''} <button type="button" className="font-semibold text-ink underline underline-offset-2" data-act="lang" data-v="mn">Read in Mongolian</button></span></p>}
            <div className="news-paper">
              {d.intro && <p className="news-intro">{d.intro}</p>}
              {(d.intro || d.paras.length > 0) && <div className="news-text">{d.paras.map((p, i) => <p key={i}>{p}</p>)}</div>}
              {d.action && <button type="button" className="btn btn-ghost mt-6" {...d.action.attrs}><Icon ub={ub} n={d.action.icon} c="w-[18px] h-[18px]" />{d.action.label}</button>}
              {d.src && (
                <div className="mt-8 rounded-[8px] border border-line p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="flex gap-3 text-[14px] text-muted leading-relaxed"><Icon ub={ub} n="info" c="w-5 h-5 shrink-0" /><span>{d.src.live ? L(['Эх сурвалж: Нийслэлийн Засаг даргын Тамгын газар, ulaanbaatar.mn', "Source: Capital City Governor's Office, ulaanbaatar.mn"]) : t('srcNote')}</span></p>
                  <a className="btn btn-sm btn-ghost shrink-0" href={d.src.href} target="_blank" rel="noopener"><Icon ub={ub} n="external-link" c="w-4 h-4" />{t('srcLink')}</a>
                </div>
              )}
              <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-center gap-2"><span className="text-[13px] text-muted mr-1">{L(['Шошго:', 'Tags:'])}</span>
                <button type="button" className="chip" {...go} data-cat={d.cat}>#{d.rub}</button><span className="chip">#{L(['Улаанбаатар', 'Ulaanbaatar'])}</span><span className="chip">#{L(['Нийслэл', 'Capital'])}</span></div>
            </div>
            <Feedback ub={ub} done={d.fb} />
            <div className="mt-6 flex items-center justify-between gap-3 lg:hidden"><span className="text-[14px] font-semibold">{L(['Хуваалцах', 'Share'])}</span><Share ub={ub} d={d} /></div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3"><Nav ub={ub} x={d.older} dir={-1} /><Nav ub={ub} x={d.newer} dir={1} /></div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-[88px] self-start">
            <div className="card p-5"><h2 className="font-extrabold text-[16px] flex items-center gap-2"><Icon ub={ub} n="flame" c="w-[18px] h-[18px] text-ubred" />{L(['Их уншсан', 'Most read'])}</h2><ol className="mt-1 divide-y divide-line">{d.top.map((x, i) => <SideItem key={x.id} ub={ub} x={x} i={i} />)}</ol></div>
            {d.latest.length > 0 && <div className="card p-5"><h2 className="font-extrabold text-[16px] flex items-center gap-2"><Icon ub={ub} n="newspaper" c="w-[18px] h-[18px] text-ubblue" />{L(['Сүүлийн мэдээ', 'Latest'])}</h2><ul className="mt-1 divide-y divide-line">{d.latest.map((x) => <SideItem key={x.id} ub={ub} x={x} />)}</ul></div>}
            <div className="rounded-[8px] bg-navy text-white p-5"><span className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center"><Icon ub={ub} n="message-square-warning" c="w-5 h-5" /></span><b className="block mt-3 text-[16px]">{L(['Асуудал анзаарсан уу?', 'Spotted a problem?'])}</b><p className="mt-1 text-[13.5px] text-white/70 leading-relaxed">{L(['Хотод тулгамдсан асуудлыг шууд мэдээлж, явцыг нь хянаарай.', 'Report a city issue and track it to resolution.'])}</p><button type="button" className="btn btn-red btn-sm mt-4" data-act="report"><Icon ub={ub} n="plus" c="w-4 h-4" />{L(['Мэдээлэх', 'Report'])}</button></div>
          </aside>
        </div>

        {d.rel.length > 0 && (
          <section className="mt-16 pt-10 border-t border-line">
            <div className="flex items-end justify-between gap-4"><h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.02em]">{t('related')}</h2><button type="button" className="btn btn-sm btn-ghost" {...go}>{L(['Бүх мэдээ', 'All news'])}<Icon ub={ub} n="arrow-right" c="w-4 h-4" /></button></div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" dangerouslySetInnerHTML={{ __html: d.rel.join('') }} />
          </section>
        )}
      </div>
    </>
  );
}

/** Хуваалцах: холбоос хуулах, Facebook, X, хэвлэх */
function Share({ ub, d }: { ub: UB; d: NewsPage }) {
  const cls = 'icon-btn border border-line hover:bg-soft';
  const print = ub.L(['Хэвлэх', 'Print']), share = ub.t('share');
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={cls} aria-label={share} title={share} data-act="copy-link" data-id={d.id}><Icon ub={ub} n="link" c="w-[18px] h-[18px]" /></button>
      <a className={cls} aria-label="Facebook" title="Facebook" href={d.share.fb} target="_blank" rel="noopener"><span className="text-[15px] font-extrabold leading-none">f</span></a>
      <a className={cls} aria-label="X" title="X" href={d.share.x} target="_blank" rel="noopener"><span className="text-[14px] font-extrabold leading-none">𝕏</span></a>
      <button type="button" className={cls} aria-label={print} title={print} data-act="print"><Icon ub={ub} n="printer" c="w-[18px] h-[18px]" /></button>
    </div>
  );
}

/** «Мэдээлэл хэрэгтэй байсан уу?» (data-act="nfb" → S.newsFb = true, renderReact()) */
function Feedback({ ub, done }: { ub: UB; done: boolean }) {
  const { t, L } = ub;
  return (
    <div id="nfb" className="mt-10 rounded-[8px] bg-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><b className="block text-[16px]">{t('helpful')}</b><span className="text-[13.5px] text-muted">{L(['Таны санал мэдээллийг сайжруулахад тусална.', 'Your answer helps us improve.'])}</span></div>
      <span className="flex flex-wrap gap-2">
        {done
          ? <span className="text-[14px] text-greenink font-semibold inline-flex items-center gap-1.5 h-9"><Icon ub={ub} n="circle-check" c="w-4 h-4" />{t('thanks')}</span>
          : <>
              <button type="button" className="btn btn-sm btn-ghost bg-card" data-act="nfb"><Icon ub={ub} n="thumbs-up" c="w-4 h-4" />{t('yes')}</button>
              <button type="button" className="btn btn-sm btn-ghost bg-card" data-act="nfb"><Icon ub={ub} n="thumbs-down" c="w-4 h-4" />{t('no')}</button>
            </>}
      </span>
    </div>
  );
}

/** Өмнөх (dir -1) / дараагийн (dir 1) мэдээ */
function Nav({ ub, x, dir }: { ub: UB; x: { id: string; title: string } | null; dir: number }) {
  if (!x) return <span className="hidden sm:block" />;
  return (
    <button type="button" className={`group card lift p-4 sm:p-5 text-left flex flex-col gap-2 ${dir > 0 ? 'sm:items-end sm:text-right' : ''}`} data-act="news" data-id={x.id}>
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
        {dir < 0 && <Icon ub={ub} n="arrow-left" c="w-4 h-4" />}{dir < 0 ? ub.L(['Өмнөх мэдээ', 'Previous']) : ub.L(['Дараагийн мэдээ', 'Next'])}{dir > 0 && <Icon ub={ub} n="arrow-right" c="w-4 h-4" />}
      </span>
      <span className="text-[15px] font-bold leading-snug line-clamp-2 group-hover:text-ubred transition-colors">{x.title}</span>
    </button>
  );
}

/** Хажуугийн жагсаалтын мөр: i байвал дугаартай (Их уншсан), үгүй бол зурагтай (Сүүлийн мэдээ) */
function SideItem({ ub, x, i }: { ub: UB; x: Side; i?: number }) {
  return (
    <li>
      <button type="button" className="group w-full flex items-start gap-3 py-3 text-left" data-act="news" data-id={x.id}>
        {i != null ? <span className="w-7 text-[22px] font-extrabold leading-none text-ubred/80 tnum shrink-0">{i + 1}</span> : x.scene ? <Raw tag="span" className="scene w-[72px] h-14 rounded-lg shrink-0" html={x.scene} /> : null}
        <span className="min-w-0">
          <span className="block text-[14.5px] font-semibold leading-snug line-clamp-3 group-hover:text-ubred transition-colors">{x.title}</span>
          <span className="mt-1 flex items-center gap-3 text-[12px] text-muted">{x.ago}<span className="inline-flex items-center gap-1 tnum"><Icon ub={ub} n="eye" c="w-3.5 h-3.5" />{x.views}</span></span>
        </span>
      </button>
    </li>
  );
}
