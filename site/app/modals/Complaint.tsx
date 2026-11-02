'use client';
/* «Өргөдөл, гомдол»: гаргах | явц шалгах таб, илгээсний дараа дугаар ба нууц түлхүүр. Төлөв, илгээх, шалгах нь lib/ub/features/complaint.js openComplaint()-д.
   Товч, талбарууд props.on-оор (React onClick) тийш очно; хаах (modal-close)-ыг features/wiring.js барина. */
import type { MouseEvent } from 'react';
import { Icon, type UB } from '../ub';
import { Swap, Tabs, type TabItem } from '../home/parts';
import { ModalHead } from './parts';

interface TrackRes {
  id: string; i: string; title: string; topic: string; status: string; stLabel: string;
  steps: { l: string; at: string; done: boolean; cur: boolean }[];
  updated: string; replyLbl: string; reply: string; replyAt: string; noReply: string;
}
interface ComplaintData {
  title: string; sub: string; tab: 'new' | 'track'; dir: number; fill: number; tabs: TabItem[];
  form?: {
    typeLbl: string; type: string; types: { k: string; i: string; l: string; d: string }[];
    topicLbl: string; topic: string; topics: { k: string; i: string; l: string }[];
    textLbl: string; text: string; textPh: string;
    contactLbl: string; hint: string; name: string; phone: string; email: string; namePh: string; phonePh: string; emailPh: string;
    photoLbl: string; photo: string | null; photoDel: string;
    err: string; errField: string; busy: boolean; send: string;
  };
  sent?: { title: string; desc: string; idLbl: string; id: string; keyLbl: string; key: string; save: string; copy: string; copyAll: string; track: string; close: string };
  track?: {
    desc: string; idLbl: string; keyLbl: string; id: string; key: string; check: string; busy: boolean; err: string;
    mineLbl: string; mine: { id: string; label: string; on: boolean }[]; res: TrackRes | null;
  };
}
export interface ComplaintOn {
  tab(v: string): void; type(k: string): void; topic(k: string): void; input(name: string, v: string): void;
  photo(f: File | null): void; photoDel(): void; submit(): void; track(): void; pick(id: string): void; copy(text: string): void; goTrack(): void;
}

export function Complaint({ ub, data, on }: { ub: UB; data: () => ComplaintData; on: ComplaintOn }) {
  const d = data();
  /* Таб (data-act="tab" data-tabs="complaint")-ыг энд барина: wiring.js-ийн onTab үүнийг мэдэхгүй тул юу ч хийхгүй */
  const onTabs = (e: MouseEvent) => { const b = (e.target as HTMLElement).closest<HTMLElement>('[data-tabs="complaint"]'); if (b && b.dataset.v) on.tab(b.dataset.v); };
  return (
    <>
      <ModalHead ub={ub} title={d.title} sub={d.sub} icon="file-pen-line" tone="bg-[#087A4E] text-white" />
      <div className="px-5 sm:px-7 py-6">
        <div onClick={onTabs}><Tabs ub={ub} name="complaint" items={d.tabs} active={d.tab} cls="w-full [&>button]:flex-1 [&>button]:justify-center" /></div>
        <Swap k={d.tab + (d.sent ? '-sent' : '')} dir={d.dir} id="c-body" className="mt-6">
          {d.sent ? <Sent ub={ub} s={d.sent} on={on} /> : d.form ? <Form ub={ub} f={d.form} on={on} /> : d.track ? <Track ub={ub} x={d.track} fill={d.fill} on={on} /> : null}
        </Swap>
      </div>
    </>
  );
}

const lbl = 'block text-[13.5px] font-semibold mb-2';

