/* ================= Header skyline: monoline Ulaanbaatar =================
   Editorial line drawing in three weights: --sk-ink landmarks > --sk-ink2 ridges/blocks > --sk-ink3 hatching.
   Bogd Khan ridge, ger hills, Gandan temple, Blue Sky Tower, Government Palace, Zaisan ring.
   Outlines carry the card colour as fill, so nearer shapes hide the lines behind them.
   Colour stays minimal: red beacon + gold finial by day; at night (.sk-nt) a crescent moon, stars and warm lights.
   Layers rise in once (transform/opacity only). viewBox is 800 wide so the 11:1 tablet band crops only
   ~12 units off the top; landmarks sit in x 198-617, y >= 21. Every id is prefixed with pid. */
function skylineSVG(pid) {
  const f = (n) => Math.round(n * 10) / 10, G = 86, u = (id) => `url(#${pid}${id})`;   // ground just under the frame: lines run into the red rule
  const P = (c, d, a = '') => `<path class="${c}" d="${d}"${a}/>`;
  const up = (t, body) => `<g class="sk-up" style="animation-delay:${t}s">${body}</g>`;   // one-shot entrance
  const hill = (x0, x1, h) => { const y = (x) => G - h * (0.5 - 0.5 * Math.cos((2 * Math.PI * (x - x0)) / (x1 - x0))); let d = `M${x0} ${G}`; for (let x = x0 + 5; x < x1; x += 5) d += `L${x} ${f(y(x))}`; return { d: `${d}L${x1} ${G}Z`, y }; };
  const rows = (x0, x1, y0, dy) => { let d = ''; for (let y = y0; y < 84; y += dy) d += `M${x0} ${f(y)}H${x1}`; return d; };
  const cols = (x0, n, dx, y0, y1) => Array.from({ length: n }, (_, i) => `M${f(x0 + i * dx)} ${y0}V${y1}`).join('');
  const wash = (d) => P('sk-ln2', d, ` style="fill:${u('R')}"`);   // ridge/hill: opaque mist-to-card wash hides what is behind
  const ger = (h, x, k) => { const y = f(h.y(x) + 1.6), p = (dx, dy) => `${f(x + dx * k)} ${f(y - dy * k)}`;
    return P('sk-ln sk-o', `M${p(-7, 0)}V${f(y - 3.4 * k)}Q${p(-4, 6.4)} ${p(-1.2, 6.9)}H${f(x + 1.2 * k)}Q${p(4, 6.4)} ${p(7, 3.4)}V${y}Z`)
      + P('sk-hat sk-gd', `M${p(-7, 3.4)}H${f(x + 7 * k)}M${p(-1.3, 0)}V${f(y - 2.4 * k)}H${f(x + 1.3 * k)}V${y}`); };   // door glows at night
  const cres = (cx, cy, R, dx, dy, r) => { const d = Math.hypot(dx, dy), a = (R * R - r * r + d * d) / (2 * d), h = Math.sqrt(R * R - a * a), px = cx + (a * dx) / d, py = cy + (a * dy) / d;
    return `M${f(px - (h * dy) / d)} ${f(py + (h * dx) / d)}A${R} ${R} 0 1 1 ${f(px + (h * dy) / d)} ${f(py - (h * dx) / d)}A${r} ${r} 0 0 0 ${f(px - (h * dy) / d)} ${f(py + (h * dx) / d)}Z`; };

  /* sky: sun by day / crescent moon + stars by night, two cloud streaks, a pair of gliding birds */
  const stars = [[132, 27], [176, 17], [236, 27], [298, 14], [452, 18], [492, 12], [652, 22], [706, 15], [764, 25]].map(([x, y], i) => `<circle class="sk-star" cx="${x}" cy="${y}" r=".8" style="animation-delay:-${f(i * 0.7)}s"/>`).join('');
  const cloud = (y, a, b, dur, del) => `<g class="sk-drift" style="animation-duration:${dur}s;animation-delay:-${del}s">${P('sk-cl', `M-60 ${y}h${a}M${-60 + b} ${y + 4}h${f(a * 0.42)}`)}</g>`;
  const sky = `<g class="sk-nt">${stars}</g><circle class="sk-glow" cx="530" cy="29" r="22" fill="${u('H')}"/>`
    + `<circle class="sk-ln2 sk-sun sk-dy" cx="530" cy="29" r="10.5"/>` + P('sk-moon sk-nt', cres(530, 29, 8.5, 3.6, -2.6, 7.4))
    + cloud(26, 38, 16, 150, 40) + cloud(19, 30, -6, 190, 135)
    + `<g class="sk-birds sk-dy">${P('sk-ln2', 'M250 30q2.6-2.6 5.2 0q2.6-2.6 5.2 0M264 26.5q2-2 4 0q2-2 4 0')}</g>`;

  /* Bogd Khan: a faint far ridge, then the main ridge over its wash */
  const far = P('sk-far', 'M-20 44C30 40 80 31 140 31S220 38 270 35S330 30 380 36S560 36 610 31S700 25 740 30S800 38 830 40')
    + wash('M-20 58C20 55 60 47 110 48S190 44 240 41S330 46 380 42S470 33 520 36S600 45 650 44S740 50 820 55V86H-20Z');

  /* hills with gers (the outer two only show on tablets), Zaisan ring + stair, mid-rise blocks, night glow */
  const hl = hill(-40, 200, 13), gh = hill(150, 365, 18), hr = hill(640, 840, 15), zh = hill(490, 670, 30);
  let mid = wash(hl.d) + ger(hl, 52, 0.75) + ger(hl, 84, 0.85)
    + wash(gh.d) + [[205, 0.85], [229, 1.05], [261, 0.95]].map(([x, k]) => ger(gh, x, k)).join('')
    + wash(hr.d) + ger(hr, 716, 0.8) + ger(hr, 745, 0.9)
    + wash(zh.d) + P('sk-stair', 'M589 59L616 84')
    + P('sk-ln sk-o', 'M565 52V55A15 3.8 0 0 0 595 55V52A15 3.8 0 0 0 565 52A15 3.8 0 0 0 595 52')
    + P('sk-ln2 sk-tn', 'M568.5 52A11.5 2.3 0 1 0 591.5 52A11.5 2.3 0 1 0 568.5 52');
  mid += P('sk-ln2 sk-o', 'M366 86V45L388 40V86Z') + P('sk-hat', 'M371 46.9V84M376 45.7V84M381 44.6V84')
    + P('sk-ln2 sk-o', 'M352 86V52H372V86Z') + P('sk-hat', rows(355, 369, 56, 4))
    + P('sk-ln2 sk-o', 'M427 86V50H445V86Z') + P('sk-hat', rows(430, 442, 54, 4))
    + P('sk-wl', 'M356 62h3M363 70h3M357 78h3M371 56v3M381 66v3M431 60h3M437 68h3M432 76h3')
    + `<ellipse class="sk-nt sk-street" cx="420" cy="88" rx="200" ry="26" fill="${u('W')}"/>`;

  /* foreground landmarks: Gandan temple, Blue Sky Tower, Government Palace */
  const c = 318;
  const temple = P('sk-ln sk-o', `M${c - 28} ${G}V81H${c + 28}V${G}Z`) + P('sk-ln sk-o', `M${c - 19} 81V69H${c + 19}V81Z`)
    + P('sk-ln sk-o', `M${c - 27} 65Q${c - 20} 69.5 ${c - 12} 69H${c + 12}Q${c + 20} 69.5 ${c + 27} 65Q${c + 18} 64 ${c + 13} 59H${c - 13}Q${c - 18} 64 ${c - 27} 65Z`)
    + P('sk-ln sk-o', `M${c - 10} 59V53H${c + 10}V59Z`)
    + P('sk-ln sk-o', `M${c - 17} 51Q${c - 12} 54.5 ${c - 7} 54H${c + 7}Q${c + 12} 54.5 ${c + 17} 51Q${c + 10} 50 ${c + 7} 45H${c - 7}Q${c - 10} 50 ${c - 17} 51Z`)
    + P('sk-ln', `M${c} 45V39.5`) + `<circle class="sk-gold" cx="${c}" cy="38.2" r="1.5"/>`
    + P('sk-hat', cols(c - 13, 2, 6, 70, 81) + cols(c + 7, 2, 6, 70, 81) + cols(c - 5, 3, 5, 54.5, 58)) + P('sk-ln2 sk-gd', `M${c - 3.5} 81V74.5H${c + 3.5}V81`);
  const sail = 'M392 86V38Q392 27 401 28C415 35 425 61 423 86Z';
  const tower = P('sk-tn', sail)
    + `<g clip-path="${u('T')}">${P('sk-hat', rows(388, 428, 41, 5))}${P('sk-gd', 'M388 57.6h40v1.8h-40zM388 72.6h40v1.8h-40z', ' opacity=".75"')}${P('sk-gl', 'M386 78L430 60V66L386 84Z')}</g>`
    + P('sk-ln2', 'M401 28C409 35 415 57 414 86') + P('sk-ln', sail) + P('sk-ln', 'M395.6 28.4V24.8')
    + '<circle class="sk-ping" cx="395.6" cy="23.2" r="1.7"/><circle class="sk-bc" cx="395.6" cy="23.2" r="1.7"/>';
  const palace = P('sk-ln sk-o', 'M444 86V71H470V61H486V56H514V61H530V71H556V86Z') + P('sk-wl', cols(477.25, 8, 6.5, 67, 80))   // шөнө баганын завсраар гэрэл
    + P('sk-ln', `M470 64.5H530M466 81.5H534${cols(474, 9, 6.5, 65.5, 81)}`)
    + P('sk-hat', cols(449, 4, 5.5, 74, 80) + cols(534.5, 4, 5.5, 74, 80) + 'M489 59H511');

  const layer = (depth, body) => `<g data-depth="${depth}">${body}</g>`;
  return `<svg class="absolute inset-0 w-full h-full" viewBox="0 0 800 84" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><defs>`
    + `<linearGradient id="${pid}R" x1="0" y1="0" x2="0" y2="1"><stop class="sk-s-mist" offset="0"/><stop class="sk-s-card" offset=".6"/></linearGradient>`
    + `<radialGradient id="${pid}W"><stop class="sk-s-lit" offset="0"/><stop class="sk-s-lit" offset="1" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="${pid}H"><stop class="sk-s-halo" offset="0"/><stop class="sk-s-halo" offset="1" stop-opacity="0"/></radialGradient>`
    + `<clipPath id="${pid}T"><path d="${sail}"/></clipPath></defs>`
    + `${layer(0.25, up(0.7, sky))}${layer(0.4, up(0, far))}${layer(0.65, up(0.12, mid))}${layer(1, up(0.3, temple) + up(0.42, tower) + up(0.54, palace))}</svg>`;
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
