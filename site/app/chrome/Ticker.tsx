'use client';
/* Яаралтай мэдээллийн капсул (#ticker дотор): мэдээлэл нэг нэгээр дээш гулсан солигдож, доод зураас (.tk-prog) дуусахад дараагийнх руу шилжинэ.
   Хулганаар заах / фокуслах / «түр зогсоох» үед зураас зогсоно (CSS). Хөдөлгөөн багасгах ба a11y горимд автоматаар солигдохгүй (d.auto).
   Өгөгдөл: src/core/ticker.js tickerData() (унтраасан бол null). Мэдээ дарах (data-act="alert"), хаах ("ticker-close")-ыг features/wiring.js барина.
   Идэвхтэй мэдээ, түр зогсоох төлвийг энд барина. Хөдөлгөөн: styles/06-header-dock.css .tk-item (is-on / is-out / is-out-down). */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Icon, useUB } from '../ub';

interface TickerData {
  auto: boolean; urgent: string; role: string; prev: string; next: string; pause: string; dismiss: string;
  items: { id: string; i: string; k: string; t: string }[];
}

export function Ticker() {
  const ub = useUB();
  /* i: идэвхтэй, out: гарч буй (-1 бол байхгүй), dir: 1 дээш / -1 доош, step: шилжилт бүрт нэмэгдэнэ (зураасыг дахин эхлүүлнэ) */
  const [st, setSt] = useState({ i: 0, out: -1, dir: 1, step: 0 });
  const [paused, setPaused] = useState(false);
  const its = useRef<(HTMLButtonElement | null)[]>([]), nRef = useRef(0), timers = useRef<number[]>([]);
  const siren = useMemo(() => (ub ? { __html: ub.animIcon('siren', 'w-[18px] h-[18px] relative') } : null), [ub]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  /* Орж буй мэдээг гарах чиглэлийн эсрэг талаас эхлүүлнэ; 650мс-ийн дараа гарсан мэдээг шилжилтгүйгээр анхны байрлалд нь буцаана */
  useLayoutEffect(() => {
    if (!st.step) return;
    const nx = its.current[st.i];
    if (nx) {
      nx.style.transition = 'none'; nx.style.transform = `translateY(${st.dir > 0 ? 100 : -100}%)`; void nx.offsetWidth;
      nx.style.transition = ''; nx.style.transform = '';
    }
    const step = st.step, cur = its.current[st.out];
    timers.current.push(window.setTimeout(() => {
      if (cur && !cur.classList.contains('is-on')) { cur.style.transition = 'none'; cur.classList.remove('is-out', 'is-out-down'); void cur.offsetWidth; cur.style.transition = ''; }
      setSt((s) => (s.step === step ? { ...s, out: -1 } : s));
    }, 650));
  }, [st.step]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = (d: number) => {
    const n = nRef.current; if (n < 2) return;
    setSt((s) => { const i = s.i < n ? s.i : 0; return { i: (i + d + n) % n, out: i, dir: d, step: s.step + 1 }; });
  };
  if (!ub) return null;
  const d = ub.home.ticker() as TickerData | null;
  if (!d) return null;
  const n = nRef.current = d.items.length, i = st.i < n ? st.i : 0;
  return (
    <div className="max-w-site mx-auto px-3 sm:px-6 lg:px-8 pt-2.5">
      <div className={`tk ${paused ? 'is-paused' : ''}`} role="region" aria-roledescription={d.role} aria-label={d.urgent}>
        <div className="tk-tag"><span className="tk-stripes" aria-hidden="true" /><span className="contents" dangerouslySetInnerHTML={siren!} /><span className="relative hidden sm:inline">{d.urgent}</span></div>
        <div className="tk-stage" aria-live="off">
          {d.items.map((a, k) => {
            const on = k === i, cls = on ? 'is-on' : k === st.out ? (st.dir > 0 ? 'is-out' : 'is-out-down') : '';
            return (
              <button key={a.id} ref={(el) => { its.current[k] = el; }} type="button" data-act="alert" data-id={a.id} className={`tk-item ${cls}`} tabIndex={on ? undefined : -1} aria-hidden={on ? undefined : true}>
                <span className="tk-ic"><Icon ub={ub} n={a.i} c="w-4 h-4" /></span><b className="shrink-0">{a.k}</b><span className="tk-txt">{a.t}</span>
                <span className="tk-more"><Icon ub={ub} n="arrow-up-right" c="w-3.5 h-3.5" /></span>
              </button>
            );
          })}
        </div>
        <div className="tk-ctl">
          {n > 1 && (
            <>
              <button type="button" className="tk-b hidden sm:grid" data-tk="prev" aria-label={d.prev} title={d.prev} onClick={() => go(-1)}><Icon ub={ub} n="chevron-left" c="w-4 h-4" /></button>
              <span className="tk-count" data-tk-count="">{i + 1}<i>/</i>{n}</span>
              <button type="button" className="tk-b grid" data-tk="next" aria-label={d.next} title={d.next} onClick={() => go(1)}><Icon ub={ub} n="chevron-right" c="w-4 h-4" /></button>
              {d.auto && (
                <button type="button" className="tk-b hidden sm:grid" data-tk="pause" aria-pressed={paused} aria-label={d.pause} title={d.pause} onClick={() => setPaused((x) => !x)}>
                  <Icon ub={ub} n={paused ? 'play' : 'pause'} c="w-3.5 h-3.5" />
                </button>
              )}
              <span className="tk-sep" aria-hidden="true" />
            </>
          )}
          <button type="button" data-act="ticker-close" className="tk-b grid" aria-label={d.dismiss} title={d.dismiss}><Icon ub={ub} n="x" c="w-4 h-4" /></button>
        </div>
        {d.auto && <span className="tk-prog" aria-hidden="true"><i key={st.step} onAnimationEnd={() => go(1)} /></span>}
      </div>
    </div>
  );
}
