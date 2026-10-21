import { pageMeta } from '../lib/meta';
import { siteInfo, SITE_DESC } from '../lib/server';
import { Shell } from './Shell';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return pageMeta({ path: '/', image: (await siteInfo()).siteImage, description: SITE_DESC });
}

/** Нүүр хуудас */
export default function Home() {
  return <Shell />;
}
