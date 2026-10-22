'use client';
/* «Санал өгөх»: санал асуулга (poll) ба санал илгээх (idea) таб. Төлөв, илгээх (apiCall /submit/idea) нь src/features/forms.js openVote()-д.
   Товчнууд (tab vote, v-pick, v-cast, v-topic, v-send, modal-close)-ыг features/wiring.js → MS барина. */
import { useEffect } from 'react';
import { Icon, type UB } from '../ub';
import { Swap, Tabs, type TabItem } from '../home/parts';
import { ModalHead } from './parts';

interface VoteData {
  title: string; tab: string; dir: number; tabs: TabItem[]; sent: boolean; castN: number;
  poll?: { q: string; until: string; voted: number | null; pick: number | null; btn: string; total: string; opts: { label: string; pct: number }[] };
  idea?: { gov: string; topicLbl: string; topic: string; topics: [string, string][]; text: string; ph: string; err: string; busy: boolean; send: string; sentMsg: string };
}

export function Vote({ ub, data, onText }: { ub: UB; data: () => VoteData; onText: (v: string) => void }) {
  const d = data();
  /* Хувийн мөр (.hbar) зурагдах хөдөлгөөн: нээхэд, таб солиход, санал өгсний дараа */
  useEffect(() => {
    const el = document.getElementById('v-body'); if (!el) return;
    el.classList.remove('drawn');
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => el.classList.add('drawn')); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [d.tab, d.castN]);
  return (
    <>
      <ModalHead ub={ub} title={d.title} icon="vote" tone="bg-ubbluebg text-white" />
      <div className="px-5 sm:px-7 py-6">
        <Tabs ub={ub} name="vote" items={d.tabs} active={d.tab} cls="w-full [&>button]:flex-1 [&>button]:justify-center" />
        <Swap k={d.tab} dir={d.dir} id="v-body" className="mt-6">
          {d.poll ? <Poll ub={ub} p={d.poll} /> : d.idea ? (d.sent ? <Sent ub={ub} msg={d.idea.sentMsg} /> : <Idea ub={ub} x={d.idea} onText={onText} />) : null}
        </Swap>
      </div>
    </>
  );
}

function Poll({ ub, p }: { ub: UB; p: NonNullable<VoteData['poll']> }) {
  const v = p.voted;
  return (
    <>
      <p className="text-[17px] font-extrabold leading-snug">{p.q}</p>
      <p className="mt-1 text-[13px] text-muted">{p.until}</p>
      <div className="mt-5 space-y-2.5">
        {p.opts.map((o, i) => v != null ? (
          <div key={i} className={`relative rounded-xl border ${v === i ? 'border-ubblue' : 'border-line'} overflow-hidden`}>
            <div className={`hbar absolute inset-y-0 left-0 ${v === i ? 'bg-ubblue/15' : 'bg-soft'}`} style={{ width: o.pct + '%' }} />
            <div className="relative flex items-center justify-between gap-3 px-4 h-12">
              <span className="font-semibold text-[14.5px] flex items-center gap-2">{v === i && <Icon ub={ub} n="circle-check" c="w-[18px] h-[18px] text-ubblue" />}{o.label}</span>
              <b className="tnum text-[14px]">{o.pct}%</b>
            </div>
          </div>
        ) : (
          <button key={i} type="button" className={`w-full flex items-center gap-3 px-4 h-12 rounded-xl border-2 text-left transition-colors ${p.pick === i ? 'border-ubblue bg-ubblue/5' : 'border-line hover:border-ink/25'}`} data-act="v-pick" data-i={i} aria-pressed={p.pick === i}>
            <span className={`w-5 h-5 rounded-full border-2 grid place-items-center shrink-0 ${p.pick === i ? 'border-ubblue' : 'border-line'}`}>{p.pick === i && <i className="w-2.5 h-2.5 rounded-full bg-ubblue" />}</span>
            <span className="font-semibold text-[14.5px]">{o.label}</span>
          </button>
        ))}
      </div>
      {v != null
        ? <p className="mt-4 text-[13.5px] text-muted flex items-center gap-2"><Icon ub={ub} n="users-round" c="w-4 h-4" />{p.total}</p>
        : <button type="button" className="btn btn-blue w-full mt-5" data-act="v-cast" disabled={p.pick == null}><Icon ub={ub} n="vote" c="w-[18px] h-[18px]" />{p.btn}</button>}
    </>
  );
}

function Sent({ ub, msg }: { ub: UB; msg: string }) {
  return (
    <div className="py-6 text-center">
      <span className="w-14 h-14 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop"><Icon ub={ub} n="check" c="w-7 h-7" sw={2.6} /></span>
      <p className="mt-4 font-extrabold text-[18px] max-w-[30ch] mx-auto">{msg}</p>
    </div>
  );
}

function Idea({ ub, x, onText }: { ub: UB; x: NonNullable<VoteData['idea']>; onText: (v: string) => void }) {
  return (
    <>
      {x.gov && <p className="rounded-xl bg-soft p-3 mb-4 text-[13.5px] font-semibold flex items-center gap-2"><Icon ub={ub} n="mail" c="w-4 h-4" />{x.gov}</p>}
      <p className="text-[13.5px] font-semibold">{x.topicLbl}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {x.topics.map(([k, l]) => <button key={k} type="button" className="chip" data-act="v-topic" data-v={k} aria-pressed={x.topic === k}>{l}</button>)}
      </div>
      {/* хяналтгүй талбар: текстийг onText-ээр src/ рүү дамжуулна (товч дарах бүрт бүх сайтыг дахин зурахгүй) */}
      <textarea id="v-text" rows={5} className="field mt-4" placeholder={x.ph} defaultValue={x.text} onInput={(e) => onText(e.currentTarget.value)} />
      <p className="mt-1 text-[13px] text-ubred min-h-[18px]" id="v-err" role="alert">{x.err}</p>
      <button type="button" className="btn btn-blue w-full mt-1" data-act="v-send" disabled={x.busy}><Icon ub={ub} n="send" c="w-[18px] h-[18px]" />{x.send}</button>
    </>
  );
}
