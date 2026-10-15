'use client';
/* Засварлах цонхны талбарууд: schema.ts-ийн талбар бүрийн төрлөөр (bi, chips, image, rows ...). */
import { useEffect, useRef } from 'react';
import { errMsg } from '../cms';
import { uploadLogo, uploadPhoto } from '../images';
import { Bi, kit, L, Lang, MapViewInstance } from '../kit';
import { destinations, Field, ICON_SET, PALETTES, randomImage, RECIPES } from '../schema';
import { Html, Icon, useToast } from '../ui';

export type Doc = Record<string, any>;
export interface FieldProps { f: Field; doc: Doc; patch: (p: Doc) => void; lang: Lang }

const Label = ({ f }: { f: Field }) => (
  <span className="adm-label">{L(f[2])}{f[3]?.req && <> <span className="text-ubred">*</span></>}</span>
);

/** Монгол / англи хоёр утга: идэвхтэй хэлнийх нь л харагдана */
function BiInputs({ value, onChange, lang, multiline, rows = 3, small }: { value: Bi | undefined; onChange: (v: Bi) => void; lang: Lang; multiline?: boolean; rows?: number; small?: boolean }) {
  return (
    <>
      {(['mn', 'en'] as const).map((lg, i) => {
        const v = (value || [])[i] || '', ph = lg === 'mn' ? 'Монгол' : 'English';
        const set = (s: string) => { const a: Bi = Array.isArray(value) ? [...value] as Bi : ['', '']; a[i] = s; onChange(a); };
        const cls = 'field' + (small ? ' !text-[14px]' + (multiline ? '' : ' !h-10') : '');
        return multiline
          ? <textarea key={lg} className={cls} rows={small ? 2 : rows} value={v} placeholder={ph} hidden={lang !== lg} onChange={(e) => set(e.target.value)} />
          : <input key={lg} className={cls} value={v} placeholder={ph} hidden={lang !== lg} onChange={(e) => set(e.target.value)} />;
      })}
    </>
  );
}

