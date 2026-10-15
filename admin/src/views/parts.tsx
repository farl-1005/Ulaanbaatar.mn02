'use client';
/* Жагсаалтын мөрийн хэсгүүд: жижиг зураг, товч мэдээлэл, тэмдэглэгээ. Сайтын төрхтэй хэсгийг kit-ээр зурна. */
import { Bi, kit, L, st } from '../kit';
import { Html, Icon } from '../ui';

const Dot = ({ c }: { c: string }) => <i className="w-2 h-2 rounded-full" style={{ background: c }} />;

export function Thumb({ col, x }: { col: string; x: any }) {
  const k = kit(), s = st();
  if ((col === 'news' || col === 'events') && x.zar) return <span className="w-[72px] h-12 rounded-lg bg-ubyellow/25 text-amberink grid place-items-center shrink-0"><Icon name="megaphone" /></span>;
  if (['news', 'events', 'mediaitems', 'banners'].includes(col)) return <Html as="span" className="scene w-[72px] h-12 rounded-lg shrink-0" html={k.Scene(x.img)} />;
  if (col === 'govsched') {
    const ty = s.GOV_TYPES[x.type] || s.GOV_TYPES.meeting, d = /^\d{4}-\d\d-\d\d$/.test(x.date || '') ? new Date(+x.date.slice(0, 4), +x.date.slice(5, 7) - 1, +x.date.slice(8, 10)) : null;
    return (
      <span className="w-12 h-12 rounded-xl grid place-items-center shrink-0 text-center leading-none" style={{ background: ty.c + '1a', color: ty.c }}>
        {d ? <span><b className="block text-[17px] tnum">{d.getDate()}</b><span className="block text-[10.5px] font-bold mt-0.5">{k.EN() ? k.EN_MON[d.getMonth()] : d.getMonth() + 1 + '-р сар'}</span></span> : <Icon name={ty.i || 'calendar'} />}
      </span>
    );
  }
  if (['rubrics', 'ecats', 'pcats'].includes(col)) return <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: (x.c || '#64748B') + '22', color: x.c || '#64748B' }}><Icon name={x.i || 'tag'} /></span>;
  if (col === 'orgs') return <Html as="span" className="contents" html={k.orgMark(x)} />;
  if (col === 'history') return <span className="w-14 h-11 rounded-xl bg-soft grid place-items-center shrink-0 font-extrabold tnum text-[14px]">{x.y || ''}</span>;
  if (col === 'projects') return <Html as="span" className="contents" html={k.projBadge({ ...x, p: x.p == null || x.p === '' ? null : Math.round(+x.p) }, 44, 4.5, 11)} />;
  return <span className="w-11 h-11 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center shrink-0"><Icon name={x.i || 'file-text'} /></span>;
}

