'use client';
/* Хамгийн дээд бараан мөр: цаг агаар, агаарын чанар, түгжрэл (хулганаар заахад дэлгэрэнгүй), цаг, лавлах утас.
   Гар утсанд хэвтээ гүйлгэдэг карт хэлбэрээр. Утгыг features/weather.js шинэчилнэ. */
import { Fragment, type ReactNode } from 'react';
import { Icon, Live, useUB, type Pulse, type UB } from '../ub';

const AQI_SCALE = 'linear-gradient(90deg,#10A36A 0 16.67%,#E5A800 16.67% 33.33%,#F08C1A 33.33% 50%,#D81E34 50% 66.67%,#8F3F97 66.67% 83.33%,#7E0023 83.33%)';

interface Seg { hl: string; strip: ReactNode; card: ReactNode; pop: ReactNode }

function segments(ub: UB, p: Pulse): Seg[] {
  const { t, L } = ub;
  const bar = Array.from({ length: 10 }, (_, i) => <i key={i} className={`w-[3px] h-3 rounded-full ${i < p.traffic ? 'bg-ubamber' : 'bg-white/20'}`} />);
  const src = (s: string) => <p className="mt-2 text-[11.5px] text-muted">{L(['Эх сурвалж', 'Source'])}: {s}</p>;
  return [
    {
      hl: 'weather',
      strip: <><Icon ub={ub} n={p.wxIcon} c="w-4 h-4 text-white/85" /><b className="tnum">{p.temp}°C</b><span className="text-white/60">{p.wxText}</span></>,
      card: <><Icon ub={ub} n={p.wxIcon} c="w-[22px] h-[22px] text-white/90" /><span className="text-left leading-tight"><b className="block tnum text-[15px]">{p.temp}°C</b><span className="block lg:hidden xl:block text-[11.5px] text-white/60">{p.wxText}</span></span></>,
      pop: <>
        <p className="text-[13px] text-muted">{t('weather')} · {p.wxText}</p>
        <p className="text-[26px] font-extrabold tnum mt-1">{p.temp}°C <span className="text-[14px] font-semibold text-muted">{t('feels')} {p.feels}°</span></p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-[13px]"><span className="text-muted">{t('wind')}</span><b>{p.wind} {L(['м/с', 'm/s'])}, {p.dir}</b><span className="text-muted">{t('humidity')}</span><b>{p.hum}%</b></div>
        {p.wxLive && <p className="mt-3 text-[11.5px] text-muted">{L(['Эх сурвалж', 'Source'])}: Open-Meteo</p>}
      </>,
    },
    {
      hl: 'aqi',
      strip: <><span className="live" style={{ ['--dot' as string]: p.aqiColor }} /><b className="tnum">AQI <Live k="aqi" v={p.aqi} /></b><span className="text-white/60">{p.aqiLabel}</span></>,
      card: <><span className="live" style={{ ['--dot' as string]: p.aqiColor }} /><span className="text-left leading-tight"><b className="block tnum text-[15px]">AQI <Live k="aqi" v={p.aqi} /></b><span className="block lg:hidden xl:block text-[11.5px] text-white/60">{p.aqiLabel}</span></span></>,
      pop: <>
        <p className="text-[13px] text-muted">{t('aqi')}</p>
        <p className="text-[26px] font-extrabold tnum mt-1"><Live k="aqi" v={p.aqi} /> <span className="text-[14px] font-semibold" style={{ color: p.aqiColor }}>{p.aqiLabel}</span></p>
        <div className="mt-3 h-2 rounded-full relative" style={{ background: AQI_SCALE }}><i className="absolute -top-1 w-1.5 h-4 rounded-[3px] bg-ink" style={{ left: `calc(${p.aqiPos.toFixed(1)}% - 3px)` }} /></div>
        <p className="text-[13px] text-muted mt-3 leading-snug">{p.aqiAdvice}</p>
        {p.airSrc && src(p.airSrc)}
      </>,
    },
    {
      hl: 'traffic',
      strip: <><Icon ub={ub} n="car-front" c="w-4 h-4 text-white/85" /><span className="text-white/60">{t('traffic')}</span><b className="tnum">{p.traffic}/10</b><span className="flex items-center gap-[2px]">{bar}</span></>,
      card: <><Icon ub={ub} n="car-front" c="w-[22px] h-[22px] text-white/90" /><span className="text-left leading-tight"><b className="block tnum text-[15px]">{p.traffic}/10</b><span className="flex items-center gap-[2px] mt-1">{bar}</span></span></>,
      pop: <>
        <p className="text-[13px] text-muted">{t('congestion')}</p>
        <p className="text-[26px] font-extrabold tnum mt-1">{p.traffic}/10 <span className="text-[14px] font-semibold text-amberink">{t('busy')}</span></p>
        <ul className="mt-3 space-y-2 text-[13px]">{p.roads.map(([n, v]) => <li key={n} className="flex justify-between gap-3"><span>{n}</span><b className="tnum">{v}</b></li>)}</ul>
      </>,
    },
  ];
}

export function TopStrip() {
  const ub = useUB();
  if (!ub) return null;
  const { t } = ub, segs = segments(ub, ub.pulse());
  const go = (hl: string) => ({ 'data-act': 'go', 'data-sec': 'data', 'data-hl': hl });
  return (
    <>
      <div className="hidden lg:block">
        <div className="max-w-site mx-auto px-8 h-[38px] flex items-center justify-between gap-6">
          <div id="pulse-strip"><div className="flex items-center -ml-3">
            {segs.map((s, i) => (
              <Fragment key={s.hl}>
                {i > 0 && <span className="w-px h-4 bg-white/15 mx-1" />}
                <div className="pulse-seg">
                  <button type="button" className="h-[38px] px-3 flex items-center gap-2 text-[12.5px] rounded-md hover:bg-white/10 transition-colors whitespace-nowrap" {...go(s.hl)}>{s.strip}</button>
                  <div className="pop"><div className="card p-4 text-ink shadow-2xl">{s.pop}
                    <button type="button" className="mt-3 text-[13px] font-bold text-ubblue inline-flex items-center gap-1" {...go(s.hl)}>{t('more')}<Icon ub={ub} n="chevron-right" c="w-4 h-4" /></button>
                  </div></div>
                </div>
              </Fragment>
            ))}
          </div></div>
          <div className="flex items-center gap-5 text-[12.5px] text-white/70 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 tnum"><Icon ub={ub} n="clock-3" c="w-3.5 h-3.5" /><Live k="clock" v={ub.clock()} /></span>
            <span className="inline-flex items-center gap-1.5"><Icon ub={ub} n="phone" c="w-3.5 h-3.5" />{t('hotlineShort')} <b className="text-white tnum">1200</b></span>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">
          {segs.map((s) => <button key={s.hl} type="button" className="h-11 px-3.5 rounded-xl bg-white/[.07] border border-white/10 whitespace-nowrap flex items-center gap-2.5 shrink-0" {...go(s.hl)}>{s.card}</button>)}
          <span className="shrink-0 h-11 px-3 flex items-center gap-2 text-[12.5px] text-white/60 tnum"><Icon ub={ub} n="clock-3" c="w-4 h-4" /><Live k="clock" v={ub.clock()} /></span>
        </div>
      </div>
    </>
  );
}