function DestSelect({ value, onChange, small }: { value: unknown; onChange: (v: unknown) => void; small?: boolean }) {
  const cur = JSON.stringify(value || {}), opts = destinations();
  if (!opts.some(([v]) => v === cur)) opts.unshift([cur, cur]);
  return (
    <select className={'field' + (small ? ' !h-10 !text-[14px]' : '')} value={cur} onChange={(e) => { try { onChange(JSON.parse(e.target.value)); } catch { /* алгасна */ } }}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export function FieldView({ f, doc, patch, lang }: FieldProps) {
  const [k, type, , o = {}] = f, set = (v: unknown) => patch({ [k]: v });
  switch (type) {
    case 'bi': return <label className="block"><Label f={f} /><BiInputs value={doc[k]} onChange={set} lang={lang} /></label>;
    case 'bitext': return <label className="block"><Label f={f} /><BiInputs value={doc[k]} onChange={set} lang={lang} multiline rows={o.rows} /></label>;
    case 'chips': return (
      <div><Label f={f} /><div className="flex flex-wrap gap-2">{(o.options ? o.options() : []).map(([v, l, c]) => (
        <button key={v} type="button" className="chip !h-9" aria-pressed={doc[k] === v} onClick={() => set(v)}>{c && <i className="w-2 h-2 rounded-full" style={{ background: c }} />}{l}</button>
      ))}</div></div>
    );
    case 'number': return <label className="block"><Label f={f} /><input type="number" className="field" value={doc[k] ?? ''} onChange={(e) => set(e.target.value === '' ? null : +e.target.value)} /></label>;
    case 'range': return (
      <div><Label f={f} /><div className="flex items-center gap-4">
        <input type="range" min={0} max={100} className="flex-1 accent-[#145095]" value={doc[k] || 0} onChange={(e) => set(+e.target.value)} />
        <b className="tnum w-14 text-right text-[18px]">{doc[k] || 0}%</b>
      </div></div>
    );
    case 'date': case 'time': return <label className="block"><Label f={f} /><input type={type} className="field" value={doc[k] || ''} onChange={(e) => set(e.target.value)} /></label>;
    case 'datetime': return <label className="block"><Label f={f} /><input type="datetime-local" className="field" value={String(doc[k] || '').replace(' ', 'T')} onChange={(e) => set(e.target.value.replace('T', ' '))} /></label>;
    case 'url': return <label className="block"><Label f={f} /><input type="url" className="field" value={doc[k] || ''} placeholder="https://" onChange={(e) => set(e.target.value)} /></label>;
    case 'text': return <label className="block"><Label f={f} /><input className="field" value={doc[k] ?? ''} onChange={(e) => set(e.target.value)} /></label>;
    case 'dest': return <label className="block"><Label f={f} /><DestSelect value={doc[k]} onChange={set} /></label>;
    case 'color': return (
      <label className="block"><Label f={f} /><span className="flex items-center gap-3">
        <input type="color" className="w-14 h-11 rounded-lg border border-line bg-card p-1 cursor-pointer" value={/^#[0-9a-f]{6}$/i.test(doc[k] || '') ? doc[k] : '#145095'} onChange={(e) => set(e.target.value)} />
        <span className="text-[13px] text-muted">{L(['Сайт дээрх тэмдэглэгээ, шүүлтүүрийн өнгө', 'Used for labels and filters on the site'])}</span>
      </span></label>
    );
    case 'flags': return (
      <div><Label f={f} /><div className="rounded-xl border border-line divide-y divide-line">{(o.flags || []).map(([fk, fl]) => (
        <label key={fk} className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer">
          <span className="text-[14px] font-semibold">{L(fl)}</span>
          <input type="checkbox" className="adm-switch" checked={!!doc[fk]} onChange={(e) => patch({ [fk]: e.target.checked ? 1 : 0 })} />
        </label>
      ))}</div></div>
    );
    case 'icon': return (
      <div><Label f={f} /><div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">{ICON_SET.map((n) => (
        <button key={n} type="button" aria-label={n} aria-pressed={doc.i === n} onClick={() => patch({ i: n })}
          className={`aspect-square rounded-lg border grid place-items-center transition-colors ${doc.i === n ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}`}>
          <Icon name={n} className="w-[18px] h-[18px]" />
        </button>
      ))}</div></div>
    );
    case 'rows': return <div><Label f={f} /><RowsField f={f} rows={doc[k] || []} onChange={set} lang={lang} /></div>;
    case 'image': return <div><Label f={f} /><ImageField value={doc.img || 'skyline:day:1'} onChange={(img) => patch({ img })} /></div>;
    case 'logo': return <div><Label f={f} /><LogoField value={doc[k]} onChange={set} /></div>;
    case 'mappos': return <div><Label f={f} /><MapPosField x={doc.x} y={doc.y} onPick={(x, y) => patch({ x, y })} /></div>;
    default: return null;
  }
}

