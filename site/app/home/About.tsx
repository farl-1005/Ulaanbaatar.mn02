'use client';
/* «Хотын тухай»: товч баримт, удирдлагын бүтэц, засаг захиргааны нэрийн түүх, харьяа байгууллагууд (ангиллаар шүүнэ).
   Өгөгдөл: src/sections/about.js aboutData(). Цэснээс data-card="leadership" | "adminhist" руу гүйлгэж тодруулна (src/core/pages.js). */
import { useState } from 'react';
import { Icon, cssVars, useUB, type AboutData, type UB } from '../ub';

export function About() {
  const ub = useUB();
  if (!ub) return null;
  const { t } = ub, d = ub.home.about();
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
      <div className="border-t border-line pt-10 lg:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <h2 className="h-section">{t('aboutTitle')}</h2>
          <p className="mt-3 text-muted leading-relaxed max-w-[52ch]">{t('aboutDesc')}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {d.facts.map(([l, v]) => <div key={l} className="card p-4"><p className="text-[13px] text-muted">{l}</p><p className="mt-1 text-[20px] font-extrabold tnum leading-tight">{v}</p></div>)}
          </div>
        </div>
        <div className="lg:col-span-7 rounded-[8px]" data-card="leadership">
          <h3 className="text-[19px] font-extrabold">{t('leadership')}</h3>
          <ol className="mt-5">
            {d.struct.map((s, i) => {
              const last = i === d.struct.length - 1;
              return (
                <li key={i} className={`relative flex gap-4 ${last ? '' : 'pb-6'}`}>
                  {!last && <span className="absolute left-[21px] top-12 bottom-1 w-px bg-line" />}
                  <span className={`relative w-11 h-11 rounded-2xl ${i === 2 ? 'bg-ubred text-white' : 'bg-card border border-line text-ubred'} grid place-items-center shrink-0`}><Icon ub={ub} n={s.i} /></span>
                  <div className="pt-1"><b className="block text-[15.5px] leading-snug">{s.title}</b><span className="block text-[13.5px] text-muted mt-0.5">{s.desc}</span></div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className="mt-12 rounded-[8px]" data-card="adminhist">
        <h3 className="text-[19px] font-extrabold">{t('adminHist')}</h3>
        <p className="mt-1 text-[13px] text-muted">{t('adminHistD')}</p>
        <ol className="mt-6 flex overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {d.names.map((x, i) => {
            const last = i === d.names.length - 1;
            return (
              <li key={i} className="snap-start shrink-0 w-[172px] sm:w-[188px] relative pr-5">
                {!last && <span className="absolute left-2 right-0 top-[7px] h-px bg-line" />}
                <span className={`relative block w-3.5 h-3.5 rounded-full ${last ? 'bg-ubred' : 'bg-card border-2 border-ubred'}`} />
                <b className="block mt-3 text-[21px] font-extrabold tnum tracking-tight">{x.y}</b>
                <span className={`block mt-1 text-[13.5px] leading-snug ${last ? 'text-ink font-semibold' : 'text-muted'}`}>{x.name}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <Orgs ub={ub} d={d} />
    </div>
  );
}

/** Харьяа байгууллагууд: ангиллаар шүүнэ; «Бүгд» үед эхний 12-ыг харуулж «Бүгдийг үзэх»-ээр дэлгэнэ */
function Orgs({ ub, d }: { ub: UB; d: AboutData }) {
  const { t, L } = ub;
  const [cat, setCat] = useState('all'), [all, setAll] = useState(false);
  const list = cat === 'all' ? d.orgs : d.orgs.filter((o) => o.cat === cat), cut = cat === 'all' && !all && list.length > 12;
  const chips: [string, string][] = [['all', `${t('f_all')} · ${d.orgs.length}`], ...d.cats.map((c): [string, string] => [c.id, `${c.title} · ${c.n}`])];
  return (
    <div className="mt-12 rounded-[8px]" data-card="orgs">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-[19px] font-extrabold">{t('orgs')}</h3>
        {d.cats.length > 0 && <a href="https://ulaanbaatar.mn/government" target="_blank" rel="noopener" className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1">{L(['Эх сурвалж: ulaanbaatar.mn', 'Source: ulaanbaatar.mn'])}<Icon ub={ub} n="arrow-up-right" c="w-3.5 h-3.5" /></a>}
      </div>
      {d.cats.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 lg:mx-0 lg:px-0" id="org-chips">
          {chips.map(([v, label]) => <button key={v} type="button" className="chip" aria-pressed={v === cat} onClick={() => { setCat(v); setAll(false); }}>{label}</button>)}
        </div>
      )}
      <div id="org-grid" className="mt-5">
        <ul key={cat} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {(cut ? list.slice(0, 12) : list).map((o, k) => <li key={o.id} className="org-li" style={cssVars({ '--i': k % 12 })} dangerouslySetInnerHTML={{ __html: o.html }} />)}
        </ul>
        {cut && <div className="mt-4 text-center"><button type="button" className="btn btn-ghost" onClick={() => setAll(true)}>{L(['Бүгдийг үзэх', 'Show all'])} ({list.length})<Icon ub={ub} n="chevron-down" c="w-[18px] h-[18px]" /></button></div>}
      </div>
    </div>
  );
}
