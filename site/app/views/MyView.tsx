'use client';
/* «Миний булан» (#view-my): толгой (нэр, хаяг, тоон үзүүлэлт), таб — тойм | хүсэлтүүд | миний хороо.
   Өгөгдөл: src/features/my-page.js myData() (нэвтрээгүй эсвэл өөр хуудсанд null). Хадгалсан арга хэмжээ нь evRow() HTML.
   Таб (tab my), төлөх (pay), шинэ хүсэлт (report), мэдэгдлийн холбоос (go, tab, vote), home-ыг features/wiring.js барина. */
import { Icon, useUB, type UB } from '../ub';
import { Raw, Swap, Tabs, type TabItem } from '../home/parts';

interface ReqItem { id: string; i: string; title: string; place: string; date: string; st: number; stLabel: string; steps: string[]; note: string }
interface MyData {
  tab: 'over' | 'req' | 'kh'; dir: number; home: string;
  ini: string; hello: string; addr: string; reg: string; stats: [number, string][]; tabs: TabItem[];
  req?: { title: string; add: string; empty: string; list: ReqItem[] };
  kh?: {
    addr: string; govLbl: string; gov: string; resLbl: string; res: string; hhLbl: string; hh: string; hoursLbl: string; hours: string;
    nearLbl: string; near: { n: string; i: string; d: string }[]; noticesLbl: string; notices: string[];
  };
  over?: {
    notifsLbl: string; notes: { i: string; text: string; ago: string; act: Record<string, string> }[];
    payLbl: string; payBtn: string; pays: { id: string; title: string; paid: boolean; status: string; amt: string }[];
    savedLbl: string; noSaved: string; saved: string[];
  };
}

export function MyView() {
  const ub = useUB();
  if (!ub) return null;
  const d = ub.home.my?.() as MyData | null;
  if (!d) return null;
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 view-in">
      <button type="button" className="text-[14px] font-semibold text-muted hover:text-ink inline-flex items-center gap-1.5" data-act="home"><Icon ub={ub} n="arrow-left" c="w-4 h-4" />{d.home}</button>
      <div className="mt-4 panel overflow-hidden">
        <div className="bg-navy text-white p-6 sm:p-8"><div className="flex flex-col md:flex-row md:items-center gap-5">
          <span className="w-16 h-16 rounded-2xl bg-ubred grid place-items-center text-[22px] font-extrabold shrink-0">{d.ini}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight">{d.hello}</h1>
            <p className="text-white/65 mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
              <span className="inline-flex items-center gap-1.5"><Icon ub={ub} n="map-pin" c="w-4 h-4" />{d.addr}</span>
              <span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="id-card" c="w-4 h-4" />{d.reg}</span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-[360px]">
            {d.stats.map(([v, l], k) => <div key={k} className="rounded-xl bg-white/[.08] border border-white/10 p-3"><p className="text-[24px] font-extrabold tnum leading-none">{v}</p><p className="text-[12px] text-white/60 mt-1.5 leading-tight">{l}</p></div>)}
          </div>
        </div></div>
        <div className="px-4 sm:px-8 border-b border-line"><Tabs ub={ub} name="my" items={d.tabs} active={d.tab} line /></div>
        <Swap k={d.tab} dir={d.dir} id="my-panel" className="p-4 sm:p-8">
          {d.req ? <Req ub={ub} r={d.req} /> : d.kh ? <Kh ub={ub} k={d.kh} /> : d.over ? <Over ub={ub} o={d.over} /> : null}
        </Swap>
      </div>
    </div>
  );
}

const ST_CLS = ['b-mute', 'b-blue', 'b-off', 'b-on'];

function Req({ ub, r }: { ub: UB; r: NonNullable<MyData['req']> }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-5"><h2 className="font-extrabold text-[19px]">{r.title}</h2><button type="button" className="btn btn-sm btn-red" data-act="report"><Icon ub={ub} n="plus" c="w-4 h-4" />{r.add}</button></div>
      {r.list.length
        ? <div className="space-y-3">{r.list.map((x) => <ReqCard key={x.id} ub={ub} x={x} />)}</div>
        : <div className="card p-10 text-center text-muted">{r.empty}</div>}
    </>
  );
}

function ReqCard({ ub, x }: { ub: UB; x: ReqItem }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-11 h-11 rounded-xl bg-soft grid place-items-center text-ubred shrink-0"><Icon ub={ub} n={x.i} c="w-5 h-5" /></span>
          <div className="min-w-0"><b className="block text-[16px] leading-snug">{x.title}</b><span className="block text-[13px] text-muted mt-0.5">{x.place}</span><span className="block text-[12.5px] text-muted tnum mt-0.5">{x.id}, {x.date}</span></div>
        </div>
        <span className={`badge ${ST_CLS[x.st]}`}>{x.stLabel}</span>
      </div>
      <ol className="mt-5 grid grid-cols-4 gap-1.5">
        {x.steps.map((s, i) => <li key={i}><span className={`block h-1.5 rounded-full ${i <= x.st ? (x.st === 3 ? 'bg-ubgreen' : 'bg-ubblue') : 'bg-line'}`} /><span className={`block mt-2 text-[11.5px] sm:text-[12px] leading-tight ${i === x.st ? 'font-bold' : 'text-muted'}`}>{s}</span></li>)}
      </ol>
      <p className="mt-4 text-[13.5px] text-muted flex gap-2"><Icon ub={ub} n="info" c="w-4 h-4 mt-0.5" /><span>{x.note}</span></p>
    </div>
  );
}

