import { renderReact } from '../core/bridge.js';
import { $$ } from '../core/helpers.js';
import { S } from '../core/state.js';
import { clock, pm25, ubNow } from '../core/time.js';
import { pushBreaking, setLive } from './live-data.js';
/* ================= Цаг агаар: Open-Meteo-оос бодит өгөгдөл =================
   Эхлээд манай сервер (/api/weather, 10 минутын кэш), байхгүй бол (нэг файлт хувилбар) Open-Meteo руу шууд. 10 минут тутам шинэчилнэ. */
export const WX_OM = 'https://api.open-meteo.com/v1/forecast?latitude=47.9184&longitude=106.9177&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FUlaanbaatar&forecast_days=6&wind_speed_unit=ms';
export let WX_AT = 0;
export async function loadWeather() {
  let w = null;
  try { const r = await fetch('/api/weather'); if (r.ok) w = await r.json(); } catch (e) { /* сервергүй */ }
  if (!w || typeof w.temp !== 'number') {
    try {
      const j = await (await fetch(WX_OM)).json(), c = j.current, d = j.daily;
      w = { temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m, wind: c.wind_speed_10m, dir: c.wind_direction_10m, code: c.weather_code, day: c.is_day, daily: d.time.map((tm, i) => [tm, d.temperature_2m_max[i], d.temperature_2m_min[i], d.weather_code[i]]) };
    } catch (e) { return; }   // сүлжээгүй бол хуучин утгаа үлдээнэ
  }
  if (!w || typeof w.temp !== 'number') return;
  WX_AT = Date.now(); S.wx = Object.assign({}, w, { live: 1 }); S.temp = Math.round(w.temp);
  paintWeather();
}
/* ================= Агаарын чанар: IQAir (сервер /api/air, 10 минутын кэш, 24 цагийн түүхтэй) =================
   Түлхүүргүй (IQAIR_API_KEY) эсвэл сервергүй үед жишээ утга хэвээр үлдэнэ. */
export let AIR_AT = 0;
export async function loadAir() {
  let a = null;
  try { const r = await fetch('/api/air'); if (r.ok) a = await r.json(); } catch (e) { /* сервергүй */ }
  if (!a || typeof a.aqi !== 'number') {   // сервер Open-Meteo руу хандаж чадахгүй (эсвэл сервергүй) бол хөтчөөс шууд
    try {
      const j = await (await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=47.9184&longitude=106.9177&current=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_ozone,pm2_5,pm10,nitrogen_dioxide&hourly=us_aqi&past_days=1&forecast_days=1&timezone=Asia%2FUlaanbaatar')).json();
      const c = j.current, h = j.hourly, now = Date.now(), ts = (s) => Date.parse(s + ':00+08:00');
      const sub = { p2: c.us_aqi_pm2_5, p1: c.us_aqi_pm10, n2: c.us_aqi_nitrogen_dioxide, o3: c.us_aqi_ozone };
      a = { aqi: Math.round(c.us_aqi), ts: ts(c.time), src: 'openmeteo', main: Object.keys(sub).filter((k) => typeof sub[k] === 'number').sort((x, y) => sub[y] - sub[x])[0] || '',
        pol: { pm25: c.pm2_5, pm10: c.pm10, no2: c.nitrogen_dioxide }, series: h.time.map((tm, i) => [ts(tm), h.us_aqi[i]]).filter(([t0, v]) => t0 <= now && t0 >= now - 25 * 3600e3 && typeof v === 'number') };
    } catch (e) { return; }
  }
  if (!a || typeof a.aqi !== 'number') return;
  AIR_AT = Date.now(); S.aqi = a.aqi; S.air = { live: 1, ts: a.ts, main: a.main || '', src: a.src || '', seriesSrc: a.seriesSrc || a.src || '', pol: a.pol || null, series: Array.isArray(a.series) ? a.series : [] };
  paintAir();
}
/* Хотын өгөгдлийн картууд (site/app/home/CityData.tsx), header-ийн утгыг React дахин зурна; AQI-ийн цифр эргэлдэнэ (setLive → rollTo) */
export function paintAir() {
  renderReact();
  setLive('aqi', S.aqi);
}
export function paintWeather() { renderReact(); }
export function startLive() {
  setInterval(() => {
    if (document.hidden) return;
    if (!(S.air && S.air.live)) {   // жишээ горимд л AQI бага зэрэг хэлбэлзэнэ; IQAir холбогдсон бол бодит утга
      const a0 = S.aqi;
      if (Math.random() < 0.55) S.aqi = Math.max(84, Math.min(91, S.aqi + (Math.random() < 0.5 ? -1 : 1)));
      setLive('aqi', S.aqi); setLive('pm25', pm25());
      if (S.aqi !== a0) renderReact();   // AQI-ийн график, ангилал (site/app/home/CityData.tsx); цифрийг дээрх setLive эргэлдүүлнэ
    }
    $$('[data-live="clocks"]').forEach((el) => { el.textContent = clock(true); });
  }, 5000);
  setInterval(() => {
    if (document.hidden) return;
    $$('[data-live="clock"]').forEach((el) => { el.textContent = clock(); });
    $$('[data-live="clocks"]').forEach((el) => { el.textContent = clock(true); });
    if (S.route === 'page' && S.page === 'data' && ubNow().getSeconds() === 0) renderReact();   // нарны нум (site/app/home/PageHero.tsx)
  }, 1000);
  setInterval(() => { if (!document.hidden) pushBreaking(); }, 22000);
  setInterval(() => { if (!document.hidden) renderReact(); }, 60000);   // шуурхай мэдээний цаг, «шинэ» тэмдэг
}

