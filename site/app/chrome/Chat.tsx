'use client';
/* AI туслах: баруун доод буланд хөвөгч товч (#chat-fab) ба чатын цонх. Төлөв, хариу авах (window.claude эсвэл бэлэн FAQ),
   товчнуудын үйлдлийг src/features/assistant.js удирдана (data-act="chat-*", data-form="chat" → features/wiring.js).
   Хариу урсаж ирэх бүрт зөвхөн чат дахин зурагдана: assistant.js chatPaint() → 'ub:chat' (бүх сайтын 'ub:render' биш). */
import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { Icon, esc, useUB, type UB } from '../ub';

interface ChatMsg {
  role: 'user' | 'assistant';
  /** Хэрэглэгчийн текст */
  text?: string;
  /** Туслахын хариу: бэлэн HTML (assistant.js md()) */
  html?: string;
  streaming?: boolean;
  err?: string;
  acts?: { v: string; i: string; label: string }[];
}
interface ChatData {
  open: boolean; seen: boolean; tip: boolean; busy: boolean;
  title: string; status: string; restart: string; close: string; greet: string; chips: string[];
  ph: string; note: string; tipText: string; openLbl: string; stop: string; send: string; thinking: string;
  msgs: ChatMsg[];
}

const subscribe = (cb: () => void) => {
  const h = () => flushSync(cb);
  window.addEventListener('ub:chat', h);
  return () => window.removeEventListener('ub:chat', h);
};
const version = () => (window.UB?.home.chatV ? (window.UB.home.chatV() as number) : 0);

const Avatar = ({ ub }: { ub: UB }) => <span className="w-8 h-8 rounded-lg bg-navy text-white grid place-items-center shrink-0"><Icon ub={ub} n="sparkles" c="w-4 h-4" /></span>;

export function Chat() {
  const ub = useUB();
  useSyncExternalStore(subscribe, version, () => 0);
  if (!ub || !ub.home.chat) return null;
  const d = ub.home.chat() as ChatData;

  return (
    <div className={d.open ? 'chat-open' : ''} id="chat-root">
      <div className="chat-panel card shadow-[0_30px_80px_-24px_rgb(0_0_0/.5)] flex flex-col overflow-hidden" role="dialog" aria-label={d.title} aria-hidden={!d.open}>
        <div className="bg-navy text-white px-4 py-3.5 flex items-center gap-3 shrink-0">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-ubblue to-ubred grid place-items-center"><Icon ub={ub} n="sparkles" c="w-5 h-5" /></span>
          <div className="flex-1 min-w-0"><b className="block text-[15.5px]">{d.title}</b><span className="block text-[12px] text-white/65 truncate" id="chat-status"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C78C] mr-1.5 align-middle" />{d.status}</span></div>
          <button type="button" className="icon-btn hover:bg-white/10" data-act="chat-reset" title={d.restart} aria-label={d.restart}><Icon ub={ub} n="rotate-ccw" c="w-[18px] h-[18px]" /></button>
          <button type="button" className="icon-btn hover:bg-white/10" data-act="chat-toggle" aria-label={d.close}><Icon ub={ub} n="x" /></button>
        </div>
        <div id="chat-msgs" className="flex-1 overflow-y-auto thin-scroll px-4 py-4 space-y-3 bg-soft/60" aria-live="polite">
          <div className="flex gap-2.5">
            <Avatar ub={ub} />
            <div className="max-w-[88%]">
              <div className="rounded-2xl rounded-tl-[4px] bg-card border border-line px-3.5 py-2.5 text-[14.5px] leading-relaxed">{d.greet}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.chips.map((c, k) => <button key={k} type="button" className="chip !h-8 !text-[13px] !px-3" data-act="chat-ask" data-v={c}>{c}</button>)}
              </div>
            </div>
          </div>
          {d.msgs.map((m, i) => <Msg key={i} ub={ub} m={m} i={i} thinking={d.thinking} />)}
        </div>
        <form className="p-3 border-t border-line bg-card shrink-0" data-form="chat">
          <div className="flex items-end gap-2">
            {/* Утгыг React барихгүй (uncontrolled): assistant.js chatSend() цэвэрлэж, wiring.js autoGrow() өндрийг тааруулна */}
            <textarea id="chat-in" rows={1} className="field !h-auto min-h-[46px] max-h-32 !py-3 !resize-none" placeholder={d.ph} aria-label={d.ph} />
            <span id="chat-btn">
              {d.busy
                ? <button type="button" className="btn btn-ink !h-[46px] !px-3.5" data-act="chat-stop" aria-label={d.stop}><Icon ub={ub} n="square" c="w-4 h-4" /></button>
                : <button type="submit" className="btn btn-blue !h-[46px] !px-3.5" aria-label={d.send}><Icon ub={ub} n="send-horizontal" c="w-5 h-5" /></button>}
            </span>
          </div>
          <p className="mt-2 text-[11.5px] text-muted leading-snug">{d.note}</p>
        </form>
      </div>
      <div className="chat-fab">
        <div id="chat-tip" className={`${d.tip ? '' : 'hidden '}absolute right-[72px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-card border border-line shadow-xl px-4 py-2.5 text-[14px] font-semibold tip-in`}>{d.tipText}</div>
        <button type="button" className="relative w-[60px] h-[60px] rounded-full bg-navy text-white grid place-items-center shadow-[0_16px_36px_-12px_rgb(11_29_69/.8)] ring-1 ring-white/10 hover:scale-105 transition-transform" data-act="chat-toggle" aria-label={d.openLbl} aria-expanded={d.open} id="chat-fab">
          <span data-fabicon="">{d.open ? <Icon ub={ub} n="x" c="w-6 h-6" /> : <Icon ub={ub} n="sparkles" c="w-6 h-6" />}</span>
          <span className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-ubred ring-2 ring-white${d.seen ? ' hidden' : ''}`} data-fabdot="" />
        </button>
      </div>
    </div>
  );
}

function Msg({ ub, m, i, thinking }: { ub: UB; m: ChatMsg; i: number; thinking: string }) {
  if (m.role === 'user') {
    return <div className="flex justify-end"><div className="max-w-[85%] rounded-2xl rounded-tr-[4px] bg-ubbluebg text-white px-3.5 py-2.5 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">{m.text}</div></div>;
  }
  // Хариу хоосон ба урсаж байвал «Бодож байна» гурван цэг
  const body = m.html || (m.streaming ? `<span class="inline-flex items-center gap-2 text-muted text-[13.5px]"><span class="typing"><span></span><span></span><span></span></span>${esc(thinking)}</span>` : '');
  return (
    <div className="flex gap-2.5" data-msg={i}>
      <Avatar ub={ub} />
      <div className="max-w-[85%] min-w-0">
        <div className={`rounded-2xl rounded-tl-[4px] bg-card border border-line px-3.5 py-2.5 text-[14.5px] leading-relaxed break-words ${body ? '' : 'hidden'}`} data-body="" dangerouslySetInnerHTML={{ __html: body }} />
        {m.err ? <p className="mt-1.5 text-[12.5px] text-ubred">{m.err}</p> : null}
        {m.acts && m.acts.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {m.acts.map((a) => <button key={a.v} type="button" className="chip !h-8 !text-[13px] !px-3 !text-ubblue" data-act="chat-do" data-v={a.v}><Icon ub={ub} n={a.i} c="w-4 h-4" />{a.label}</button>)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
