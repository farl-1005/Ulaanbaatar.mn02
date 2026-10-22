'use client';
/* Дээш буцах товч: доош гүйлгэхэд AI туслахын товчны дээр гарч ирнэ. Тойрог нь хуудсыг хэр уншсаныг харуулна;
   дарахад сум «хөөрч», хуудас зөөлөн дээш гулсана (хэрэглэгч хулгана/хуруугаар оролцвол шууд зогсоно).
   Shell-д #chat-ийн ДАРАА (ах дүү) байх ёстой: CSS `#chat:has(.chat-open) ~ .totop` (src/styles/09-widgets.css). */
import { useEffect, useRef, type MouseEvent } from 'react';
import { useUB } from '../ub';

const Arrow = ({ c }: { c: string }) => (
  <svg className={`ta ${c}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
);

export function ToTop() {
  const ub = useUB();
  const btn = useRef<HTMLButtonElement>(null), pct = useRef<HTMLElement>(null);
  const run = useRef<AbortController | null>(null);
  const ready = !!ub;

  /* Гүйлгэх бүрт (нэг фрэймд нэг удаа): харагдах эсэх, тойргийн явц, хувь */
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    const upd = () => {
      raf = 0; const el = btn.current; if (!el) return;
      const h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      const on = scrollY > innerHeight * 0.9;
      if (el.classList.contains('is-on') !== on) { el.classList.toggle('is-on', on); el.tabIndex = on ? 0 : -1; el.setAttribute('aria-hidden', String(!on)); }
      el.style.setProperty('--off', (100 - p * 100).toFixed(2));
      if (pct.current) pct.current.textContent = Math.round(p * 100) + '%';
    };
    const q = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    addEventListener('scroll', q, { passive: true }); addEventListener('resize', q, { passive: true });
    return () => { removeEventListener('scroll', q); removeEventListener('resize', q); cancelAnimationFrame(raf); if (run.current) run.current.abort(); };
  }, [ready]);

  if (!ub) return null;
  const { L } = ub;

  const go = (ev: MouseEvent) => {
    const el = btn.current!, kb = ev.detail === 0, s = ub.state();
    if (run.current) run.current.abort();
    const done = () => { if (kb) document.getElementById('main')?.focus({ preventScroll: true }); setTimeout(() => el.classList.remove('is-launch'), 700); };
    el.classList.remove('is-launch'); void el.offsetWidth; el.classList.add('is-launch');
    if (s.reduced || s.a11y) { window.scrollTo(0, 0); done(); return; }
    // Өөрийн easing-тэй гүйлгэлт: зай их бол арай удаан (0.5–1.1 сек), эхлэл ба төгсгөл зөөлөн
    const ac = new AbortController(); run.current = ac;
    ['wheel', 'touchstart', 'keydown'].forEach((n) => addEventListener(n, () => ac.abort(), { passive: true, signal: ac.signal }));
    const y0 = scrollY, dur = Math.min(1100, 500 + y0 * 0.08), t0 = performance.now();
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const step = (now: number) => {
      if (ac.signal.aborted) { el.classList.remove('is-launch'); return; }
      const k = Math.min(1, (now - t0) / dur); window.scrollTo(0, Math.round(y0 * (1 - ease(k))));
      if (k < 1) requestAnimationFrame(step); else { ac.abort(); run.current = null; done(); }
    };
    setTimeout(() => requestAnimationFrame(step), 120);   // сум эхлээд бага зэрэг суугаад хөөрнө
  };

  /* is-on, is-launch, tabIndex, aria-hidden-ийг шууд DOM-оор өөрчилнө (гүйлгэх бүрт React дахин зурахгүй); эдгээр prop тогтмол тул React дарж бичихгүй */
  return (
    <button type="button" id="totop" className="totop" ref={btn} tabIndex={-1} aria-hidden="true"
      aria-label={L(['Хуудасны эхэнд очих', 'Back to top'])} onClick={go}>
      <svg className="totop-ring" viewBox="0 0 56 56" aria-hidden="true">
        <defs><linearGradient id="ttg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF5A6E" /><stop offset="1" stopColor="#FFB547" /></linearGradient></defs>
        <rect className="totop-track" x="1.3" y="1.3" width="53.4" height="53.4" rx="7" />
        <path className="totop-bar" d="M28 1.3H47.7A7 7 0 0 1 54.7 8.3V47.7A7 7 0 0 1 47.7 54.7H8.3A7 7 0 0 1 1.3 47.7V8.3A7 7 0 0 1 8.3 1.3Z" pathLength={100} />
      </svg>
      <span className="totop-arrows"><Arrow c="ta-1" /><Arrow c="ta-2" /></span>
      <span className="totop-tip" aria-hidden="true"><b>{L(['Дээш буцах', 'Back to top'])}</b><em className="tnum" data-ttpct="" ref={pct}>0%</em></span>
    </button>
  );
}
