import type { Metadata, Viewport } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Удирдлага · ulaanbaatar.mn',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#0B1D45' };

/* Сайтын хадгалсан горимыг (цайвар / харанхуй) хуудас зурагдахаас өмнө хэрэглэнэ (src/template.html-тэй ижил) */
const THEME = `try{var t=JSON.parse(localStorage.getItem('ubmn:theme'));if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Сайтын зураг харьцангуй замтай (assets/news/...): сайтын үндсээс уншина (сайтын хуудсуудтай ижил) */}
        <base href="/" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap" />
        {/* Сайтын загвар (Tailwind + бүрэлдэхүүн): admin ч, урьдчилан харах карт ч үүнийг ашиглана */}
        <link rel="stylesheet" href="/assets/style.css" />
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
