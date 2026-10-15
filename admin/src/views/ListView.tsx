'use client';
/* Бүлгийн жагсаалт: хайлт, шүүлтүүр, засах, устгах. Анхааруулгыг шууд асааж / унтрааж болно. */
import { useState } from 'react';
import { cms, errMsg, useCms } from '../cms';
import { Bi, kit, L, st } from '../kit';
import { docForEdit, SCHEMA } from '../schema';
import { Icon, useArmed, useToast } from '../ui';
import { Badges, Meta, Thumb } from './parts';

const FILTERS: Record<string, [string, Bi, (x: any) => boolean][]> = {
  news: [['all', ['Бүгд', 'All'], () => true], ['pub', ['Нийтлэгдсэн', 'Published'], (x) => !x.draft], ['draft', ['Ноорог', 'Drafts'], (x) => x.draft], ['br', ['Шуурхай', 'Latest feed'], (x) => x.br], ['edited', ['Засварласан', 'Edited'], (x) => x._edited || x._new]],
  alerts: [['all', ['Бүгд', 'All'], () => true], ['on', ['Идэвхтэй', 'Active'], (x) => !x.off], ['off', ['Нуусан', 'Hidden'], (x) => x.off]],
};

function sorted(col: string, items: any[]) {
  const k = kit();
  if (col === 'news') return items.sort((a, b) => (+(k.parseUB(b.d) || 0)) - (+(k.parseUB(a.d) || 0)));
  if (col === 'docs') return items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  if (col === 'history') return items.sort((a, b) => (+a.y || 0) - (+b.y || 0));
  if (col === 'govsched') return items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(a.from || '').localeCompare(String(b.from || '')));
  if (items.some((x) => x.ord != null)) return items.sort((a, b) => (+a.ord || 0) - (+b.ord || 0));
  return items;
}

export function ListView({ col, onEdit }: { col: string; onEdit: (id: string) => void }) {
  useCms();   // засвар өөрчлөгдөхөд дахин зурна
  const sc = SCHEMA[col], toast = useToast(), { armed, confirm } = useArmed();
  const [q, setQ] = useState(''), [f, setF] = useState('all');
  const filters = FILTERS[col];
  let items = sorted(col, cms.merged(col));
  const needle = q.trim().toLowerCase();
  if (needle) items = items.filter((x) => JSON.stringify([x.t, x.n, x.k, x.l, x.v, x.d, x.no, x.kw, x.lbl]).toLowerCase().includes(needle));
  const fn = filters && filters.find((x) => x[0] === f);
  if (fn) items = items.filter(fn[2]);

  const remove = async (x: any) => {
    if (!confirm('row-' + x.id)) return;
    try { await cms.remove(col, x.id, sc.title(x) || x.id); toast(L(['Устгалаа', 'Deleted']), 'trash-2'); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  const toggleAlert = async (x: any, on: boolean) => {
    const doc = { ...docForEdit('alerts', x), off: on ? 0 : 1 };
    try { await cms.save('alerts', x.id, doc, L(x.k), 'update'); toast(on ? L(['Анхааруулга сайт дээр гарлаа', 'Alert is live']) : L(['Анхааруулгыг нуулаа', 'Alert hidden']), 'siren'); }
    catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative md:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"><Icon name="search" className="w-[18px] h-[18px]" /></span>
          <input type="search" className="field !h-10 !pl-10 !text-[14px]" placeholder={L(['Хайх', 'Search'])} aria-label={L(['Хайх', 'Search'])} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {filters && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">{filters.map(([v, l]) => (
            <button key={v} type="button" className="chip !h-9 shrink-0" aria-pressed={f === v} onClick={() => setF(v)}>{L(l)}</button>
          ))}</div>
        )}
        <span className="md:ml-auto text-[13px] text-muted">
          {L([`${items.length} бичлэг`, `${items.length} items`])}
          {col === 'mediaitems' && ` · ${L([`сайт дээр эхний ${st().MEDIA_MAX} нь харагдана`, `the first ${st().MEDIA_MAX} show on the site`])}`}
        </span>
      </div>
      {items.length ? (
        <ul className="card divide-y divide-line overflow-hidden">{items.map((x) => (
          <li key={x.id} className="adm-row group">
            <button type="button" className="flex items-center gap-4 flex-1 min-w-0 text-left" onClick={() => onEdit(x.id)}>
              <Thumb col={col} x={x} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[15px] leading-snug truncate group-hover:text-ubblue transition-colors">{sc.title(x) || L(['(гарчиггүй)', '(untitled)'])}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted"><Meta col={col} x={x} /></span>
                <span className="mt-1.5 flex flex-wrap gap-1.5"><Badges col={col} x={x} /></span>
              </span>
            </button>
            <span className="flex items-center gap-1 shrink-0">
              {col === 'alerts' && (
                <label className="mr-2 inline-flex items-center gap-2 text-[12.5px] text-muted" title={L(['Сайт дээр харуулах', 'Show on site'])}>
                  <input type="checkbox" className="adm-switch" checked={!x.off} onChange={(e) => toggleAlert(x, e.target.checked)} />
                </label>
              )}
              <button type="button" className="icon-btn !rounded-lg hover:bg-soft" onClick={() => onEdit(x.id)} aria-label={L(['Засах', 'Edit'])}><Icon name="pencil-line" className="w-[18px] h-[18px]" /></button>
              <button type="button" className={`icon-btn !rounded-lg hover:bg-soft text-muted hover:text-ubred ${armed === 'row-' + x.id ? '!text-ubred bg-ubred/10' : ''}`} onClick={() => remove(x)}
                aria-label={armed === 'row-' + x.id ? L(['Дахин дарж баталгаажуулна', 'Click again to confirm']) : L(['Устгах', 'Delete'])} title={armed === 'row-' + x.id ? L(['Дахин дарж баталгаажуулна', 'Click again to confirm']) : undefined}>
                <Icon name={armed === 'row-' + x.id ? 'triangle-alert' : 'trash-2'} className="w-[18px] h-[18px]" />
              </button>
            </span>
          </li>
        ))}</ul>
      ) : (
        <div className="card p-10 text-center text-muted"><span className="block w-8 h-8 mx-auto mb-3 opacity-60"><Icon name="inbox" className="w-8 h-8" /></span>{L(['Илэрц алга', 'Nothing here'])}</div>
      )}
    </>
  );
}
