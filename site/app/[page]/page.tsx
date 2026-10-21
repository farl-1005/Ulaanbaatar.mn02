/* Цэсний тусдаа хуудсууд: /news, /services, /events, /media, /projects, /data, /transparency, /about.
   Жагсаалт нь сервер дээр (server/pages/pages.service.ts PAGES), агуулгыг app.js хаягаар нь зурна. */
import { notFound } from 'next/navigation';
import { pageMeta } from '../../lib/meta';
import { siteInfo } from '../../lib/server';
import { Shell } from '../Shell';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props) {
  const { page } = await params, info = await siteInfo(), p = info.pages[page];
  if (!p) return {};
  return pageMeta({ path: '/' + page, image: info.siteImage, title: p[0] + ' · ulaanbaatar.mn', description: p[1] });
}

export default async function SectionPage({ params }: Props) {
  const { page } = await params;
  if (!(await siteInfo()).pages[page]) notFound();
  return <Shell />;
}
