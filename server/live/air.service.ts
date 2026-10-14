import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Database } from '../database/database';

/* Агаарын чанарын 2 эх сурвалж:
   - IQAir / AirVisual (IQAIR_API_KEY, .env): газар дээрх хэмжилт. Үнэгүй багц сард 10 000 хүсэлт → 15 минут тутам уншина (сард ~2 900).
     Хэмжилт бүрийг air_log-д хадгалж, сүүлийн 24 цагийн графикийг бодит утгаар зурна.
   - Open-Meteo Air Quality (түлхүүргүй, CAMS загвар, CC BY 4.0): AQI US, PM2.5, PM10, NO₂, SO₂, CO, O₃ + 24 цагийн түүх.
     IQAir түлхүүргүй үед бүх өгөгдөл эндээс; түлхүүртэй үед бохирдуулагчийн хэмжээ, (түүх хангалтгүй бол) графикийг эндээс авна. */
const OPEN_METEO = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=47.9184&longitude=106.9177&current=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_ozone,us_aqi_sulphur_dioxide,us_aqi_carbon_monoxide,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&hourly=us_aqi&past_days=1&forecast_days=1&timezone=Asia%2FUlaanbaatar';
const IQAIR_CITY = 'https://api.airvisual.com/v2/city?city=Ulaanbaatar&state=Ulaanbaatar&country=Mongolia';
const IQAIR_NEAREST = 'https://api.airvisual.com/v2/nearest_city?lat=47.9184&lon=106.9177';
/** IQAir-ын алдааны мессеж → манай алдааны код */
const IQAIR_ERRORS: Record<string, string> = { incorrect_api_key: 'air_key_rejected', api_key_expired: 'air_key_rejected', call_limit_reached: 'air_limit', too_many_requests: 'air_limit' };

/** «2026-10-09T18:00» (Улаанбаатарын цаг) → ms */
const ubTs = (s: string) => Date.parse(s + ':00+08:00');

class AirError extends Error {
  constructor(message: string, readonly code: string) { super(message); }
}

interface IqAirReading { at: number; ts: number; aqi: number; main: string; aqicn: number; city: string }
export interface AirReport {
  at: number; ts: number; aqi: number; main: string; src: 'iqair' | 'openmeteo';
  /** Бохирдуулагчийн хэмжээ (мкг/м³) */
  pol: Record<string, number> | null;
  /** [ms, AQI] сүүлийн 24 цаг */
  series: [number, number][];
  seriesSrc?: 'iqair' | 'openmeteo';
}

@Injectable()
export class AirService implements OnModuleInit, OnModuleDestroy {
  private iq: IqAirReading | null = null;
  private iqBusy: Promise<void> | null = null;
  private om: AirReport | null = null;
  private omBusy: Promise<void> | null = null;
  private timers: NodeJS.Timeout[] = [];

  constructor(private readonly db: Database) {}

  /** Зочингүй үед ч 24 цагийн түүх тасрахгүйн тулд IQAir-ыг 15 минут тутам уншина (түлхүүртэй үед л) */
  onModuleInit() {
    if (!process.env.IQAIR_API_KEY) return;
    const poll = (force: boolean) => this.iqair(force).catch((e) => console.warn('  ⚠ IQAir:', e.message));
    this.timers.push(setTimeout(() => poll(false), 3000).unref(), setInterval(() => poll(true), 900e3).unref());
  }

  onModuleDestroy() {
    this.timers.forEach(clearTimeout);
  }

  /** Сүүлд амжилттай авсан Open-Meteo-ийн утга (эх сурвалж түр тасарвал үүнийг өгнө) */
  get last() {
    return this.om;
  }

