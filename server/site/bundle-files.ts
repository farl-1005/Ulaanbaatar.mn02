/* Хөтчийн JavaScript: src/ доторх дараах файлууд энэ дарааллаар нэг IIFE (assets/app.js) болж нийлнэ.
   Бүгд нэг хүрээнд ажиллах тул дараагийн файл нь өмнөх файлынхаа функц, тогтмолыг шууд ашиглана.
   Шинэ файл нэмбэл зөвхөн энд нэмнэ. Бүтцийн тайлбар: ARCHITECTURE.md */
export const BUNDLE_FILES = [
  // Өгөгдөл: текст, мэдээ, үйлчилгээ, төсөл... (энгийн тогтмолууд)
  'data/i18n.js',
  'data/alerts.js',
  'data/news.js',
  'data/media.js',
  'data/services.js',
  'data/map.js',
  'data/projects.js',
  'data/events.js',
  'data/transparency.js',
  'data/about.js',
  'data/city-stats.js',
  'data/my-page.js',
  'data/governor.js',
  'data/banners.js',
  'data/chat.js',
  // Зураг чимэглэл (SVG үүсгэгч)
  'art/scene.js',
  // Цөм: туслах функц, төлөв, header, хайлт, чиглүүлэлт, хуудсууд
  'core/helpers.js',
  'core/state.js',
  'core/time.js',
  'core/motion.js',
  'core/modal.js',
  'core/header.js',
  'core/ticker.js',
  'core/mobile-menu.js',
  'core/search.js',
  'core/router.js',
  'core/pages.js',
  // Нүүрний хэсгүүд (дарааллаараа)
  'sections/hero.js',
  'sections/hub.js',
  'sections/life-events.js',
  'sections/media.js',
  'sections/map-view.js',
  'sections/projects.js',
  'sections/city-data.js',
  'sections/events.js',
  'sections/transparency.js',
  'sections/governor.js',
  'sections/about.js',
  'sections/rail.js',
  'sections/footer.js',
  // Зураг чимэглэл (SVG үүсгэгч)
  'art/skyline.js',
  // Admin-ы засварыг сайтад тусгах (засварыг /admin — admin/ төсөлд хийнэ)
  'core/cms.js',
  // Цонх, маягт, үзэгч, AI туслах, эхлүүлэлт
  'features/shared.js',
  'features/news-reader.js',
  'features/season.js',
  'features/services.js',
  'features/dan-login.js',
  'features/forms.js',
  'features/media-player.js',
  'features/documents.js',
  'features/my-page.js',
  'features/assistant.js',
  'features/wiring.js',
  'features/live-data.js',
  'features/to-top.js',
  'features/weather.js',
  'features/init.js',
];

/** assets/kit.js (admin-д): дээрх бүх файл (сайтыг асаадаг init.js-ээс бусад) + src/kit.js */
export const KIT_FILES = BUNDLE_FILES.filter((f) => f !== 'features/init.js').concat('kit.js');

/** Мэдээний хуудас, sitemap-д (pages/) хэрэгтэй NEWS жагсаалтыг эдгээр файлаас гаргана */
export const NEWS_DATA_FILES = ['data/i18n.js', 'data/alerts.js', 'data/news.js', 'data/media.js'];
