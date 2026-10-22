# Кодын бүтэц

Төсөл 3 хэсгээс бүрдэнэ:

1. **Сайт (frontend): `site/`**. [Next.js](https://nextjs.org) + React.
   - `site/app/`: хуудсууд, мета, SEO (сервер дээр), бүх харагдац (React бүрэлдэхүүн).
   - `site/lib/ub/`: сайтын логик (ES модулиуд): анхны агуулга, төлөв, admin-ы засварыг тусгах, чиглүүлэлт, товчны үйлдэл. Next.js React-тай хамт багцална.
2. **Удирдлага (admin): `admin/`**. Тусдаа [Next.js](https://nextjs.org) + React төсөл, `/admin` хаягаар. Сайтын агуулгыг засна, урьдчилан харахдаа `site/lib/ub/`-ийг шууд ашиглана.
3. **Сервер (backend): `server/`**. [Nest.js](https://nestjs.com) + TypeScript. Сайт, admin-ыг үйлчилж, `/api/...` хүсэлтэд хариулна.

```
   ulaanbaatar.mn API, ipiu.mn API
             │  (15 минут тутам, кэштэй)
             ▼
   server/sources/ ───┬──▶ server/site/site-builder.ts ──▶ dist/site/assets/live.json (бодит мэдээ, медиа, икон, лого)
   site/styles/*.css ─┘                                └──▶ dist/site/assets/style.css (Tailwind)

   хөтөч ◀──── server/main.ts (Nest.js) ──┬─ /, /news, /news/<id> ...  site/ (Next.js, Nest өөр дотроо ажиллуулна)
                                          │      хуудас ачаалагдмагц site/lib/ub/ нь live.json-ийг уншиж сайтыг асаана
                                          ├─ /admin  удирдлага (admin/out, npm run dev үед next dev)
                                          ├─ pages/   хуудасны өгөгдөл (/api/pages), og зураг, sitemap
                                          ├─ cms/, auth/, forms/, events/   /api/...  ──▶ database/ (PostgreSQL эсвэл SQLite)
                                          └─ live/    цаг агаар, агаарын чанар, газрын зураг, зураг
```

## Тушаалууд
| Тушаал | Юу хийх |
|---|---|
| `npm run dev` | Хөгжүүлэлт: сайт http://localhost:8080, admin http://localhost:8080/admin. `site/`, `admin/`-ийн файл хадгалахад Next.js шууд шинэчилнэ; CSS ангилал, икон өөрчлөгдвөл `style.css`, `live.json`-ийг дахин бүтээж хөтчийг refresh хийнэ; `server/`-ийн файл хадгалахад серверийг дахин асаана |
| `npm run build` | Бүгдийг бүтээнэ: сервер (`dist/server/`), `style.css` ба `live.json` (`dist/site/assets/`), сайт (`site/.next/`), admin (`admin/out/`) |
| `npm start` | Production сервер (эхлээд `npm run build`). 15 минут тутам ulaanbaatar.mn-ээс шинэ мэдээ татаж `live.json`-ийг шинэчилнэ |
| `npm run news` | ulaanbaatar.mn-ээс мэдээ, медиаг кэшийг үл хайхран одоо шууд татна |

TypeScript-ийг `tsc` нь `dist/server/` руу хөрвүүлдэг (`server/tsconfig.json`).

## `site/lib/ub/`: сайтын логик

ES модулиуд (JavaScript). Хуудас ачаалагдмагц `app/Boot.tsx` → `boot.js`: эхлээд `/assets/live.json`-ийг (`live.js`), дараа нь бүх модулийг (`main.js`) ачаалж `features/init.js`-ийн `init()` сайтыг асаана.
React бүрэлдэхүүнүүд логикоос өгөгдлийг `core/bridge.js`-ийн `window.UB`-аар уншиж, `renderReact()` дуудагдах бүрд дахин зурагдана (`app/ub.tsx` `useUB`).
Модуль бүр ачаалах үедээ өгөгдлөө бэлддэг (`data/*.js`) тул `main.js`-ийн импортын дараалал чухал. **Шинэ модуль нэмбэл `main.js`-д импортлоно.**

| Хавтас | Агуулга |
|---|---|
| `data/` | Анхны агуулга (admin засаагүй үед харагдана): текст (МН/EN), мэдээ, медиа, үйлчилгээ, төсөл, арга хэмжээ, ил тод байдал, хотын тухай, Засаг дарга, баннер, чатын хариулт |
| `core/` | Суурь: туслах функц, төлөв (`S`), цаг, хөдөлгөөн, цонх (`modal.js`), header-ийн өгөгдөл, React-д өгөх гүүр (`bridge.js`, `home.js`), яаралтай мэдээ, хайлт, чиглүүлэлт, тусдаа хуудсууд, admin-ы засварыг тусгах (`cms.js`) |
| `sections/` | Нүүрний хэсэг бүрийн өгөгдөл (`xData()` → `HOME.x`), төлөв солих функц: hero, мэдээ (hub), амьдралын нөхцөл, медиа, газрын зураг, 24 мега төсөл, хотын тоо, арга хэмжээ, ил тод байдал, Засаг дарга, хотын тухай, баннер |
| `features/` | Цонх, үйлдлүүдийн өгөгдөл: мэдээ унших, үйлчилгээ, ДАН нэвтрэлт, маягт, медиа тоглуулагч, баримт бичиг, Миний булан, AI туслах, цаг агаар, товчнууд (`wiring.js`), эхлүүлэх код (`init.js`) |
| `art/` | Кодоор зурдаг зураг: мэдээний чимэглэл, лого (`scene.js`), header-ийн хотын зураг (`skyline.js`) |
| `live.js`, `boot.js`, `main.js` | Бодит өгөгдөл ачаалах, асаах дараалал |
| `kit.js` | Admin-д өгөх сайтын функцууд (урьдчилан харах карт, чимэглэл, икон, анхны агуулга) → `window.UBKit` |

`site/styles/`: CSS, нэрийн дарааллаар (01, 02 …) нийлж Tailwind-аар бүтээгдэнэ. Өнгөний токен `01-base.css`-д. `site/logo.webp`: хотын сүлд.

## `site/`: сайтын хуудсууд (Next.js + React)

Nest сервер (`server/site/next-app.ts`) Next.js-ийг өөр дотроо ажиллуулна: нэг процесс, нэг порт. `/api`, `/admin`, `/assets`, `/og`, `/sitemap.xml` Nest-д, бусад бүх хаяг Next.js-д очно. `npm run dev` үед `site/`-ийн файл хадгалахад хөтөч өөрөө шинэчлэгдэнэ.

| Файл | Агуулга |
|---|---|
| `app/layout.tsx` | `<head>` (фонт, CSS, горим), сайтын логикийг асаана (`Boot.tsx`) |
| `app/Shell.tsx` | Хуудасны хүрээ: header, хэсгүүд, харагдацууд, цонх, footer-ийг байрлуулна |
| `app/chrome/` | Header (`Header.tsx`, `TopStrip.tsx`), яаралтай мэдээ (`Ticker.tsx`), dock цэс, мега цэс (`Dock.tsx`), гар утасны цэс ба доод мөр (`MobileMenu.tsx`), footer (`Footer.tsx`), AI туслах (`Chat.tsx`), дээш буцах (`ToTop.tsx`) |
| `app/home/` | Нүүрний хэсгүүд ба тусдаа хуудсуудын агуулга: `Hero`, `Hub` (мэдээ, үйлчилгээ; `/news`, `/services`), `Gov` (Засаг даргын хуваарь), `Situations` (амьдралын нөхцөл), `Media`, `Projects` (24 мега төсөл, газрын зураг), `CityData`, `Events`, `Transparency`, `About`, `PageHero` (хуудасны толгой), `Rail` (босоо баннер); нийтлэг хэсгүүд `parts.tsx` (таб, chip, гарчиг, солигдох хөдөлгөөн). Өгөгдлийг `lib/ub/sections/<хэсэг>.js`-ийн `xData()` бэлдэж `HOME.<нэр>`-д бүртгэнэ |
| `app/views/` | Бүтэн дэлгэцийн харагдацууд: `NewsView` (мэдээ унших), `MyView` (Миний булан), `NotFoundView` (404) |
| `app/modals/` | Цонхнууд: хайлт, үйлчилгээ ба цаг захиалга, баримт бичиг, тендер, арга хэмжээ, мега төсөл, анхааруулга, санал өгөх, ДАН нэвтрэх, медиа тоглуулагч. Бүртгэл `index.tsx` (`MODALS`); `lib/ub/` код `openModal({ view, props })`-оор нээнэ |
| `app/ui/` | Цонхны бүрхүүл (`Modal.tsx`), мэдэгдэл (`Toaster.tsx`) |
| `app/ub.tsx` | React ба `lib/ub/` логикийн гүүр: төлөв, текст, икон, өгөгдлийг `lib/ub/core/bridge.js`-ийн `window.UB`-аас уншина (`useUB`) |
| `app/Boot.tsx` | Хуудас ачаалагдмагц сайтын логикийг асаана (`lib/ub/boot.js`) |
| `app/page.tsx` | Нүүр |
| `app/[page]/page.tsx` | `/news`, `/services`, `/events` … (жагсаалт: `server/pages/pages.service.ts` `PAGES`) |
| `app/news/[id]/page.tsx` | Мэдээний хуудас: гарчиг, текст, og:, JSON-LD (өгөгдөл: `/api/pages/news/<id>`) |
| `app/not-found.tsx` | 404 |
| `lib/server.ts`, `lib/meta.ts` | Nest API-аас өгөгдөл авах, мета (og:, twitter:, canonical) |

## `admin/`: удирдлага (Next.js + React)

Тусдаа төсөл: өөрийн `package.json` (npm workspace), `next.config.ts`. `next build` нь статик файл (`admin/out/`) гаргаж, сервер `/admin` хаягаар үйлчилнэ. Загвар нь сайтын `/assets/style.css`, урьдчилан харах карт нь сайтын өөрийн модулиуд (`site/lib/ub/kit.js`) тул сайт дээрхтэй яг адилхан харагдана.

| Файл | Агуулга |
|---|---|
| `app/layout.tsx`, `app/page.tsx` | Хуудас (Next.js App Router), сайтын CSS-ийг ачаална |
| `src/App.tsx` | Үндсэн бүрэлдэхүүн: kit ачаалах, нэвтрэлт, хаягаар (`#news`, `#news/<id>`) хэсэг нээх |
| `src/schema.ts` | Бүлэг бүрийн маягтын талбар (мэдээ, анхааруулга, арга хэмжээ ...), цэс, шинэ бичлэгийн анхны утга |
| `src/cms.ts` | Засвар ачаалах, хадгалах, устгах, буцаах (`/api/cms`), шууд шинэчлэлт (`/api/events`) |
| `src/kit.ts` | Сайтын хэрэгсэл (`site/lib/ub/kit.js`) ачаалах, төрөл |
| `src/api.ts` | Backend API дуудах |
| `src/images.ts` | Зураг, лого оруулах (хөтөч дээр жижигрүүлнэ) |
| `src/ui.tsx` | Икон, цонх, мэдэгдэл (toast), таб, устгахыг баталгаажуулах |
| `src/views/` | Дэлгэцүүд: `Shell` (цэс), `Dashboard`, `ListView`, `Editor` + `fields` (талбарууд) + `preview`, `Inbox`, `Texts`, `Settings`, `Login` |

## `server/`: Nest.js backend

Nest.js-ийн дүрмээр: **модуль** (`*.module.ts`) бүр нэг үүрэгтэй, **controller** нь хаягийг (route) хүлээн авч, **service** нь ажлыг гүйцэтгэнэ. Service-үүдийг constructor-оор нь автоматаар холбодог (dependency injection).

| Хавтас / файл | Агуулга |
|---|---|
| `main.ts` | Сервер асаах (`npm start`, `npm run dev`) |
| `cli.ts` | `npm run build`, `npm run news` |
| `config.ts` | `.env` ачаалах, хавтсуудын зам (`data/`, `dist/`, Docker-т `/data`) |
| `app.module.ts` | Бүх модулийг нэгтгэнэ |
| `common/` | Бүх модульд: API-ийн алдаа (`ApiError`), JSON унших, хурдны хязгаар, CSRF шалгалт (`SameOriginGuard`), алдааны хариу (`HttpErrorFilter`) |
| `database/` | Өгөгдлийн сан: `Database` абстракт класс, `postgres.ts` (`DATABASE_URL` байвал), `sqlite.ts` (эс бөгөөс `data/ub.sqlite`) |
| `auth/` | Admin нэвтрэлт (`/api/login`, `/api/logout`), `AdminGuard` |
| `cms/` | Admin-ы засвар (`/api/cms`) |
| `forms/` | Иргэдийн маягт (`/api/submit/...`), admin-ы «Ирсэн хүсэлт» (`/api/submissions`, `/uploads/...`) |
| `events/` | Шууд мэдэгдэл (`/api/events`, Server-Sent Events): admin хадгалахад бүх хөтөч шинэчлэгдэнэ |
| `live/` | Гадны бодит цагийн өгөгдөл: цаг агаар, агаарын чанар (IQAir, Open-Meteo), газрын зураг (hamuga.mn), зураг жижигрүүлэх (`/api/img`) |
| `site/` | `style.css`, `live.json` бүтээх (`site-builder.ts`), dev горимд автоматаар дахин бүтээх, Next.js-ийг ажиллуулах (`next-app.ts`), admin-ыг үйлчлэх (`static-assets.ts`) |
| `pages/` | Хуудасны өгөгдөл (`/api/pages`, `/api/pages/news/<id>` → `site/`), og зураг, `sitemap.xml`, `robots.txt` |
| `sources/` | Бүтээх үед татах гадны өгөгдөл (доор) |

### `server/sources/`: гадны эх сурвалж
Бүгд `dist/.news/`-д (production-д `NEWS_CACHE_DIR`) кэшлэгдэнэ. Сүлжээ тасарвал хуучин кэшээ ашиглана.

| Файл | Эх сурвалж | Хөтөч дээр |
|---|---|---|
| `news.ts` | ulaanbaatar.mn мэдээ (цаг үеийн, харьяа газрын, хэвлэлийн тойм) | `LIVE_NEWS` |
| `media.ts` | ulaanbaatar.mn медиа (Live, Фото сурвалжилга, Постер, Подкаст) | `LIVE_MEDIA` |
| `orgs.ts` | ulaanbaatar.mn харьяа байгууллага, лого | `LIVE_ORGS` |
| `mega.ts` | ulaanbaatar.mn 24 мега төсөл, явцын мэдээ | `LIVE_MEGA` |
| `ipiu.ts` | ipiu.mn мега төслийн албан ёсны тоо (гүйцэтгэл, төсөв, хугацаа) | `LIVE_IPIU` |
| `shared.ts` | Нийтлэг: кэш, татах, HTML → текст, зураг жижигрүүлэх, байгууллагын нэр | |

## Admin
- Нэвтрэх: http://localhost:8080/admin. Нууц үг нь `.env`-ийн `ADMIN_PASSWORD` (анх асаахад `.env` байхгүй бол санамсаргүй нууц үг үүсгэнэ).
- Admin-аас засагдах хэсгүүд: мэдээ, анхааруулга, арга хэмжээ, медиа, төсөл, үйлчилгээ, амьдралын нөхцөл, ил тод байдал, удирдлагын бүтэц, харьяа байгууллага, түүх, хотын статистик, цэс, ангилал, AI туслахын хариулт, сайтын бүх текст, тохиргоо. Засваргүй бол `site/lib/ub/data/`-ийн анхны агуулга харагдана, «Анхны хувилбарт буцаах» нь засварыг устгана.
- Admin хадгалах бүрд нээлттэй бүх хөтөч `/api/events`-ээр мэдэгдэл авч, дахин ачаалахгүйгээр шинэчлэгдэнэ.
- Иргэдийн маягт (эрсдэл мэдээлэх (зурагтай), санал хүсэлт, имэйл бүртгэл) admin-ы **Ирсэн хүсэлт** хэсэгт харагдана. Иргэний зураг `data/uploads/`-д, зөвхөн admin-д харагдана.

## API ба хуудсууд
| Хүсэлт | Эрх | Үүрэг | Код |
|---|---|---|---|
| `GET /api/cms` | бүгд | Admin-ы засварууд | `cms/` |
| `PUT` / `DELETE /api/cms/:col/:id` | admin | Засвар хадгалах / буцаах | `cms/` |
| `POST /api/cms-log` | admin | Өөрчлөлтийн түүх | `cms/` |
| `POST /api/login`, `/api/logout` | бүгд | Нэвтрэх / гарах | `auth/` |
| `POST /api/submit/report\|idea\|digest` | бүгд | Маягт илгээх | `forms/` |
| `GET /api/submissions`, `PATCH` / `DELETE /api/submissions/:id` | admin | Ирсэн хүсэлт, төлөв солих, устгах | `forms/` |
| `GET /uploads/:file` | admin | Иргэний оруулсан зураг | `forms/` |
| `GET /api/events` | бүгд | Шууд мэдэгдэл (SSE) | `events/` |
| `GET /api/weather`, `/api/air` | бүгд | Цаг агаар, агаарын чанар | `live/` |
| `GET /api/img?w=240\|1280&u=...` | бүгд | ulaanbaatar.mn-ийн зургийг жижигрүүлэх | `live/` |
| `GET /api/map/tiles/...` | бүгд | Газрын зураг (hamuga.mn, `HAMUGA_API_KEY`) | `live/` |
| `GET /api/health` | бүгд | Сервер ажиллаж байгаа эсэх | `health.controller.ts` |
| `GET /news/:id` | бүгд | Мэдээний хуудас: og:/twitter: tag, JSON-LD, текст нь HTML-д (JS ажиллуулдаггүй робот ч уншина) | `pages/` |
| `GET /og/:id.jpg` | бүгд | Share хийхэд харагдах 1200×630 зураг (`dist/.og/`-д кэшлэнэ) | `pages/` |
| `GET /sitemap.xml`, `/robots.txt` | бүгд | Хайлтын системд | `pages/` |

- Хаягийн домэйн (og:, sitemap): `.env`-ийн `SITE_URL` → `DOMAIN` → хүсэлтийн Host.
- Facebook хуучин preview-г кэшлэдэг: https://developers.facebook.com/tools/debug → «Scrape Again».

## Хамгаалалт
- Засах бүх үйлдэл нэвтрэлт шаардана (HttpOnly cookie, 7 хоног; өгөгдлийн санд зөвхөн token-ы hash).
- Өөр сайтаас ирсэн бичих хүсэлтийг хаана (Origin шалгалт, `common/same-origin.guard.ts`).
- Хурдны хязгаар: нэвтрэх оролдлого 15 минутад 10, маягт нэг IP-ээс цагт 30.
- Reverse proxy (nginx г.м.) ард `.env`-д `TRUST_PROXY=1` (HTTPS дээр cookie `Secure` болно).

## Юуг хаана засах вэ
| Хүсэлт | Файл |
|---|---|
| Сайтын текст, орчуулга | `site/lib/ub/data/i18n.js` |
| Нүүр хуудасны тодорхой хэсэг | `site/app/home/<Хэсэг>.tsx` (харагдац), `site/lib/ub/sections/<хэсэг>.js` (өгөгдөл), CSS `site/styles/` |
| Цэс, header, footer | `site/app/chrome/`, `site/styles/06-header-dock.css` (цэсний бүтэц: `site/lib/ub/core/header.js` `MENU`) |
| Тусдаа хуудас (`/news`, `/services` …) | `site/lib/ub/core/pages.js` (сервер талд `server/pages/pages.service.ts`-ийн `PAGES`) |
| Өнгө, үндсэн загвар | `site/styles/01-base.css`, `tailwind.config.js` |
| Admin-аас засагдах шинэ бүлэг | `admin/src/schema.ts` (`NAV`, `SCHEMA`), `src/core/cms.js` (`CMS_COLS`, `DEF`), `server/cms/cms.service.ts` (`CMS_COLS`) |
| Admin-ы дэлгэц | `admin/src/views/` |
| Шинэ API | `server/<модуль>/<нэр>.controller.ts` (шинэ модуль бол `app.module.ts`-д нэмнэ) |
| Шинэ гадны эх сурвалж | `server/sources/<нэр>.ts` → `server/sources/index.ts` → `server/site/site-builder.ts` |

## `deploy/`: сервер дээр байршуулах
`DEPLOY.md`-г үзнэ үү. Товчоор: Docker. `setup-nginx.sh` нь бусад сайттай хуваалцсан nginx-тэй сервер, `setup-ubuntu.sh` нь Caddy-тэй цэвэр сервер, `update.sh` нь шинэчлэх, `backup.sh` нь нөөцлөх скрипт. Өөрийн Mac дээр байнга ажиллуулах: `mac-service.sh`. Байгаа PostgreSQL сервер рүү холбох: `connect-postgres.sh`.