  /** /api/air: IQAir (түлхүүртэй бол) → эс бөгөөс Open-Meteo. Бохирдуулагчийн хэмжээ үргэлж Open-Meteo-оос. */
  async now(): Promise<AirReport> {
    const [iq, om] = await Promise.allSettled([process.env.IQAIR_API_KEY ? this.iqair() : Promise.reject(new Error('no key')), this.openMeteo()]);
    const o = om.status === 'fulfilled' ? om.value : null, q = iq.status === 'fulfilled' ? iq.value : null;
    if (!q && !o) throw (iq.status === 'rejected' && iq.reason?.code ? iq.reason : (om as PromiseRejectedResult).reason);
    if (!q) return o!;
    const log = (await this.db.airSince(Date.now() - 25 * 3600e3)).map((r): [number, number] => [r.ts, r.aqi]);
    const useLog = log.length >= 12 || !o;
    return { at: q.at, ts: q.ts, aqi: q.aqi, main: q.main, src: 'iqair', pol: o ? o.pol : null, series: useLog ? log : o!.series, seriesSrc: useLog ? 'iqair' : 'openmeteo' };
  }

  /** IQAir: 10 минут кэш. Хэмжилтийг air_log-д (7 хоног) хадгална. */
  private async iqair(force = false): Promise<IqAirReading> {
    const key = process.env.IQAIR_API_KEY;
    if (!key) throw new AirError('air_key_missing', 'air_key_missing');
    if (!force && this.iq && Date.now() - this.iq.at < 600e3) return this.iq;
    if (!this.iqBusy) this.iqBusy = (async () => {
      const get = async (u: string) => (await fetch(u + '&key=' + encodeURIComponent(key), { signal: AbortSignal.timeout(12000) })).json() as Promise<any>;
      let j = await get(IQAIR_CITY);
      if (!j || j.status !== 'success') {
        const msg = j?.data?.message;
        if (IQAIR_ERRORS[msg]) throw new AirError(msg, IQAIR_ERRORS[msg]);
        j = await get(IQAIR_NEAREST);
      }
      if (!j || j.status !== 'success') { const msg = j?.data?.message || 'bad_response'; throw new AirError(msg, IQAIR_ERRORS[msg] || 'air_unavailable'); }
      const p = j.data.current.pollution, ts = Date.parse(p.ts) || Date.now();
      await this.db.airAdd(ts, Math.round(p.aqius), p.mainus || null);
      await this.db.airGc(Date.now() - 7 * 864e5);
      this.iq = { at: Date.now(), ts, aqi: Math.round(p.aqius), main: p.mainus || '', aqicn: p.aqicn, city: j.data.city };
    })().finally(() => { this.iqBusy = null; });
    await this.iqBusy;
    return this.iq!;
  }

  /** Open-Meteo: 10 минут кэш */
  private async openMeteo(): Promise<AirReport> {
    if (this.om && Date.now() - this.om.at < 600e3) return this.om;
    if (!this.omBusy) this.omBusy = (async () => {
      const r = await fetch(OPEN_METEO, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j: any = await r.json(), c = j.current, h = j.hourly, now = Date.now();
      const sub: Record<string, number> = { p2: c.us_aqi_pm2_5, p1: c.us_aqi_pm10, n2: c.us_aqi_nitrogen_dioxide, o3: c.us_aqi_ozone, s2: c.us_aqi_sulphur_dioxide, co: c.us_aqi_carbon_monoxide };
      const main = Object.keys(sub).filter((k) => typeof sub[k] === 'number').sort((a, b) => sub[b] - sub[a])[0] || '';   // хамгийн өндөр AQI-тай бохирдуулагч
      this.om = {
        at: now, ts: ubTs(c.time), aqi: Math.round(c.us_aqi), main, src: 'openmeteo',
        pol: { pm25: c.pm2_5, pm10: c.pm10, no2: c.nitrogen_dioxide, so2: c.sulphur_dioxide, co: c.carbon_monoxide, o3: c.ozone },
        series: h.time.map((tm: string, i: number) => [ubTs(tm), h.us_aqi[i]]).filter(([ts, v]: [number, unknown]) => ts <= now && ts >= now - 25 * 3600e3 && typeof v === 'number'),
      };
    })().finally(() => { this.omBusy = null; });
    await this.omBusy;
    return this.om!;
  }
}
