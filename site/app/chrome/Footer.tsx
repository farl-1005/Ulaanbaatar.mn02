'use client';
/* Хөл: сүлд, лавлах утас, яаралтай дугаарууд | үйлчилгээ | мэдээлэл (үндсэн цэснээс) | мэдээ хүлээн авах (features/wiring.js digest) */
import { Icon, LogoMark, itemAct, useUB, type MenuItem } from '../ub';

/** «Улаанбаатар» монгол бичгээр */
const MONG = 'ᠤᠯᠠᠭᠠᠨᠪᠠᠭᠠᠲᠤᠷ';

export function Footer() {
  const ub = useUB();
  if (!ub) return null;
  const { t } = ub, menu = ub.menu();
  const link = (it: MenuItem, k: number) => <li key={k}><button type="button" className="hover:text-white text-left transition-colors" {...itemAct(it)}>{it.t}</button></li>;
  const services = (menu.find((m) => m.k === 'nav_services') || { items: [] }).items;
  const info = menu.filter((m) => m.k !== 'nav_services').map((m) => m.items[0]).filter(Boolean);
  return (
    <div className="bg-navy text-white relative overflow-hidden">
      <div className="meander h-[18px] opacity-40" aria-hidden="true" />
      <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 flex gap-7">
          <div className="mong text-[46px] leading-none text-white/[.16] select-none hidden sm:block" lang="mn-Mong" aria-hidden="true">{MONG}</div>
          <div>
            <div className="flex items-center gap-3"><LogoMark ub={ub} c="w-11 h-11" /><div><p className="font-extrabold text-[20px] tracking-tight">{t('brand')}</p><p className="text-[13px] text-white/60">{t('slogan')}</p></div></div>
            <p className="mt-7 text-[13px] text-white/60">{t('hotline')}</p>
            <p className="text-[44px] font-extrabold tnum leading-none mt-1 tracking-tight">1200</p>
            <p className="mt-6 text-[13px] text-white/60">{t('emergency')}</p>
            <div className="mt-2 flex gap-2">
              {[['101', t('fire')], ['102', t('police')], ['103', t('ambulance')]].map(([n, l]) => (
                <span key={n} className="rounded-xl bg-white/[.07] border border-white/10 px-3 py-2"><b className="block text-[18px] tnum leading-none">{n}</b><span className="text-[11.5px] text-white/60">{l}</span></span>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2"><p className="font-bold">{t('f_services')}</p><ul className="mt-4 space-y-2.5 text-[14px] text-white/70">{services.map(link)}</ul></div>
        <div className="lg:col-span-2"><p className="font-bold">{t('f_info')}</p><ul className="mt-4 space-y-2.5 text-[14px] text-white/70">{info.map(link)}</ul></div>
        <div className="lg:col-span-4">
          <p className="font-bold">{t('digest')}</p>
          <p className="mt-2 text-[14px] text-white/65">{t('digestD')}</p>
          <form className="mt-4 flex gap-2" data-form="digest" noValidate>
            <input type="email" placeholder={t('email')} aria-label={t('email')} className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/45 focus:outline-none focus:border-white/50" />
            <button type="submit" className="btn !h-11 bg-white text-[#0B1D45] hover:bg-white/90">{t('subscribe')}</button>
          </form>
          <p className="mt-2 text-[13px] text-ubyellow min-h-[20px]" data-digest-msg="" role="status" />
          <div className="mt-5 flex gap-2" aria-hidden="true">
            {['facebook', 'youtube', 'instagram', 'twitter'].map((i) => <span key={i} className="w-10 h-10 rounded-xl bg-white/[.07] border border-white/10 grid place-items-center text-white/75"><Icon ub={ub} n={i} c="w-[18px] h-[18px]" /></span>)}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row gap-3 md:items-center justify-between text-[13px] text-white/55">
          <p>© 2026 ulaanbaatar.mn. {t('conceptNote')}</p>
          <div className="flex gap-5"><span>{t('privacy')}</span><span>{t('access')}</span><span>{t('openData')}</span></div>
        </div>
      </div>
    </div>
  );
}
