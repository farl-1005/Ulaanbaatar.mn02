/* Сайтын хүрээ: header, цэс, footer (./chrome/) ба нүүрний бүх хэсэг (./home/) React. Цонхнууд (хайлт, мэдээ унших, маягт ...),
   «Миний булан», AI туслахыг одоогоор src/ доторх код (assets/app.js) зурна. */
import type { ReactNode } from 'react';
import { Dock } from './chrome/Dock';
import { Footer } from './chrome/Footer';
import { HeaderBand } from './chrome/Header';
import { BottomBar, MobileMenu } from './chrome/MobileMenu';
import { TopStrip } from './chrome/TopStrip';
import { About } from './home/About';
import { CityData } from './home/CityData';
import { Events } from './home/Events';
import { Gov } from './home/Gov';
import { Hero } from './home/Hero';
import { Hub } from './home/Hub';
import { Media } from './home/Media';
import { PageHero } from './home/PageHero';
import { Projects } from './home/Projects';
import { Rail } from './home/Rail';
import { Situations } from './home/Situations';
import { Transparency } from './home/Transparency';
import { ModalRoot } from './ui/Modal';
import { MyView } from './views/MyView';
import { NewsView } from './views/NewsView';
import { NotFoundView } from './views/NotFoundView';
import { Chat } from './chrome/Chat';
import { Ticker } from './chrome/Ticker';
import { ToTop } from './chrome/ToTop';
import { Toaster } from './ui/Toaster';

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

      <div id="topstrip" className="bg-navy text-white"><TopStrip /></div>
      <header id="hdr-band" className="hdr-white sticky z-50 lg:static" style={sticky}><HeaderBand /></header>
      <div id="hdr-scene" className="lg:hidden relative overflow-hidden" aria-hidden="true" />
      <div id="nav-sentinel" aria-hidden="true" style={{ height: 1, marginTop: -1 }} />
      <div id="hdr-nav" className="hidden lg:block sticky z-50" style={sticky}><Dock /></div>
      <div id="ticker"><Ticker /></div>

      <main id="main" tabIndex={-1}>
        <div id="view-home" hidden={!!news || notFound}>
          <section id="page-hero" hidden><PageHero /></section>
          <section id="hero" aria-label="Гол мэдээ"><Hero /></section>
          <section id="hub"><Hub /></section>
          <section id="gov" aria-label="Засаг дарга"><Gov /></section>
          <section id="situations"><Situations /></section>
          <section id="media"><Media /></section>
          <section id="projects"><Projects /></section>
          <section id="data"><CityData /></section>
          <section id="events"><Events /></section>
          <section id="transparency"><Transparency /></section>
          <section id="about" hidden><About /></section>
        </div>
        <div id="view-my" hidden><MyView /></div>
        <div id="view-news" hidden={!news}><NewsView>{news}</NewsView></div>
        <div id="view-404" hidden={!notFound}><NotFoundView>{notFound && <NotFoundText />}</NotFoundView></div>
        <Rail />
      </main>

      <footer id="footer"><Footer /></footer>
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div id="bbar"><BottomBar /></div>
      <MobileMenu />
      <div id="chat"><Chat /></div>
      <ToTop />
      <div id="modal-root"><ModalRoot /></div>
      <div id="toast-root" className="fixed left-0 right-0 z-[95] flex flex-col items-center gap-2 pointer-events-none px-4" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}><Toaster /></div>
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
