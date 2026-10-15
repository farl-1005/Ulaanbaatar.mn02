# Кодын бүтэц

Төсөл 3 хэсгээс бүрдэнэ:

1. **Сайт (frontend): `src/`**. Энгийн JavaScript, framework байхгүй. Сервер бүх файлыг дарааллаар нь нэг `assets/app.js` болгон нийлүүлнэ.
2. **Удирдлага (admin): `admin/`**. Тусдаа [Next.js](https://nextjs.org) + React төсөл, `/admin` хаягаар. Сайтын агуулгыг засна.
3. **Сервер (backend): `server/`**. [Nest.js](https://nestjs.com) + TypeScript. Сайт, admin-ыг үйлчилж, `/api/...` хүсэлтэд хариулна.

```
   ulaanbaatar.mn API, ipiu.mn API
             │  (бүтээх бүрд, 15 мин кэш)
             ▼
   server/sources/ ──┐
   src/*.js ─────────┼──▶ server/site/site-builder.ts ──▶ dist/site/ (index.html, assets/app.js, assets/style.css)
   src/styles/*.css ─┘                         └──▶ assets/kit.js (admin-д: сайтын карт, чимэглэл, анхны агуулга)
                                                               │
   admin/ (Next.js) ──▶ admin/out/ ──────────────┐             ▼
   хөтөч ◀──── server/main.ts (Nest.js) ──┬─ /admin  удирдлага (admin/out, npm run dev үед next dev)
                                          ├─ pages/   нүүр, /news/<id>, og зураг, sitemap
                                          ├─ cms/, auth/, forms/, events/   /api/...  ──▶ database/ (PostgreSQL эсвэл SQLite)
                                          └─ live/    цаг агаар, агаарын чанар, газрын зураг, зураг
```

## Тушаалууд
| Тушаал | Юу хийх |
|---|---|
| `npm run dev` | Хөгжүүлэлт: сайт http://localhost:8080, admin http://localhost:8080/admin. `src/`-ийн файл хадгалахад сайтыг дахин бүтээж хөтчийг refresh хийнэ, `server/`-ийн файл хадгалахад серверийг дахин асаана, `admin/`-ийн файл хадгалахад admin шууд шинэчлэгдэнэ (`next dev`, 3001 порт) |
| `npm run build` | Бүгдийг бүтээнэ: сервер (`dist/server/`), сайт (`dist/site/`, `dist/ulaanbaatar-mn.html` нэг файлт хувилбар), admin (`admin/out/`) |
| `npm start` | Production сервер (эхлээд `npm run build`). Сайтыг 15 минут тутам дахин бүтээж шинэ мэдээ оруулна |
| `npm run news` | ulaanbaatar.mn-ээс мэдээ, медиаг кэшийг үл хайхран одоо шууд татна |

TypeScript-ийг `tsc` нь `dist/server/` руу хөрвүүлдэг (`server/tsconfig.json`).

## `src/`: хөтчийн код

`server/site/bundle-files.ts`-ийн жагсаалтын дарааллаар нийлнэ. Бүх файл нэг хүрээнд (scope) ажиллах тул нэг файлд зарласан функцыг дараагийн файлууд шууд дуудна. **Шинэ файл нэмбэл `server/site/bundle-files.ts`-д бичнэ.**

| Хавтас | Агуулга |
|---|---|
| `data/` | Анхны агуулга (admin засаагүй үед харагдана): текст (МН/EN), мэдээ, медиа, үйлчилгээ, төсөл, арга хэмжээ, ил тод байдал, хотын тухай, Засаг дарга, баннер, чатын хариулт |
| `core/` | Суурь: туслах функц, төлөв (`S`), цаг, хөдөлгөөн, цонх (modal), header, гүйдэг мөр, гар утасны цэс, хайлт, чиглүүлэлт, тусдаа хуудсууд, admin-ы засварыг сайтад тусгах (`cms.js`) |
| `sections/` | Нүүр хуудасны хэсэг бүр өөрийн файлд: hero, мэдээ (hub), амьдралын нөхцөл, медиа, газрын зураг, 24 мега төсөл, хотын тоо, арга хэмжээ, ил тод байдал, Засаг дарга, хотын тухай, баннер, footer |
| `features/` | Дэлгэрэнгүй цонх, үйлдлүүд: мэдээ унших, үйлчилгээ, ДАН нэвтрэлт, маягт, медиа тоглуулагч, баримт бичиг, Миний булан, AI туслах, цаг агаар, эхлүүлэх код (`init.js`) |
| `art/` | Кодоор зурдаг зураг: мэдээний чимэглэл, лого (`scene.js`), header-ийн хотын зураг (`skyline.js`) |
| `styles/` | CSS: нэрийн дарааллаар (01, 02 …) нийлж Tailwind-аар бүтээгдэнэ. Өнгөний токен `01-base.css`-д |
| `template.html` | HTML араг бүтэц, фонт, мета |
| `kit.js` | Admin-д өгөх сайтын функцууд (урьдчилан харах карт, чимэглэл, икон, анхны агуулга) → `assets/kit.js` |

## `admin/`: удирдлага (Next.js + React)

Тусдаа төсөл: өөрийн `package.json` (npm workspace), `next.config.ts`. `next build` нь статик файл (`admin/out/`) гаргаж, сервер `/admin` хаягаар үйлчилнэ. Загвар нь сайтын `/assets/style.css`, урьдчилан харах карт нь сайтын өөрийн функцууд (`/assets/kit.js`) тул сайт дээрхтэй яг адилхан харагдана.

| Файл | Агуулга |
|---|---|
| `app/layout.tsx`, `app/page.tsx` | Хуудас (Next.js App Router), сайтын CSS-ийг ачаална |
| `src/App.tsx` | Үндсэн бүрэлдэхүүн: kit ачаалах, нэвтрэлт, хаягаар (`#news`, `#news/<id>`) хэсэг нээх |
| `src/schema.ts` | Бүлэг бүрийн маягтын талбар (мэдээ, анхааруулга, арга хэмжээ ...), цэс, шинэ бичлэгийн анхны утга |
| `src/cms.ts` | Засвар ачаалах, хадгалах, устгах, буцаах (`/api/cms`), шууд шинэчлэлт (`/api/events`) |
| `src/kit.ts` | Сайтын хэрэгсэл (`/assets/kit.js`) ачаалах, төрөл |
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
| `site/` | Сайтыг бүтээх (`site-builder.ts`), JS файлын дараалал (`bundle-files.ts`), dev горимд автоматаар дахин бүтээх |
| `pages/` | Сервер дээр бэлддэг хуудсууд: нүүр, `/news/<id>` (og: tag, JSON-LD), og зураг, `sitemap.xml`, `robots.txt` |
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
- Нэвтрэх: http://localhost:8080/admin (сайтын хөлийн **«Удирдлагын хэсэг»** холбоос). Нууц үг нь `.env`-ийн `ADMIN_PASSWORD` (анх асаахад `.env` байхгүй бол санамсаргүй нууц үг үүсгэнэ).
- Admin-аас засагдах хэсгүүд: мэдээ, анхааруулга, арга хэмжээ, медиа, төсөл, үйлчилгээ, амьдралын нөхцөл, ил тод байдал, удирдлагын бүтэц, харьяа байгууллага, түүх, хотын статистик, цэс, ангилал, AI туслахын хариулт, сайтын бүх текст, тохиргоо. Засваргүй бол `src/data/`-ийн анхны агуулга харагдана, «Анхны хувилбарт буцаах» нь засварыг устгана.
- Admin хадгалах бүрд нээлттэй бүх хөтөч `/api/events`-ээр мэдэгдэл авч, дахин ачаалахгүйгээр шинэчлэгдэнэ.
- Иргэдийн маягт (эрсдэл мэдээлэх (зурагтай), санал хүсэлт, имэйл бүртгэл) admin-ы **Ирсэн хүсэлт** хэсэгт харагдана. Иргэний зураг `data/uploads/`-д, зөвхөн admin-д харагдана.
- Admin нь сервер шаарддаг. Сервергүй (`dist/ulaanbaatar-mn.html`, нэг файлт хувилбар) үед сайт анхны агуулгаараа харагдана.

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
| Сайтын текст, орчуулга | `src/data/i18n.js` |
| Нүүр хуудасны тодорхой хэсэг | `src/sections/<хэсэг>.js` + түүний CSS `src/styles/` |
| Цэс, header | `src/core/header.js`, `src/styles/06-header-dock.css` |
| Тусдаа хуудас (`/news`, `/services` …) | `src/core/pages.js` (сервер талд `server/pages/pages.service.ts`-ийн `PAGES`) |
| Өнгө, үндсэн загвар | `src/styles/01-base.css`, `tailwind.config.js` |
| Admin-аас засагдах шинэ бүлэг | `admin/src/schema.ts` (`NAV`, `SCHEMA`), `src/core/cms.js` (`CMS_COLS`, `DEF`), `server/cms/cms.service.ts` (`CMS_COLS`) |
| Admin-ы дэлгэц | `admin/src/views/` |
| Шинэ API | `server/<модуль>/<нэр>.controller.ts` (шинэ модуль бол `app.module.ts`-д нэмнэ) |
| Шинэ гадны эх сурвалж | `server/sources/<нэр>.ts` → `server/sources/index.ts` → `server/site/site-builder.ts` |

## `deploy/`: сервер дээр байршуулах
`DEPLOY.md`-г үзнэ үү. Товчоор: Docker. `setup-nginx.sh` нь бусад сайттай хуваалцсан nginx-тэй сервер, `setup-ubuntu.sh` нь Caddy-тэй цэвэр сервер, `update.sh` нь шинэчлэх, `backup.sh` нь нөөцлөх скрипт. Өөрийн Mac дээр байнга ажиллуулах: `mac-service.sh`. Байгаа PostgreSQL сервер рүү холбох: `connect-postgres.sh`.
