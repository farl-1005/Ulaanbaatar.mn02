'use client';
/* Хянах самбар: товч тоо, сүүлийн өөрчлөлтүүд, хамгийн их уншсан мэдээ */
import { cms, useCms } from '../cms';
import { Bi, kit, L } from '../kit';
import { navLabel } from '../schema';
import { Icon } from '../ui';

function Kpi({ icon, v, l, sub, onClick }: { icon: string; v: string | number; l: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" className="card p-5 text-left hover:border-ink/25 transition-colors" onClick={onClick}>
      <span className="w-10 h-10 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center"><Icon name={icon} /></span>
      <p className="mt-4 text-[30px] font-extrabold tnum leading-none tracking-tight">{v}</p>
      <p className="mt-1.5 text-[13.5px] font-semibold">{l}</p>
      <p className="text-[12.5px] text-muted">{sub}</p>
    </button>
  );
}

const ACTION: Record<string, Bi> = { create: ['нэмлээ', 'added'], update: ['засварлалаа', 'edited'], delete: ['устгалаа', 'deleted'], revert: ['анхны хувилбарт буцаалаа', 'reverted'] };

export function Dashboard({ go, add, edit }: { go: (v: string) => void; add: (col: string) => void; edit: (col: string, id: string) => void }) {
  const { log } = useCms(), k = kit();
  const news = cms.merged('news'), pub = news.filter((n) => !n.draft), drafts = news.length - pub.length;
  const views = pub.reduce((a, n) => a + (+n.views || 0), 0), alerts = cms.merged('alerts'), active = alerts.filter((a) => !a.off).length;
  const upcoming = cms.merged('events').filter((e) => (e.date ? k.dayOffset(e.date) : typeof e.w === 'number' ? e.w : 0) >= 0).length;
  const projs = cms.merged('projects'), known = projs.filter((p) => p.p != null && p.p !== '');
  const avg = known.length ? Math.round(known.reduce((a, p) => a + (+p.p || 0), 0) / known.length) : 0;   // гүйцэтгэл мэдэгдэх төслүүдээр
  const top = pub.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5), maxV = Math.max(1, ...top.map((n) => +n.views || 0));

  return (
    <>
      <div className="rounded-[8px] bg-navy text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <p className="text-white/65 text-[14px]">{k.fDate(k.today(), true)}</p>
            <h2 className="mt-1 text-[26px] sm:text-[30px] font-extrabold tracking-tight">{L(['Сайн байна уу', 'Hello'])}</h2>
            <p className="mt-2 text-white/70 max-w-[56ch]">{L(['Мэдээ, анхааруулга, гарчиг, тохиргоог эндээс засна. Хадгалсан даруйд сайт шинэчлэгдэнэ.', 'Edit stories, alerts, headings and settings here. The site updates as soon as you save.'])}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn bg-white text-[#0B1D45] hover:bg-white/90" onClick={() => add('news')}><Icon name="plus" className="w-[18px] h-[18px]" />{L(['Мэдээ нэмэх', 'New story'])}</button>
            <button type="button" className="btn bg-white/10 hover:bg-white/15 text-white" onClick={() => add('alerts')}><Icon name="siren" className="w-[18px] h-[18px]" />{L(['Анхааруулга', 'Alert'])}</button>
            <button type="button" className="btn bg-white/10 hover:bg-white/15 text-white" onClick={() => go('texts')}><Icon name="type" className="w-[18px] h-[18px]" />{L(['Гарчиг засах', 'Edit headings'])}</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon="newspaper" v={pub.length} l={L(['Нийтлэгдсэн мэдээ', 'Published stories'])} sub={drafts ? L([`${drafts} ноорог`, `${drafts} drafts`]) : L(['Ноорог алга', 'No drafts'])} onClick={() => go('news')} />
        <Kpi icon="eye" v={k.num(views)} l={L(['Нийт үзэлт', 'Total views'])} sub={L(['Нийтлэгдсэн мэдээнүүдийн', 'Across published stories'])} onClick={() => go('news')} />
        <Kpi icon="siren" v={active} l={L(['Идэвхтэй анхааруулга', 'Active alerts'])} sub={L([`Нийт ${alerts.length}`, `${alerts.length} total`])} onClick={() => go('alerts')} />
        <Kpi icon="hard-hat" v={avg + '%'} l={L(['Төслийн дундаж явц', 'Avg project progress'])} sub={L([`${projs.length} төсөл, ${upcoming} арга хэмжээ`, `${projs.length} projects, ${upcoming} events`])} onClick={() => go('projects')} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h3 className="font-bold flex items-center gap-2"><Icon name="history" className="w-[18px] h-[18px]" />{L(['Сүүлийн өөрчлөлтүүд', 'Recent changes'])}</h3>
          {log.length ? (
            <ul className="mt-2 divide-y divide-line">{log.slice(0, 10).map((e, i) => {
              const mins = Math.max(0, Math.round((Date.now() - new Date(e.at).getTime()) / 60000));
              return (
                <li key={i} className="flex gap-3 py-3">
                  <span className="w-9 h-9 rounded-lg bg-soft grid place-items-center text-muted shrink-0"><Icon name={e.action === 'delete' ? 'trash-2' : e.action === 'create' ? 'plus' : 'pencil-line'} className="w-4 h-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-[14px] leading-snug"><b>{L(['Админ', 'Admin'])}</b> {L(navLabel(e.col)).toLowerCase()}: «{e.title || e.id}» {L(ACTION[e.action] || ACTION.update)}</span>
                    <span className="block text-[12.5px] text-muted">{k.ago(mins)}</span>
                  </span>
                </li>
              );
            })}</ul>
          ) : <p className="mt-4 text-[14px] text-muted">{L(['Одоогоор өөрчлөлт хийгдээгүй байна. Эхний мэдээгээ нэмээд үзээрэй.', 'No changes yet. Try adding your first story.'])}</p>}
        </div>
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-bold flex items-center gap-2"><Icon name="trending-up" className="w-[18px] h-[18px]" />{L(['Хамгийн их уншсан', 'Most read'])}</h3>
          <ul className="mt-4 space-y-3">{top.map((n) => (
            <li key={n.id}><button type="button" className="w-full text-left" onClick={() => edit('news', n.id)}>
              <span className="flex justify-between gap-3 text-[13.5px]"><span className="truncate font-semibold min-w-0">{L(n.t)}</span><b className="tnum">{k.num(n.views || 0)}</b></span>
              <span className="mt-1.5 block h-1.5 rounded-full bg-line overflow-hidden"><span className="block h-full rounded-full bg-ubblue" style={{ width: `${((+n.views || 0) / maxV) * 100}%` }} /></span>
            </button></li>
          ))}</ul>
        </div>
      </div>
    </>
  );
}
