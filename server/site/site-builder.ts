/* Сайтыг бүтээнэ (npm run build, сервер асахад болон 15 минут тутам):
     dist/site/assets/app.js, style.css, news/*.webp                           ← сайтын хуудсууд (site/ — Next.js) ачаална
     dist/site/assets/kit.js                                                    ← admin (/admin) урьдчилан харахад сайтын функцууд
     dist/ulaanbaatar-mn.html                                                   ← бүх зүйл нэг файлд (сервергүй хувилбар)
     dist/news-index.json                                                       ← мэдээний хуудас, sitemap (pages/)
   Алхмууд: гадны эх сурвалжаас бодит өгөгдөл татах → src/*.js-ийг нэг IIFE болгох (бодит өгөгдөл, икон, лого шигтгэнэ)
           → src/styles/*.css-ийг Tailwind-аар бүтээх. */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { DIST, ROOT, SITE, SRC } from '../config';
import { getLiveIpiu, getLiveMedia, getLiveMega, getLiveNews, getLiveOrgs, IMG_DIR } from '../sources';
import { BUNDLE_FILES, KIT_FILES, NEWS_DATA_FILES } from './bundle-files';

const lucide: { icons: Record<string, any> } = require('lucide');
const pascal = (n: string) => n.split('-').filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');