export function Meta({ col, x }: { col: string; x: any }) {
  const k = kit(), s = st();
  switch (col) {
    case 'news': {
      const r = s.RUB[x.cat] || s.RUB.city, d = k.parseUB(x.d);
      return <><span className="inline-flex items-center gap-1.5"><Dot c={r.c} />{L(r.t)}</span><span>{d ? k.fDate(d) + ', ' + k.hhmm(d) : ''}</span><span className="inline-flex items-center gap-1 tnum"><Icon name="eye" className="w-3.5 h-3.5" />{k.num(x.views || 0)}</span></>;
    }
    case 'alerts': return <span className="truncate">{L(x.t)}</span>;
    case 'events': {
      const d = x.date ? k.evDate(k.dayOffset(x.date)) : k.evDate(x.w), c = s.ECAT[x.c] || s.ECAT.civic;
      return <><span className="inline-flex items-center gap-1.5"><Dot c={c.c} />{L(c.t)}</span><span>{k.fDate(d, true)}, {x.tm || ''}</span><span className="truncate">{L(x.v || ['', ''])}</span></>;
    }
    case 'projects': { const c = s.PCAT[x.c] || s.PCAT.transport; return <><span>{L(c.t)}</span><span>{k.bn(+x.bud || 0)}</span><span>{x.due || ''}</span></>; }
    case 'mediaitems': {
      const types: Record<string, Bi> = { video: ['Видео', 'Video'], live: ['Шууд', 'Live'], photo: ['Фото', 'Photo'], podcast: ['Подкаст', 'Podcast'], poster: ['Постер', 'Poster'] };
      return <><span>{types[x.type] ? L(types[x.type]) : ''}</span>{x.url && <span className="inline-flex items-center gap-1"><Icon name="link" className="w-3.5 h-3.5" />{L(['холбоостой', 'linked'])}</span>}</>;
    }
    case 'sits': return <span>{(x.steps || []).length} {L(['алхам', 'steps'])}</span>;
    case 'govsched': {
      const ty = s.GOV_TYPES[x.type] || s.GOV_TYPES.meeting, o = x.date ? k.dayOffset(x.date) : null;
      return <><span className="inline-flex items-center gap-1.5"><Dot c={ty.c} />{L(ty.t)}</span><span className="tnum">{x.date || ''} {x.from || ''}{x.to ? '–' + x.to : ''}</span>{x.off ? <span>{L(['Нуусан', 'Hidden'])}</span> : o != null && o < 0 ? <span>{L(['Болсон', 'Past'])}</span> : null}<span className="truncate">{L(x.place || ['', ''])}</span></>;
    }
    case 'banners': {
      const th = s.RAIL_THEMES[x.theme] || s.RAIL_THEMES.red;
      const state = x.off ? L(['Нуусан', 'Hidden']) : x.to && k.dayOffset(x.to) < 0 ? L(['Дууссан', 'Ended']) : x.from && k.dayOffset(x.from) > 0 ? L(['Хүлээгдэж буй', 'Scheduled']) : L(['Идэвхтэй', 'Active']);
      return <><span className="inline-flex items-center gap-1.5"><Dot c={th[0]} />{state}</span><span>{[x.from, x.to].filter(Boolean).join(' → ') || L(['Хугацаагүй', 'No end date'])}</span></>;
    }
    case 'docs': {
      const kinds: Record<string, Bi> = { res: ['Тогтоол', 'Resolution'], ord: ['Захирамж', 'Order'], tender: ['Тендер', 'Tender'] };
      return <><span>{kinds[x.kind] ? L(kinds[x.kind]) : ''}</span><span className="tnum">{x.no || ''}</span><span>{x.date || ''}</span></>;
    }
    case 'menu': return <span>{(x.items || []).length} {L(['холбоос', 'links'])}</span>;
    case 'faq': return <span className="truncate">{L(x.a || ['', '']).slice(0, 90)}</span>;
    case 'rubrics': return x.chip ? <span>{L(['Шүүлтүүрт харагдана', 'Shown as a filter'])}</span> : null;
    case 'citydata': return <span>{(x.pop || []).length} {L(['дүүрэг', 'districts'])} · {(x.budget || []).length} {L(['улирал', 'quarters'])} · {(x.roads || []).length} {L(['зам', 'roads'])}</span>;
    case 'orgs': return x.url ? <span className="truncate">{x.url}</span> : null;
    default: return <span>{L(x.d || ['', ''])}</span>;
  }
}

export function Badges({ col, x }: { col: string; x: any }) {
  const s = st(), b: [string, Bi][] = [];
  if (col === 'news') {
    if (x.id === s.HERO_ID) b.push(['b-red', ['Гол мэдээ', 'Lead']]);
    if (x.id === s.FEATURED_ID) b.push(['b-blue', ['Онцлох', 'Featured']]);
    if (x.br) b.push(['b-mute', ['Шуурхай', 'Latest feed']]);
    if (s.GOV.includes(x.id)) b.push(['b-mute', ['Засаг дарга', 'Governor']]);
    if (x.zar) b.push(['b-off', ['Зар', 'Notice']]);
    if (x.draft) b.push(['b-off', ['Ноорог', 'Draft']]);
  }
  if (col === 'alerts') b.push(x.off ? ['b-mute', ['Нуусан', 'Hidden']] : ['b-on', ['Идэвхтэй', 'Active']]);
  if (x._new) b.push(['b-on', ['Шинэ', 'New']]);
  else if (x._edited) b.push(['b-blue', ['Засварласан', 'Edited']]);
  return <>{b.map(([c, l]) => <span key={l[0]} className={`badge ${c}`}>{L(l)}</span>)}</>;
}
