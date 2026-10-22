import { EN_MON, addDays, ago, bn, evDate, fDate, hhmm, num, pad, today, ubNow } from './core/time.js';
import { MapView } from './sections/map-view.js';
import { Scene, inDistrict, logoMark } from './art/scene.js';
import { railCard } from './sections/rail.js';
import { govRow, govState } from './sections/governor.js';
import { orgMark, orgTile } from './sections/about.js';
import { pctRing, projBadge } from './sections/projects.js';
import { evCard } from './sections/events.js';
import { MEDIA_MAX } from './sections/media.js';
import { I } from './data/i18n.js';
import { SQ_POP } from './core/search.js';
import { CHAT_CHIPS } from './data/chat.js';
import { QUICK } from './sections/hero.js';
import { SITS } from './data/services.js';
import { RCAT, TOPICS } from './data/my-page.js';
import { ORG_CATS } from './data/about.js';
import { RAIL_THEMES, RAIL_THEME_L } from './data/banners.js';
import { GOV_TYPES } from './data/governor.js';
import { NEWS_NT, newsCard, svcTile } from './sections/hub.js';
import { PCAT, PROJECTS } from './data/projects.js';
import { ECAT, EVDESC } from './data/events.js';
import { FEATURED_ID, GOV, HERO_ID, RUB } from './data/news.js';
import { CMS, CMS_COLS, DEF, SET, applyOverlay, dayOffset, linesOf, mediaSrc, pairsOf } from './core/cms.js';
import { applyTheme } from './core/header.js';
import { esc, ic, store } from './core/helpers.js';
import { ALL_SVC, EN, L, S, parseUB, t } from './core/state.js';
import { SEASON_IC, SEASON_L, seasonByDate } from './features/season.js';
/* ================= Admin-д зориулсан сайтын хэрэгсэл (assets/kit.js) =================
   /admin (admin/ — тусдаа Next.js төсөл) урьдчилан харах карт, чимэглэл, иконыг сайттай яг адилхан зурахын тулд
   сайтын өөрийн функцуудыг ашиглана. Энэ файл зөвхөн kit.js-д орно (сайтын app.js-д биш): server/site/bundle-files.ts KIT_FILES.
   Бүх функц HTML мөр буцаана (React-д dangerouslySetInnerHTML-ээр). */
window.UBKit = {
  /** Admin-ы засварыг (GET /api/cms-ийн data) сайтын өгөгдөлд тусгана: ангилал, тохиргоо, мэдээ, текст ... */
  apply(data) { CMS_COLS.forEach((c) => { CMS.data[c] = (data && data[c]) || {}; }); applyOverlay(); },
  /** Сайтын хэл ('mn' | 'en'): L(), t(), огнооны бичлэг */
  setLang(l) { S.lang = l === 'en' ? 'en' : 'mn'; store.set('lang', S.lang); },
  lang: () => S.lang,
  /** Хөтчид хадгалсан горимыг (цайвар / харанхуй) хэрэглэнэ */
  applyTheme: () => applyTheme(false),

  /** Анхны агуулга (src/data/) бүлэг бүрээр: admin засаагүй үед сайт дээр харагдах зүйл */
  cols: CMS_COLS,
  defaults: DEF,
  /** Сайтын одоогийн төлөв (apply()-ын дараа засвартай нь) */
  state: () => ({
    RUB, ECAT, PCAT, NEWS_NT, GOV_TYPES, RAIL_THEMES, RAIL_THEME_L, ORG_CATS, RCAT, TOPICS, SITS, PROJECTS, ALL_SVC, QUICK, GOV,
    HERO_ID, FEATURED_ID, SET, CHAT_CHIPS, SQ_POP, I, EVDESC, MEDIA_MAX, SEASON_L, SEASON_IC, season: seasonByDate(),
  }),

  /* ---- Сайтын карт, хэсэг (урьдчилан харах) ---- */
  newsCard, evCard, svcTile, pctRing, projBadge, orgMark, orgTile, govRow, govState, railCard, logoMark, Scene, ic,
  /** Газрын зураг (байршил сонгох): new MapView(host, { points, onPick }) */
  MapView, inDistrict,

  /* ---- Туслах ---- */
  L, t, esc, num, bn, ago, pad, fDate, hhmm, parseUB, ubNow, today, addDays, dayOffset, evDate, mediaSrc, linesOf, pairsOf, EN, EN_MON,
};
