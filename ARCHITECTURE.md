# Кодын бүтэц

Сайт 3 хэсгээс бүрдэнэ:

1. **Хөтөч (frontend):** `src/`. Энгийн JavaScript, framework байхгүй. `build.js` бүх файлыг дарааллаар нь нэг `app.js` болгон нийлүүлнэ.
2. **Бүтээх (build):** `build.js`. Гадны эх сурвалжаас (`server/sources/`) бодит мэдээ, медиа, төслийг татаж JS-д шигтгэнэ, Tailwind CSS-ийг бүтээнэ.
3. **Сервер (backend):** `server/`. Сайтыг үйлчилж, admin, маягт, цаг агаар, агаарын чанар зэрэг `/api/...` хүсэлтэд хариулна.

```
                  ulaanbaatar.mn API, ipiu.mn API
                              │  (build бүрт, 15 мин кэш)
                              ▼
src/*.js  ──┐        server/sources/*.js
src/styles ─┼──▶ build.js ──▶ dist/site/  (index.html, assets/app.js, assets/style.css)
template ───┘                     │
                                  ▼
          хөтөч ◀──── server/index.js (production) эсвэл build.js --serve (npm run dev)
                          │
                          ├─ server/pages.js  /news/<id>, /og/<id>.jpg, /sitemap.xml
                          └─ server/api.js    /api/...  ──▶ server/db.js (PostgreSQL эсвэл SQLite)
                                                       └─▶ server/live.js (газрын зураг, зураг, агаар, цаг агаар)
```

## `src/`: хөтчийн код

`build.js`-ийн `FILES` жагсаалтын дарааллаар нийлнэ. Бүх файл нэг хүрээнд (scope) ажиллах тул нэг файлд зарласан функцыг дараагийн файлууд шууд дуудна. **Шинэ файл нэмбэл `build.js`-ийн `FILES`-д бичнэ.**

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

### Юуг хаана засах вэ
| Хүсэлт | Файл |
|---|---|
| Сайтын текст, орчуулга | `src/data/i18n.js` |
| Нүүр хуудасны тодорхой хэсэг | `src/sections/<хэсэг>.js` + түүний CSS `src/styles/` |
| Цэс, header | `src/core/header.js`, `src/styles/06-header-dock.css` |
| Тусдаа хуудас (`/news`, `/services` …) | `src/core/pages.js` (сервер талд `server/pages.js`-ийн `PAGES`) |
| Өнгө, үндсэн загвар | `src/styles/01-base.css`, `tailwind.config.js` |
| Admin-аас засагдах шинэ бүлэг | `src/admin/cms.js` (`CMS_COLS`), `src/admin/admin.js` (`SCHEMA`), `server/api.js` (`COLS`) |
| Шинэ гадны эх сурвалж | `server/sources/<нэр>.js` → `server/sources/index.js` → `build.js` |

## `server/`: backend

| Файл | Агуулга |
|---|---|
| `index.js` | Production сервер (`npm start`): `dist/site`-ийг үйлчилж, 15 минут тутам дахин бүтээнэ |
| `config.js` | `.env` ачаалах, өгөгдлийн хавтас (`data/`, Docker-т `/data`). Бусад модулиас өмнө ачаалагдана |
| `http.js` | JSON хариу, хүсэлтийн бие унших, cookie, IP, хурдны хязгаар |
| `api.js` | `/api/...` чиглүүлэлт: admin нэвтрэлт, CMS, маягт, ирсэн хүсэлт, шууд мэдэгдэл (SSE) |
| `live.js` | Гадны бодит цагийн өгөгдөл: газрын зураг (hamuga.mn), зураг жижигрүүлэх, агаарын чанар (IQAir, Open-Meteo), цаг агаар |
| `db.js` | Өгөгдлийн сан: `DATABASE_URL` байвал PostgreSQL, эс бөгөөс SQLite (`data/ub.sqlite`) |
| `pages.js` | Мэдээ бүрийн хуудас (`/news/<id>`), og зураг, sitemap, robots.txt |
| `sources/` | Build үед татах гадны өгөгдөл (доор) |

### `server/sources/`: гадны эх сурвалж
Бүгд `dist/.news/`-д (production-д `NEWS_CACHE_DIR`) кэшлэгдэнэ. Сүлжээ тасарвал хуучин кэшээ ашиглана.

| Файл | Эх сурвалж | Хөтөч дээр |
|---|---|---|
| `news.js` | ulaanbaatar.mn мэдээ (цаг үеийн, харьяа газрын, хэвлэлийн тойм) | `LIVE_NEWS` |
| `media.js` | ulaanbaatar.mn медиа (Live, Фото сурвалжилга, Постер, Подкаст) | `LIVE_MEDIA` |
| `orgs.js` | ulaanbaatar.mn харьяа байгууллага, лого | `LIVE_ORGS` |
| `mega.js` | ulaanbaatar.mn 24 мега төсөл, явцын мэдээ | `LIVE_MEGA` |
| `ipiu.js` | ipiu.mn мега төслийн албан ёсны тоо (гүйцэтгэл, төсөв, хугацаа) | `LIVE_IPIU` |
| `shared.js` | Нийтлэг: кэш, татах, HTML → текст, зураг жижигрүүлэх, байгууллагын нэр | |
| `index.js` | Бүгдийг нэг дор экспортлоно. `npm run news` = мэдээ, медиаг шууд шинэчлэх | |

## `deploy/`: сервер дээр байршуулах
`DEPLOY.md`-г үзнэ үү. Товчоор: Docker. `setup-nginx.sh` нь бусад сайттай хуваалцсан nginx-тэй сервер, `setup-ubuntu.sh` нь Caddy-тэй цэвэр сервер, `update.sh` нь шинэчлэх, `backup.sh` нь нөөцлөх скрипт.
