/* Гадны бүх эх сурвалж (build.js нэг дор дуудна). Эх сурвалж бүр өөрийн файлд:
     news.js   ulaanbaatar.mn мэдээ          media.js  ulaanbaatar.mn медиа
     orgs.js   харьяа байгууллагууд          mega.js   24 мега төсөл
     ipiu.js   ipiu.mn албан ёсны тоо        shared.js нийтлэг хэрэгсэл (кэш, татах, текст, зураг)
   `npm run news` гэж ажиллуулбал кэшийг үл хайхран мэдээ, медиаг шууд шинэчилнэ. */
const { IMG_DIR, paragraphs, splitLead } = require('./shared');
const { getLiveNews, classify } = require('./news');
const { getLiveMedia } = require('./media');
const { getLiveOrgs } = require('./orgs');
const { getLiveMega } = require('./mega');
const { getLiveIpiu } = require('./ipiu');

module.exports = { getLiveNews, getLiveMedia, getLiveOrgs, getLiveMega, getLiveIpiu, IMG_DIR, paragraphs, splitLead, classify };

if (require.main === module) {
  getLiveNews({ force: true }).then((r) => console.log('✓ ' + r.note)).then(() => getLiveMedia({ force: true })).then((r) => console.log('✓ ' + r.note));
}
