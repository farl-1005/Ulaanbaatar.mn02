'use client';
/* Admin-ы үндсэн бүрэлдэхүүн.
   1) Сайтын хэрэгслийг (site/lib/ub/ модулиуд) ачаална  2) Засваруудыг (GET /api/cms) ачаалж, шууд шинэчлэлтэд холбогдоно
   3) Нэвтрээгүй бол нэвтрэх хуудас  4) Хаягаар (#news, #news/<id>, #news/new) хэсэг, засварлах цонхоо нээнэ */
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { cms, useCms } from './cms';
import { kit, L, Lang, loadKit } from './kit';
import { NAV, SCHEMA, View } from './schema';
import { Spinner, Toaster } from './ui';
import { Dashboard } from './views/Dashboard';
import { Editor } from './views/Editor';
import { Inbox } from './views/Inbox';
import { ListView } from './views/ListView';
import { Login } from './views/Login';
import { Settings } from './views/Settings';
import { Shell } from './views/Shell';
import { Texts } from './views/Texts';

/** «#news/n123» → { view: 'news', edit: 'n123' } */
function parseHash(hash: string): { view: View; edit: string | null } {
  const [v, id] = decodeURIComponent(hash.replace(/^#/, '')).split('/');
  const view = NAV.some((n) => n[0] === v) ? v : 'dash';
  return { view, edit: id && SCHEMA[view] ? id : null };
}

const Center = ({ children }: { children: ReactNode }) => <div className="min-h-[100dvh] grid place-items-center p-6 bg-page text-ink">{children}</div>;

export default function AdminApp() {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    loadKit().then((k) => { k.applyTheme(); setPhase('ready'); }).catch(() => setPhase('error'));
  }, []);
  if (phase === 'loading') return <Center><Spinner /></Center>;
  if (phase === 'error') {
    return (
      <Center><div className="card max-w-md p-8 text-center">
        <h1 className="text-[20px] font-extrabold">Сайтын файл олдсонгүй</h1>
        <p className="mt-2 text-muted">Сайтын өгөгдөл (/assets/live.json) ачаалсангүй. Серверээ асаана уу (npm run dev эсвэл npm start).</p>
      </div></Center>
    );
  }
  return <Toaster><Admin /></Toaster>;
}

function Admin() {
  const { status, admin } = useCms();
  const [lang, setLangState] = useState<Lang>(() => kit().lang());
  const [route, setRoute] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    cms.load();
    cms.watch();
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [route.view]);

  const go = useCallback((v: View) => { window.location.hash = v; }, []);
  const add = useCallback((col: string) => { window.location.hash = col + '/new'; }, []);
  const edit = useCallback((col: string, id: string) => { window.location.hash = col + '/' + encodeURIComponent(id); }, []);
  const closeEditor = useCallback(() => { window.location.hash = route.view; }, [route.view]);
  const setLang = (l: Lang) => { kit().setLang(l); setLangState(l); };

  if (status === 'loading') return <Center><Spinner label={L(['Ачаалж байна', 'Loading'])} /></Center>;
  if (status === 'offline') {
    return (
      <Center><div className="card max-w-md p-8 text-center">
        <h1 className="text-[20px] font-extrabold">{L(['Сервертэй холбогдсонгүй', 'Cannot reach the server'])}</h1>
        <p className="mt-2 text-muted">{L(['Сервер (npm run dev эсвэл npm start) ажиллаж байгаа эсэхийг шалгаад хуудсаа дахин ачаална уу.', 'Check that the server (npm run dev or npm start) is running, then reload.'])}</p>
        <button type="button" className="btn btn-ink mt-6" onClick={() => cms.load()}>{L(['Дахин оролдох', 'Try again'])}</button>
      </div></Center>
    );
  }
  if (!admin) return <Login />;

  const { view } = route;
  const content = view === 'inbox' ? <Inbox />
    : view === 'texts' ? <Texts />
    : view === 'settings' ? <Settings />
    : SCHEMA[view] ? <ListView key={view} col={view} onEdit={(id) => edit(view, id)} />
    : <Dashboard go={go} add={add} edit={edit} />;
  return (
    <>
      <Shell view={view} go={go} add={add} lang={lang} setLang={setLang}>{content}</Shell>
      {route.edit && <Editor key={view + '/' + route.edit} col={view} id={route.edit === 'new' ? null : route.edit} onClose={closeEditor} />}
    </>
  );
}
