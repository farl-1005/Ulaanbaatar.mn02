import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SITE_DESC, SITE_TITLE } from '../lib/server';

export const metadata: Metadata = { title: SITE_TITLE, description: SITE_DESC };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0B1D45' };

/* Хадгалсан горимыг (цайвар / харанхуй) хуудас зурагдахаас өмнө хэрэглэнэ */
const THEME = `try{var t=JSON.parse(localStorage.getItem('ubmn:theme'));if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`;
/* npm run dev: src/-ийн файл хадгалахад сайт дахин бүтээгдэж хуудас өөрөө refresh хийгдэнэ (Nest /__dev), алдаа гарвал доод талд улаанаар */
const DEV_RELOAD = `(()=>{let seen=null;const es=new EventSource('/__dev');const ok=(e)=>{if(e.data==='0')return;if(seen&&e.data!==seen)location.reload();seen=e.data;};es.addEventListener('hello',ok);es.addEventListener('built',ok);es.addEventListener('fail',(e)=>{let b=document.getElementById('__devErr');if(!b){b=document.createElement('div');b.id='__devErr';b.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#D81E34;color:#fff;font:600 14px/1.45 system-ui,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.35);white-space:pre-wrap';document.body.appendChild(b);}b.textContent='✗ '+e.data;});})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Сайтын харьцангуй замууд (assets/...) /news/<id> хаяг дээр ч сайтын үндсээс уншигдана */}
        <base href="/" />
        {/* app.js-д /news/<id>, /news гэх мэт жинхэнэ хаяг ашиглахыг хэлнэ */}
        <meta name="ubmn-routes" content="path" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&text=%E2%82%AE&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mongolian&display=swap" />
        <link rel="stylesheet" href="/assets/style.css" />
        <Script id="ubmn-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body>
        {children}
        {/* Сайтын хэсгүүдийг (header, мэдээ, үйлчилгээ ...) одоогоор src/ доторх код зурна → assets/app.js */}
        <Script src="/assets/app.js" strategy="afterInteractive" />
        {process.env.NODE_ENV === 'development' && <Script id="ubmn-dev-reload" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: DEV_RELOAD }} />}
      </body>
    </html>
  );
}
