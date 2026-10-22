'use client';
/* Босоо баннер: өргөн дэлгэцийн (≥1840px) баруун хоосон зайд, идэвхтэй баннер байх үед л (styles/07-effects.css #rail).
   8 секунд тутам сэлгэнэ (хулгана дээр нь байхад, хөдөлгөөн багасгасан эсвэл a11y горимд үгүй), цэгээр сонгоно,
   хаавал тухайн баннер 24 цаг харагдахгүй. Өгөгдөл: src/sections/rail.js railData(). Баннерын товчийг (data-act) features/wiring.js барина. */
import { useEffect, useRef, useState } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';

interface RailData { label: string; close: string; closeT: string; slides: { id: string; r1: string; r2: string; html: string }[] }

let shown = false;   // «орох» хөдөлгөөн (rail-intro) зөвхөн анх удаа

export function Rail() {
  const ub = useUB();
  return ub ? <RailIn ub={ub} /> : null;
}

function RailIn({ ub }: { ub: UB }) {
  const [i, setI] = useState(0), [closing, setClosing] = useState(false), [intro, setIntro] = useState(() => !shown), [, bump] = useState(0);
  const hover = useRef(false), frozen = useRef<RailData | null>(null);
  const live = ub.home.rail() as RailData, d = closing && frozen.current ? frozen.current : live;
  const n = d.slides.length, cur = i < n ? i : 0, s = ub.state(), auto = n > 1 && !s.reduced && !s.a11y;
  useEffect(() => { if (n) shown = true; }, [n]);
  useEffect(() => {
    if (!auto) return;
    const tm = setInterval(() => { if (!hover.current && !document.hidden) setI((k) => (k + 1) % n); }, 8000);
    return () => clearInterval(tm);
  }, [auto, n]);
  const close = () => {
    const id = d.slides[cur]?.id;
    if (id) ub.home.railHide(id);
    setIntro(false);
    if (s.reduced) { bump((x) => x + 1); return; }   // шинэ жагсаалтаар шууд дахин зурна
    frozen.current = d; setClosing(true);   // хөдөлгөөн дуустал хуучин жагсаалтаа харуулна
    setTimeout(() => { frozen.current = null; setClosing(false); }, 340);
  };
  if (!n) return <aside id="rail" hidden />;
  return (
    <aside id="rail" aria-label={d.label} onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; }}>
      <div className={`rail-card ${intro ? 'rail-intro' : ''} ${closing ? 'is-closing' : ''}`}>
        <button type="button" className="rail-x" data-rail="close" aria-label={d.close} title={d.closeT} onClick={close}><Icon ub={ub} n="x" c="w-4 h-4" /></button>
        <div className="rail-stack">
          {d.slides.map((b, k) => {
            const on = k === cur;
            return <article key={b.id || k} className={`rail-slide ${on ? 'is-on' : ''}`} style={cssVars({ '--r1': b.r1, '--r2': b.r2 })} data-id={b.id} aria-hidden={on ? undefined : true} inert={!on} dangerouslySetInnerHTML={{ __html: b.html }} />;
          })}
        </div>
        {n > 1 && (
          <div className="rail-dots">
            {d.slides.map((b, k) => <button key={b.id || k} type="button" className={`rail-dot ${k === cur ? 'is-on' : ''}`} data-rail={k} aria-label={`${k + 1} / ${n}`} onClick={() => setI(k)} />)}
          </div>
        )}
      </div>
    </aside>
  );
}
