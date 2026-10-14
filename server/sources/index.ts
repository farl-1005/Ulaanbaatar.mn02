/* Гадны бүх эх сурвалж (сайтыг бүтээх үед site-builder.ts дуудна). Эх сурвалж бүр өөрийн файлд:
     news.ts   ulaanbaatar.mn мэдээ          media.ts  ulaanbaatar.mn медиа
     orgs.ts   харьяа байгууллагууд          mega.ts   24 мега төсөл
     ipiu.ts   ipiu.mn албан ёсны тоо        shared.ts нийтлэг хэрэгсэл (кэш, татах, текст, зураг)
   Бүгд dist/.news/-д (production-д NEWS_CACHE_DIR) кэшлэгдэнэ; сүлжээ тасарвал хуучин кэшээ ашиглана. */
export { getLiveIpiu } from './ipiu';
export { getLiveMedia } from './media';
export { getLiveMega } from './mega';
export { getLiveNews } from './news';
export { getLiveOrgs } from './orgs';
export { IMG_DIR } from './shared';
