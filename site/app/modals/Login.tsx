'use client';
/* ДАН-аар нэвтрэх (концепц): апп (QR) | код | банк таб, амжилттай нэвтэрсэн дэлгэц. Төлөв, цаг нь src/features/dan-login.js openLogin()-д.
   Товчнууд (tab dan, dan-send, dan-ok, modal-close)-ыг features/wiring.js → MS барина. */
import { Icon, type UB } from '../ub';
import { Raw, Swap, Tabs, type TabItem } from '../home/parts';
import { ModalHead } from './parts';

interface LoginData {
  tab: 'app' | 'code' | 'bank'; dir: number; stage: number; title: string; desc: string; note: string; signedIn: string; me: string; tabs: TabItem[];
  /** qrSVG() HTML */
  qr: string; scanQr: string; waiting: string;
  regPh: string; sendCode: string; codeSent: string; codePh: string; signIn: string; bankNote: string; bankBtn: string;
}

export function Login({ ub, data }: { ub: UB; data: () => LoginData }) {
  const d = data();
  if (d.stage === 9) {
    return (
      <div className="p-10 text-center">
        <span className="w-16 h-16 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop"><Icon ub={ub} n="check" c="w-8 h-8" sw={2.6} /></span>
        <p className="mt-4 text-[19px] font-extrabold">{d.signedIn}</p><p className="text-muted mt-1">{d.me}</p>
      </div>
    );
  }
  return (
    <>
      <ModalHead ub={ub} title={d.title} sub={d.desc} icon="fingerprint" tone="bg-navy text-white" />
      <div className="px-5 sm:px-7 py-6">
        <Tabs ub={ub} name="dan" items={d.tabs} active={d.tab} cls="w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2 [&>button]:text-[13.5px]" />
        <Swap k={d.tab} dir={d.dir} id="dan-body" className="mt-6"><Body ub={ub} d={d} /></Swap>
        <p className="mt-6 text-[12.5px] text-muted flex items-center gap-2"><Icon ub={ub} n="info" c="w-4 h-4" />{d.note}</p>
      </div>
    </>
  );
}

function Body({ ub, d }: { ub: UB; d: LoginData }) {
  if (d.tab === 'app') {
    return (
      <>
        <Raw className="mx-auto w-48 h-48 rounded-2xl border border-line p-2 bg-white" html={d.qr} />
        <p className="mt-4 text-center font-semibold">{d.scanQr}</p>
        <p className="mt-1.5 flex justify-center items-center gap-2 text-[13.5px] text-muted"><span className="typing"><span /><span /><span /></span>{d.waiting}</p>
      </>
    );
  }
  if (d.tab === 'code') {
    return d.stage < 1 ? (
      <>
        <label className="block text-[13.5px] font-semibold mb-2" htmlFor="dan-reg">{d.regPh}</label>
        <input id="dan-reg" className="field tnum uppercase" placeholder="УБ90011234" autoComplete="off" />
        <button type="button" className="btn btn-ink w-full mt-4" data-act="dan-send">{d.sendCode}</button>
      </>
    ) : (
      <>
        <p className="text-[13.5px] text-greenink font-semibold flex items-center gap-2"><Icon ub={ub} n="circle-check" c="w-4 h-4" />{d.codeSent}</p>
        <label className="block text-[13.5px] font-semibold mt-4 mb-2" htmlFor="dan-code">{d.codePh}</label>
        <input id="dan-code" className="field tnum tracking-[.4em] text-center !text-[20px]" inputMode="numeric" maxLength={6} placeholder="••••••" autoComplete="one-time-code" />
        <button type="button" className="btn btn-blue w-full mt-4" data-act="dan-ok">{d.signIn}</button>
      </>
    );
  }
  return (
    <>
      <div className="rounded-2xl bg-soft p-5 text-center"><Icon ub={ub} n="landmark" c="w-9 h-9 mx-auto text-ubblue" /><p className="mt-3 text-[14.5px] font-semibold">{d.bankNote}</p></div>
      <button type="button" className="btn btn-ink w-full mt-4" data-act="dan-ok"><Icon ub={ub} n="external-link" c="w-[18px] h-[18px]" />{d.bankBtn}</button>
    </>
  );
}
