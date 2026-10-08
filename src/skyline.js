/* ================= Header skyline: clean daytime Ulaanbaatar =================
   Flat light-blue strip for the white masthead. Two mountain ridges drift in
   seamless loops (different speeds = depth), clouds and a small flock cross,
   steam rises from the plant, a glint runs up the glass tower. */
function skylineSVG(pid) {
  let seed = 41;
  const r = () => { seed = (seed + 0x6D2B79F5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const f = (n) => Math.round(n * 10) / 10;
  const P = 640, H = 84;
  const ridge = (base, comps) => { let d = `M0 ${H}`; for (let x = 0; x <= P * 2; x += 4) { let y = base; comps.forEach(([a, c, ph]) => { y -= a * (0.5 + 0.5 * Math.sin((2 * Math.PI * c * x) / P + ph)); }); d += ` L${x} ${f(y)}`; } return `${d} L${P * 2} ${H} Z`; };
  const tints = ['sk-b1', 'sk-b2', 'sk-b3', 'sk-b4'];
  const winGrid = (x, y, w) => { let s = ''; for (let yy = y + 4; yy < H - 4; yy += 5.5) for (let xx = x + 2.5; xx <= x + w - 4.5; xx += 4.5) if (r() < 0.55) s += `<rect class="sk-win" x="${f(xx)}" y="${f(yy)}" width="2" height="2.6"/>`; return s; };
  const block = (x, w, h, tint) => `<rect class="${tint}" x="${f(x)}" y="${f(H - h)}" width="${f(w)}" height="${f(h)}"/>` + (r() < 0.6 ? winGrid(x, H - h, w) : '');
  const fill = (x0, x1, hMin, hMax) => { let s = '', x = x0; while (x < x1 - 6) { const w = Math.min(x1 - x, 12 + r() * 16), h = hMin + r() * (hMax - hMin); s += block(x, w, h, tints[Math.floor(r() * 4)]); x += w + (r() < 0.3 ? 1.5 : 0); } return s; };
  const sail = 'M300 84 V22 Q300 10 309 12 C 322 22 328 56 324 84 Z';
  let city = fill(30, 186, 16, 38);
  city += `<g><rect class="sk-b3" x="192" y="70" width="30" height="14"/><path class="sk-b4" d="M186 71 Q192 68 194 64 H220 Q222 68 228 71 Z"/><rect class="sk-b3" x="199" y="56" width="16" height="8"/><path class="sk-b4" d="M194 57 Q199 54 201 50 H213 Q215 54 220 57 Z"/><path d="M207 50 V44" stroke="#E7B04A" stroke-width="1.2"/><circle cx="207" cy="43" r="1.6" fill="#E7B04A"/><rect class="sk-win" x="204" y="75" width="6" height="9"/></g>`;
  city += fill(230, 298, 22, 46);
  city += `<g><path class="sk-acc" d="${sail}"/><g clip-path="url(#${pid}Sail)">${Array.from({ length: 8 }, (_, i) => `<path d="M298 ${74 - i * 8} H330" stroke="#fff" stroke-opacity=".16" stroke-width=".6"/>`).join('')}<path class="sk-shine" d="M296 70 L332 52 L332 60 L296 78 Z" fill="#fff" opacity=".45"/></g><path class="sk-stroke-acc" d="M303 12 V6" stroke-width="1"/><circle class="sk-beacon" cx="303" cy="5.5" r="1.5" fill="#E2445A"/></g>`;
  city += `<rect class="sk-acc2" x="328" y="30" width="14" height="54"/>${winGrid(328, 30, 14)}`;
  city += fill(344, 358, 26, 34);
  city += `<g><rect class="sk-b3" x="360" y="62" width="50" height="22"/><path class="sk-b4" d="M372 62 L385 55 L398 62 Z"/>${Array.from({ length: 7 }, (_, i) => `<rect class="sk-win" x="${f(364 + i * 6.6)}" y="65" width="2.2" height="17"/>`).join('')}</g>`;
  city += fill(412, 426, 18, 28);
  city += `<g><rect class="sk-b2" x="426" y="66" width="26" height="18"/><rect class="sk-b3" x="430" y="30" width="5" height="54"/><rect class="sk-b3" x="441" y="24" width="5" height="60"/>${[[430, 30], [441, 24]].map(([cx, cy]) => `<rect x="${cx}" y="${cy}" width="5" height="4" fill="#E2445A" opacity=".75"/><rect x="${cx}" y="${cy + 8}" width="5" height="4" fill="#E2445A" opacity=".45"/>`).join('')}<circle class="sk-steam" cx="432.5" cy="26" r="3.2"/><circle class="sk-steam" cx="443.5" cy="20" r="3.4" style="animation-delay:-2.4s"/><circle class="sk-steam" cx="443.5" cy="20" r="3" style="animation-delay:-4.1s"/></g>`;
  city += fill(454, 612, 14, 40);
  const cloud = (y, w, dur, delay) => `<g class="sk-cloud-g" style="animation-duration:${dur}s;animation-delay:-${delay}s"><ellipse class="sk-cloud" cx="0" cy="${y}" rx="${w / 2}" ry="${f(w * 0.12)}"/><ellipse class="sk-cloud" cx="${f(-w * 0.14)}" cy="${f(y - w * 0.1)}" rx="${f(w * 0.2)}" ry="${f(w * 0.14)}"/><ellipse class="sk-cloud" cx="${f(w * 0.12)}" cy="${f(y - w * 0.12)}" rx="${f(w * 0.24)}" ry="${f(w * 0.16)}"/></g>`;
  const sky = `<g class="sk-sun-g"><circle cx="540" cy="24" r="16" class="sk-sun" opacity=".25"/><circle cx="540" cy="24" r="7.5" class="sk-sun"/></g>` + cloud(24, 60, 70, 10) + cloud(36, 44, 52, 34)
    + `<g class="sk-flock">${[[0, 0], [8, -3], [15, 2], [23, -2]].map(([x, y], i) => `<path class="sk-bird sk-stroke" style="animation-delay:-${(i * 0.12).toFixed(2)}s" d="M${x} ${26 + y} q2 -2.2 4 0 q2 -2.2 4 0" fill="none" stroke-width=".9" stroke-linecap="round"/>`).join('')}</g>`;
  const far = `<path class="sk-m1 sk-roll" style="animation-duration:96s" d="${ridge(56, [[18, 2, 0.4], [8, 3, 1.9], [4, 7, 0.7]])}"/>`;
  const near = `<path class="sk-m2 sk-roll" style="animation-duration:58s" d="${ridge(68, [[13, 3, 2.2], [6, 5, 0.3], [3, 9, 1.4]])}"/>`;
  const layer = (depth, delay, body) => `<g data-depth="${depth}"><g${delay == null ? '' : ` class="sk-rise" style="animation-delay:${delay}s"`}>${body}</g></g>`;
  return `<svg class="absolute inset-0 w-full h-full" viewBox="0 0 640 84" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs><clipPath id="${pid}Sail"><path d="${sail}"/></clipPath></defs>${layer(0.25, null, sky)}${layer(0.4, 0, far)}${layer(0.6, 0.12, near)}${layer(1, 0.24, city)}</svg>`;
}
function watchSky(el) { if (el && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => el.classList.toggle('sk-paused', !en.isIntersecting)).observe(el); }
function setupSkyline() {
  const m = $('#hdr-scene');
  if (m && !m.dataset.built) { m.innerHTML = skylineSVG('skm'); m.dataset.built = '1'; watchSky(m); }
  if (reduced || setupSkyline.bound) return;
  setupSkyline.bound = true;
  let tx = 0, cx = 0, raf = 0;
  const loop = () => { cx += (tx - cx) * 0.06; $$('#hb-sky [data-depth]').forEach((l) => { l.style.transform = `translateX(${(cx * +l.dataset.depth).toFixed(2)}px)`; }); raf = Math.abs(tx - cx) > 0.03 ? requestAnimationFrame(loop) : 0; };
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' || scrollY > 220 || S.a11y) return; tx = (e.clientX / innerWidth - 0.5) * -16; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
}
