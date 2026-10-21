/* Хуудас бүрийн мета (title, description, og:, twitter:, canonical) */
import type { Metadata } from 'next';
import { origin, SITE_TITLE } from './server';

interface Opts {
  path: string; image: string; title?: string; ogTitle?: string; description?: string;
  article?: { publishedTime?: string; section?: string };
  noindex?: boolean;
}

export async function pageMeta({ path, image, title, ogTitle, description, article, noindex }: Opts): Promise<Metadata> {
  const o = await origin();
  const t = title || SITE_TITLE;
  return {
    metadataBase: new URL(o),
    title: t,
    description,
    alternates: noindex ? undefined : { canonical: path },
    robots: noindex ? { index: false } : undefined,
    openGraph: {
      siteName: 'ulaanbaatar.mn', locale: 'mn_MN', type: article ? 'article' : 'website',
      title: ogTitle || t, description, url: path,
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle || t }],
      ...(article ? { publishedTime: article.publishedTime, section: article.section } : {}),
    },
    twitter: { card: 'summary_large_image' },
  };
}