function Kh({ ub, k }: { ub: UB; k: NonNullable<MyData['kh']> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="card p-5">
        <p className="text-[13px] text-muted">{k.addr}</p>
        <div className="mt-4 flex items-center gap-3"><span className="w-12 h-12 rounded-2xl bg-ubblue/10 text-ubblue grid place-items-center"><Icon ub={ub} n="user-round" c="w-6 h-6" /></span><div><p className="text-[13px] text-muted">{k.govLbl}</p><b>{k.gov}</b></div></div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-[13.5px]">
          <div className="rounded-xl bg-soft p-3"><dt className="text-muted">{k.resLbl}</dt><dd className="font-extrabold tnum text-[18px]">{k.res}</dd></div>
          <div className="rounded-xl bg-soft p-3"><dt className="text-muted">{k.hhLbl}</dt><dd className="font-extrabold tnum text-[18px]">{k.hh}</dd></div>
          <div className="rounded-xl bg-soft p-3 col-span-2"><dt className="text-muted">{k.hoursLbl}</dt><dd className="font-bold">{k.hours}</dd></div>
        </dl>
      </div>
      <div className="card p-5"><h3 className="font-bold">{k.nearLbl}</h3><ul className="mt-3 space-y-1">
        {k.near.map((n, j) => <li key={j} className="flex items-center gap-3 p-2 rounded-xl"><span className="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred shrink-0"><Icon ub={ub} n={n.i} c="w-[18px] h-[18px]" /></span><span className="flex-1 text-[14px] font-semibold leading-snug">{n.n}</span><span className="text-[13px] text-muted tnum">{n.d}</span></li>)}
      </ul></div>
      <div className="card p-5"><h3 className="font-bold">{k.noticesLbl}</h3><ul className="mt-3 space-y-3">
        {k.notices.map((n, j) => <li key={j} className="flex gap-3 text-[14px] leading-snug"><span className="w-2 h-2 rounded-full bg-ubyellow mt-1.5 shrink-0" />{n}</li>)}
      </ul></div>
    </div>
  );
}

function Over({ ub, o }: { ub: UB; o: NonNullable<MyData['over']> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="card p-5"><h3 className="font-bold flex items-center gap-2"><Icon ub={ub} n="bell" c="w-[18px] h-[18px]" />{o.notifsLbl}</h3><ul className="mt-2 divide-y divide-line">
          {o.notes.map((n, j) => (
            <li key={j}><button type="button" className="w-full flex items-start gap-3 py-3 text-left group" {...n.act}>
              <span className="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred shrink-0"><Icon ub={ub} n={n.i} c="w-[18px] h-[18px]" /></span>
              <span className="flex-1"><span className="block text-[14.5px] font-semibold leading-snug group-hover:text-ubblue transition-colors">{n.text}</span><span className="block text-[12.5px] text-muted mt-0.5">{n.ago}</span></span>
              <Icon ub={ub} n="chevron-right" c="w-4 h-4 text-muted mt-2" />
            </button></li>
          ))}
        </ul></div>
        <div className="card p-5"><h3 className="font-bold flex items-center gap-2"><Icon ub={ub} n="wallet" c="w-[18px] h-[18px]" />{o.payLbl}</h3><ul className="mt-2 divide-y divide-line">
          {o.pays.map((p) => (
            <li key={p.id} className="py-3 flex items-center justify-between gap-3">
              <span><b className="block text-[14.5px]">{p.title}</b><span className={`text-[13px] ${p.paid ? 'text-greenink' : 'text-muted'}`}>{p.status}</span></span>
              <span className="flex items-center gap-3"><b className="tnum">{p.amt}</b>{p.paid ? <Icon ub={ub} n="circle-check" c="w-5 h-5 text-ubgreen" /> : <button type="button" className="btn btn-sm btn-blue" data-act="pay" data-id={p.id}>{o.payBtn}</button>}</span>
            </li>
          ))}
        </ul></div>
      </div>
      <div className="card p-5 self-start"><h3 className="font-bold flex items-center gap-2"><Icon ub={ub} n="bookmark" c="w-[18px] h-[18px]" />{o.savedLbl}</h3>
        {o.saved.length
          ? <Raw className="mt-3 space-y-2" html={o.saved.join('')} />
          : <p className="mt-3 text-[14px] text-muted leading-relaxed">{o.noSaved}</p>}
      </div>
    </div>
  );
}
