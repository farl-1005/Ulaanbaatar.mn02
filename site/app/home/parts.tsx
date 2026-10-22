'use client';
/* Нүүрний хэсгүүдэд нийтлэг: гарчиг, хүрээ, таб, шүүлтүүр (chip), агуулга солигдох хөдөлгөөн.
   Төлөв (S.hub, S.newsCat ...) src/ кодод байна: таб, chip дарахад features/wiring.js төлөвийг сольж renderReact() дуудна. */
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Icon, type UB } from '../ub';

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.2,.8,.2,1)';

/** Нүүрний хэсгийн гарчиг + «Бүгдийг үзэх» товч (act: data-act гэх мэт) */
export function HomeHead({ ub, title, desc, act, label }: { ub: UB; title: string; desc?: string; act: Record<string, string>; label?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
      <div className="min-w-0"><h2 className="h-section">{title}</h2>{desc && <p className="mt-2 text-muted max-w-[62ch]">{desc}</p>}</div>
      <button type="button" className="btn btn-ghost self-start sm:self-auto shrink-0" {...act}>{label || ub.L(['Бүгдийг үзэх', 'See all'])}<Icon ub={ub} n="arrow-right" c="w-[18px] h-[18px]" /></button>
    </div>
  );
}

/** Нүүрний хэсгийн хүрээ (card: цагаан дэвсгэртэй, дээд доод зураастай) */
export function HomeWrap({ card, children }: { card?: boolean; children: ReactNode }) {
  const inner = <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">{children}</div>;
  return card ? <div className="bg-card border-y border-line">{inner}</div> : inner;
}

export type TabItem = [value: string, label: string, icon?: string];

/** Таб (seg: капсул, line: доогуур зураас). Тодруулга (pill) идэвхтэй таб руу гулсана (src/core/motion.js placePill). */
export function Tabs({ ub, name, items, active, line, lg, cls, label }: { ub: UB; name: string; items: TabItem[]; active: string; line?: boolean; lg?: boolean; cls?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null), placed = useRef(false);
  const sig = items.map((i) => i[1]).join('|');
  useLayoutEffect(() => { ub.placePill(ref.current!, placed.current); placed.current = true; }, [ub, active, sig]);
  return (
    <div ref={ref} className={`${line ? 'uline' : 'seg'} ${lg ? 'seg-lg' : ''} ${cls || ''}`} role="tablist" data-tablist={name} aria-label={label || ''}>
      <span className={line ? 'uline-bar' : 'seg-pill'} data-pill="" />
      {items.map(([v, l, icn]) => (
        <button key={v} type="button" className={line ? 'uline-btn' : 'seg-btn'} role="tab" data-act="tab" data-tabs={name} data-v={v} aria-selected={v === active} tabIndex={v === active ? 0 : -1}>
          {icn && <Icon ub={ub} n={icn} c="w-[18px] h-[18px]" />}<span>{l}</span>
        </button>
      ))}
    </div>
  );
}

/** Үйлчилгээний хэлбэр: онлайн / биечлэн / цахим систем (src/sections/hub.js modeBadge()-тэй ижил тэмдэглэгээ) */
export function ModeBadge({ ub, m }: { ub: UB; m: string }) {
  if (m === 'sys') return <span className="badge b-blue"><Icon ub={ub} n="external-link" c="w-3.5 h-3.5" />{ub.t('system')}</span>;
  return m === 'on'
    ? <span className="badge b-on"><Icon ub={ub} n="wifi" c="w-3.5 h-3.5" />{ub.t('online')}</span>
    : <span className="badge b-off"><Icon ub={ub} n="footprints" c="w-3.5 h-3.5" />{ub.t('inperson')}</span>;
}

export type ChipItem = [value: string, label: string, dot?: string];

/** Шүүлтүүрийн товчнууд (data-act=act, data-v=утга) */
export function Chips({ act, items, active, dark }: { act: string; items: ChipItem[]; active: string; dark?: boolean }) {
  return (
    <>
      {items.map(([v, l, dot]) => (
        <button key={v} type="button" className={`chip ${dark ? 'chip-dark' : ''}`} data-act={act} data-v={v} aria-pressed={v === active}>
          {dot && <i className="w-2 h-2 rounded-full" style={{ background: dot }} />}{l}
        </button>
      ))}
    </>
  );
}

/** Агуулга солигдоход (k өөрчлөгдөхөд) өндөр нь зөөлөн өөрчлөгдөж, шинэ агуулга dir чиглэлээс гулсаж орно (src/core/motion.js swap-тай ижил) */
export function Swap({ k, dir = 0, id, className, children }: { k: string; dir?: number; id?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null), prev = useRef({ k, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current!, p = prev.current;
    if (p.k !== k && !reduced() && el.animate && p.h) {
      const dx = dir ? dir * 18 : 0, dy = dir ? 0 : 8, h1 = el.offsetHeight;
      el.style.overflow = 'hidden';
      const a = el.animate([{ height: p.h + 'px' }, { height: h1 + 'px' }], { duration: 340, easing: EASE });
      el.animate([{ opacity: 0, transform: `translate(${dx * 1.4}px, ${dy}px)` }, { opacity: 1, transform: 'none' }], { duration: 340, easing: EASE });
      a.finished.then(() => { el.style.overflow = ''; }, () => {});
    }
    prev.current = { k, h: el.offsetHeight };
  });
  return <div ref={ref} id={id} className={className}>{children}</div>;
}

/** src/ кодын HTML мөр (карт, зураг ...). tag-ийн шууд хүүхэд болно (жишээ нь .scene > svg). */
export function Raw({ html, tag: Tag = 'div', className, ...rest }: { html: string; tag?: 'div' | 'span' | 'li' | 'ul' | 'ol'; className?: string } & Record<string, unknown>) {
  return <Tag className={className} {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