function Form({ ub, f, on }: { ub: UB; f: NonNullable<ComplaintData['form']>; on: ComplaintOn }) {
  const bad = (k: string) => (f.errField === k ? { 'aria-invalid': true as const, 'aria-describedby': 'c-err' } : {});
  return (
    <>
      <p className={lbl}>{f.typeLbl}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={f.typeLbl}>
        {f.types.map((x) => (
          <button key={x.k} type="button" role="radio" aria-checked={f.type === x.k} onClick={() => on.type(x.k)}
            className={`flex sm:flex-col items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-colors ${f.type === x.k ? 'border-ubblue bg-ubblue/5' : 'border-line hover:border-ink/25'}`}>
            <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${f.type === x.k ? 'bg-ubblue text-white' : 'bg-soft text-ubblue'}`}><Icon ub={ub} n={x.i} c="w-[18px] h-[18px]" /></span>
            <span className="min-w-0"><b className="block text-[14.5px] leading-tight">{x.l}</b><span className="block mt-1 text-[12.5px] text-muted leading-snug">{x.d}</span></span>
          </button>
        ))}
      </div>

      <p className={`${lbl} mt-5`}>{f.topicLbl}</p>
      <div className="flex flex-wrap gap-2">
        {f.topics.map((x) => <button key={x.k} type="button" className="chip" aria-pressed={f.topic === x.k} onClick={() => on.topic(x.k)}><Icon ub={ub} n={x.i} c="w-4 h-4" />{x.l}</button>)}
      </div>

      <label className={`${lbl} mt-5`} htmlFor="c-text">{f.textLbl}</label>
      {/* хяналтгүй талбарууд: утгыг on.input-ээр lib/ub/ руу дамжуулна (товч дарах бүрт бүх сайтыг дахин зурахгүй) */}
      <textarea id="c-text" rows={6} maxLength={4000} className="field" placeholder={f.textPh} defaultValue={f.text} onInput={(e) => on.input('text', e.currentTarget.value)} {...bad('text')} />

      <p className={`${lbl} mt-5`}>{f.contactLbl}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input id="c-name" className="field sm:col-span-2" placeholder={f.namePh} aria-label={f.namePh} autoComplete="name" maxLength={100} defaultValue={f.name} onInput={(e) => on.input('name', e.currentTarget.value)} />
        <input id="c-phone" className="field tnum" type="tel" inputMode="tel" placeholder={f.phonePh} aria-label={f.phonePh} autoComplete="tel" maxLength={30} defaultValue={f.phone} onInput={(e) => on.input('phone', e.currentTarget.value)} {...bad('phone')} />
        <input id="c-email" className="field" type="email" placeholder={f.emailPh} aria-label={f.emailPh} autoComplete="email" maxLength={200} defaultValue={f.email} onInput={(e) => on.input('email', e.currentTarget.value)} {...bad('email')} />
      </div>
      <p className="mt-2 text-[12.5px] text-muted flex gap-2"><Icon ub={ub} n="shield-check" c="w-4 h-4 mt-px" /><span>{f.hint}</span></p>

      {f.photo ? (
        <div className="mt-5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- хөтөч дээрх data: URL */}
          <img src={f.photo} alt="" className="w-20 h-16 rounded-xl object-cover border border-line" />
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => on.photoDel()}><Icon ub={ub} n="trash-2" c="w-4 h-4" />{f.photoDel}</button>
        </div>
      ) : (
        <label className="mt-5 flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-line hover:border-ink/25 cursor-pointer text-[14px] font-semibold text-muted">
          <span className="w-9 h-9 rounded-lg bg-soft grid place-items-center"><Icon ub={ub} n="image-plus" c="w-[18px] h-[18px]" /></span>{f.photoLbl}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { on.photo(e.currentTarget.files ? e.currentTarget.files[0] : null); e.currentTarget.value = ''; }} />
        </label>
      )}

      <p className="mt-3 text-[13px] text-ubred min-h-[18px]" id="c-err" role="alert">{f.err}</p>
      <button type="button" className="btn btn-blue w-full mt-1" disabled={f.busy} onClick={() => on.submit()}>
        {f.busy ? <span className="typing"><span /><span /><span /></span> : <Icon ub={ub} n="send" c="w-[18px] h-[18px]" />}{f.send}
      </button>
    </>
  );
}

function Sent({ ub, s, on }: { ub: UB; s: NonNullable<ComplaintData['sent']>; on: ComplaintOn }) {
  const row = (label: string, v: string) => (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="min-w-0"><span className="block text-[12.5px] text-muted">{label}</span><b className="block text-[19px] tnum tracking-wide break-all select-all">{v}</b></span>
      <button type="button" className="btn btn-sm btn-ghost shrink-0" onClick={() => on.copy(v)} aria-label={`${s.copy}: ${label}`}><Icon ub={ub} n="copy" c="w-4 h-4" />{s.copy}</button>
    </div>
  );
  return (
    <div>
      <div className="text-center">
        <span className="w-14 h-14 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop"><Icon ub={ub} n="check" c="w-7 h-7" sw={2.6} /></span>
        <p className="mt-3 font-extrabold text-[19px]">{s.title}</p>
        <p className="mt-1 text-[14px] text-muted">{s.desc}</p>
      </div>
      <div className="mt-5 rounded-xl border border-line divide-y divide-line">{row(s.idLbl, s.id)}{row(s.keyLbl, s.key)}</div>
      <p className="mt-3 rounded-xl bg-ubyellow/15 p-3 text-[13.5px] font-semibold leading-snug flex gap-2" role="note"><Icon ub={ub} n="key-round" c="w-4 h-4 mt-0.5" /><span>{s.save}</span></p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => on.copy(`${s.idLbl}: ${s.id}\n${s.keyLbl}: ${s.key}`)}><Icon ub={ub} n="clipboard-check" c="w-[18px] h-[18px]" />{s.copyAll}</button>
        <button type="button" className="btn btn-blue" onClick={() => on.goTrack()}><Icon ub={ub} n="search-check" c="w-[18px] h-[18px]" />{s.track}</button>
      </div>
    </div>
  );
}

const ST_CLS: Record<string, string> = { new: 'b-mute', progress: 'b-blue', done: 'b-on', rejected: 'b-red' };

function Track({ ub, x, fill, on }: { ub: UB; x: NonNullable<ComplaintData['track']>; fill: number; on: ComplaintOn }) {
  return (
    <>
      {x.mine.length > 0 && (
        <div className="mb-5">
          <p className={lbl}>{x.mineLbl}</p>
          <div className="flex flex-wrap gap-2">
            {x.mine.map((m) => <button key={m.id} type="button" className="chip tnum" aria-pressed={m.on} onClick={() => on.pick(m.id)}>{m.id}<span className="opacity-60">{m.label}</span></button>)}
          </div>
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); on.track(); }}>
        <p className="text-[13.5px] text-muted mb-3">{x.desc}</p>
        {/* key={fill}: хадгалснаас сонгоход талбаруудыг шинэ утгаар дахин үүсгэнэ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" key={fill}>
          <label className="block"><span className={lbl}>{x.idLbl}</span><input id="c-tid" className="field tnum uppercase" placeholder="OG-2026-48501" autoComplete="off" spellCheck={false} maxLength={20} defaultValue={x.id} onInput={(e) => on.input('tid', e.currentTarget.value)} /></label>
          <label className="block"><span className={lbl}>{x.keyLbl}</span><input id="c-tkey" className="field tnum uppercase tracking-wider" placeholder="XXXXX-XXXXX" autoComplete="off" spellCheck={false} maxLength={24} defaultValue={x.key} onInput={(e) => on.input('tkey', e.currentTarget.value)} /></label>
        </div>
        <p className="mt-2 text-[13px] text-ubred min-h-[18px]" role="alert">{x.err}</p>
        <button type="submit" className="btn btn-ink w-full mt-1" disabled={x.busy}>
          {x.busy ? <span className="typing"><span /><span /><span /></span> : <Icon ub={ub} n="search-check" c="w-[18px] h-[18px]" />}{x.check}
        </button>
      </form>
      {x.res && <Result ub={ub} r={x.res} />}
    </>
  );
}

function Result({ ub, r }: { ub: UB; r: TrackRes }) {
  const bad = r.status === 'rejected';
  return (
    <div className="mt-6 card p-5" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-11 h-11 rounded-xl bg-soft grid place-items-center text-ubblue shrink-0"><Icon ub={ub} n={r.i} c="w-5 h-5" /></span>
          <div className="min-w-0"><b className="block text-[16px] leading-snug">{r.title}: {r.topic}</b><span className="block text-[12.5px] text-muted tnum mt-0.5">{r.id}</span></div>
        </div>
        <span className={`badge ${ST_CLS[r.status] || 'b-mute'}`}>{r.stLabel}</span>
      </div>
      <ol className="mt-5 space-y-0">
        {r.steps.map((s, i) => {
          const last = i === r.steps.length - 1, dot = !s.done ? 'bg-card border-2 border-line' : last && bad ? 'bg-ubred' : last ? 'bg-ubgreen' : 'bg-ubblue';
          return (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && <span className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${r.steps[i + 1].done ? 'bg-ubblue' : 'bg-line'}`} aria-hidden="true" />}
              <span className={`relative w-5 h-5 rounded-full shrink-0 grid place-items-center text-white ${dot}`}>{s.done && <Icon ub={ub} n={last && bad ? 'x' : 'check'} c="w-3 h-3" sw={3} />}</span>
              <span className="min-w-0 -mt-0.5"><span className={`block text-[14.5px] ${s.cur ? 'font-bold' : s.done ? 'font-semibold' : 'text-muted'}`}>{s.l}</span>{s.at && <span className="block text-[12.5px] text-muted tnum">{s.at}</span>}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 rounded-xl bg-soft p-4">
        <p className="text-[13px] font-bold flex items-center gap-2"><Icon ub={ub} n="message-square-reply" c="w-4 h-4" />{r.replyLbl}{r.replyAt && <span className="font-normal text-muted tnum">{r.replyAt}</span>}</p>
        <p className={`mt-1.5 text-[14.5px] leading-relaxed whitespace-pre-wrap ${r.reply ? '' : 'text-muted'}`}>{r.reply || r.noReply}</p>
      </div>
      <p className="mt-3 text-[12.5px] text-muted">{r.updated}</p>
    </div>
  );
}
