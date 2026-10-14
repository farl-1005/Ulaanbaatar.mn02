/* ================= City data ================= */
/* AQI 24 цаг: IQAir-ийн бодит хэмжилт (серверийн air_log, цагаар дундажлана; хэмжилтгүй цаг хоосон) эсвэл түлхүүргүй үед жишээ муруй */
function aqiSeries() {
  if (S.air && S.air.live) {
    const HR = 3600e3, end = Math.floor(Date.now() / HR) * HR;
    return Array.from({ length: 24 }, (_, i) => {
      const st = end - (23 - i) * HR, pts = (S.air.series || []).filter(([ts]) => ts >= st && ts < st + HR).map((x) => x[1]);
      if (i === 23) pts.push(S.aqi);
      return { hr: new Date(st + 8 * HR).getUTCHours(), v: pts.length ? Math.round(pts.reduce((x, y) => x + y, 0) / pts.length) : null };
    });
  }
  const h = ubNow().getHours(), shift = S.aqi - AQI_PROFILE[h];
  return Array.from({ length: 24 }, (_, i) => { const hr = (h - 23 + i + 24) % 24; return { hr, v: Math.max(15, Math.round(AQI_PROFILE[hr] + shift * (i / 23))) }; });
}
function aqiPaths() {
  const d = aqiSeries(), vals = d.map((x) => x.v).filter((v) => v != null), top = Math.max(200, Math.ceil(Math.max(0, ...vals) / 100) * 100);   // утаатай өдөр шкал өөрөө томорно
  const W = 600, H = 200, X = (i) => (i / 23) * W, Y = (v) => H - (Math.min(v, top) / top) * H;
  const idx = d.map((x, i) => (x.v == null ? -1 : i)).filter((i) => i >= 0);
  let p = '';
  idx.forEach((i, k) => {
    const x1 = X(i), y1 = Y(d[i].v);
    if (!k) { p = `M${x1.toFixed(1)} ${y1.toFixed(1)}`; return; }
    const j = idx[k - 1], x0 = X(j), y0 = Y(d[j].v), cx = (x0 + x1) / 2;
    p += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  const ok = idx.length > 1;
  return { d, p: ok ? p : '', area: ok ? p + ` L${X(idx[idx.length - 1])} ${H} L${X(idx[0])} ${H} Z` : '', Y, top, n: idx.length };
}
/* Эх сурвалжийн тэмдэглэгээ: IQAir (хэмжилт) эсвэл Open-Meteo (CAMS загвар, CC BY 4.0) */
function airSrcHTML() {
  const a = S.air || {}, om = '<a href="https://open-meteo.com/" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">Open-Meteo</a> · CAMS';
  if (a.src === 'iqair') return `${L(['Эх сурвалж', 'Source'])}: <a href="https://www.iqair.com/mongolia/ulaanbaatar" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">IQAir</a>${a.pol || a.seriesSrc === 'openmeteo' ? ' + ' + om : ''}`;
  return `${L(['Эх сурвалж', 'Source'])}: ${om}`;
}
function aqiChart() {
  const { d, p, area, Y, top, n } = aqiPaths(), marks = [50, 100, 150, 200, 300].filter((v) => v < top);
  const bands = [[0, 50, '#10A36A'], [50, 100, '#E5A800'], [100, 150, '#F08C1A'], [150, 200, '#D81E34'], [200, 300, '#8F3F97'], [300, 500, '#7E0023']].filter(([a]) => a < top).map(([a, b, c]) => [a, Math.min(b, top), c]);
  return `<div class="relative" id="aqi-wrap"><svg viewBox="0 0 600 200" preserveAspectRatio="none" class="w-full h-[170px] block overflow-visible" role="img" aria-label="AQI, 24h"><defs><linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F08C1A" stop-opacity=".38"/><stop offset="1" stop-color="#F08C1A" stop-opacity="0"/></linearGradient></defs>
    ${bands.map(([a, b, c]) => `<rect x="0" y="${Y(b)}" width="600" height="${Y(a) - Y(b)}" fill="${c}" opacity=".07"/>`).join('')}
    ${marks.map((v) => `<line x1="0" x2="600" y1="${Y(v)}" y2="${Y(v)}" stroke="rgb(var(--c-line))" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/>`).join('')}
    <path class="aqi-area" id="aqi-area" d="${area}" fill="url(#aqiFill)"/><path class="aqi-line" id="aqi-line" pathLength="1" d="${p}" fill="none" stroke="#F08C1A" stroke-width="3" stroke-linecap="round"/>
    <line id="aqi-x" x1="0" x2="0" y1="0" y2="200" stroke="rgb(var(--c-ink))" stroke-opacity=".3" vector-effect="non-scaling-stroke" style="display:none"/></svg>
    <span id="aqi-now" class="absolute w-3 h-3 rounded-full bg-[#F08C1A] ring-4 ring-[#F08C1A]/25 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style="left:100%;top:${(Y(S.aqi) / 200) * 100}%"></span>
    <div id="aqi-tip" class="absolute -translate-x-1/2 -translate-y-full -mt-3 card !rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold shadow-lg pointer-events-none whitespace-nowrap" style="display:none"></div>
    ${marks.map((v) => `<span class="absolute -left-1 text-[10.5px] text-muted tnum -translate-y-1/2 bg-card pr-1" style="top:${(Y(v) / 200) * 100}%">${v}</span>`).join('')}</div>
    <div class="relative h-4 mt-2 text-[11.5px] text-muted tnum">${d.map((x, i) => (i % 4 === 3 ? `<span class="absolute ${i === 23 ? '-translate-x-full' : '-translate-x-1/2'}" style="left:${(i / 23) * 100}%">${pad(x.hr)}:00</span>` : '')).join('')}</div>${S.air && S.air.live ? `<p class="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11.5px] text-muted"><span>${n < 24 && S.air.seriesSrc === 'iqair' ? L([`IQAir хэмжилт хуримтлагдаж байна: ${n}/24 цаг`, `Collecting IQAir readings: ${n}/24 hours`]) : ''}</span><span>${airSrcHTML()}</span></p>` : ''}`;
}
function updAqiChart() {
  const line = $('#aqi-line'); if (!line || (S.air && S.air.live)) return;
  const { p, area, Y } = aqiPaths();
  line.setAttribute('d', p); $('#aqi-area').setAttribute('d', area); $('#aqi-now').style.top = (Y(S.aqi) / 200) * 100 + '%';
}
function liveBadge(color) { return `<span class="live-badge"><span class="live" style="--dot:${color}"></span>${t('live')}</span>`; }
/* ================= «Амьд хот»: өгөгдлөөс хамаарах хөдөлгөөн (Хотын өгөгдөл) ================= */
let DATA_IO = null;
const rnd = (a, b) => a + Math.random() * (b - a);
/* Эргэлддэг цифр (одометр): цифр бүр 0–9 баганаар, --d-ээр байрлана. fromZero: эхлээд 0, харагдах үед жинхэнэ утга руу эргэлдэнэ */
function rollWrap(v, fromZero) {
  let k = 0;
  return `<span class="sr-only">${esc(String(v))}</span><span class="rd-w" aria-hidden="true">${[...String(v)].map((ch) => (/\d/.test(ch)
    ? `<span class="rd"><span class="rd-s" style="--d:${fromZero ? 0 : ch};--k:${k++}" ${fromZero ? `data-to="${ch}"` : ''}>${'0123456789'.split('').map((n) => `<i>${n}</i>`).join('')}</span></span>`
    : `<span class="rd-c">${/\s/.test(ch) ? '&nbsp;' : esc(ch)}</span>`)).join('')}</span>`;
}
function rollTo(el, v) {
  const s = String(v), sr = el.querySelector('.sr-only'), cols = el.querySelectorAll('.rd-w > span');
  if (!sr || cols.length !== s.length || [...s].some((ch, i) => /\d/.test(ch) !== cols[i].classList.contains('rd'))) { el.innerHTML = rollWrap(s); return; }
  sr.textContent = s;
  [...s].forEach((ch, i) => { if (/\d/.test(ch)) { const c = cols[i].firstElementChild; c.removeAttribute('data-to'); c.style.setProperty('--d', ch); } });   // харагдахаас өмнө шинэчлэгдсэн бол хуучин утга руу буцахгүй
}
/* «Таны амьсгалж буй агаар»: AQI ихсэх тусам тоосонцор олширч, өнгө нь AQI ангиллын өнгө */
function pmFX() {
  const c = aqiCat(S.aqi), n = S.aqi <= 50 ? 8 : S.aqi <= 100 ? 22 : S.aqi <= 150 ? 34 : 48;
  return `<div class="pm-field" aria-hidden="true" style="--pc:${c.c}">${Array.from({ length: n }, () => `<i style="--x:${rnd(0, 100).toFixed(1)}%;--y:${rnd(0, 100).toFixed(1)}%;--s:${rnd(2, 6).toFixed(1)}px;--t:${rnd(9, 20).toFixed(1)}s;--dl:${(-rnd(0, 20)).toFixed(1)}s;--dx:${Math.round(rnd(-46, 46))}px;--dy:${Math.round(rnd(-34, 34))}px;--o:${rnd(0.16, 0.5).toFixed(2)}"></i>`).join('')}</div>`;
}
/* Цаг агаарын амьд тэнгэр: 0°-оос доош бол цас, үүлтэй, Улаанбаатарын цагаар үүр/өдөр/үдэш/шөнө (шөнө од) */
function skyFX() {
  const h = ubNow().getHours(), tod = h >= 20 || h < 6 ? 'night' : h < 9 ? 'dawn' : h >= 17 ? 'dusk' : 'day';
  const c = +S.wx.code, snowing = [71, 73, 75, 77, 85, 86].includes(c), raining = (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || c >= 95, clouds = c >= 2;
  const rain = raining ? Array.from({ length: 40 }, () => `<i class="rd" style="--x:${rnd(0, 100).toFixed(1)}%;--t:${rnd(0.6, 1.1).toFixed(2)}s;--dl:${(-rnd(0, 1.2)).toFixed(2)}s;--o:${rnd(0.25, 0.6).toFixed(2)}"></i>`).join('') : '';
  const snow = snowing ? Array.from({ length: 36 }, () => `<i style="--x:${rnd(0, 100).toFixed(1)}%;--s:${rnd(2, 5).toFixed(1)}px;--t:${rnd(8, 16).toFixed(1)}s;--dl:${(-rnd(0, 16)).toFixed(1)}s;--dx:${Math.round(rnd(-36, 36))}px;--o:${rnd(0.3, 0.85).toFixed(2)}"></i>`).join('') : '';
  const stars = tod === 'night' ? Array.from({ length: 18 }, () => `<b style="--x:${rnd(2, 98).toFixed(1)}%;--y:${rnd(3, 42).toFixed(1)}%;--t:${rnd(2, 5).toFixed(1)}s;--dl:${(-rnd(0, 5)).toFixed(1)}s"></b>`).join('') : '';
  return `<div class="sky sky-${tod}" aria-hidden="true"><span class="sky-glow"></span>${stars}${clouds ? '<span class="sky-cloud sky-c1"></span><span class="sky-cloud sky-c2"></span>' : ''}${snow}${rain}</div>`;
}
/* Цаг агаарын карт (Open-Meteo): өнөөдөр + дараагийн 5 хоног. 10 минут тутам paintWeather() дахин зурна. */
function weatherCardInner() {
  const w = S.wx, wi = wxInfo(w.code, w.day);
  const days = w.daily ? w.daily.slice(1, 6).map(([d, mx, mn, cd]) => [new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)), mx, mn, wxInfo(cd, 1)]) : FORECAST.map((f, i) => [addDays(today(), i + 1), f[0], f[1], { i: f[2], t: '' }]);
  return `${skyFX()}<div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-[17px]">${t('weather')}</h3><p class="text-[13px] text-muted">${fDate(today(), true)}</p></div>${liveBadge('#145095')}</div>
      <div class="mt-4 flex items-center gap-5"><span class="wx-ic w-20 h-20 rounded-3xl bg-ubblue/10 text-ubblue grid place-items-center">${ic(wi.i, 'w-11 h-11', 1.6)}</span><div><p class="text-[56px] leading-none font-extrabold tnum tracking-tight">${wxT(w.temp)}°</p><p class="font-semibold text-muted mt-1">${esc(wi.t)}, ${t('feels').toLowerCase()} ${wxT(w.feels)}°</p></div></div>
      <div class="mt-5 grid grid-cols-2 gap-2 text-[13.5px]"><div class="rounded-xl bg-soft p-3 flex items-center gap-2" title="${esc(wxDir(w.dir))}">${ic('wind', 'w-[18px] h-[18px] text-muted')}<span class="text-muted">${t('wind')}</span><b class="ml-auto tnum">${Math.round(w.wind)} ${L(['м/с', 'm/s'])}</b></div><div class="rounded-xl bg-soft p-3 flex items-center gap-2">${ic('droplet', 'w-[18px] h-[18px] text-muted')}<span class="text-muted">${t('humidity')}</span><b class="ml-auto tnum">${Math.round(w.hum)}%</b></div></div>
      <div class="mt-auto pt-5 grid grid-cols-5 gap-1 text-center">${days.map(([dd, mx, mn, inf]) => `<div class="rounded-xl py-2" title="${esc(inf.t)}"><p class="text-[12px] font-semibold text-muted">${EN() ? EN_WD[dd.getDay()] : MN_WDS[dd.getDay()]}</p>${ic(inf.i, 'w-6 h-6 mx-auto my-1.5 text-ink/80', 1.7)}<p class="text-[13px] font-bold tnum">${wxT(mx)}°</p><p class="text-[12px] text-muted tnum">${wxT(mn)}°</p></div>`).join('')}</div>
      ${w.live ? `<p class="mt-3 text-[11.5px] text-muted text-right">${L(['Эх сурвалж', 'Source'])}: <a href="https://open-meteo.com/" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">Open-Meteo</a></p>` : ''}`;
}
/* Агаарын чанарын карт (IQAir ирэхэд paintAir() дахин зурна) */
function aqiCardInner(drawn) {
  const c = aqiCat(S.aqi), live = S.air && S.air.live, pol = live && S.air.pol;
  return `${pmFX()}<div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-[17px]">${t('aqi')}</h3><p class="text-[13px] text-muted">${t('aqi24')}</p></div>${liveBadge(c.c)}</div>
      <div class="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3"><div><p class="text-[60px] leading-[.9] font-extrabold tnum tracking-tight" data-live="aqi" data-roll>${rollWrap(S.aqi, !drawn)}</p><p class="mt-2 font-bold" style="color:${c.c}">${t(c.k)}</p></div><p class="text-[13.5px] text-muted max-w-[36ch] leading-snug">${t(c.adv)}</p>
      ${live ? `<div class="ml-auto grid grid-cols-2 gap-x-5 gap-y-1 text-[13px]">${pol ? [['PM2.5', pol.pm25], ['PM10', pol.pm10], ['NO₂', pol.no2]].map(([k, v]) => `<span class="text-muted">${k}${POL[S.air.main] === k ? ' •' : ''}</span><b class="tnum">${v == null ? '—' : Math.round(v)} µg/m³</b>`).join('') : ''}<span class="text-muted">${t('mainPol')}</span><b>${esc(POL[S.air.main] || S.air.main || '—')}</b><span class="text-muted">${L(['Шинэчлэгдсэн', 'Updated'])}</span><b class="tnum">${hhmm(new Date(S.air.ts + (480 + new Date().getTimezoneOffset()) * 60000))}</b></div>` : `<div class="ml-auto grid grid-cols-2 gap-x-5 gap-y-1 text-[13px]"><span class="text-muted">PM2.5</span><b class="tnum"><span data-live="pm25" data-roll>${rollWrap(pm25(), !drawn)}</span> µg/m³</b><span class="text-muted">PM10</span><b class="tnum">58 µg/m³</b><span class="text-muted">NO2</span><b class="tnum">21 ppb</b></div>`}</div>
      <div class="mt-5 pl-5">${aqiChart()}</div>`;
}
function renderData() {
  if (onHome()) {   // нүүрэнд: агаарын чанар + цаг агаарын бүтэн карт (бусад нь /data хуудсанд)
    const drawn = $('#data').classList.contains('drawn');
    $('#data').innerHTML = `<div class="on-navy">${homeWrap(homeHead(t('dataTitle'), t('dataDesc'), 'data-act="page" data-v="data"')
      + `<div class="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5" id="data-grid"><div class="card fx-card p-5 sm:p-6 md:col-span-7" data-card="aqi">${aqiCardInner(drawn)}</div><div class="card fx-card p-5 sm:p-6 md:col-span-5 flex flex-col" data-card="weather">${weatherCardInner()}</div></div>`)}</div>`;
    dataFx(0);
    return;
  }
  const c = aqiCat(S.aqi), tot = POP.reduce((a, p) => a + p[2], 0), max = POP[0][2];
  const plan = BUDGET_Q.reduce((a, q) => a + q[0], 0), act = BUDGET_Q.reduce((a, q) => a + q[1], 0), bpct = Math.round((act / plan) * 100), bmx = Math.max(...BUDGET_Q.map((q) => q[0]));
  const ang = -90 + (S.traffic / 10) * 180;
  const others = POP.slice(6).reduce((a, p) => a + p[2], 0);
  const popRows = POP.slice(0, 6).map((p) => [EN() ? p[1] : p[0], p[2]]).concat([[L(['Бусад 3 дүүрэг', 'Other 3 districts']), others]]);
  const k = (v) => (EN() ? Math.round(v / 1000) + 'k' : Math.round(v / 1000) + ' мян');
  const drawn = $('#data').classList.contains('drawn');
  $('#data').innerHTML = `<div class="on-navy"><div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"><div>
  <div class="pg-dup flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div class="sec-ttl"><h2 class="h-section">${t('dataTitle')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('dataDesc')}</p></div><span class="live-badge self-start lg:self-auto"><span class="live" style="--dot:rgb(var(--c-green))"></span>${t('updated')} <span class="tnum text-ink" data-live="clocks">${clock(true)}</span></span></div>
  <div class="mt-8 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-5" id="data-grid">
    <div class="card fx-card p-5 sm:p-6 md:col-span-6 lg:col-span-7" data-card="aqi">${aqiCardInner(drawn)}</div>
    <div class="card fx-card p-5 sm:p-6 md:col-span-6 lg:col-span-5 flex flex-col" data-card="weather">${weatherCardInner()}</div>
    <div class="card p-5 sm:p-6 md:col-span-3 lg:col-span-4" data-card="traffic"><div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-[17px]">${t('congestion')}</h3><p class="text-[13px] text-muted">0–10</p></div>${liveBadge('rgb(var(--c-amber))')}</div>
      <div class="mt-3 mx-auto w-[210px]"><svg viewBox="0 0 200 108" class="w-full" aria-hidden="true"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#10A36A"/><stop offset=".5" stop-color="#E5A800"/><stop offset="1" stop-color="#D81E34"/></linearGradient></defs><path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="rgb(var(--c-line))" stroke-width="14" stroke-linecap="round"/><path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="url(#gg)" stroke-width="14" stroke-linecap="round" opacity=".9"/><g class="needle" data-ang="${ang}" style="transform-origin:100px 100px;transform:rotate(-90deg)"><path d="M100 100 L100 34" stroke="rgb(var(--c-ink))" stroke-width="4" stroke-linecap="round"/></g><circle cx="100" cy="100" r="7" fill="rgb(var(--c-ink))"/></svg><p class="text-center -mt-1"><b class="text-[30px] font-extrabold tnum">${S.traffic}</b><span class="text-muted font-semibold">/10</span> <span class="text-[13px] font-semibold text-amberink">${t('busy')}</span></p></div>
      <p class="mt-4 text-[13px] font-semibold text-muted">${t('busiest')}</p><ul class="mt-2 space-y-2.5">${ROADS.map(([n, v]) => `<li><div class="flex justify-between text-[13.5px]"><span>${esc(L(n))}</span><b class="tnum">${v}</b></div><div class="mt-1 h-1.5 rounded-full bg-line overflow-hidden"><div class="hbar h-full rounded-full" style="width:${v * 10}%;background:${v > 8 ? '#D81E34' : '#F08C1A'}"></div></div></li>`).join('')}</ul></div>
    <div class="card p-5 sm:p-6 md:col-span-3 lg:col-span-4" data-card="pop"><h3 class="font-bold text-[17px]">${t('population')}</h3><p class="text-[13px] text-muted">${t('popNote')}</p><p class="mt-3 text-[40px] leading-none font-extrabold tnum tracking-tight" data-count="${tot}">${num(tot)}</p>
      <ul class="mt-5 space-y-2">${popRows.map(([n, v]) => `<li class="grid grid-cols-[minmax(0,118px)_1fr_auto] items-center gap-3 text-[13px]"><span class="truncate">${esc(n)}</span><span class="h-2 rounded-full bg-line overflow-hidden"><span class="hbar block h-full rounded-full bg-ubblue" style="width:${(v / max) * 100}%"></span></span><b class="tnum text-[12.5px]">${k(v)}</b></li>`).join('')}</ul></div>
    <div class="card p-5 sm:p-6 md:col-span-6 lg:col-span-4" data-card="budget"><h3 class="font-bold text-[17px]">${t('budgetExec')}</h3><p class="text-[13px] text-muted">${t('budgetNote', { v: EN() ? '₮3.9 trn' : '3.9 их наяд ₮' })}</p>
      <div class="mt-4 flex items-center gap-5"><span class="relative grid place-items-center">${ring(bpct, 96, 10, 'rgb(var(--c-blue))')}<b class="absolute text-[22px] font-extrabold tnum">${bpct}%</b></span><div class="text-[13px] space-y-1.5"><p class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-[2px] bg-line"></i>${t('plan')}</p><p class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-[2px] bg-ubblue"></i>${t('actual')}</p></div></div>
      <div class="mt-5 h-[110px] flex items-end gap-4">${BUDGET_Q.map((q, i) => `<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"><div class="w-full flex items-end gap-1 h-full"><span class="bar-grow flex-1 rounded-t-[6px] bg-line" style="height:${(q[0] / bmx) * 100}%"></span><span class="bar-grow flex-1 rounded-t-[6px] bg-ubblue" style="height:${(q[1] / bmx) * 100}%;transition-delay:${0.1 + i * 0.08}s"></span></div><span class="text-[11.5px] text-muted font-semibold">${['I', 'II', 'III', 'IV'][i]}</span></div>`).join('')}</div></div>
  </div></div></div></div>`;
  dataFx(tot);
}
/* Хотын өгөгдлийн картууд дэлгэцэнд орж ирэхэд: зүү, тоолуур, эргэлдэх цифр; дэлгэцээс гарвал тоосонцор зогсоно; AQI графикийн hover */
function dataFx(tot) {
  const grid = $('#data-grid'), sec = $('#data'); if (!grid) return;
  const reveal = () => {
    sec.classList.add('drawn');
    const n = $('.needle', grid); if (n) n.style.transform = `rotate(${n.dataset.ang}deg)`;
    const cnt = $('[data-count]', grid); if (cnt && !sec.dataset.counted) { sec.dataset.counted = '1'; countUp(cnt, tot); }
    $$('.rd-s[data-to]', grid).forEach((s) => { s.style.setProperty('--d', s.dataset.to); s.removeAttribute('data-to'); });   // цифрүүд 0-ээс эргэлдэнэ
  };
  if (sec.classList.contains('drawn')) reveal(); else observeOnce(grid, reveal, 0.15);
  if (DATA_IO) DATA_IO.disconnect();   // цас, тоосонцор: дэлгэцэнд харагдахгүй үед зогсоно
  if ('IntersectionObserver' in window) { DATA_IO = new IntersectionObserver(([en]) => sec.classList.toggle('fx-off', !en.isIntersecting)); DATA_IO.observe(sec); }
  bindAqiHover();
}
function bindAqiHover() {
  const wrap = $('#aqi-wrap');
  if (wrap) {
    const tip = $('#aqi-tip'), xl = $('#aqi-x');
    const move = (cx) => { const r = wrap.getBoundingClientRect(), i = Math.max(0, Math.min(23, Math.round(((cx - r.left) / r.width) * 23))), P = aqiPaths(), d = P.d[i]; if (d.v == null) { tip.style.display = 'none'; xl.style.display = 'none'; return; } const cat = aqiCat(d.v); xl.style.display = ''; xl.setAttribute('x1', (i / 23) * 600); xl.setAttribute('x2', (i / 23) * 600); tip.style.display = ''; tip.style.left = (i / 23) * 100 + '%'; tip.style.top = (P.Y(d.v) / 200) * 100 + '%'; tip.innerHTML = `<span class="text-muted font-semibold">${pad(d.hr)}:00</span> AQI ${d.v} <span style="color:${cat.c}">${t(cat.k)}</span>`; };
    wrap.addEventListener('pointermove', (e) => move(e.clientX));
    wrap.addEventListener('pointerleave', () => { tip.style.display = 'none'; xl.style.display = 'none'; });
  }
}

