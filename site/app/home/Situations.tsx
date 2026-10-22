'use client';
/* «Амьдралын нөхцөл»: нүүрэнд товч сүлжээ (дарахад /services хуудсанд тухайн нөхцөл нээгдэнэ),
   /services хуудсанд нөхцлийн жагсаалт + алхмын самбар (явцын зураас, алхам тэмдэглэх, бүгд дуусахад confetti).
   Өгөгдөл: src/sections/life-events.js sitsData(). Товчнуудыг (data-act="sit" | "sit-toggle" | "sit-apply" | "sit-reset") features/wiring.js барина. */
import { useEffect, useState } from 'react';
import { Icon, cssVars, useUB, type UB } from '../ub';
import { HomeHead, HomeWrap, ModeBadge, Swap } from './parts';

interface SitItem { id: string; i: string; title: string; done: number; n: number; sub: string }
interface SitStep { title: string; desc: string; time: string; m: string; done: boolean }
interface SitsData { sit: string; dir: number; pop: number | null; list: SitItem[]; steps: SitStep[] }

export function Situations() {
  const ub = useUB();
  if (!ub) return null;
  const { t } = ub, d = ub.home.sits() as SitsData, s = ub.state();
  if (s.route !== 'page') {
    return (
      <HomeWrap card>
        <HomeHead ub={ub} title={t('sitTitle')} desc={t('sitDesc')} act={{ 'data-act': 'go', 'data-sec': 'situations' }} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {d.list.map((x) => (
            <button key={x.id} type="button" className="lift card p-4 text-left flex flex-col gap-3 h-full" data-act="go" data-sec="situations" data-sit={x.id}>
              <span className="w-11 h-11 rounded-xl bg-ubred/10 text-ubred grid place-items-center"><Icon ub={ub} n={x.i} c="w-[22px] h-[22px]" /></span>
              <b className="text-[15px] leading-snug">{x.title}</b>
              <span className="mt-auto text-[12.5px] text-muted">{x.sub}</span>
            </button>
          ))}
        </div>
      </HomeWrap>
    );
  }
  return (
    <div className="bg-card border-y border-line"><div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"><div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      <div className="lg:col-span-4 min-w-0">
        <h2 className="h-section">{t('sitTitle')}</h2>
        <p className="mt-3 text-muted leading-relaxed">{t('sitDesc')}</p>
        <div className="mt-6 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1" id="sit-list">
          {d.list.map((x) => {
            const on = x.id === d.sit;
            return (
              <button key={x.id} type="button" className={`shrink-0 w-[244px] lg:w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition-colors ${on ? 'border-ink/70 bg-soft' : 'border-line hover:bg-soft'}`} data-act="sit" data-v={x.id} aria-pressed={on}>
                <span className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 transition-colors ${on ? 'bg-ubred text-white' : 'bg-ubred/10 text-ubred'}`}><Icon ub={ub} n={x.i} c="w-[22px] h-[22px]" /></span>
                <span className="flex-1 min-w-0">
                  <b className="block text-[15px] truncate">{x.title}</b>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><span className="block h-full rounded-full bg-ubgreen transition-[width] duration-500" style={{ width: `${(x.done / x.n) * 100}%` }} /></span>
                    <span className="text-[12px] text-muted tnum">{x.done}/{x.n}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <Swap id="sit-panel" className="lg:col-span-8 min-w-0" k={d.sit} dir={d.dir}><Panel key={d.sit} ub={ub} d={d} /></Swap>
    </div></div></div>
  );
}

/** Сонгосон нөхцлийн алхмууд. #sit-card-д toggleStep() бүгд дуусахад confetti нэмнэ. */
function Panel({ ub, d }: { ub: UB; d: SitsData }) {
  const { t } = ub, s = d.list.find((x) => x.id === d.sit);
  if (!s) return null;
  const n = d.steps.length, done = d.steps.filter((x) => x.done).length, nextI = d.steps.findIndex((x) => !x.done);
  const cols = cssVars({ gridTemplateColumns: `repeat(${n},minmax(0,1fr))` });
  return (
    <div className="panel p-5 sm:p-7 relative overflow-hidden" id="sit-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-2xl bg-ubred/10 text-ubred grid place-items-center"><Icon ub={ub} n={s.i} c="w-7 h-7" /></span>
          <div><h3 className="text-[23px] font-extrabold tracking-tight leading-tight">{s.title}</h3><p className="text-[14px] text-muted mt-0.5">{s.sub}</p></div>
        </div>
        {done > 0 && <button type="button" className="btn btn-sm btn-ghost" data-act="sit-reset"><Icon ub={ub} n="rotate-ccw" c="w-4 h-4" />{t('restart')}</button>}
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-[13.5px] font-semibold"><span>{t('progress')}</span><span className="tnum text-muted">{t('doneOf', { d: done, n })}</span></div>
        <div className="mt-2.5 grid gap-1.5" style={cols}>
          {d.steps.map((x, i) => <div key={i} className="h-2.5 rounded-full bg-line overflow-hidden"><Seg i={i} on={x.done} /></div>)}
        </div>
        <div className="mt-2 hidden sm:grid gap-1.5 text-[12px] text-muted" style={cols}>
          {d.steps.map((x, i) => <span key={i} className={`truncate ${i === nextI ? 'text-ubblue font-semibold' : ''}`}>{i + 1}. {x.title}</span>)}
        </div>
      </div>
      {done === n && (
        <div className="mt-6 rounded-2xl bg-ubgreen/10 border border-ubgreen/30 p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-ubgreen text-white grid place-items-center shrink-0"><Icon ub={ub} n="party-popper" /></span>
          <div><b className="block">{t('allDone')}</b><span className="text-[13.5px] text-muted">{t('allDoneD')}</span></div>
        </div>
      )}
      <ol className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {d.steps.map((x, i) => <Step key={i} ub={ub} x={x} i={i} next={i === nextI} pop={d.pop === i && x.done} />)}
      </ol>
    </div>
  );
}

/** Явцын зураасны нэг хэсэг: өмнөх өргөнөөсөө шинэ өргөн рүү гулсана (.seg-fill transition) */
function Seg({ i, on }: { i: number; on: boolean }) {
  const [w, setW] = useState(on);
  useEffect(() => {
    if (w === on) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setW(on)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [on, w]);
  return <div className="seg-fill h-full rounded-full bg-ubgreen" data-seg={i} style={{ width: w ? '100%' : '0%' }} />;
}

function Step({ ub, x, i, next, pop }: { ub: UB; x: SitStep; i: number; next: boolean; pop: boolean }) {
  const { t } = ub, done = x.done;
  return (
    <li className={`card p-5 ${next ? 'ring-2 ring-ubblue/45 border-transparent' : ''} ${done ? 'bg-soft' : ''}`}><div className="flex items-start gap-4">
      <button type="button" className={`w-10 h-10 rounded-full grid place-items-center border-2 font-extrabold shrink-0 transition-colors ${done ? 'bg-ubgreen border-ubgreen text-white' : next ? 'border-ubblue text-ubblue' : 'border-line text-muted'} ${pop ? 'check-pop' : ''}`} data-act="sit-toggle" data-i={i} data-stepcheck={i} aria-label={done ? t('undo') : t('markDone')}>
        {done ? <Icon ub={ub} n="check" sw={2.6} /> : i + 1}
      </button>
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-[16px] leading-snug ${done ? 'text-muted' : ''}`}>{x.title}</h4>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <ModeBadge ub={ub} m={x.m} />
          <span className="badge b-mute"><Icon ub={ub} n="clock-3" c="w-3.5 h-3.5" />{x.time}</span>
          {next && <span className="badge b-blue">{t('nextStep')}</span>}
          {done && <span className="badge b-on"><Icon ub={ub} n="check" c="w-3.5 h-3.5" sw={2.6} />{t('doneLbl')}</span>}
        </div>
        <p className="mt-2.5 text-[14px] text-muted leading-relaxed">{x.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {done
            ? <button type="button" className="btn btn-sm btn-ghost" data-act="sit-toggle" data-i={i}><Icon ub={ub} n="undo-2" c="w-4 h-4" />{t('undo')}</button>
            : <>
              <button type="button" className={`btn btn-sm ${x.m === 'on' ? 'btn-blue' : 'btn-ink'}`} data-act="sit-apply" data-i={i}><Icon ub={ub} n={x.m === 'on' ? 'send' : 'calendar-clock'} c="w-4 h-4" />{x.m === 'on' ? t('applyOnline') : t('book')}</button>
              <button type="button" className="btn btn-sm btn-ghost" data-act="sit-toggle" data-i={i}>{t('markDone')}</button>
            </>}
        </div>
      </div>
    </div></li>
  );
}
