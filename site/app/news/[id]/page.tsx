/* /news/<id>: мэдээний хуудас. Гарчиг, текст, og:, JSON-LD (NewsArticle)-ийг сервер дээр бэлддэг тул
   Facebook, Google зэрэг JS ажиллуулдаггүй робот ч зөв харна. Хөтөч дээр app.js ачаалагдаад ердийнхөөрөө ажиллана. */
import { notFound } from 'next/navigation';
import { pageMeta } from '../../../lib/meta';
import { NewsData, newsData, origin } from '../../../lib/server';
import { Shell } from '../../Shell';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const n = await newsData((await params).id);
  if (!n) return {};
  return pageMeta({
    path: '/news/' + encodeURIComponent(n.id), image: n.image, title: n.title + ' · ulaanbaatar.mn', ogTitle: n.title, description: n.desc,
    article: { publishedTime: n.at || undefined, section: n.cat },
  });
}

export default async function NewsPage({ params }: Props) {
  const n = await newsData((await params).id);
  if (!n) notFound();
  return <Shell news={<Article n={n} ld={jsonLd(n, await origin())} />} />;
}

/** Хайлтын системд зориулсан бүтэцлэгдсэн өгөгдөл */
function jsonLd(n: NewsData, o: string) {
  const org = { '@type': 'Organization', name: n.publisher };
  return {
    '@context': 'https://schema.org', '@type': 'NewsArticle', mainEntityOfPage: o + '/news/' + encodeURIComponent(n.id),
    headline: n.headline, description: n.desc, image: [o + n.image], articleSection: n.cat, inLanguage: 'mn',
    datePublished: n.at || undefined, dateModified: n.modified || undefined,
    author: org, publisher: { ...org, logo: { '@type': 'ImageObject', url: o + n.siteImage } },
  };
}

function Article({ n, ld }: { n: NewsData; ld: object }) {
  const [intro, ...rest] = n.body;
  return (
    <article className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav className="text-[13.5px] text-muted"><a href="/">Нүүр</a> › <a href="/#hub">Мэдээ</a> › {n.cat}</nav>
      <header className="news-head mt-6" style={{ ['--rc' as string]: n.color }}>
        <div className="news-head-in">
          <h1 className="text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance">{n.title}</h1>
          {n.lead && <p className="mt-5 text-[18px] sm:text-[20px] leading-relaxed text-ink/80 font-medium">{n.lead}</p>}
          {n.at && <p className="mt-4 text-[13px] text-muted"><time dateTime={n.at}>{n.dateText}</time> · {n.publisher}</p>}
        </div>
        {n.photo && <figure className="news-head-fig"><img src={'/' + n.photo} alt={n.title} className="w-full aspect-[16/9] lg:aspect-[21/9] object-cover" /></figure>}
      </header>
      {n.body.length > 0 && (
        <div className="news-paper mt-8 max-w-[760px]">
          {rest.length > 0 && <p className="news-intro">{intro}</p>}
          <div className="news-text">{(rest.length ? rest : n.body).map((x, i) => <p key={i}>{x}</p>)}</div>
        </div>
      )}
      {n.source && <p className="mt-8"><a href={n.source} rel="noopener">Эх сурвалж</a></p>}
    </article>
  );
}
