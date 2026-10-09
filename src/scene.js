/* ================= Generative editorial illustrations =================
   Each "photo" is a seeded SVG scene so the concept carries no remote images. */
const Scene = (() => {
  const cache = new Map();
  let uid = 0;
  const W = 800, H = 500;
  const rnd = (s) => { let a = (s >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const f = (n) => Math.round(n * 10) / 10;
  const PAL = {
    dawn:  { sky: ['#FFD3BD', '#FFF1E4'], sun: '#FFF7EC', far: '#EDB9A8', mid: '#D0948E', near: '#9A6274', bld: '#3B2B50', bld2: '#56406E', win: '#FFD9A6', ground: '#3A2A47', acc: '#D81E34', water: '#9FC3E8' },
    day:   { sky: ['#9FD0FF', '#E9F5FF'], sun: '#FFFFFF', far: '#B7D1EA', mid: '#8EB2D3', near: '#5C86AE', bld: '#1E3A66', bld2: '#2C5289', win: '#D4E8FF', ground: '#28476F', acc: '#D81E34', water: '#6FB1EA' },
    dusk:  { sky: ['#1A2768', '#F28A66'], sun: '#FFD9A6', far: '#5E4E8E', mid: '#403776', near: '#2A2559', bld: '#161638', bld2: '#24244E', win: '#FFC96E', ground: '#13122C', acc: '#FFC524', water: '#4C5EA8', lit: 1 },
    night: { sky: ['#060D29', '#1F2D5E'], sun: '#F4F1E4', far: '#1D2A56', mid: '#152047', near: '#0F183A', bld: '#0B1230', bld2: '#121B42', win: '#FFCF6B', ground: '#070D24', acc: '#FFC524', water: '#1E3A78', stars: 1, lit: 1 },
    winter:{ sky: ['#CADDF2', '#F6FAFE'], sun: '#FFFFFF', far: '#DCE7F3', mid: '#C1D3E8', near: '#A3BAD7', bld: '#37527C', bld2: '#4B6893', win: '#EAF2FC', ground: '#F2F6FB', acc: '#D81E34', water: '#9CC3E6', snow: 1 },
    smog:  { sky: ['#B9AE9C', '#E5DCCB'], sun: '#F6EAD3', far: '#C8BEAD', mid: '#ADA394', near: '#8B8273', bld: '#5C554D', bld2: '#6E665C', win: '#EADFCA', ground: '#4C4640', acc: '#F08C1A', water: '#9AA6A8', haze: 1 },
    green: { sky: ['#BDE7D6', '#F0FBF6'], sun: '#FFFFFF', far: '#A6D7C1', mid: '#79C1A0', near: '#4C9E7A', bld: '#1D4C44', bld2: '#2A6257', win: '#DAF5EA', ground: '#2D7859', acc: '#FFC524', water: '#7CC4E0' },
    civic: { sky: ['#F6CAC4', '#FFF2EE'], sun: '#FFFFFF', far: '#ECB2AC', mid: '#D78B87', near: '#AE5D61', bld: '#5A1D2D', bld2: '#78293A', win: '#FFE4D8', ground: '#48172A', acc: '#0B1D45', water: '#9DB6DE' },
    navy:  { sky: ['#0B1D45', '#27428A'], sun: '#FFC524', far: '#233A7C', mid: '#1A2F67', near: '#122452', bld: '#0A1838', bld2: '#11234F', win: '#9DC0FF', ground: '#081430', acc: '#D81E34', water: '#2F57B0', lit: 1 },
  };

  const defs = (id, P) => `<defs><linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky[0]}"/><stop offset="1" stop-color="${P.sky[1]}"/></linearGradient><radialGradient id="g${id}"><stop offset="0" stop-color="${P.sun}" stop-opacity=".85"/><stop offset="1" stop-color="${P.sun}" stop-opacity="0"/></radialGradient><linearGradient id="b${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.acc}" stop-opacity=".85"/><stop offset="1" stop-color="${P.acc}" stop-opacity="0"/></linearGradient><pattern id="w${id}" width="10" height="12" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="4" height="5" fill="${P.win}"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#s${id})"/>`;
  const sun = (id, P, x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r * 3.2}" fill="url(#g${id})"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${P.sun}"/>`;
  const stars = (r, n) => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * W)}" cy="${f(r() * H * .5)}" r="${f(.6 + r() * 1.3)}" fill="#fff" opacity="${f(.25 + r() * .6)}"/>`; return s; };
  const ridge = (r, base, amp, step, color, op = 1) => {
    const pts = []; for (let x = -step; x <= W + step; x += step) pts.push([x, base - amp * (.2 + .8 * r())]);
    let d = `M${pts[0][0]} ${f(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; d += ` Q${pts[i][0]} ${f(pts[i][1])} ${f(mx)} ${f(my)}`; }
    return `<path d="${d} L${W + step} ${H} L${-step} ${H} Z" fill="${color}" opacity="${op}"/>`;
  };
  const ground = (y, c) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${c}"/>`;
  const buildings = (r, id, P, g, minH, maxH, o = {}) => {
    let s = '', x = -12; const towerX = o.tower ? 260 + r() * 260 : -999;
    while (x < W + 10) {
      const w = 26 + r() * 50, h = minH + r() * (maxH - minH), c = r() < .5 ? P.bld : P.bld2;
      if (o.tower && x <= towerX && x + w > towerX) {
        const th = maxH + 95, tw = 48;
        s += `<path d="M${f(x)} ${g} V${f(g - th)} Q${f(x + tw * 1.4)} ${f(g - th * .55)} ${f(x + tw)} ${g} Z" fill="${P.bld2}"/><path d="M${f(x + 6)} ${g} V${f(g - th + 24)} Q${f(x + tw * 1.15)} ${f(g - th * .55)} ${f(x + tw - 7)} ${g} Z" fill="url(#w${id})" opacity=".55"/>`;
        x += tw + 4; continue;
      }
      s += `<rect x="${f(x)}" y="${f(g - h)}" width="${f(w)}" height="${f(h)}" fill="${c}"/>`;
      if (r() < .82) s += `<rect x="${f(x + 4)}" y="${f(g - h + 8)}" width="${f(w - 8)}" height="${f(h - 12)}" fill="url(#w${id})" opacity="${P.lit ? .9 : .5}"/>`;
      if (r() < .16) s += `<rect x="${f(x + w / 2 - 1)}" y="${f(g - h - 16)}" width="2" height="16" fill="${c}"/>`;
      x += w + (r() < .25 ? 4 + r() * 12 : 0);
    }
    return s;
  };
  const tree = (x, g, h, c, round) => round
    ? `<rect x="${f(x - 2)}" y="${f(g - h * .45)}" width="4" height="${f(h * .45)}" fill="#5B4636"/><circle cx="${f(x)}" cy="${f(g - h * .62)}" r="${f(h * .32)}" fill="${c}"/>`
    : `<path d="M${f(x)} ${f(g - h)} L${f(x - h * .28)} ${f(g - h * .25)} H${f(x + h * .28)} Z M${f(x)} ${f(g - h * .72)} L${f(x - h * .34)} ${f(g)} H${f(x + h * .34)} Z" fill="${c}"/>`;
  const ger = (x, g, w, P, smoke) => { const h = w * .46; return `<g><path d="M${f(x)} ${g} V${f(g - h * .55)} Q${f(x + w / 2)} ${f(g - h * 1.25)} ${f(x + w)} ${f(g - h * .55)} V${g} Z" fill="#F7F3EC"/><path d="M${f(x)} ${f(g - h * .55)} Q${f(x + w / 2)} ${f(g - h * 1.25)} ${f(x + w)} ${f(g - h * .55)}" fill="none" stroke="#CFC6B6" stroke-width="2"/><rect x="${f(x + w * .41)}" y="${f(g - h * .48)}" width="${f(w * .18)}" height="${f(h * .48)}" fill="${P.acc}"/><rect x="${f(x + w * .62)}" y="${f(g - h * 1.15)}" width="${f(w * .05)}" height="${f(h * .3)}" fill="#6F695E"/>${smoke ? `<path d="M${f(x + w * .645)} ${f(g - h * 1.15)} c-12 -16 16 -26 4 -44 c-10 -15 14 -24 6 -40" fill="none" stroke="#A39C8E" stroke-width="7" stroke-linecap="round" opacity=".45"/>` : ''}</g>`; };
  const bus = (x, yb, w, col) => { const h = w * .3; return `<g><rect x="${f(x)}" y="${f(yb - h)}" width="${w}" height="${f(h - 8)}" rx="${f(h * .16)}" fill="${col}"/><rect x="${f(x + w * .05)}" y="${f(yb - h + h * .14)}" width="${f(w * .9)}" height="${f(h * .36)}" rx="4" fill="#DCEBFF" opacity=".93"/><path d="M${f(x + w * .33)} ${f(yb - h + h * .14)} v${f(h * .36)} M${f(x + w * .6)} ${f(yb - h + h * .14)} v${f(h * .36)}" stroke="${col}" stroke-width="5"/><rect x="${f(x + w * .25)}" y="${f(yb - h - 6)}" width="${f(w * .42)}" height="8" rx="3" fill="${col}" opacity=".85"/><circle cx="${f(x + w * .2)}" cy="${f(yb - 8)}" r="${f(h * .15)}" fill="#171A22"/><circle cx="${f(x + w * .8)}" cy="${f(yb - 8)}" r="${f(h * .15)}" fill="#171A22"/><circle cx="${f(x + w * .2)}" cy="${f(yb - 8)}" r="${f(h * .06)}" fill="#8A93A6"/><circle cx="${f(x + w * .8)}" cy="${f(yb - 8)}" r="${f(h * .06)}" fill="#8A93A6"/></g>`; };
  const crane = (x, g, h, jib, col, acc) => { let z = `M${x} ${g}`; for (let y = g; y > g - h + 10; y -= 12) z += ` L${x + 9} ${y - 6} L${x} ${y - 12}`; return `<g stroke="${col}" fill="none"><path d="M${x} ${g} V${g - h} M${x + 9} ${g} V${g - h}" stroke-width="2.4"/><path d="${z}" stroke-width="1.2"/><path d="M${f(x - jib * .3)} ${g - h} H${x + jib} M${x + 4} ${g - h - 16} L${f(x - jib * .3)} ${g - h} M${x + 4} ${g - h - 16} L${x + jib} ${g - h}" stroke-width="2.2"/><path d="M${f(x + jib * .72)} ${g - h} V${g - h + 46}" stroke-width="1.2"/></g><rect x="${f(x + jib * .72 - 7)}" y="${g - h + 46}" width="14" height="9" fill="${acc}"/><rect x="${f(x - jib * .3)}" y="${g - h - 2}" width="16" height="10" fill="${col}"/>`; };
  const snow = (r, n) => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="${f(1 + r() * 2.2)}" fill="#fff" opacity="${f(.5 + r() * .5)}"/>`; return s; };
  const haze = (P) => P.haze ? `<rect width="${W}" height="${H}" fill="${P.sky[1]}" opacity=".32"/>` : '';

  const R = {
    skyline(r, id, P) {
      return sun(id, P, 120 + r() * 520, 92 + r() * 60, 26) + (P.stars ? stars(r, 60) : '') + ridge(r, 300, 120, 74, P.far) + ridge(r, 338, 70, 52, P.mid)
        + buildings(r, id, P, 420, 60, 215, { tower: true }) + ground(420, P.ground)
        + `<rect x="0" y="436" width="${W}" height="4" fill="${P.acc}" opacity=".7"/>` + (P.snow ? snow(r, 70) : '') + haze(P);
    },
    bus(r, id, P) {
      return sun(id, P, 600, 100, 30) + ridge(r, 250, 70, 60, P.far) + buildings(r, id, P, 360, 40, 150)
        + `<rect y="360" width="${W}" height="140" fill="#2A2F3B"/><rect y="356" width="${W}" height="8" fill="#A4ADBE"/><path d="M0 440 H${W}" stroke="#EEF1F6" stroke-width="4" stroke-dasharray="34 26" opacity=".7"/>`
        + bus(110 + r() * 60, 425, 300, '#D81E34') + bus(500 + r() * 40, 492, 250, '#1D5BFF')
        + `<rect x="${740}" y="300" width="5" height="70" fill="#5B6478"/><rect x="722" y="290" width="40" height="22" rx="4" fill="#1D5BFF"/>`;
    },
    air(r, id, P) {
      let s = sun(id, P, 560, 120, 32) + ridge(r, 280, 90, 70, P.far) + buildings(r, id, P, 380, 50, 190) + ridge(r, 440, 64, 46, P.near);
      for (let i = 0; i < 6; i++) s += ger(40 + i * 130 + r() * 40, 456 + r() * 18, 52, P, true);
      return s + ground(472, P.ground) + `<rect width="${W}" height="${H}" fill="${P.sky[1]}" opacity=".38"/>`;
    },
    bridge(r, id, P) {
      let s = sun(id, P, 180, 120, 30) + ridge(r, 300, 130, 84, P.far) + ridge(r, 340, 80, 60, P.mid) + `<rect y="360" width="${W}" height="140" fill="${P.near}"/>`
        + `<path d="M0 404 C 200 384 420 424 ${W} 396 V448 C 520 466 260 434 0 456 Z" fill="${P.water}"/>`
        + `<rect x="-10" y="330" width="${W + 20}" height="16" fill="${P.bld2}"/><path d="M-10 324 H${W + 10}" stroke="${P.bld}" stroke-width="3"/>`;
      for (let x = 60; x < W; x += 130) s += `<rect x="${x}" y="346" width="16" height="${80 + r() * 20}" fill="${P.bld}"/>`;
      return s + crane(620, 330, 170, 150, P.bld, P.acc) + haze(P);
    },
    school(r, id, P) {
      let s = sun(id, P, 640, 96, 28) + ridge(r, 300, 70, 70, P.far) + ground(400, P.ground === '#F2F6FB' ? '#E6EDF5' : P.near)
        + `<rect x="170" y="210" width="380" height="190" fill="${P.bld2}"/><rect x="180" y="226" width="360" height="160" fill="url(#w${id})" opacity=".6"/><rect x="160" y="196" width="400" height="18" fill="${P.acc}"/><rect x="330" y="320" width="60" height="80" fill="${P.bld}"/><circle cx="360" cy="252" r="18" fill="#fff"/><path d="M360 252 V240 M360 252 H370" stroke="${P.bld}" stroke-width="3"/>`
        + `<path d="M600 400 V330 H650 L700 400" fill="none" stroke="#FFC524" stroke-width="7" stroke-linejoin="round"/><rect x="596" y="322" width="8" height="78" fill="${P.bld}"/><path d="M90 400 V250 M90 250 H120 V270 H90" fill="${P.acc}" stroke="${P.bld}" stroke-width="3"/>`;
      for (let i = 0; i < 4; i++) s += tree(60 + i * 30 + (i > 1 ? 640 : 0), 400, 70 + r() * 30, P.mid === '#79C1A0' ? '#3E8E6B' : '#4C9E7A', true);
      return s + (P.snow ? snow(r, 50) : '');
    },
    civic(r, id, P) {
      const cx = 400, top = 190, w = 460, h = 170;
      let s = sun(id, P, 640, 90, 26) + (P.stars ? stars(r, 40) : '') + ridge(r, 300, 60, 70, P.far) + buildings(r, id, P, 360, 30, 120)
        + `<rect x="${cx - w / 2}" y="${top}" width="${w}" height="${h}" fill="${P.bld2}"/><path d="M${cx - w / 2 - 14} ${top} L${cx} ${top - 62} L${cx + w / 2 + 14} ${top} Z" fill="${P.bld}"/>`;
      for (let i = 0; i < 9; i++) s += `<rect x="${f(cx - w / 2 + 24 + i * ((w - 48) / 8) - 7)}" y="${top + 14}" width="14" height="${h - 14}" fill="${P.win}" opacity=".9"/>`;
      s += `<rect x="${cx - w / 2 - 20}" y="${top + h}" width="${w + 40}" height="10" fill="${P.bld}"/><rect x="${cx - w / 2 - 36}" y="${top + h + 10}" width="${w + 72}" height="10" fill="${P.bld}" opacity=".8"/>` + ground(top + h + 20, P.ground);
      [130, 670].forEach((x, k) => { s += `<rect x="${x}" y="230" width="4" height="${top + h - 210}" fill="${P.bld}"/><path d="M${x + 4} 232 h44 l-8 12 l8 12 h-44 Z" fill="${k ? '#1D5BFF' : P.acc === '#0B1D45' ? '#D81E34' : P.acc}"/>`; });
      for (let i = -6; i <= 6; i++) s += `<path d="M${cx + i * 18} ${top + h + 20} L${cx + i * 120} ${H}" stroke="${P.win}" stroke-width="1" opacity=".18"/>`;
      return s;
    },
    heat(r, id, P) {
      let s = sun(id, P, 160, 110, 26) + ridge(r, 300, 70, 70, P.far) + buildings(r, id, P, 380, 30, 110);
      [[520, 120], [590, 150]].forEach(([x, top]) => { s += `<path d="M${x + 6} ${top} c-30 -30 30 -50 0 -80 c-24 -24 36 -36 10 -70" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" opacity=".55"/>`; for (let y = top; y < 380; y += 26) s += `<rect x="${x}" y="${y}" width="22" height="13" fill="${P.acc}"/><rect x="${x}" y="${y + 13}" width="22" height="13" fill="#F4F6FA"/>`; });
      s += `<path d="M330 380 C 345 300 335 260 350 240 H430 C 445 260 435 300 450 380 Z" fill="${P.bld2}"/><rect x="250" y="300" width="80" height="80" fill="${P.bld}"/>` + ground(380, P.ground);
      s += `<path d="M-10 430 H260 V408 H520 V430 H${W + 10}" fill="none" stroke="#B7C0CD" stroke-width="13"/><path d="M-10 452 H${W + 10}" stroke="#9AA5B5" stroke-width="10"/>`;
      for (let x = 30; x < W; x += 90) s += `<rect x="${x}" y="430" width="6" height="30" fill="#7C8798"/>`;
      return s + (P.snow ? snow(r, 60) : '');
    },
    stage(r, id, P) {
      let s = stars(r, 70);
      for (let i = 0; i < 5; i++) { const x = 170 + i * 115; s += `<path d="M${x} 118 L${x - 130 + r() * 40} ${H} L${x + 90 + r() * 40} ${H} Z" fill="url(#b${id})" opacity=".42"/>`; }
      s += `<rect x="110" y="104" width="580" height="12" fill="#2B2D58"/><rect x="104" y="104" width="12" height="230" fill="#2B2D58"/><rect x="684" y="104" width="12" height="230" fill="#2B2D58"/>`;
      for (let i = 0; i < 7; i++) s += `<circle cx="${150 + i * 85}" cy="122" r="7" fill="${P.acc}"/>`;
      s += `<rect x="100" y="300" width="600" height="44" fill="#1A1B3C"/><rect x="100" y="300" width="600" height="5" fill="${P.acc}" opacity=".8"/>`;
      for (let i = 0; i < 4; i++) s += `<path d="M${300 + i * 70} 300 v-46 a10 10 0 0 1 20 0 v46 Z" fill="#0A0B20"/><circle cx="${310 + i * 70}" cy="240" r="10" fill="#0A0B20"/>`;
      for (let x = -10; x < W + 20; x += 20 + r() * 8) { const y = 430 + r() * 22; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(11 + r() * 3)}" fill="#05061A"/><rect x="${f(x - 14)}" y="${f(y + 8)}" width="28" height="80" rx="10" fill="#05061A"/>`; }
      for (let i = 0; i < 5; i++) s += `<path d="M${f(80 + r() * 640)} ${f(440 - r() * 30)} l${f(-6 + r() * 12)} -46" stroke="#05061A" stroke-width="6" stroke-linecap="round"/>`;
      return s;
    },
    road(r, id, P) {
      let s = sun(id, P, 400, 236, 22) + (P.stars ? stars(r, 50) : '') + ridge(r, 250, 70, 60, P.far) + buildings(r, id, P, 300, 40, 160)
        + `<rect y="300" width="${W}" height="200" fill="${P.ground}"/><path d="M372 300 L432 300 L${W + 60} ${H} L-60 ${H} Z" fill="#2B303C"/>`;
      for (let i = 0; i < 9; i++) { const t0 = i / 9, t1 = (i + .45) / 9; s += `<path d="M${f(400 + 0 * t0)} ${f(300 + 200 * t0 * t0)} L${f(400)} ${f(300 + 200 * t1 * t1)}" stroke="#F2F4F8" stroke-width="${f(1 + 6 * t1)}" opacity=".85"/>`; }
      const glow = P.lit;
      for (let i = 0; i < 7; i++) { const t = .25 + r() * .7, side = r() < .5 ? -1 : 1, x = 400 + side * (40 + 380 * t * t) * (.25 + r() * .35), y = 300 + 200 * t * t, w = 10 + 60 * t * t; s += `<rect x="${f(x - w / 2)}" y="${f(y - w * .45)}" width="${f(w)}" height="${f(w * .45)}" rx="${f(w * .12)}" fill="${['#D81E34', '#F4F6FA', '#1D5BFF', '#FFC524'][i % 4]}"/>${glow ? `<circle cx="${f(x - w * .3)}" cy="${f(y - w * .12)}" r="${f(w * .09 + 1)}" fill="#FFE7A8"/><circle cx="${f(x + w * .3)}" cy="${f(y - w * .12)}" r="${f(w * .09 + 1)}" fill="#FFE7A8"/>` : ''}`; }
      s += `<rect x="690" y="210" width="8" height="200" fill="#3C4253"/><rect x="676" y="190" width="36" height="86" rx="8" fill="#1B1F2A"/><circle cx="694" cy="210" r="9" fill="#D81E34" opacity=".35"/><circle cx="694" cy="233" r="9" fill="#FFC524" opacity=".35"/><circle cx="694" cy="256" r="9" fill="#18C37E"/>`;
      return s;
    },
    build(r, id, P) {
      let s = sun(id, P, 140, 100, 28) + ridge(r, 290, 80, 70, P.far) + buildings(r, id, P, 400, 40, 130) + ground(400, '#8C7A64');
      const x0 = 300, y0 = 400, bw = 46, fh = 38, nb = 5, nf = 6;
      for (let fl = 0; fl < nf; fl++) for (let b = 0; b < nb; b++) { const filled = fl < 3 || (fl === 3 && b < 3); s += `<rect x="${x0 + b * bw}" y="${y0 - (fl + 1) * fh}" width="${bw}" height="${fh}" fill="${filled ? P.bld2 : 'none'}" stroke="${P.bld}" stroke-width="3"/>${filled ? `<rect x="${x0 + b * bw + 6}" y="${y0 - (fl + 1) * fh + 6}" width="${bw - 12}" height="${fh - 12}" fill="${P.win}" opacity=".55"/>` : ''}`; }
      s += crane(250, 400, 300, 230, P.bld, P.acc) + crane(600, 400, 230, 160, P.bld, '#FFC524');
      return s + `<path d="M40 400 q40 -40 80 0 Z M640 400 q30 -30 60 0 Z" fill="#7A6A56"/>`;
    },
    park(r, id, P) {
      let s = sun(id, P, 620, 100, 30) + ridge(r, 280, 110, 80, P.far) + ridge(r, 330, 70, 60, P.mid) + ground(360, P.near)
        + `<path d="M0 420 C 180 390 360 440 560 410 S ${W} 420 ${W} 420 V455 C 600 470 300 440 0 470 Z" fill="${P.water}" opacity=".9"/><path d="M380 ${H} C 420 450 360 400 430 360" stroke="#E9DFC9" stroke-width="20" fill="none" opacity=".7"/>`;
      for (let i = 0; i < 14; i++) { const x = r() * W, g = 360 + r() * 40; s += tree(x, g, 40 + r() * 50, i % 3 ? '#2F7D5A' : '#3E9468', i % 2 === 0); }
      return s;
    },
    tech(r, id, P) {
      let s = (P.stars ? stars(r, 40) : '') + ridge(r, 300, 60, 70, P.far);
      for (let i = -10; i <= 10; i++) s += `<path d="M${400 + i * 22} 330 L${400 + i * 120} ${H}" stroke="#4E7BE0" stroke-width="1" opacity=".35"/>`;
      for (let k = 0; k < 7; k++) { const y = 330 + 170 * Math.pow(k / 6, 2); s += `<path d="M0 ${f(y)} H${W}" stroke="#4E7BE0" stroke-width="1" opacity=".3"/>`; }
      let x = 40; while (x < W - 40) { const w = 30 + r() * 40, h = 60 + r() * 170; s += `<rect x="${f(x)}" y="${f(330 - h)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="#7FA6FF" stroke-width="1.6" opacity=".7"/>`; x += w + 8; }
      const nodes = []; for (let i = 0; i < 9; i++) nodes.push([60 + r() * 680, 50 + r() * 200]);
      nodes.forEach((a, i) => { const b = nodes[(i + 3) % nodes.length]; s += `<path d="M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}" stroke="#FFC524" stroke-width="1.2" opacity=".45"/>`; });
      nodes.forEach(([a, b]) => { s += `<circle cx="${f(a)}" cy="${f(b)}" r="12" fill="#FFC524" opacity=".15"/><circle cx="${f(a)}" cy="${f(b)}" r="4" fill="#FFC524"/>`; });
      return s;
    },
    ger(r, id, P) {
      let s = sun(id, P, 160 + r() * 480, 110, 30) + ridge(r, 260, 110, 80, P.far) + ridge(r, 330, 80, 70, P.mid) + ridge(r, 400, 70, 60, P.near);
      for (let i = 0; i < 9; i++) { const x = r() * 760, g = 410 + r() * 70; if (r() < .55) s += ger(x, g, 46 + r() * 22, P, P.haze || r() < .3); else s += `<rect x="${f(x)}" y="${f(g - 34)}" width="46" height="34" fill="${P.bld2}"/><path d="M${f(x - 4)} ${f(g - 34)} l27 -18 l27 18 Z" fill="${P.acc}"/>`; s += `<path d="M${f(x - 20)} ${f(g)} h120" stroke="#8D7759" stroke-width="3" stroke-dasharray="3 5"/>`; }
      s += `<path d="M0 360 L${W} 330" stroke="#3F4658" stroke-width="1.5" opacity=".6"/>`;
      for (let x = 60; x < W; x += 160) s += `<rect x="${x}" y="${f(358 - x * 30 / W)}" width="4" height="70" fill="#3F4658" opacity=".7"/>`;
      return s + haze(P);
    },
    sport(r, id, P) {
      let s = sun(id, P, 640, 90, 28) + ridge(r, 260, 60, 70, P.far) + `<rect y="200" width="${W}" height="90" fill="${P.bld}"/><rect y="210" width="${W}" height="72" fill="url(#w${id})" opacity=".35"/>` + ground(290, '#2F7D5A')
        + `<ellipse cx="400" cy="420" rx="520" ry="150" fill="#C9473F"/><ellipse cx="400" cy="420" rx="430" ry="104" fill="#3E9468"/>`;
      for (let k = 1; k < 5; k++) s += `<ellipse cx="400" cy="420" rx="${430 + k * 18}" ry="${104 + k * 9}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>`;
      s += `<rect x="560" y="250" width="8" height="160" fill="#fff"/><rect x="740" y="250" width="8" height="160" fill="#fff"/><rect x="560" y="246" width="188" height="26" fill="${P.acc === '#FFC524' ? '#D81E34' : '#1D5BFF'}"/>`;
      return s;
    },
    market(r, id, P) {
      let s = sun(id, P, 660, 90, 28) + ridge(r, 280, 80, 70, P.far) + buildings(r, id, P, 340, 30, 100) + ground(340, '#D9CDB8');
      const cols = ['#D81E34', '#1D5BFF', '#FFC524', '#10A36A'];
      for (let i = 0; i < 5; i++) { const x = 20 + i * 158, c = cols[i % 4]; s += `<rect x="${x + 10}" y="300" width="128" height="110" fill="#F7F2E8"/>`; for (let k = 0; k < 8; k++) s += `<path d="M${x + k * 18} 300 h18 v28 q-9 10 -18 0 Z" fill="${k % 2 ? '#fff' : c}"/>`; s += `<rect x="${x + 16}" y="380" width="116" height="30" fill="#8B6A48"/>`; for (let k = 0; k < 7; k++) s += `<circle cx="${x + 26 + k * 16}" cy="372" r="8" fill="${['#F08C1A', '#D81E34', '#9BC53D', '#FFC524'][k % 4]}"/>`; }
      for (let i = 0; i < 9; i++) { const x = r() * W, y = 470 + r() * 20; s += `<circle cx="${f(x)}" cy="${f(y - 44)}" r="9" fill="#2A2238"/><rect x="${f(x - 10)}" y="${f(y - 36)}" width="20" height="50" rx="8" fill="${['#3B4A7A', '#7A2E3E', '#2E6A57'][i % 3]}"/>`; }
      return s;
    },
    art(r, id, P) {
      let s = `<rect width="${W}" height="${H}" fill="#F4EFE7"/><rect y="400" width="${W}" height="100" fill="#C9B79C"/><rect y="396" width="${W}" height="6" fill="#B09B7D"/>`;
      [[70, 120, 200, 240], [320, 90, 180, 290], [550, 130, 190, 220]].forEach(([x, y, w, h], k) => {
        s += `<rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="#2B2B33"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${['#FBE7D3', '#E4ECF8', '#FDF1C9'][k]}"/>`;
        for (let j = 0; j < 4; j++) { const t = r(); const cx = x + 20 + r() * (w - 40), cy = y + 20 + r() * (h - 40), c = ['#D81E34', '#1D5BFF', '#FFC524', '#0B1D45', '#10A36A'][Math.floor(r() * 5)]; s += t < .4 ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(16 + r() * 34)}" fill="${c}" opacity=".9"/>` : t < .75 ? `<rect x="${f(cx - 30)}" y="${f(cy - 20)}" width="${f(30 + r() * 50)}" height="${f(20 + r() * 40)}" fill="${c}" opacity=".9"/>` : `<path d="M${f(cx)} ${f(cy - 34)} L${f(cx + 34)} ${f(cy + 26)} L${f(cx - 34)} ${f(cy + 26)} Z" fill="${c}" opacity=".9"/>`; }
      });
      return s + `<rect x="300" y="430" width="200" height="16" rx="6" fill="#5B4636"/><rect x="316" y="446" width="10" height="34" fill="#5B4636"/><rect x="474" y="446" width="10" height="34" fill="#5B4636"/>`;
    },
    cable(r, id, P) {
      let s = sun(id, P, 640, 92, 26) + ridge(r, 250, 110, 80, P.far) + ridge(r, 320, 70, 60, P.mid) + buildings(r, id, P, 420, 40, 140) + ground(420, P.ground);
      s += `<path d="M60 150 L740 300" stroke="${P.bld}" stroke-width="2.5"/><path d="M60 162 L740 312" stroke="${P.bld}" stroke-width="1.5" opacity=".7"/>`;
      [[60, 150], [400, 225], [740, 300]].forEach(([x, y]) => { s += `<path d="M${x - 16} 420 L${x} ${y} L${x + 16} 420" fill="none" stroke="${P.bld}" stroke-width="4"/><path d="M${x - 10} ${y + 70} H${x + 10}" stroke="${P.bld}" stroke-width="3"/>`; });
      [[200, 181], [300, 203], [520, 251], [640, 278]].forEach(([x, y], k) => { s += `<path d="M${x} ${y} v18" stroke="${P.bld}" stroke-width="2"/><rect x="${x - 18}" y="${y + 18}" width="36" height="30" rx="7" fill="${k % 2 ? '#D81E34' : '#FFC524'}"/><rect x="${x - 13}" y="${y + 23}" width="26" height="11" rx="3" fill="#DCEBFF" opacity=".9"/>`; });
      return s;
    },
  };
  const RECIPES = Object.keys(R);
  const PALS = Object.keys(PAL);

  function make(key) {
    const [rec0, pal0, seed0] = key.split(':');
    const seed = +seed0 || 1; const r = rnd(seed);
    const rec = rec0 === 'mix' ? RECIPES[seed % RECIPES.length] : rec0;
    const pal = pal0 === 'mix' ? PALS[(seed * 7) % PALS.length] : pal0;
    const P = PAL[pal] || PAL.day; const id = 'q' + (++uid);
    const body = (R[rec] || R.skyline)(r, id, P);
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${defs(id, P)}${body}</svg>`;
  }
  const PHOTO = /^(assets\/news\/[\w.-]+|https:\/\/ulaanbaatar\.mn\/files\/[^"'<>\s]+)$/;   // бодит мэдээний зураг (news.js)
  return (key) => { key = key || 'civic:day:9'; if (PHOTO.test(key)) return `<img src="${key}" alt="" loading="lazy" decoding="async">`; if (key.indexOf('media:') === 0) { const m = CMS.data.media[key.slice(6)]; return m && /^data:image\/(webp|png|jpeg|gif);base64,[A-Za-z0-9+/=]+$/.test(m.src || '') ? `<img src="${m.src}" alt="" decoding="async">` : make('civic:day:9'); } if (!cache.has(key)) cache.set(key, make(key)); return cache.get(key); };
})();

/* ================= Logo (Улаанбаатар хотын сүлд: Хан Гаруди) — зураг нь src/logo.webp ================= */
function logoMark(cls = 'w-10 h-10') {
  return `<img src="${LOGO_SRC}" class="${cls} shrink-0 object-contain" alt="" aria-hidden="true" decoding="async" draggable="false">`;
}
/* Хөдөлгөөнт сүлд (толгой, dock): ард нь гэрэлтэх цагираг (::before), сүлдний өөрийн хэлбэрээр гүйх гялбаа (::after, --logo-img mask). input.css .logo-* */
function logoEmblem(cls = 'w-10 h-10') {
  return `<span class="logo-em ${cls}" aria-hidden="true"><img src="${LOGO_SRC}" class="w-full h-full object-contain" alt="" decoding="async" draggable="false"></span>`;
}
document.documentElement.style.setProperty('--logo-img', `url("${LOGO_SRC}")`);

/* ================= Schematic map base ================= */
function mapBaseSVG() {
  const d = DISTRICTS.map((z, k) => `<path class="${k % 2 ? 'm-dist' : 'm-dist m-dist-alt'}" d="M${z.poly.map((p) => p.join(' ')).join(' L')} Z"/>`).join('');
  const labels = DISTRICTS.map((z) => `<text class="m-label" data-fs="15" x="${z.lx}" y="${z.ly}" text-anchor="middle" font-size="15">${esc(L(z.n))}</text>`).join('');
  return `<rect class="m-land" x="0" y="0" width="1000" height="620"/>${d}
  <path class="m-green" d="M0 548 C 90 520 170 560 260 530 S 420 500 520 538 S 700 505 790 532 S 930 512 1000 530 V620 H0 Z"/>
  <path class="m-green" opacity=".6" d="M0 0 H1000 V36 C 900 62 820 30 720 48 S 560 70 470 40 S 300 64 200 42 S 60 60 0 40 Z"/>
  <path class="m-river" stroke-width="11" d="M0 486 C 90 470 180 500 270 478 S 430 446 540 468 S 740 500 840 474 S 950 452 1000 460"/>
  <path class="m-river" stroke-width="4" d="M512 0 C 526 70 508 140 530 210 S 548 360 548 468"/>
  <path class="m-river" stroke-width="3" d="M905 50 C 885 140 925 240 895 330 S 862 430 882 474"/>
  <path class="m-rail" stroke-width="2.5" d="M0 372 C 220 360 420 380 620 362 S 860 350 1000 356"/>
  <ellipse class="m-road" stroke-width="5" cx="545" cy="300" rx="210" ry="128"/>
  <path class="m-road" stroke-width="3.5" d="M560 300 V470 M470 300 L440 110 M650 300 L690 110 M300 300 L220 130 M760 300 L830 160 M545 300 V60 M560 470 L610 620 M380 300 L360 470"/>
  <path class="m-major" stroke-width="7" d="M24 300 H976"/>
  <rect class="m-sq" x="550" y="276" width="20" height="16" rx="3"/>
  ${labels}
  <text class="m-label m-label-w" data-fs="13" x="760" y="500" font-size="13">${esc(S.lang === 'en' ? 'Tuul river' : 'Туул гол')}</text>
  <text class="m-label" data-fs="12" x="560" y="604" text-anchor="middle" font-size="12">${esc(S.lang === 'en' ? 'Bogd Khan mountain' : 'Богд хан уул')}</text>
  <text class="m-label" data-fs="11" x="120" y="292" font-size="11">${esc(S.lang === 'en' ? 'Peace Avenue' : 'Энхтайвны өргөн чөлөө')}</text>`;
}
function inDistrict(x, y) {
  for (const z of DISTRICTS) { let inside = false; const p = z.poly; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside; } if (inside) return z; }
  return DISTRICTS[DISTRICTS.length - 1];
}

/* ================= QR-like pattern (sign-in simulation) ================= */
function qrSVG(seed = 7) {
  const n = 25, r = (() => { let a = seed; return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; })();
  let s = '';
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#0B1D45"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0B1D45"/>`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && r() < .48) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0B1D45"/>`; }
  return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" class="qr w-full h-full" aria-hidden="true"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/>${s}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}<rect x="10" y="10" width="5" height="5" rx="1" fill="#D81E34"/></svg>`;
}
