'use client';
/* Admin-ы жижиг бүрэлдэхүүнүүд. Загвар нь сайтын CSS-ийн классууд (btn, card, chip, field, seg, ovl, sheet, toast). */
import { createContext, ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { kit, L } from './kit';

/** Сайтын Lucide икон (kit.ic): <Icon name="plus" className="w-4 h-4" /> */
export function Icon({ name, className = 'w-5 h-5', stroke }: { name: string; className?: string; stroke?: number }) {
  return <i className="adm-ic" aria-hidden="true" dangerouslySetInnerHTML={{ __html: kit().ic(name, className, stroke) }} />;
}

/** Сайтын функцын буцаасан HTML (урьдчилан харах карт, чимэглэл) */
export function Html({ html, className, as: Tag = 'div' }: { html: string; className?: string; as?: 'div' | 'span' }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="text-center text-muted">
      <span className="typing"><span /><span /><span /></span>
      {label && <p className="mt-3">{label}</p>}
    </div>
  );
}

/** Сайтын «seg» таб: идэвхтэй товчны доор гулсах дэвсгэр */
export function Seg<T extends string>({ items, value, onChange, label }: { items: [T, string][]; value: T; onChange: (v: T) => void; label?: string }) {
  const list = useRef<HTMLDivElement>(null), pill = useRef<HTMLSpanElement>(null), [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const btn = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (btn && pill.current) { pill.current.style.width = btn.offsetWidth + 'px'; pill.current.style.transform = `translateX(${btn.offsetLeft}px)`; }
    if (!ready) requestAnimationFrame(() => setReady(true));
  }, [value, ready]);
  return (
    <div ref={list} className={`seg${ready ? ' ready' : ''}`} role="tablist" aria-label={label}>
      <span ref={pill} className="seg-pill" />
      {items.map(([v, l]) => (
        <button key={v} type="button" className="seg-btn" role="tab" aria-selected={v === value} tabIndex={v === value ? 0 : -1} onClick={() => onChange(v)}>
          <span>{l}</span>
        </button>
      ))}
    </div>
  );
}

/** Сайтын цонх (ovl + sheet). Esc, гадна дарахад хаагдана. */
export function Modal({ children, onClose, size = 'sm:max-w-4xl', label }: { children: ReactNode; onClose: () => void; size?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    document.body.style.overflow = 'hidden';
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', key); };
  }, [onClose]);
  return (
    <div className={`ovl${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label={label} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`sheet ${size}`}>{children}</div>
    </div>
  );
}

export function ModalHead({ title, icon, onClose }: { title: string; icon: string; onClose: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-start gap-3 px-5 sm:px-7 pt-5 pb-4 bg-card/95 backdrop-blur border-b border-line">
      <span className="w-11 h-11 rounded-2xl grid place-items-center bg-ubblue/10 text-ubblue"><Icon name={icon} className="w-[22px] h-[22px]" /></span>
      <div className="flex-1 min-w-0 pt-0.5"><h2 className="text-[20px] font-extrabold tracking-tight leading-tight">{title}</h2></div>
      <button type="button" className="icon-btn hover:bg-soft -mr-2" onClick={onClose} aria-label={L(['Хаах', 'Close'])}><Icon name="x" /></button>
    </div>
  );
}

/* ---- Мэдэгдэл (toast) ---- */
type ToastFn = (msg: string, icon?: string) => void;
const ToastCtx = createContext<ToastFn>(() => {});
export const useToast = () => useContext(ToastCtx);

export function Toaster({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; icon: string; out?: boolean }[]>([]);
  const push = useCallback<ToastFn>((msg, icon = 'circle-check') => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg, icon }]);
    setTimeout(() => setItems((x) => x.map((t) => (t.id === id ? { ...t, out: true } : t))), 2700);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 2960);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed left-0 right-0 z-[95] flex flex-col items-center gap-2 pointer-events-none px-4" style={{ bottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}>
        {items.map((t) => (
          <div key={t.id} className={`toast${t.out ? ' out' : ''}`} role="status"><Icon name={t.icon} className="w-5 h-5 text-ubgreen" /><span>{t.msg}</span></div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** Устгах г.м. аюултай үйлдэл: эхний дарахад «Дахин дарж баталгаажуулна», 3.5 секундын дотор дахин дарвал хийнэ */
export function useArmed() {
  const [armed, setArmed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** true бол үйлдлийг хийнэ */
  const confirm = useCallback((key: string) => {
    clearTimeout(timer.current);
    if (armed === key) { setArmed(null); return true; }
    setArmed(key);
    timer.current = setTimeout(() => setArmed(null), 3500);
    return false;
  }, [armed]);
  return { armed, confirm };
}
