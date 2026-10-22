'use client';
/* Баримтын цонхнууд: тогтоол / захирамж (Doc), тендер (Tender), арга хэмжээ (EventView). Нээх: src/features/documents.js openDoc(type, i), openEvent(id).
   Өгөгдөл: ub.home.docModal(type, i), ub.home.tenderModal(i), ub.home.eventModal(id).
   Товчнууд (data-act="bid" | "ev-save" | "ev-onmap" | "modal-close")-ыг features/wiring.js барина; хадгалахад (toggleSave) renderReact() → дахин зурна. */
import { Icon, LogoMark, cssVars, type UB } from '../ub';
import { ModalHead } from './parts';

interface DocData { no: string; date: string; icon: string; title: string; place: string; note: string; hdr: string; sign: string; clauses: string[] }

export function Doc({ ub, type, i }: { ub: UB; type: string; i: number }) {
  const d = ub.home.docModal(type, i) as DocData | null;
  if (!d) return null;
  return (
    <>
      <ModalHead ub={ub} title={d.no} sub={d.date} icon={d.icon} tone="bg-soft text-ubblue" />
      <div className="p-4 sm:p-8 bg-soft">
        <div className="paper rounded-lg mx-auto max-w-[560px] px-6 sm:px-12 py-10 text-[13.5px] leading-relaxed">
          <div className="flex justify-center"><LogoMark ub={ub} c="w-12 h-12" /></div>
          <p className="mt-4 text-center font-extrabold tracking-wide text-[12.5px] text-[#111827]">{d.hdr}</p>
          <div className="mt-5 flex justify-between gap-3 text-[12px] text-gray-500"><span>{d.date}</span><span className="font-bold text-gray-800 tnum">{d.no}</span><span>{d.place}</span></div>
          <p className="mt-6 text-center font-bold text-[15px] leading-snug text-[#111827]">{d.title}</p>
          <div className="mt-6 space-y-3 text-gray-700">{d.clauses.map((c, k) => <p key={k}>{c}</p>)}</div>
          <div className="mt-5 space-y-2" aria-hidden="true">{[92, 100, 84, 96, 60].map((w, k) => <span key={k} className="block h-2 rounded-[4px] bg-gray-200" style={{ width: w + '%' }} />)}</div>
          <div className="mt-10 flex items-end justify-between text-[12px] text-gray-500"><span>{d.sign}</span><span className="w-28 border-b border-gray-400" /></div>
        </div>
        <p className="mt-4 text-center text-[13px] text-muted">{d.note}</p>
      </div>
    </>
  );
}

interface TenderData {
  title: string; no: string; budgetL: string; budget: string; statusL: string;
  badge: { cls: string; live?: boolean; i?: string; text: string };
  cur: number; steps: [string, string][]; bid: string;
}

export function Tender({ ub, i }: { ub: UB; i: number }) {
  const d = ub.home.tenderModal(i) as TenderData | null;
  if (!d) return null;
  const b = d.badge;
  return (
    <>
      <ModalHead ub={ub} title={d.title} sub={d.no} icon="gavel" tone="bg-soft text-ubblue" />
      <div className="px-5 sm:px-7 py-6">
        <div className="grid grid-cols-2 gap-3 text-[13.5px]">
          <div className="rounded-xl bg-soft p-3"><p className="text-muted">{d.budgetL}</p><b className="tnum">{d.budget}</b></div>
          <div className="rounded-xl bg-soft p-3"><p className="text-muted mb-1">{d.statusL}</p>
            <span className={`badge ${b.cls}`}>{b.live ? <span className="live !w-1.5 !h-1.5" style={cssVars({ '--dot': 'currentColor' })} /> : <Icon ub={ub} n={b.i || 'circle'} c="w-3.5 h-3.5" />}{b.text}</span>
          </div>
        </div>
        <ol className="mt-6">
          {d.steps.map(([l, v], k) => (
            <li key={k} className={`flex gap-3 relative ${k < 3 ? 'pb-5' : ''}`}>
              {k < 3 && <span className={`absolute left-[11px] top-7 bottom-0 w-0.5 ${k < d.cur ? 'bg-ubgreen' : 'bg-line'}`} />}
              <span className={`relative w-6 h-6 rounded-full grid place-items-center shrink-0 ${k < d.cur ? 'bg-ubgreen text-white' : k === d.cur ? 'bg-ubbluebg text-white' : 'bg-line'}`}>{k < d.cur && <Icon ub={ub} n="check" c="w-3.5 h-3.5" sw={3} />}</span>
              <span><b className="block text-[14.5px]">{l}</b>{v && <span className="text-[13px] text-muted">{v}</span>}</span>
            </li>
          ))}
        </ol>
        {d.bid && <button type="button" className="btn btn-blue w-full mt-2" data-act="bid"><Icon ub={ub} n="file-signature" c="w-[18px] h-[18px]" />{d.bid}</button>}
      </div>
    </>
  );
}

interface EventData {
  id: string; scene: string; cat: string; color: string; title: string; when: string; venue: string; price: string; desc: string;
  saved: boolean; saveL: string; map: string;
}

export function EventView({ ub, id }: { ub: UB; id: string }) {
  const e = ub.home.eventModal(id) as EventData | null;
  if (!e) return null;
  return (
    <>
      <div className="relative">
        {/* .scene > svg: Scene() HTML-ийг шууд хүүхэд болгоно (Scene кэштэй тул дахин зурахад өөрчлөгдөхгүй) */}
        <div className="scene aspect-[16/8] sm:rounded-t-[8px]" dangerouslySetInnerHTML={{ __html: e.scene }} />
        <button type="button" className="absolute right-3 top-3 icon-btn bg-black/45 text-white hover:bg-black/60 backdrop-blur" data-act="modal-close" aria-label={ub.t('close')}><Icon ub={ub} n="x" /></button>
      </div>
      <div className="px-5 sm:px-7 py-6">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted"><i className="w-2 h-2 rounded-full" style={{ background: e.color }} />{e.cat}</span>
        <h2 className="mt-2 text-[24px] font-extrabold leading-tight">{e.title}</h2>
        <div className="mt-4 grid gap-2.5 text-[14.5px]">
          {([['calendar-days', e.when], ['map-pin', e.venue], ['ticket', e.price]] as const).map(([n, v]) => <p key={n} className="flex items-center gap-3"><Icon ub={ub} n={n} c="w-5 h-5 text-muted" />{v}</p>)}
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-ink/85">{e.desc}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={`btn ${e.saved ? 'btn-ghost' : 'btn-ink'}`} data-act="ev-save" data-id={e.id} aria-pressed={e.saved}><Icon ub={ub} n={e.saved ? 'bookmark-check' : 'bookmark'} c="w-[18px] h-[18px]" />{e.saveL}</button>
          <button type="button" className="btn btn-ghost" data-act="ev-onmap" data-id={e.id}><Icon ub={ub} n="map" c="w-[18px] h-[18px]" />{e.map}</button>
        </div>
      </div>
    </>
  );
}
