'use client';
/* 404 «Хуудас олдсонгүй» (#view-404). Өгөгдөл: src/features/news-reader.js notFoundData() (HOME.notFound).
   app.js ачаалагдахаас өмнө (useUB() === null) эсвэл 404 хуудас нээгдээгүй үед сервер бэлдсэн текстийг (children) хэвээр харуулна: hydration зөрөхгүй.
   Товчнуудыг (home, search, page) features/wiring.js барина. */
import type { ReactNode } from 'react';
import { Icon, useUB, type UB } from '../ub';
import { Raw } from '../home/parts';

interface NotFoundData { scene: string; path: string; links: { k: string; label: string }[] }

export function NotFoundView({ children }: { children?: ReactNode }) {
  const ub = useUB();
  return ub && ub.state().route === '404' ? <NotFoundIn ub={ub} /> : <>{children}</>;
}

function NotFoundIn({ ub }: { ub: UB }) {
  const d = ub.home.notFound() as NotFoundData;
  const { t, L } = ub;
  return (
    <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 view-in"><div className="max-w-[640px] mx-auto text-center">
      <Raw className="scene mx-auto w-full max-w-[520px] aspect-[16/7] rounded-[22px] overflow-hidden" html={d.scene} />
      <p className="mt-8 text-[72px] sm:text-[96px] leading-none font-extrabold tnum tracking-[-0.04em] text-ubred">404</p>
      <h1 className="mt-3 text-[26px] sm:text-[32px] font-extrabold tracking-tight">{L(['Хуудас олдсонгүй', 'Page not found'])}</h1>
      <p className="mt-3 text-muted leading-relaxed">{L(['Таны хайсан хуудас устсан, нэр нь өөрчлөгдсөн эсвэл хаяг буруу бичигдсэн байж магадгүй.', 'The page may have been removed or renamed, or the address may be mistyped.'])}</p>
      <p className="mt-2 text-[13px] text-muted break-all tnum">{d.path}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <button type="button" className="btn btn-ink" data-act="home"><Icon ub={ub} n="house" c="w-[18px] h-[18px]" />{t('home')}</button>
        <button type="button" className="btn btn-ghost" data-act="search"><Icon ub={ub} n="search" c="w-[18px] h-[18px]" />{L(['Сайтаас хайх', 'Search the site'])}</button>
      </div>
      <div className="mt-10 pt-8 border-t border-line"><p className="text-[13px] font-semibold text-muted">{L(['Эсвэл эндээс эхлээрэй', 'Or start here'])}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">{d.links.map((m) => <button key={m.k} type="button" className="chip" data-act="page" data-v={m.k}>{m.label}</button>)}</div>
      </div>
    </div></div>
  );
}
