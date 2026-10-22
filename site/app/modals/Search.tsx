'use client';
/* Хайлтын цонх (command palette): openSearch() (src/core/search.js) нээнэ. Өгөгдөл: searchData() → ub.home.search().
   Талбар (#sq) хяналтгүй (uncontrolled): бичсэн утгыг React дарж бичихгүй, тиймээс тэмдэгт алдагдахгүй. Бичихэд SQ.q шинэчлэгдэнэ (HOME.searchInput).
   Товчнууд (data-act="sq" | "sq-scope" | "sq-clear" | "sq-recent-del" | "sq-ai" | "sgo") ба ↑ ↓ Enter, Ctrl+K-г features/wiring.js барина. */
import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import { Icon, type UB } from '../ub';

type Part = [string, boolean];
interface SqRow { k: number; type: string; id: string; i: string; cls: string; title: Part[]; sub: Part[] }
interface SearchData {
  q: string; idx: number; n: number; ph: string; label: string; close: string;
  scopes: { v: string; i: string; label: string; on: boolean; n: string }[];
  home: {
    recent: string[];
    top: { id: string; i: string; title: string; mode: string }[];
    pop: string[];
    acts: { v: string; i: string; label: string }[];
  } | null;
  groups: { type: string; label: string; n: number; rows: SqRow[] }[];
  none: { title: string; hint: string } | null;
}

const Head = ({ children }: { children: ReactNode }) => <p className="px-2 pt-3 pb-2 text-[12.5px] font-bold text-muted">{children}</p>;
const Hl = ({ parts }: { parts: Part[] }) => <>{parts.map(([s, m], i) => (m ? <mark key={i} className="sq-mark">{s}</mark> : s))}</>;

