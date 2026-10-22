'use client';
/* Засаг даргын мэдээ (Gov) ба яаралтай мэдээлэл (Alert) цонх. Нээх: src/features/season.js openGov(i), openAlert(id).
   Өгөгдөл: ub.home.govModal(i), ub.home.alertModal(id). Товчнууд (data-act="vote" | "notify" | "modal-close")-ыг features/wiring.js барина. */
import { Icon, type UB } from '../ub';
import { ModalHead } from './parts';

interface GovData { head: string; role: string; ago: string; title: string; lead: string; letter: string }

export function Gov({ ub, i }: { ub: UB; i: number }) {
  const g = ub.home.govModal(i) as GovData | null;
  if (!g) return null;
  return (
    <>
      <ModalHead ub={ub} title={g.head} sub={g.role} icon="landmark" tone="bg-navy text-white" />
      <article className="px-5 sm:px-7 py-6">
        <p className="text-[13px] text-muted">{g.ago}</p>
        <h3 className="mt-2 text-[22px] font-extrabold leading-snug">{g.title}</h3>
        <p className="mt-3 text-[16px] leading-relaxed text-ink/85">{g.lead}</p>
        <button type="button" className="btn btn-ghost mt-6" data-act="vote" data-tab="idea" data-gov="1"><Icon ub={ub} n="pen-line" c="w-[18px] h-[18px]" />{g.letter}</button>
      </article>
    </>
  );
}

interface AlertData { title: string; sub: string; i: string; notify: string; rows: [string, string, string][] }

export function Alert({ ub, id }: { ub: UB; id: string }) {
  const a = ub.home.alertModal(id) as AlertData | null;
  if (!a) return null;
  return (
    <>
      <ModalHead ub={ub} title={a.title} sub={a.sub} icon={a.i} tone="bg-ubyellow text-[#261E00]" />
      <div className="px-5 sm:px-7 py-6 space-y-4">
        {a.rows.map(([l, n, v]) => (
          <div key={n} className="flex gap-3">
            <span className="w-10 h-10 rounded-xl bg-soft grid place-items-center shrink-0"><Icon ub={ub} n={n} c="w-5 h-5 text-muted" /></span>
            <div><p className="text-[13px] text-muted">{l}</p><p className="text-[15px] font-semibold leading-snug">{v}</p></div>
          </div>
        ))}
        <button type="button" className="btn btn-ink w-full !mt-6" data-act="notify"><Icon ub={ub} n="bell-ring" c="w-[18px] h-[18px]" />{a.notify}</button>
      </div>
    </>
  );
}
