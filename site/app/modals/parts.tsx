'use client';
/* Цонхнуудын нийтлэг хэсэг: толгой (src/core/modal.js modalHead()-тэй яг ижил тэмдэглэгээ). Хаах товчийг (data-act="modal-close") features/wiring.js барина. */
import type { ReactNode } from 'react';
import { Icon, type UB } from '../ub';

/** Цонхны толгой: дүрс, гарчиг, тайлбар, хаах товч. sub нь текст эсвэл JSX (modalHead-д HTML байсан) */
export function ModalHead({ ub, title, sub, icon, tone }: { ub: UB; title: string; sub?: ReactNode; icon?: string; tone?: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-start gap-3 px-5 sm:px-7 pt-5 pb-4 bg-card/95 backdrop-blur border-b border-line">
      {icon ? <span className={`w-11 h-11 rounded-2xl grid place-items-center ${tone || 'bg-soft text-ink'}`}><Icon ub={ub} n={icon} c="w-[22px] h-[22px]" /></span> : null}
      <div className="flex-1 min-w-0 pt-0.5"><h2 className="text-[20px] font-extrabold tracking-tight leading-tight">{title}</h2>{sub ? <p className="text-[13.5px] text-muted mt-0.5">{sub}</p> : null}</div>
      <button type="button" className="icon-btn hover:bg-soft -mr-2" data-act="modal-close" aria-label={ub.t('close')}><Icon ub={ub} n="x" /></button>
    </div>
  );
}
