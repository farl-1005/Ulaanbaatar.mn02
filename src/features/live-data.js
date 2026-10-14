/* ================= Live data ================= */
function pushBreaking() {
  if (S.incoming >= INCOMING.length) return;
  const n = INCOMING[S.incoming++];
  S.breaking.forEach((b) => { b.fresh = false; });
  S.breaking.unshift({ id: n.id, ts: ubNow(), fresh: true });
  const l = $('#brk-list'); if (l) { l.innerHTML = breakingHTML(n.id); l.scrollTop = 0; }
}
/* data-roll-тэй (Хотын өгөгдөл) бол цифр эргэлдэнэ, бусад нь шууд солигдоно */
function setLive(key, v) { $$(`[data-live="${key}"]`).forEach((el) => { if (el.hasAttribute('data-roll')) rollTo(el, v); else el.textContent = v; }); }
