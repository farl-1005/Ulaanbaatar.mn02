import { Injectable } from '@nestjs/common';

/* Open-Meteo (түлхүүргүй, CC BY 4.0): одоогийн цаг агаар + 6 хоногийн урьдчилсан мэдээ */
const URL = 'https://api.open-meteo.com/v1/forecast?latitude=47.9184&longitude=106.9177&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FUlaanbaatar&forecast_days=6&wind_speed_unit=ms';

export interface Weather {
  at: number; time: string; temp: number; feels: number; hum: number; wind: number; dir: number; code: number; day: number;
  /** [огноо, дээд, доод, код] */
  daily: [string, number, number, number][];
}

/** Цаг агаар. Бүх зочин нэг хариуг хуваалцана: Open-Meteo руу 10 минутад нэг л удаа хандана. */
@Injectable()
export class WeatherService {
  private cache: Weather | null = null;
  private busy: Promise<void> | null = null;

  /** Сүүлд амжилттай авсан утга (Open-Meteo түр тасарвал үүнийг өгнө) */
  get last() {
    return this.cache;
  }

  async current(): Promise<Weather> {
    if (this.cache && Date.now() - this.cache.at < 600e3) return this.cache;
    if (!this.busy) this.busy = this.fetch().finally(() => { this.busy = null; });
    await this.busy;
    return this.cache!;
  }

  private async fetch() {
    const r = await fetch(URL, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j: any = await r.json(), c = j.current, d = j.daily;
    this.cache = {
      at: Date.now(), time: c.time, temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m,
      wind: c.wind_speed_10m, dir: c.wind_direction_10m, code: c.weather_code, day: c.is_day,
      daily: d.time.map((tm: string, i: number) => [tm, d.temperature_2m_max[i], d.temperature_2m_min[i], d.weather_code[i]]),
    };
  }
}
