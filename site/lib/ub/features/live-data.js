import { renderReact } from '../core/bridge.js';
import { $$ } from '../core/helpers.js';
import { S } from '../core/state.js';
import { ubNow } from '../core/time.js';
import { INCOMING } from '../data/news.js';
import { rollTo } from '../sections/city-data.js';
/* ================= Live data ================= */
export function pushBreaking() {
  if (S.incoming >= INCOMING.length) return;
  const n = INCOMING[S.incoming++];
  S.breaking.forEach((b) => { b.fresh = false; });
  S.breaking.unshift({ id: n.id, ts: ubNow(), fresh: true });
  S.brkNew = n.id; renderReact();   // site/app/home/Hero.tsx
}
/* data-roll-тэй (Хотын өгөгдөл) бол цифр эргэлдэнэ, бусад нь шууд солигдоно */
export function setLive(key, v) { $$(`[data-live="${key}"]`).forEach((el) => { if (el.hasAttribute('data-roll')) rollTo(el, v); else el.textContent = v; }); }