export function Search({ ub }: { ub: UB }) {
  const d = ub.home.search() as SearchData, { L } = ub;
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => {   // бичих бүрт (IME-ийн дунд ч) SQ.q шинэчлэгдэнэ; фокус (Modal.tsx-ээс гадна, хуучин шиг 60мс-ийн дараа)
    const el = inp.current; if (!el) return;
    const h = () => ub.home.searchInput(el.value);
    el.addEventListener('input', h);
    const tm = setTimeout(() => { try { el.focus(); } catch { /* ignore */ } }, 60);
    return () => { el.removeEventListener('input', h); clearTimeout(tm); };
  }, [ub]);
  const acts = ['bg-ubred/10 text-ubred hover:bg-ubred/15', 'bg-ubblue/10 text-ubblue hover:bg-ubblue/15'];
  return (
    <>
      <div className="sticky top-0 z-10 bg-card">
        <div className="flex items-center gap-3 px-4 sm:px-5 h-16 border-b border-line">
          <Icon ub={ub} n="search" c="w-[22px] h-[22px] text-ubblue" />
          <input ref={inp} data-autofocus id="sq" type="search" defaultValue={d.q} placeholder={d.ph} className="sq-input flex-1 min-w-0 h-full bg-transparent text-[17px] sm:text-[18px] font-semibold placeholder:text-muted/70 placeholder:font-medium" autoComplete="off" spellCheck={false} aria-label={d.label} />
          <button type="button" id="sq-clear" className={`${d.q ? '' : 'hidden'} w-8 h-8 grid place-items-center rounded-full bg-soft hover:bg-line text-muted`} data-act="sq-clear" aria-label={L(['Арилгах', 'Clear'])}><Icon ub={ub} n="x" c="w-4 h-4" /></button>
          <button type="button" className="sm:hidden text-[15px] font-semibold text-ubblue px-1" data-act="modal-close">{L(['Болих', 'Cancel'])}</button>
          <span className="hidden sm:inline-flex"><button type="button" className="sq-kbd !h-7 !px-2" data-act="modal-close" aria-label={d.close}>Esc</button></span>
        </div>
        <div id="sscope" className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 sm:px-5 py-2.5 border-b border-line">
          {d.scopes.map((s) => (
            <button key={s.v} type="button" className="chip !h-8 !px-3 !text-[13px] shrink-0" data-act="sq-scope" data-v={s.v} aria-pressed={s.on}>
              <Icon ub={ub} n={s.i} c="w-4 h-4" />{s.label}{s.n ? <span className="tnum opacity-60">{s.n}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <div id="sres" className="p-2 sm:p-3 sm:max-h-[min(520px,58vh)] overflow-auto thin-scroll"
        onMouseMove={(e) => { const r = (e.target as HTMLElement).closest<HTMLElement>('[data-k]'); if (r) ub.home.searchHover(+r.dataset.k!); }}>
        {/* key: sqRender() бүрт шинэ DOM → мөрүүдийн sq-in хөдөлгөөн хуучин шиг дахин тоглоно (хулгана, ↑ ↓ дээр биш) */}
        <Body key={d.n} ub={ub} d={d} acts={acts} />
      </div>
      <div className="hidden sm:flex items-center gap-5 px-5 py-2.5 border-t border-line text-[12px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="sq-kbd">↑</span><span className="sq-kbd">↓</span>{L(['сонгох', 'move'])}</span>
        <span className="inline-flex items-center gap-1.5"><span className="sq-kbd">↵</span>{L(['нээх', 'open'])}</span>
        <span className="inline-flex items-center gap-1.5"><span className="sq-kbd">Esc</span>{L(['хаах', 'close'])}</span>
        <span className="ml-auto inline-flex items-center gap-1.5">{L(['Хаанаас ч', 'Anywhere'])}<span className="sq-kbd">Ctrl</span><span className="sq-kbd">K</span></span>
      </div>
    </>
  );
}

function Body({ ub, d, acts }: { ub: UB; d: SearchData; acts: string[] }) {
  const { L } = ub;
  if (d.home) {
    const h = d.home;
    return (
      <>
        {h.recent.length ? (
          <>
            <Head>{L(['Сүүлийн хайлт', 'Recent'])}</Head>
            <div className="flex flex-wrap gap-2 px-2">
              {h.recent.map((r) => (
                <span key={r} className="chip !h-8 !pl-3 !pr-1 !text-[13px]">
                  <button type="button" className="inline-flex items-center gap-1.5" data-act="sq" data-v={r}><Icon ub={ub} n="history" c="w-4 h-4 text-muted" />{r}</button>
                  <button type="button" className="w-6 h-6 grid place-items-center rounded-full hover:bg-soft text-muted" data-act="sq-recent-del" data-v={r} aria-label={L(['Устгах', 'Remove'])}><Icon ub={ub} n="x" c="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          </>
        ) : null}
        <Head>{L(['Түгээмэл үйлчилгээ', 'Popular services'])}</Head>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
          {h.top.map((s) => (
            <button key={s.id} type="button" className="flex items-center gap-3 p-3 rounded-xl border border-line text-left hover:bg-soft hover:border-ink/20 transition-colors" data-act="sgo" data-type="svc" data-id={s.id}>
              <span className="w-9 h-9 rounded-lg bg-ubblue/10 text-ubblue grid place-items-center shrink-0"><Icon ub={ub} n={s.i} c="w-[18px] h-[18px]" /></span>
              <span className="min-w-0"><b className="block text-[14px] truncate">{s.title}</b><span className="block text-[12.5px] text-muted truncate">{s.mode}</span></span>
            </button>
          ))}
        </div>
        <Head>{L(['Түгээмэл хайлт', 'Popular searches'])}</Head>
        <div className="flex flex-wrap gap-2 px-2">
          {h.pop.map((p, i) => <button key={i} type="button" className="chip !h-8 !text-[13px]" data-act="sq" data-v={p}><Icon ub={ub} n="trending-up" c="w-4 h-4 text-muted" />{p}</button>)}
        </div>
        <Head>{L(['Шуурхай үйлдэл', 'Quick actions'])}</Head>
        <div className="grid grid-cols-2 gap-2 px-2 pb-2">
          {h.acts.map((a, k) => (
            <button key={a.v} type="button" className={`flex items-center gap-2.5 min-h-[44px] py-2 px-3 rounded-xl text-[13.5px] font-semibold text-left transition-colors ${acts[k] || 'bg-soft hover:bg-line'}`} data-act="sgo" data-type="act" data-id={a.v}>
              <Icon ub={ub} n={a.i} c="w-[18px] h-[18px]" /><span className="leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  if (d.none) {
    return (
      <div className="py-10 px-4 text-center sq-in">
        <span className="w-14 h-14 mx-auto rounded-2xl bg-soft grid place-items-center text-muted"><Icon ub={ub} n="search-x" c="w-7 h-7" /></span>
        <p className="mt-4 font-bold text-[16px]">{d.none.title}</p>
        <p className="mt-1 text-[14px] text-muted">{d.none.hint}</p>
        <button type="button" className="btn btn-ink mt-5" data-act="sq-ai"><Icon ub={ub} n="sparkles" c="w-[18px] h-[18px]" />{L(['AI туслахаас асуух', 'Ask the AI assistant'])}</button>
      </div>
    );
  }
  return (
    <>
      {d.groups.map((g) => (
        <Fragment key={g.type}>
          <Head>{g.label} <span className="tnum font-semibold">{g.n}</span></Head>
          {g.rows.map((x) => (
            <button key={x.k} type="button" className="sq-row sq-in" style={{ animationDelay: `${Math.min(x.k * 14, 160)}ms` }} data-act="sgo" data-type={x.type} data-id={x.id} data-k={x.k} aria-selected={x.k === d.idx}>
              <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${x.cls}`}><Icon ub={ub} n={x.i} c="w-5 h-5" /></span>
              <span className="min-w-0 flex-1"><b className="block text-[15px] leading-snug truncate"><Hl parts={x.title} /></b><span className="block text-[13px] text-muted truncate"><Hl parts={x.sub} /></span></span>
              <span className="sq-enter hidden sm:inline-flex items-center gap-1 text-[12px] text-muted">{L(['Нээх', 'Open'])}<span className="sq-kbd">↵</span></span>
            </button>
          ))}
        </Fragment>
      ))}
    </>
  );
}
