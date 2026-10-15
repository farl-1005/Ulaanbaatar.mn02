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
