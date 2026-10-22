'use client';
/* Цонх (modal): бүрхүүл, гулсаж орох / гарах хөдөлгөөн, гадна дарж хаах, фокус. Нээх / хаахыг src/core/modal.js (openModal, closeModal) удирдана.
   Агуулга: m.view нэртэй React цонх (../modals/index.tsx MODALS). */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MODALS } from '../modals';
import { useUB, type UB } from '../ub';

export interface ModalState {
  id: number; cls: string; top: boolean; label: string;
  view: string; props: Record<string, unknown>;
  immediate?: boolean; sheet: HTMLElement | null;
}

export function ModalRoot() {
  const ub = useUB(), m = (ub?.modal() as ModalState | null) ?? null;
  const [closing, setClosing] = useState<ModalState | null>(null);
  const prev = useRef<ModalState | null>(null);
  useLayoutEffect(() => {
    const p = prev.current; prev.current = m;
    if (!p || p === m || p.immediate) return;
    setClosing(p);   // хаагдсан цонх 320мс бүдгэрч алга болно
    setTimeout(() => setClosing((c) => (c === p ? null : c)), 320);
  }, [m]);
  if (!ub) return null;
  return (
    <>
      {[closing && closing !== m ? closing : null, m].map((x) => x && <Sheet key={x.id} ub={ub} m={x} open={x === m} />)}
    </>
  );
}

function Sheet({ ub, m, open }: { ub: UB; m: ModalState; open: boolean }) {
  const ovl = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {   // дараагийн фрэймд .open → CSS шилжилт; дараа нь эхний товч / талбарт фокус
    const r = requestAnimationFrame(() => {
      setShown(true);
      const w = ovl.current, f = w && (w.querySelector<HTMLElement>('[data-autofocus]') || w.querySelector<HTMLElement>('button, input, textarea, [tabindex]'));
      if (f) try { f.focus({ preventScroll: true }); } catch { /* ignore */ }
    });
    return () => cancelAnimationFrame(r);
  }, []);
  const View = MODALS[m.view];
  const sheetRef = (el: HTMLDivElement | null) => { if (open && el) m.sheet = el; };
  return (
    <div ref={ovl} className={`ovl${m.top ? ' ovl-top' : ''}${open && shown ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label={m.label || undefined}
      onMouseDown={(e) => { if (open && e.target === e.currentTarget) ub.closeModal(); }}>
      <div className={`sheet ${m.cls}`} data-sheet="" ref={sheetRef}>{View && <View ub={ub} {...m.props} />}</div>
    </div>
  );
}