/* ---- Давтагдах мөрүүд: алхмууд, цэсийн холбоос, статистик ---- */
function RowsField({ f, rows, onChange, lang }: { f: Field; rows: Doc[]; onChange: (r: Doc[]) => void; lang: Lang }) {
  const o = f[3] || {}, mini = 'icon-btn !w-8 !h-8 !rounded-lg border border-line text-muted hover:text-ink disabled:opacity-30';
  const setRow = (ri: number, p: Doc) => onChange(rows.map((r, i) => (i === ri ? { ...r, ...p } : r)));
  const move = (ri: number, d: number) => { const a = [...rows], j = ri + d; [a[ri], a[j]] = [a[j], a[ri]]; onChange(a); };
  return (
    <div className="space-y-3">
      {rows.map((r, ri) => (
        <div key={ri} className="rounded-xl border border-line bg-soft/50 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[12.5px] font-bold text-muted tnum">#{ri + 1}</span>
            <span className="flex gap-1">
              <button type="button" className={mini} disabled={ri === 0} onClick={() => move(ri, -1)} aria-label={L(['Дээш', 'Move up'])}><Icon name="arrow-up" className="w-4 h-4" /></button>
              <button type="button" className={mini} disabled={ri === rows.length - 1} onClick={() => move(ri, 1)} aria-label={L(['Доош', 'Move down'])}><Icon name="arrow-down" className="w-4 h-4" /></button>
              <button type="button" className={mini + ' hover:!text-ubred'} onClick={() => onChange(rows.filter((_, i) => i !== ri))} aria-label={L(['Устгах', 'Remove'])}><Icon name="trash-2" className="w-4 h-4" /></button>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
            {(o.sub || []).map((sf) => <SubField key={sf[0]} f={sf} row={r} onPatch={(p) => setRow(ri, p)} lang={lang} />)}
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange([...rows, o.blank ? o.blank() : {}])}><Icon name="plus" className="w-4 h-4" />{L(o.add || ['Нэмэх', 'Add'])}</button>
    </div>
  );
}

function SubField({ f, row, onPatch, lang }: { f: Field; row: Doc; onPatch: (p: Doc) => void; lang: Lang }) {
  const [k, type, label, o = {}] = f, set = (v: unknown) => onPatch({ [k]: v });
  const wide = type === 'bitext' || type === 'dest' || type === 'url' ? 'sm:col-span-2' : '';
  let ctl = null;
  if (type === 'bi') ctl = <BiInputs value={row[k]} onChange={set} lang={lang} small />;
  else if (type === 'bitext') ctl = <BiInputs value={row[k]} onChange={set} lang={lang} multiline small />;
  else if (type === 'number') ctl = <input type="number" className="field !h-10 !text-[14px]" value={row[k] ?? ''} onChange={(e) => set(e.target.value === '' ? null : +e.target.value)} />;
  else if (type === 'url') ctl = <input type="url" className="field !h-10 !text-[14px]" value={row[k] || ''} placeholder="https://" onChange={(e) => set(e.target.value)} />;
  else if (type === 'select') ctl = <select className="field !h-10 !text-[14px]" value={row[k] || ''} onChange={(e) => set(e.target.value)}>{(o.options ? o.options() : []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
  else if (type === 'dest') ctl = <DestSelect value={row[k]} onChange={set} small />;
  else if (type === 'iconsel') ctl = (
    <span className="flex items-center gap-2">
      <span className="w-10 h-10 rounded-lg border border-line bg-card grid place-items-center shrink-0"><Icon name={row[k] || 'file-text'} /></span>
      <select className="field !h-10 !text-[14px]" value={row[k] || 'file-text'} onChange={(e) => set(e.target.value)}>
        {[...new Set([row[k] || 'file-text', ...ICON_SET])].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </span>
  );
  return <label className={'block ' + wide}><span className="block text-[12.5px] font-semibold text-muted mb-1">{L(label)}</span>{ctl}</label>;
}

/* ---- Зураг: кодоор зурдаг чимэглэл (сэдэв, өнгө, хувилбар) эсвэл оруулсан зураг ---- */
function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const toast = useToast();
  const parts = value.indexOf('media:') === 0 ? [] : value.split(':');
  const change = (i: number, v: string) => {
    const p = value.indexOf('media:') === 0 ? randomImage().split(':') : value.split(':');
    p[i] = v;
    onChange(`${p[0]}:${p[1] || 'day'}:${p[2] || randomImage().split(':')[2]}`);
  };
  const upload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const key = await uploadPhoto(file);
      if (!key) { toast(L(['Зураг хэт том байна', 'The image is too large']), 'triangle-alert'); return; }
      onChange(key);
      toast(L(['Зураг орууллаа', 'Photo uploaded']), 'image');
    } catch (e) { toast(errMsg(e), 'triangle-alert'); }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-4">
      <Html className="scene rounded-xl aspect-[16/10]" html={kit().Scene(value)} />
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">{Object.entries(RECIPES).map(([r, l]) => (
          <button key={r} type="button" className="chip !h-8 !px-3 !text-[12.5px]" aria-pressed={parts[0] === r} onClick={() => change(0, r)}>{L(l)}</button>
        ))}</div>
        <div className="flex flex-wrap gap-2">{Object.entries(PALETTES).map(([p, [a, b]]) => (
          <button key={p} type="button" aria-label={p} onClick={() => change(1, p)}
            className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-card ${parts[1] === p ? 'ring-ubblue' : 'ring-transparent'}`} style={{ background: `linear-gradient(135deg,${a},${b})` }} />
        ))}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => change(2, randomImage().split(':')[2])}><Icon name="shuffle" className="w-4 h-4" />{L(['Өөр хувилбар', 'Another version'])}</button>
          <label className="btn btn-sm btn-ghost cursor-pointer"><Icon name="upload" className="w-4 h-4" />{L(['Зураг оруулах', 'Upload photo'])}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>
      </div>
    </div>
  );
}

/* ---- Лого ---- */
function LogoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const toast = useToast(), src = kit().mediaSrc(value);
  const upload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const key = await uploadLogo(file);
      if (!key) { toast(L(['Лого хэт том байна', 'The logo is too large']), 'triangle-alert'); return; }
      onChange(key);
      toast(L(['Лого орууллаа. «Хадгалах»-ыг дарна уу.', 'Logo uploaded. Press Save.']), 'image');
    } catch (e) {
      toast((e as Error).name === 'EncodingError' ? L(['Энэ файлыг зураг болгож уншиж чадсангүй', 'Could not read this file as an image']) : errMsg(e), 'triangle-alert');
    }
  };
  return (
    <div className="flex items-center gap-4">
      <span className="org-logo w-[92px] h-[92px] !rounded-2xl">{src ? <img src={src} alt="" /> : <span className="text-muted"><Icon name="image-plus" className="w-7 h-7" stroke={1.6} /></span>}</span>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap gap-2">
          <label className="btn btn-sm btn-ghost cursor-pointer"><Icon name="upload" className="w-4 h-4" />{src ? L(['Лого солих', 'Replace logo']) : L(['Лого оруулах', 'Upload logo'])}
            <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {src && <button type="button" className="btn btn-sm btn-ghost !text-ubred" onClick={() => onChange('')}><Icon name="trash-2" className="w-4 h-4" />{L(['Устгах', 'Remove'])}</button>}
        </div>
        <p className="text-[12.5px] text-muted leading-snug">{L(['PNG, SVG эсвэл WebP. Ил тод (transparent) дэвсгэртэй лого хамгийн цэвэрхэн харагдана.', 'PNG, SVG or WebP. A logo with a transparent background looks best.'])}</p>
      </div>
    </div>
  );
}

/* ---- Газрын зураг дээрх байршил (сайтын MapView) ---- */
function MapPosField({ x, y, onPick }: { x?: number; y?: number; onPick: (x: number, y: number) => void }) {
  const host = useRef<HTMLDivElement>(null), map = useRef<MapViewInstance | null>(null);
  const pos = useRef({ x, y }), pick = useRef(onPick);
  pos.current = { x, y };
  pick.current = onPick;
  useEffect(() => {
    if (!host.current) return;
    map.current = new (kit().MapView)(host.current, {
      cluster: false,
      points: () => (pos.current.x != null ? [{ id: 'pos', x: pos.current.x, y: pos.current.y, c: '#D81E34', i: 'map-pin' }] : []),
      onPick: (px, py) => pick.current(Math.round(px), Math.round(py)),
    });
    return () => { map.current?.destroy(); map.current = null; };
  }, []);
  useEffect(() => { map.current?.recluster(true); }, [x, y]);
  return (
    <>
      <div ref={host} className="h-[260px] rounded-2xl overflow-hidden border border-line" />
      <p className="mt-2 text-[13px] text-muted">
        {x != null ? `${L(['Сонгосон байршил:', 'Selected:'])} ${L(kit().inDistrict(x, y || 0).n)}` : L(['Газрын зураг дээр дарж байршлыг сонгоно.', 'Tap the map to set the position.'])}
      </p>
    </>
  );
}
