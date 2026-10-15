'use client';
/* Admin-ы хүрээ: зүүн талын цэс (том дэлгэц), толгой (гарчиг, «Нэмэх», сайт руу), гар утсанд хэвтээ цэс. */
import { ReactNode } from 'react';
import { cms, useCms } from '../cms';
import { kit, L, Lang } from '../kit';
import { NAV, NAV_GROUPS, navLabel, SCHEMA, View } from '../schema';
import { Html, Icon } from '../ui';

interface Props { view: View; go: (v: View) => void; add: (col: string) => void; lang: Lang; setLang: (l: Lang) => void; children: ReactNode }

export function Shell({ view, go, add, lang, setLang, children }: Props) {
  const { data, inboxNew } = useCms();
  const count = (v: View) => (v === 'inbox' ? inboxNew || '' : SCHEMA[v] ? cms.merged(v).length : v === 'texts' ? Object.keys(data.texts || {}).length : '');
  const sc = SCHEMA[view];
  const primary = sc && !sc.single
    ? <button type="button" className="btn btn-sm btn-blue" onClick={() => add(view)}><Icon name="plus" className="w-4 h-4" />{L(['Нэмэх', 'Add'])} {L(sc.one)}</button>
    : view === 'dash' ? <button type="button" className="btn btn-sm btn-blue" onClick={() => add('news')}><Icon name="plus" className="w-4 h-4" />{L(['Мэдээ нэмэх', 'New story'])}</button> : null;

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[264px_minmax(0,1fr)] bg-page text-ink">
      <aside className="hidden lg:flex flex-col bg-navy text-white sticky top-0 h-[100dvh] p-4">
        <a href="/" className="flex items-center gap-3 px-2 py-2">
          <Html as="span" className="contents" html={kit().logoMark('w-10 h-10')} />
          <span className="text-left leading-tight"><b className="block text-[16px]">{kit().t('brand')}</b><span className="text-[12px] text-white/60">{L(['Удирдлагын систем', 'Content admin'])}</span></span>
        </a>
        <nav className="mt-4 space-y-0.5 overflow-y-auto thin-scroll min-h-0 flex-1 -mr-2 pr-2">
          {NAV.map(([v, icon, label, group], i) => (
            <div key={v}>
              {group && group !== (NAV[i - 1] || [])[3] && <p className="px-3 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">{L(NAV_GROUPS[group])}</p>}
              <button type="button" className="adm-nav" aria-current={view === v} onClick={() => go(v)}>
                <Icon name={icon} className="w-[18px] h-[18px]" /><span className="flex-1 text-left">{L(label)}</span>
                {count(v) !== '' && <span className="text-[12px] tnum opacity-60">{count(v)}</span>}
              </button>
            </div>
          ))}
        </nav>
        <div className="mt-3 rounded-xl bg-white/[.06] border border-white/10 p-3 text-[12.5px] text-white/70 leading-snug">{L(['Өөрчлөлт серверийн өгөгдлийн санд хадгалагдаж, сайтын бүх зочинд шууд харагдана.', 'Changes are saved to the server database and appear instantly for every visitor.'])}</div>
        <a href="/" className="mt-3 btn btn-sm bg-white/10 hover:bg-white/15 text-white w-full"><Icon name="arrow-left" className="w-4 h-4" />{L(['Сайт руу буцах', 'Back to site'])}</a>
        <button type="button" className="mt-2 btn btn-sm text-white/70 hover:text-white hover:bg-white/10 w-full" onClick={() => cms.logout()}><Icon name="log-out" className="w-4 h-4" />{L(['Гарах', 'Sign out'])}</button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-line">
          <div className="h-16 px-4 lg:px-8 flex items-center gap-3">
            <a href="/" className="lg:hidden icon-btn !rounded-lg border border-line" aria-label={L(['Сайт руу буцах', 'Back to site'])}><Icon name="arrow-left" /></a>
            <h1 className="text-[17px] sm:text-[19px] font-extrabold tracking-tight truncate min-w-0">{L(navLabel(view))}</h1>
            <span className="hidden sm:inline-flex ml-2 items-center gap-2 text-[12.5px] font-semibold text-greenink"><span className="live" style={{ ['--dot' as string]: 'rgb(var(--c-green))' }} />{L(['Сервертэй холбогдсон', 'Connected to server'])}</span>
            <div className="ml-auto flex items-center gap-2">
              {primary}
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setLang(lang === 'mn' ? 'en' : 'mn')} aria-label="Language">{lang === 'mn' ? 'EN' : 'МН'}</button>
              <a href="/" className="hidden sm:inline-flex btn btn-sm btn-ghost"><Icon name="external-link" className="w-4 h-4" />{L(['Сайтыг харах', 'View site'])}</a>
            </div>
          </div>
          <div className="lg:hidden flex gap-1.5 overflow-x-auto no-scrollbar px-4 pb-3">
            {NAV.map(([v, icon, label]) => <button key={v} type="button" className="chip !h-9 shrink-0" aria-pressed={view === v} onClick={() => go(v)}><Icon name={icon} className="w-4 h-4" />{L(label)}</button>)}
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1180px]">{children}</div>
      </div>
    </div>
  );
}
