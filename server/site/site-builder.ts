/* Сайтын серверийн талын файлуудыг бүтээнэ (npm run build, сервер асахад болон 15 минут тутам):
     dist/site/assets/live.json      ← ulaanbaatar.mn-ийн бодит мэдээ, медиа, байгууллага, мега төсөл + ашигласан икон, лого (site/lib/ub/live.js ачаална)
     dist/site/assets/style.css      ← site/styles/*.css → Tailwind
     dist/site/assets/news/*.webp    ← жижигрүүлсэн зургууд
     dist/news-index.json            ← мэдээний хуудас, sitemap (pages/)
   Сайтын JavaScript-ийг (site/lib/ub/, site/app/) болон admin-ыг Next.js өөрөө бүтээнэ. */
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { DIST, LOGO_FILE, ROOT, SITE, STYLES, UB_LIB } from '../config';
import { getLiveIpiu, getLiveMedia, getLiveMega, getLiveNews, getLiveOrgs, IMG_DIR } from '../sources';

const lucide: { icons: Record<string, any> } = require('lucide');
const pascal = (n: string) => n.split('-').filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');

/** Эх кодод ашигласан Lucide иконуудыг SVG болгоно. ic('нэр')-ээр дуудсан боловч Lucide-д байхгүй нэрсийг буцаана. */
function collectIcons(code: string) {
  const icons: Record<string, string> = {}, missing = new Set<string>();
  for (const m of code.matchAll(/['"`]([a-z][a-z0-9-]{0,40})['"`]/g)) {
    const node = lucide.icons[pascal(m[1])];
    if (node && !icons[m[1]]) icons[m[1]] = node[2].map(([tag, a]: [string, Record<string, string>]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  }
  for (const m of code.matchAll(/\bic\(\s*'([a-z0-9-]+)'/g)) if (!icons[m[1]]) missing.add(m[1]);
  return { icons, missing: [...missing] };
}

/** Хавтас доторх эх код (js, ts, tsx): тэнд ашигласан иконыг олоход */
function sources(...dirs: string[]): string {
  return dirs.map((d) => path.join(ROOT, d)).filter((d) => fs.existsSync(d))
    .flatMap((d) => (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.(js|tsx?)$/.test(f)).map((f) => fs.readFileSync(path.join(d, f), 'utf8')))
    .join('\n');
}

/** ES модулийг (site/lib/ub/**.js) vm-д энгийн скрипт болгож ажиллуулахаар import/export-ийг хасна */
export const plainScript = (code: string) => code.replace(/^import [^\n]*\n/gm, '').replace(/^export /gm, '');

/** Мэдээний хуудас, sitemap-д (pages/) хэрэгтэй NEWS жагсаалтыг эдгээр модулиас гаргана (хөтөч дээрхтэй ижил) */
const NEWS_DATA_FILES = ['data/i18n.js', 'data/alerts.js', 'data/news.js', 'data/media.js'];

/** Сүүлийн бүтээлтийн үр дүнгийн (CSS, live.json) хэш: өөрчлөгдсөн үед л хөтчийг шинэчлэхэд (npm run dev) */
let lastHash = '';
export const builtHash = () => lastHash;

/** Сайтыг бүтээнэ. Амжилттай бол null, алдаатай бол алдааны текст. */
export async function buildSite(): Promise<string | null> {
  try { return await build(); } catch (e) { return (e as Error).message; }
}

async function build(): Promise<string | null> {
  const t0 = Date.now();
  const news = await getLiveNews();
  console.log('  📰 ' + news.note);
  const media = await getLiveMedia();
  console.log('  🎬 ' + media.note);
  const orgs = await getLiveOrgs();
  console.log('  🏛  ' + orgs.note);
  const mega = await getLiveMega();
  console.log('  🏗  ' + mega.note);
  const ipiu = await getLiveIpiu();
  console.log('  📊 ' + ipiu.note);

  const { icons, missing } = collectIcons(sources('site/lib/ub', 'site/app', 'admin/src', 'admin/app'));   // сайт ба admin-ы ашигласан иконууд
  if (missing.length) return 'Lucide-д байхгүй икон: ' + missing.join(', ') + ' (https://lucide.dev/icons)';
  const LOGO = 'data:image/webp;base64,' + fs.readFileSync(LOGO_FILE).toString('base64');   // site/logo.webp-г солиход лого солигдоно

  // Бодит мэдээ: зургийг жижигрүүлсэн хувилбараар (assets/news/*.webp)
  const img = (file: string | null | undefined) => (file ? 'assets/news/' + file : undefined);
  const live = {
    ICONS: icons, LOGO_SRC: LOGO,
    LIVE_NEWS: news.items.map(({ imgFile, imgSrc, ...n }) => Object.assign(n, { img: img(imgFile) })),
    LIVE_MEDIA: media.items.map(({ imgFile, imgSrc, ...m }) => Object.assign(m, { img: img(imgFile) })),
    LIVE_ORGS: { cats: orgs.cats, orgs: orgs.orgs.map(({ logoFile, logoSrc, ...o }) => Object.assign(o, { logo: logoFile ? img(logoFile) : '' })) },
    LIVE_MEGA: mega.projects, LIVE_IPIU: ipiu.projects,
  };

  // Мэдээ бүрийн хуудас, sitemap: data/ модулиудыг ажиллуулж хөтөч дээрхтэй ижил NEWS жагсаалтыг авна.
  let idx: any;
  try { idx = vm.runInNewContext(`${NEWS_DATA_FILES.map((f) => plainScript(fs.readFileSync(path.join(UB_LIB, f), 'utf8'))).join('\n')}\n;({ NEWS, RUB, NEWS_SRC })`, { LIVE_NEWS: live.LIVE_NEWS, LIVE_MEDIA: [] }, { filename: 'data/news.js' }); }
  catch (e) { return 'data/news.js алдаа: ' + (e as Error).message; }
  const newsIndex = {
    src: idx.NEWS_SRC,
    rub: Object.fromEntries(Object.entries(idx.RUB as Record<string, any>).map(([k, r]) => [k, { t: r.t, c: r.c }])),
    news: idx.NEWS.map(({ id, t, l, b, d, img, cat, live, zar }: any) => ({ id, t, l, b, d, img, cat, live, zar })),
  };

  // Зургууд: кэшээс dist/site/assets/news/ руу
  fs.mkdirSync(path.join(SITE, 'assets', 'news'), { recursive: true });
  for (const f of [...news.items.map((n) => n.imgFile), ...media.items.map((m) => m.imgFile), ...orgs.orgs.map((o) => o.logoFile)]) {
    if (f) fs.copyFileSync(path.join(IMG_DIR, f), path.join(SITE, 'assets', 'news', f));
  }

  // CSS: site/styles/*.css-ийг нэрийн дарааллаар (01-, 02- ...) нийлүүлээд Tailwind-аар боловсруулна
  fs.writeFileSync(path.join(DIST, '.input.css'), fs.readdirSync(STYLES).filter((f) => f.endsWith('.css')).sort().map((f) => fs.readFileSync(path.join(STYLES, f), 'utf8')).join(''));
  try {
    execSync('npx tailwindcss -c tailwind.config.js -i dist/.input.css -o dist/.tailwind.css --minify', {
      cwd: ROOT, stdio: 'pipe',
      env: { ...process.env, BROWSERSLIST_IGNORE_OLD_DATA: '1' },   // «caniuse-lite is outdated» анхааруулгыг алгасна
    });
  } catch (e: any) {
    if (e.signal) return 'CSS бүтээлт тасалдлаа (сервер дахин асаж байна)';   // npm run dev: nodemon дахин асаах үед
    return 'CSS алдаа: ' + ((e.stderr && e.stderr.toString()) || e.message);
  }
  const css = fs.readFileSync(path.join(DIST, '.tailwind.css'), 'utf8');

  const liveJson = JSON.stringify(live);
  fs.writeFileSync(path.join(SITE, 'assets', 'style.css'), css);
  fs.writeFileSync(path.join(SITE, 'assets', 'live.json'), liveJson);
  fs.writeFileSync(path.join(SITE, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 256"><image href="${LOGO}" width="244" height="256"/></svg>`);
  fs.writeFileSync(path.join(DIST, 'news-index.json'), JSON.stringify(newsIndex));
  lastHash = crypto.createHash('sha1').update(css).update(liveJson).digest('hex').slice(0, 12);
  console.log(`✓ Бүтээлээ (${Date.now() - t0} мс)`);
  return null;
}
