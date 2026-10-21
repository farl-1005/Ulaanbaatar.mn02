/* Сайтын хүрээ: хэсэг бүрийн байр (id). Агуулгыг одоогоор src/ доторх код (assets/app.js) зурна;
   дараагийн үе шатуудад хэсэг бүрийг React бүрэлдэхүүн болгоно. src/template.html-тэй ижил бүтэц (нэг файлт хувилбарт). */
import type { ReactNode } from 'react';

interface Props {
  /** Мэдээний хуудас: сервер дээр бэлдсэн текст (JS ажиллуулдаггүй робот ч уншина) */
  news?: ReactNode;
  /** Олдохгүй хуудас */
  notFound?: boolean;
}

const sticky = { top: 'env(safe-area-inset-top, 0px)' };

export function Shell({ news, notFound }: Props) {
  return (
    <>
      <a className="skip" href="#main" id="skip-link">Үндсэн агуулга руу шилжих</a>

      <div id="topstrip" className="bg-navy text-white" />
      <header id="hdr-band" className="hdr-white sticky z-50 lg:static" style={sticky} />
      <div id="hdr-scene" className="lg:hidden relative overflow-hidden" aria-hidden="true" />
      <div id="nav-sentinel" aria-hidden="true" style={{ height: 1, marginTop: -1 }} />
      <div id="hdr-nav" className="hidden lg:block sticky z-50" style={sticky} />
      <div id="ticker" />

      <main id="main" tabIndex={-1}>
        <div id="view-home" hidden={!!news || notFound}>
          <section id="page-hero" hidden />
          <section id="hero" aria-label="Гол мэдээ" />
          <section id="hub" />
          <section id="gov" aria-label="Засаг дарга" />
          <section id="situations" />
          <section id="media" />
          <section id="projects" />
          <section id="data" />
          <section id="events" />
          <section id="transparency" />
          <section id="about" hidden />
        </div>
        <div id="view-my" hidden />
        <div id="view-news" hidden={!news}>{news}</div>
        <div id="view-404" hidden={!notFound}>{notFound && <NotFoundText />}</div>
      </main>

      <footer id="footer" />
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div id="bbar" />
      <div id="chat" />
      <div id="modal-root" />
      <div id="toast-root" className="fixed left-0 right-0 z-[95] flex flex-col items-center gap-2 pointer-events-none px-4" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }} />
    </>
  );
}

/** JS ажиллахаас өмнө (робот) харагдах 404 текст. app.js ачаалагдаад өөрийн 404 хуудсаа зурна. */
function NotFoundText() {
  return (
    <div className="max-w-site mx-auto px-4 py-20 text-center">
      <p className="text-[72px] font-extrabold text-ubred leading-none">404</p>
      <h1 className="mt-3 text-[28px] font-extrabold">Хуудас олдсонгүй</h1>
      <p className="mt-3 text-muted">Таны хайсан хуудас устсан, нэр нь өөрчлөгдсөн эсвэл хаяг буруу байна.</p>
      <p className="mt-6"><a href="/">Нүүр хуудас</a></p>
    </div>
  );
}
