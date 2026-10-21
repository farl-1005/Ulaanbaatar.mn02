/* Серверийг асаалгүйгээр ажиллуулах тушаалууд:
     npm run build   сайтын assets-ийг бүтээнэ → dist/site/
     npm run news    ulaanbaatar.mn-ээс мэдээ, медиаг кэшийг үл хайхран одоо шууд татна */
import './config';
import { getLiveMedia, getLiveNews } from './sources';
import { buildSite } from './site/site-builder';

async function main(cmd: string | undefined) {
  if (cmd === 'build') {
    const err = await buildSite();
    if (err) { console.error('✗ ' + err); process.exit(1); }
    console.log('  dist/site/ бэлэн боллоо.');
    return;
  }
  if (cmd === 'news') {
    console.log('✓ ' + (await getLiveNews({ force: true })).note);
    console.log('✓ ' + (await getLiveMedia({ force: true })).note);
    return;
  }
  console.error('Хэрэглээ: node dist/server/cli.js build | news');
  process.exit(1);
}

main(process.argv[2]);