/** JS-д ашигласан Lucide иконуудыг SVG болгоно. ic('нэр')-ээр дуудсан боловч Lucide-д байхгүй нэрсийг буцаана. */
function collectIcons(js: string) {
  const icons: Record<string, string> = {}, missing = new Set<string>();
  for (const m of js.matchAll(/['"`]([a-z][a-z0-9-]{0,40})['"`]/g)) {
    const node = lucide.icons[pascal(m[1])];
    if (node && !icons[m[1]]) icons[m[1]] = node[2].map(([tag, a]: [string, Record<string, string>]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  }
  for (const m of js.matchAll(/\bic\(\s*'([a-z0-9-]+)'/g)) if (!icons[m[1]]) missing.add(m[1]);
  return { icons, missing: [...missing] };
}

/** Admin төслийн (admin/) эх код: kit.js-д тэдний ашигласан иконыг нэмэхэд */
function adminSources(): string {
  return ['src', 'app'].map((d) => path.join(ROOT, 'admin', d)).filter((d) => fs.existsSync(d))
    .flatMap((d) => (fs.readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync(path.join(d, f), 'utf8')))
    .join('\n');
}

/** Сайтыг бүтээнэ. Амжилттай бол null, алдаатай бол алдааны текст. */
export async function buildSite(): Promise<string | null> {
  try { return await build(); } catch (e) { return (e as Error).message; }
}

async function build(): Promise<string | null> {
  const t0 = Date.now();
  const live = await getLiveNews();
  console.log('  📰 ' + live.note);
  const media = await getLiveMedia();
  console.log('  🎬 ' + media.note);
  const orgs = await getLiveOrgs();
  console.log('  🏛  ' + orgs.note);
  const mega = await getLiveMega();
  console.log('  🏗  ' + mega.note);
  const ipiu = await getLiveIpiu();
  console.log('  📊 ' + ipiu.note);

  const concat = (files: string[]) => files.map((f) => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
  const js = concat(BUNDLE_FILES), kitJs = concat(KIT_FILES);
  const html = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
  const { icons, missing } = collectIcons(js);
  if (missing.length) return 'Lucide-д байхгүй икон: ' + missing.join(', ') + ' (https://lucide.dev/icons)';
  const LOGO = 'data:image/webp;base64,' + fs.readFileSync(path.join(SRC, 'logo.webp')).toString('base64');   // src/logo.webp-г солиход лого солигдоно

  // Бодит мэдээ: dist/site нь жижигрүүлсэн зургийг (assets/news/*.webp), нэг файлт хувилбар нь эх зургийг ашиглана.
  const img = (file: string | null | undefined, src: string | undefined, local: boolean) => (file ? (local ? 'assets/news/' + file : src) : undefined);
  const liveFor = (local: boolean) => JSON.stringify(live.items.map(({ imgFile, imgSrc, ...n }) => Object.assign(n, { img: img(imgFile, imgSrc, local) })));
  const mediaFor = (local: boolean) => JSON.stringify(media.items.map(({ imgFile, imgSrc, ...m }) => Object.assign(m, { img: img(imgFile, imgSrc, local) })));
  const orgsFor = (local: boolean) => JSON.stringify({ cats: orgs.cats, orgs: orgs.orgs.map(({ logoFile, logoSrc, ...o }) => Object.assign(o, { logo: logoFile ? img(logoFile, logoSrc, local) : '' })) });
  const bundleFor = (local: boolean, code = js, iconSet = icons) => `(()=>{'use strict';\nconst ICONS=${JSON.stringify(iconSet)};\nconst LOGO_SRC=${JSON.stringify(LOGO)};\nconst LIVE_NEWS=${liveFor(local)};\nconst LIVE_MEDIA=${mediaFor(local)};\nconst LIVE_ORGS=${orgsFor(local)};\nconst LIVE_MEGA=${JSON.stringify(mega.projects)};\nconst LIVE_IPIU=${JSON.stringify(ipiu.projects)};\n${code}\n})();`;
  const bundle = bundleFor(true), bundleOne = bundleFor(false);
  const kit = bundleFor(true, kitJs, collectIcons(kitJs + '\n' + adminSources()).icons);   // admin-ы икон ч орно
  try { new vm.Script(bundle, { filename: 'app.js' }); new vm.Script(kit, { filename: 'kit.js' }); } catch (e) { return 'JavaScript алдаа: ' + (e as Error).message; }

  // Мэдээ бүрийн хуудас, sitemap: data/ файлуудыг ажиллуулж хөтөч дээрхтэй ижил NEWS жагсаалтыг авна.
  let idx: any;
  try { idx = vm.runInNewContext(`const LIVE_NEWS=${liveFor(true)};\nconst LIVE_MEDIA=[];\n${NEWS_DATA_FILES.map((f) => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n')}\n;({ NEWS, RUB, NEWS_SRC })`, {}, { filename: 'data/news.js' }); }
  catch (e) { return 'data/news.js алдаа: ' + (e as Error).message; }
  const newsIndex = {
    src: idx.NEWS_SRC,
    rub: Object.fromEntries(Object.entries(idx.RUB as Record<string, any>).map(([k, r]) => [k, { t: r.t, c: r.c }])),
    news: idx.NEWS.map(({ id, t, l, b, d, img, cat, live, zar }: any) => ({ id, t, l, b, d, img, cat, live, zar })),
  };

  // Зургууд: кэшээс dist/site/assets/news/ руу
  fs.mkdirSync(path.join(SITE, 'assets', 'news'), { recursive: true });
  for (const f of [...live.items.map((n) => n.imgFile), ...media.items.map((m) => m.imgFile), ...orgs.orgs.map((o) => o.logoFile)]) {
    if (f) fs.copyFileSync(path.join(IMG_DIR, f), path.join(SITE, 'assets', 'news', f));
  }

  // CSS: src/styles/*.css-ийг нэрийн дарааллаар (01-, 02- ...) нийлүүлээд Tailwind-аар боловсруулна
  const STYLES = path.join(SRC, 'styles');
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

  fs.writeFileSync(path.join(DIST, 'ulaanbaatar-mn.html'), html.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => bundleOne));
  fs.writeFileSync(path.join(SITE, 'assets', 'style.css'), css);
  fs.writeFileSync(path.join(SITE, 'assets', 'app.js'), bundle);
  fs.writeFileSync(path.join(SITE, 'assets', 'kit.js'), kit);
  fs.writeFileSync(path.join(SITE, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 256"><image href="${LOGO}" width="244" height="256"/></svg>`);
  fs.writeFileSync(path.join(DIST, 'news-index.json'), JSON.stringify(newsIndex));
  console.log(`✓ Бүтээлээ (${Date.now() - t0} мс)`);
  return null;
}
