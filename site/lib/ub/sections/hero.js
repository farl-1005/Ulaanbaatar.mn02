import { Scene } from '../art/scene.js';
import { esc } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { ALL_SVC, L, NEWS_BY, S, t } from '../core/state.js';
import { Lf, ago, dkey, hhmm, num, pad, today, ubNow } from '../core/time.js';
import { GOV, HERO_ID, NEWS, RUB } from '../data/news.js';
/* ================= Hero ================= */
export function rubTag(n) { const r = RUB[n.cat]; return `<span class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${r.c}"></i>${esc(L(r.t))}</span>`; }
/* Нүүрний эхний хэсгийг (гол мэдээ, шуурхай мэдээ, Засаг даргын мэдээ, түгээмэл үйлчилгээ) site/app/home/Hero.tsx зурна.
   Энэ функц түүнд хэрэгтэй бүх өгөгдлийг (текст нь сонгосон хэлээр) бэлдэнэ. */
export function heroData() {
  const m = NEWS_BY[HERO_ID]; if (!m) return null;
  const rub = (n) => RUB[n.cat] || RUB.city;
  const rel = (m.rel || []).map((id) => NEWS_BY[id]).filter((x) => x && x.id !== m.id);
  NEWS.forEach((n) => { if (rel.length < 3 && n.id !== m.id && !n.zar && !rel.includes(n)) rel.push(n); });
  const card = (n) => ({ id: n.id, title: L(n.t), scene: Scene(n.img), rub: L(rub(n).t), rubColor: rub(n).c, ago: ago(n.ago), views: num(n.views || 0) });
  const mins = m.mins || Math.max(1, Math.ceil((String((m.l || [''])[0]).length + (m.b || []).reduce((a, p) => a + String(p[0] || '').length, 0)) / 900));
  const now = ubNow();
  const mode = (x) => (x === 'off' ? ['bg-ubamber', t('inperson')] : x === 'sys' ? ['bg-ubblue', t('system')] : ['bg-ubgreen', t('online')]);
  return {
    main: Object.assign(card(m), { lead: Lf(m.l), minRead: t('minRead', { n: mins }) }),
    rel: rel.map(card),
    breaking: S.breaking.map((b) => {
      const n = NEWS_BY[b.id], hot = Math.round((now - b.ts) / 60000) < 30;
      return { id: n.id, title: L(n.t), rub: L(rub(n).t), dot: hot ? 'rgb(var(--c-red))' : rub(n).c, hot, fresh: !!b.fresh, isNew: b.id === S.brkNew,
        time: dkey(b.ts) === dkey(today()) ? hhmm(b.ts) : (b.ts.getMonth() + 1) + '/' + pad(b.ts.getDate()) };
    }),
    gov: GOV.map((id) => NEWS_BY[id]).filter(Boolean).map((g) => ({ id: g.id, title: L(g.t), ago: ago(g.ago) })),
    quick: QUICK.map((id) => ALL_SVC.find((x) => x.id === id)).filter(Boolean).map((x) => { const [dot, label] = mode(x.m); return { id: x.id, i: x.i, title: L(x.t), dot, mode: label }; }),
  };
}
HOME.hero = heroData;
export const QUICK = ['c2', 'c3', 'c4', 'c8', 'c1', 'c5', 'b1', 'e1'];
