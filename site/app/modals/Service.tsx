'use client';
/* Үйлчилгээний цонх (Service) ба цаг захиалах цонх (Booking). Нээх: src/features/services.js openService(id), openBooking(o).
   Өгөгдөл: ub.home.svcModal(id), ub.home.booking(o). Товчнууд (data-act="svc-apply" | "svc-book" | "sys-open" | "modal-close")-ыг features/wiring.js барина;
   захиалгын өдөр, цагийн сонголтыг энэ цонх өөрөө (useState) барьж, баталгаажуулахад props.ok(өдөр, цаг) дуудна. */
import { useState } from 'react';
import { Icon, type UB } from '../ub';
import { ModeBadge } from '../home/parts';
import { ModalHead } from './parts';

interface SvcData {
  id: string; i: string; m: string; title: string; desc: string;
  time: [string, string]; fee: [string, string]; stepsT: string; steps: string[]; docsT: string; docs: string; btn: string;
}

export function Service({ ub, id }: { ub: UB; id: string }) {
  const s = ub.home.svcModal(id) as SvcData | null;
  if (!s) return null;
  return (
    <>
      <ModalHead ub={ub} title={s.title} sub={s.desc} icon={s.i} tone="bg-ubblue/10 text-ubblue" />
      <div className="px-5 sm:px-7 py-6">
        <div className="flex items-center gap-2"><ModeBadge ub={ub} m={s.m} /></div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[13.5px]">
          {[s.time, s.fee].map(([l, v]) => <div key={l} className="rounded-xl bg-soft p-3"><p className="text-muted">{l}</p><b>{v}</b></div>)}
        </div>
        <p className="mt-6 font-bold">{s.stepsT}</p>
        <ol className="mt-3 space-y-3">
          {s.steps.map((x, i) => <li key={i} className="flex gap-3"><span className="w-7 h-7 rounded-full bg-ink text-card grid place-items-center text-[13px] font-bold shrink-0">{i + 1}</span><span className="pt-0.5 text-[14.5px]">{x}</span></li>)}
        </ol>
        <p className="mt-6 font-bold">{s.docsT}</p><p className="mt-1.5 text-[14px] text-muted">{s.docs}</p>
        <div className="mt-7">
          {s.m === 'sys'
            ? <button type="button" className="btn btn-blue w-full" data-act="sys-open"><Icon ub={ub} n="external-link" c="w-[18px] h-[18px]" />{s.btn}</button>
            : s.m === 'on'
              ? <button type="button" className="btn btn-blue w-full" data-act="svc-apply" data-id={s.id}><Icon ub={ub} n="send" c="w-[18px] h-[18px]" />{s.btn}</button>
              : <button type="button" className="btn btn-ink w-full" data-act="svc-book" data-id={s.id}><Icon ub={ub} n="calendar-clock" c="w-[18px] h-[18px]" />{s.btn}</button>}
        </div>
      </div>
    </>
  );
}

interface BookData {
  title: string; sub: string; place: string; pick: string; confirm: string;
  slots: string[]; days: { wd: string; d: number }[]; taken: boolean[][];
}

export function Booking({ ub, o, ok }: { ub: UB; o: Record<string, unknown>; ok: (di: number, si: number) => void }) {
  const [di, setDi] = useState(0), [si, setSi] = useState<number | null>(null);
  const b = ub.home.booking(o) as BookData;
  return (
    <>
      <ModalHead ub={ub} title={b.title} sub={b.sub} icon="calendar-clock" tone="bg-ink text-card" />
      <div className="px-5 sm:px-7 py-6">
        <p className="text-[13.5px] text-muted flex items-center gap-2"><Icon ub={ub} n="map-pin" c="w-4 h-4" />{b.place}</p>
        <p className="mt-5 font-bold">{b.pick}</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {b.days.map((x, i) => (
            <button key={i} type="button" className={`rounded-xl border py-2 text-center transition-colors ${i === di ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}`} aria-pressed={i === di}
              onClick={() => { setDi(i); setSi(null); }}>
              <span className="block text-[12px] font-semibold opacity-70">{x.wd}</span><b className="block text-[17px] tnum">{x.d}</b>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {b.slots.map((s, j) => {
            const tk = b.taken[di][j];
            return (
              <button key={j} type="button" disabled={tk} aria-pressed={j === si} onClick={() => setSi(j)}
                className={`h-11 rounded-xl border text-[14px] font-semibold tnum transition-colors ${tk ? 'border-line text-muted/50 line-through cursor-not-allowed' : j === si ? 'bg-ubbluebg text-white border-transparent' : 'border-line hover:bg-soft'}`}>{s}</button>
            );
          })}
        </div>
        <button type="button" className="btn btn-blue w-full mt-6" disabled={si == null} onClick={() => { if (si != null) ok(di, si); }}>
          <Icon ub={ub} n="calendar-check" c="w-[18px] h-[18px]" />{b.confirm}
        </button>
      </div>
    </>
  );
}
