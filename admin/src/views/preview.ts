/* Засаж буй бичлэг сайт дээр хэрхэн харагдахыг сайтын өөрийн функцээр (kit) зурна: HTML мөр. */
import { Bi, kit, L, st } from '../kit';
import { SCHEMA } from '../schema';

export function previewHtml(col: string, d: Record<string, any>): string {
  const k = kit(), s = st(), esc = (x: unknown) => k.esc(x);
  const ph = L(['Гарчиг энд харагдана', 'Your headline appears here']);
  const tt = (a: Bi | undefined): Bi => (a && (a[0] || a[1]) ? a : [ph, ph]);
  switch (col) {
    case 'news': return k.newsCard({ ...d, id: 'prev', ago: 1, views: +d.views || 0, t: tt(d.t), l: d.l || ['', ''] }, false);
    case 'events': { const w = k.dayOffset(d.date); return k.evCard({ ...d, id: 'prev', w, d: k.evDate(w), t: tt(d.t), v: d.v || ['', ''] }); }
    case 'services': return k.svcTile({ ...d, id: 'prev', t: tt(d.t), d: d.d || ['', ''] });
    case 'projects': {
      const c = s.PCAT[d.c] || s.PCAT.transport;
      return `<div class="card p-4 flex items-center gap-3">${k.pctRing(Math.round(+d.p || 0), 56, 6, c.c, 13)}<div class="min-w-0"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug">${esc(L(tt(d.n)))}</p><p class="text-[12.5px] text-muted">${k.bn(+d.bud || 0)}, ${d.due || ''}</p></div></div>`;
    }
    case 'alerts': return `<div class="ticker rounded-xl p-3 flex items-start gap-2 text-[14px]">${k.ic(d.i || 'triangle-alert', 'w-4 h-4 mt-0.5')}<span><b>${esc(L(tt(d.k)))}.</b> ${esc(L(d.t || ['', '']))}</span></div>`;
    case 'govsched': {
      const x: Record<string, any> = { id: 'prev', type: 'meeting', from: '', place: ['', ''], d: ['', ''], ...d, t: tt(d.t) };
      return /^\d{4}-\d\d-\d\d$/.test(x.date || '') ? `<ol class="gov-list">${k.govRow(x, k.govState(x), 0)}</ol>` : '';
    }
    case 'banners': return `<div class="w-[212px] mx-auto"><div class="rail-stack">${k.railCard({ ...d, t: tt(d.t) }, { on: true, preview: true })}</div></div>`;
    case 'mediaitems': return `<div class="card overflow-hidden"><div class="scene aspect-[16/10]">${k.Scene(d.img)}</div><div class="p-4"><p class="text-[12px] font-bold text-muted uppercase">${esc(d.type || '')}</p><p class="mt-1 font-bold leading-snug">${esc(L(tt(d.t)))}</p><p class="text-[13px] text-muted">${esc(L(d.d || ['', '']))}</p></div></div>`;
    case 'orgs': return `<div class="max-w-[300px]">${k.orgTile({ ...d, t: tt(d.t) })}</div>`;
    case 'rubrics': case 'ecats': case 'pcats':
      return `<span class="chip"><i class="w-2 h-2 rounded-full" style="background:${esc(d.c || '#145095')}"></i>${esc(L(tt(d.t)))}</span>`;
    default: {
      const sc = SCHEMA[col];
      return `<div class="card p-4 flex items-start gap-3"><span class="w-10 h-10 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center shrink-0">${k.ic(d.i || sc.icon, 'w-5 h-5')}</span><div class="min-w-0"><p class="font-bold leading-snug">${esc(sc.title(d) || L(['Нэр энд харагдана', 'The name appears here']))}</p>${d.d && L(d.d) ? `<p class="text-[13px] text-muted mt-1">${esc(L(d.d))}</p>` : ''}${Array.isArray(d.steps) ? `<p class="text-[13px] text-muted mt-1">${d.steps.length} ${L(['алхам', 'steps'])}</p>` : ''}</div></div>`;
    }
  }
}
