# Кодын бүтэц

Сайт 2 хэсгээс бүрдэнэ:

1. **Хөтөч (frontend): `src/`**. Энгийн JavaScript, framework байхгүй. Сервер бүх файлыг дарааллаар нь нэг `assets/app.js` болгон нийлүүлнэ.
2. **Сервер (backend): `server/`**. [Nest.js](https://nestjs.com) + TypeScript. Сайтыг бүтээж үйлчилнэ, admin, маягт, цаг агаар зэрэг `/api/...` хүсэлтэд хариулна.

```
   ulaanbaatar.mn API, ipiu.mn API
             │  (бүтээх бүрд, 15 мин кэш)
             ▼
   server/sources/ ──┐
   src/*.js ─────────┼──▶ server/site/site-builder.ts ──▶ dist/site/ (index.html, assets/app.js, assets/style.css)
   src/styles/*.css ─┘                                         │
                                                               ▼
   хөтөч ◀──── server/main.ts (Nest.js) ──┬─ pages/   нүүр, /news/<id>, og зураг, sitemap
                                          ├─ cms/, auth/, forms/, events/   /api/...  ──▶ database/ (PostgreSQL эсвэл SQLite)
                                          └─ live/    цаг агаар, агаарын чанар, газрын зураг, зураг
```

## Тушаалууд
| Тушаал | Юу хийх |
|---|---|
| `npm run dev` | Хөгжүүлэлт: http://localhost:8080. `src/`-ийн файл хадгалахад сайтыг дахин бүтээж хөтчийг refresh хийнэ, `server/`-ийн файл хадгалахад серверийг дахин асаана |
| `npm run build` | Сайтыг бүтээнэ: `dist/site/` ба `dist/ulaanbaatar-mn.html` (нэг файлт хувилбар) |
| `npm start` | Production сервер (эхлээд `npm run build`). Сайтыг 15 минут тутам дахин бүтээж шинэ мэдээ оруулна |
| `npm run news` | ulaanbaatar.mn-ээс мэдээ, медиаг кэшийг үл хайхран одоо шууд татна |

TypeScript-ийг `tsc` нь `dist/server/` руу хөрвүүлдэг (`server/tsconfig.json`).

## `src/`: хөтчийн код

`server/site/bundle-files.ts`-ийн жагсаалтын дарааллаар нийлнэ. Бүх файл нэг хүрээнд (scope) ажиллах тул нэг файлд зарласан функцыг дараагийн файлууд шууд дуудна. **Шинэ файл нэмбэл `server/site/bundle-files.ts`-д бичнэ.**

| Хавтас | Агуулга |
|---|---|
| `data/` | Анхны агуулга (admin засаагүй үед харагдана): текст (МН/EN), мэдээ, медиа, үйлчилгээ, төсөл, арга хэмжээ, ил тод байдал, хотын тухай, Засаг дарга, баннер, чатын хариулт |
| `core/` | Суурь: туслах функц, төлөв (`S`), цаг, хөдөлгөөн, цонх (modal), header, гүйдэг мөр, гар утасны цэс, хайлт, чиглүүлэлт, тусдаа хуудсууд |
| `sections/` | Нүүр хуудасны хэсэг бүр өөрийн файлд: hero, мэдээ (hub), амьдралын нөхцөл, медиа, газрын зураг, 24 мега төсөл, хотын тоо, арга хэмжээ, ил тод байдал, Засаг дарга, хотын тухай, баннер, footer |
| `features/` | Дэлгэрэнгүй цонх, үйлдлүүд: мэдээ унших, үйлчилгээ, ДАН нэвтрэлт, маягт, медиа тоглуулагч, баримт бичиг, Миний булан, AI туслах, цаг агаар, эхлүүлэх код (`init.js`) |
| `admin/` | `cms.js`: анхны агуулга + admin-ы засварыг нийлүүлэх давхарга. `admin.js`: удирдлагын дэлгэц |
| `art/` | Кодоор зурдаг зураг: мэдээний чимэглэл, лого (`scene.js`), header-ийн хотын зураг (`skyline.js`) |
| `styles/` | CSS: нэрийн дарааллаар (01, 02 …) нийлж Tailwind-аар бүтээгдэнэ. Өнгөний токен `01-base.css`-д |
| `template.html` | HTML араг бүтэц, фонт, мета |

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

## Юуг хаана засах вэ
| Хүсэлт | Файл |
|---|---|
| Сайтын текст, орчуулга | `src/data/i18n.js` |
| Нүүр хуудасны тодорхой хэсэг | `src/sections/<хэсэг>.js` + түүний CSS `src/styles/` |
| Цэс, header | `src/core/header.js`, `src/styles/06-header-dock.css` |
| Тусдаа хуудас (`/news`, `/services` …) | `src/core/pages.js` (сервер талд `server/pages/pages.service.ts`-ийн `PAGES`) |
| Өнгө, үндсэн загвар | `src/styles/01-base.css`, `tailwind.config.js` |
| Admin-аас засагдах шинэ бүлэг | `src/admin/cms.js` (`CMS_COLS`), `src/admin/admin.js` (`SCHEMA`), `server/cms/cms.service.ts` (`CMS_COLS`) |
| Шинэ API | `server/<модуль>/<нэр>.controller.ts` (шинэ модуль бол `app.module.ts`-д нэмнэ) |
| Шинэ гадны эх сурвалж | `server/sources/<нэр>.ts` → `server/sources/index.ts` → `server/site/site-builder.ts` |

## `deploy/`: сервер дээр байршуулах
`DEPLOY.md`-г үзнэ үү. Товчоор: Docker. `setup-nginx.sh` нь бусад сайттай хуваалцсан nginx-тэй сервер, `setup-ubuntu.sh` нь Caddy-тэй цэвэр сервер, `update.sh` нь шинэчлэх, `backup.sh` нь нөөцлөх скрипт.
