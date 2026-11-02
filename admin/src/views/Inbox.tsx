'use client';
/* Ирсэн хүсэлт: иргэдийн эрсдэл мэдээлэл, санал, имэйл бүртгэл. Төлөв солих, устгах. */
import { useEffect, useState } from 'react';
import { api } from '../api';
import { errMsg, useCms } from '../cms';
import { Bi, kit, L, st } from '../kit';
import { Icon, Spinner, useArmed, useToast } from '../ui';

interface Submission { id: string; kind: 'report' | 'idea' | 'digest'; data: any; status: string; created_at: string }

const KINDS: Record<string, [string, string, Bi]> = {
  report: ['siren', 'text-ubred bg-ubred/10', ['Эрсдэл мэдээлэл', 'Hazard report']],
  idea: ['message-square-plus', 'text-ubblue bg-ubblue/10', ['Санал хүсэлт', 'Idea']],
  digest: ['mail', 'text-greenink bg-ubgreen/10', ['Имэйл бүртгэл', 'Newsletter']],
};
const STATUSES: [string, Bi][] = [['new', ['Шинэ', 'New']], ['progress', ['Шийдвэрлэж буй', 'In progress']], ['done', ['Шийдвэрлэсэн', 'Resolved']], ['rejected', ['Татгалзсан', 'Rejected']]];

function Chip({ on, label, n, onClick }: { on: boolean; label: string; n: number; onClick: () => void }) {
  return <button type="button" className="chip !h-9" aria-pressed={on} onClick={onClick}>{label}<span className="tnum opacity-60">{n}</span></button>;
}

export function Inbox() {
  const { inboxTick } = useCms(), toast = useToast(), { armed, confirm } = useArmed();
  const [list, setList] = useState<Submission[] | null>(null), [err, setErr] = useState(''), [f, setF] = useState('all');
  useEffect(() => {   // анх нээхэд болон шинэ маягт ирэх бүрд
    api<{ list: Submission[] }>('/submissions').then((j) => { setList(j.list); setErr(''); }).catch((e) => setErr(errMsg(e)));
  }, [inboxTick]);
  if (!list) return err ? <p className="text-ubred font-semibold">{err}</p> : <div className="card p-10"><Spinner /></div>;

  const k = kit(), s = st();
  const shown = f === 'all' ? list : KINDS[f] ? list.filter((x) => x.kind === f) : list.filter((x) => x.status === f);
  const when = (iso: string) => { const d = new Date(iso); return isNaN(+d) ? '' : `${k.fDate(d)}, ${k.hhmm(d)}`; };
  const setStatus = async (x: Submission, status: string) => {
    try { await api('/submissions/' + encodeURIComponent(x.id), { method: 'PATCH', body: { status } }); setList((l) => l && l.map((y) => (y.id === x.id ? { ...y, status } : y))); toast(L(['Төлөв шинэчлэгдлээ', 'Status updated'])); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  const remove = async (x: Submission) => {
    if (!confirm('sub-' + x.id)) return;
    try { await api('/submissions/' + encodeURIComponent(x.id), { method: 'DELETE' }); setList((l) => l && l.filter((y) => y.id !== x.id)); toast(L(['Устгалаа', 'Deleted']), 'trash-2'); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };

  return (
    <>
      {err && <p className="mb-4 text-ubred font-semibold">{err}</p>}
      <div className="flex flex-wrap gap-2 mb-5">
        <Chip on={f === 'all'} onClick={() => setF('all')} label={L(['Бүгд', 'All'])} n={list.length} />
        {Object.entries(KINDS).map(([v, kd]) => <Chip key={v} on={f === v} onClick={() => setF(v)} label={L(kd[2])} n={list.filter((x) => x.kind === v).length} />)}
        <span className="w-px bg-line mx-1" />
        {STATUSES.slice(0, 3).map(([v, l]) => <Chip key={v} on={f === v} onClick={() => setF(v)} label={L(l)} n={list.filter((x) => x.status === v && x.kind !== 'digest').length} />)}
      </div>
      {shown.length ? (
        <ul className="space-y-3">{shown.map((x) => {
          const kd = KINDS[x.kind] || KINDS.idea, d = x.data || {}, rc = x.kind === 'report' ? s.RCAT[d.cat] || s.RCAT.other : null;
          const title = rc ? L(rc.t) : x.kind === 'digest' ? d.email : ((s.TOPICS.find((tp) => tp[0] === d.topic) || [])[k.EN() ? 2 : 1] || L(kd[2]));
          const text = x.kind === 'report' ? d.desc : x.kind === 'idea' ? d.text : '';
          return (
            <li key={x.id} className="card p-5"><div className="flex flex-wrap items-start gap-4">
              <span className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${kd[1]}`}><Icon name={rc ? rc.i : kd[0]} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><b className="text-[15.5px] break-all">{title}</b><span className="text-[12.5px] text-muted tnum">{x.id}</span>{d.gov && <span className="badge b-blue">{L(['Засаг даргад', 'To the Governor'])}</span>}</div>
                <p className="mt-1 text-[12.5px] text-muted flex flex-wrap gap-x-3">{L(kd[2])}<span>{when(x.created_at)}</span>{d.dist && <span className="inline-flex items-center gap-1"><Icon name="map-pin" className="w-3.5 h-3.5" />{d.dist}</span>}</p>
                {text && <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-wrap">{text}</p>}
                {d.photo && <a href={d.photo} target="_blank" rel="noopener" className="mt-3 inline-block"><img src={d.photo} alt={L(['Иргэний оруулсан зураг', 'Submitted photo'])} className="w-40 h-28 rounded-xl object-cover border border-line" loading="lazy" /></a>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {x.kind !== 'digest' && (
                  <select className="field !h-9 !py-0 !text-[13.5px] !w-auto" value={x.status} aria-label={L(['Төлөв', 'Status'])} onChange={(e) => setStatus(x, e.target.value)}>
                    {STATUSES.map(([v, l]) => <option key={v} value={v}>{L(l)}</option>)}
                  </select>
                )}
                <button type="button" className={`icon-btn !rounded-lg border border-line text-muted hover:text-ubred ${armed === 'sub-' + x.id ? '!text-ubred bg-ubred/10' : ''}`} onClick={() => remove(x)}
                  title={armed === 'sub-' + x.id ? L(['Дахин дарж баталгаажуулна', 'Click again to confirm']) : L(['Устгах', 'Delete'])} aria-label={L(['Устгах', 'Delete'])}>
                  <Icon name={armed === 'sub-' + x.id ? 'triangle-alert' : 'trash-2'} className="w-4 h-4" />
                </button>
              </div>
            </div></li>
          );
        })}</ul>
      ) : (
        <div className="card p-10 text-center text-muted"><span className="block w-8 h-8 mx-auto mb-3 opacity-60"><Icon name="inbox" className="w-8 h-8" /></span>{L(['Одоогоор хүсэлт ирээгүй байна', 'Nothing here yet'])}</div>
      )}
    </>
  );
}
