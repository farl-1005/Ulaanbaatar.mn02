# VPS дээр байршуулах

Сайт + backend Docker дотор ажиллаж, **Caddy** HTTPS сертификатыг автоматаар (үнэгүй, Let's Encrypt) авч сунгана.
Өгөгдлийн сан, иргэдийн зураг `ubdata` нэртэй Docker volume-д хадгалагдах тул шинэчлэхэд устахгүй.

## 1. Бэлтгэл
- **VPS:** Ubuntu 22.04 эсвэл 24.04, хамгийн багадаа 1 vCPU, **2 GB RAM**, 20 GB диск. Монголд: Mongolia Cloud, Datacom, Unitel Cloud г.м.; гадаадад: DigitalOcean, Hetzner.
- **Домэйн (заавал биш):** домэйны DNS-д `A` бичлэг нэмж серверийн IP руу заана (жишээ нь `ub.example.mn → 203.0.113.10`). DNS тархахад 5–30 минут.
- Серверт SSH-ээр нэвтрэх эрх (root эсвэл sudo).

## 2. Нэг командаар суулгах
Сервер дээр (домэйнээ өөрийнхөөрөө солино, домэйнгүй бол хоосон орхино):
```bash
curl -fsSL https://raw.githubusercontent.com/farl-1005/Ulaanbaatar.mn02/main/deploy/setup-ubuntu.sh | sudo bash -s -- ub.example.mn
```
Скрипт: Docker суулгана → галт ханыг (22, 80, 443) нээнэ → кодыг `/opt/ulaanbaatar-mn`-д татна → admin нууц үгтэй `.env` үүсгэнэ → сайтыг асаана.

Дууссаны дараа:
- Сайт: `https://ub.example.mn` (домэйнгүй бол `http://<серверийн IP>`)
- Admin: `/#admin`. Нууц үг: `sudo cat /opt/ulaanbaatar-mn/.env`
- Анх асахад мэдээ, зургийг татаж бүтээхэд 1–2 минут болно. Дараа нь 15 минут тутам мэдээ автоматаар шинэчлэгдэнэ.

## 2б. Сервер дээр nginx аль хэдийн ажиллаж байвал (бусад сайттай хамтын сервер)
Дээрх скрипт 80/443 портыг Caddy-д авдаг тул **nginx-тэй серверт бүү ажиллуул**. Оронд нь:
```bash
curl -fsSL https://raw.githubusercontent.com/farl-1005/Ulaanbaatar.mn02/main/deploy/setup-nginx.sh | sudo bash -s -- ub.example.mn
```
Скрипт: апп-ыг Docker-т зөвхөн `127.0.0.1:3010` дээр асаана → тухайн домэйнд л nginx-ийн тохиргоо нэмнэ (`nginx -t` алдаатай бол буцаана) → certbot-оор HTTPS авна.
Бусад сайт, галт хана, 80/443 портод хүрэхгүй. 3010 эзлэгдсэн бол гуравдахь аргументаар өөр порт: `... ub.example.mn 3020`.
Дараагийн бүх команд (update.sh, backup.sh, `docker compose ...`) өөрчлөлтгүй ажиллана (`.env`-ийн `COMPOSE_FILE`).

## Өгөгдлийн сан: PostgreSQL
Admin-ы засвар, иргэдийн хүсэлт, нэвтрэлт **PostgreSQL**-д хадгалагдана (Docker-ийн `db` сервис, `pgdata` volume, зөвхөн дотоод сүлжээнд).
- Суулгах, шинэчлэх скриптүүд `.env`-д `POSTGRES_PASSWORD`, `DATABASE_URL`, `COMPOSE_FILE`-ийг өөрсдөө үүсгэнэ.
- Өмнө нь SQLite-аар ажиллаж байсан серверт `update.sh`-ийг ажиллуулахад PostgreSQL асаж, хуучин өгөгдөл **автоматаар шилжинэ** (SQLite файл нөөц болж үлдэнэ).
- `DATABASE_URL` тохируулаагүй бол SQLite (`/data/ub.sqlite`) хэвээр ажиллана.
- Өөрийн компьютер дээр: `bash deploy/local-postgres.sh`.
- Байгаа PostgreSQL сервер рүү (pgAdmin-д харагддаг г.м.): `bash deploy/connect-postgres.sh <хост> <порт> <өгөгдлийн сан> <хэрэглэгч>`. Нууц үгийг асууж, холболтыг шалгаад `.env`-д бичнэ. Сайтын хүснэгтүүд тусдаа `ubmn` schema-д үүсэх тул тухайн өгөгдлийн сангийн бусад хүснэгтэд хүрэхгүй (`DATABASE_SCHEMA`).
- PostgreSQL руу орж харах: `cd /opt/ulaanbaatar-mn && sudo docker compose exec db psql -U ubmn ubmn`

## 3. Өдөр тутмын ажиллагаа
| Үйлдэл | Команд (сервер дээр) |
|---|---|
| GitHub-ийн шинэ кодыг гаргах | `sudo bash /opt/ulaanbaatar-mn/deploy/update.sh` |
| Лог харах | `cd /opt/ulaanbaatar-mn && sudo docker compose logs -f app` |
| Дахин асаах | `cd /opt/ulaanbaatar-mn && sudo docker compose restart` |
| Нөөц авах (PostgreSQL dump + зураг) | `sudo bash /opt/ulaanbaatar-mn/deploy/backup.sh` → `backups/ub-ОГНОО.tgz` |
| Өдөр бүр автоматаар нөөцлөх | `echo "0 3 * * * root bash /opt/ulaanbaatar-mn/deploy/backup.sh" \| sudo tee /etc/cron.d/ubmn-backup` |
| Admin нууц үг солих | `.env`-ийн `ADMIN_PASSWORD`-ийг засаад `sudo docker compose up -d` |

Нөөцийг серверээс гадна (өөрийн компьютер, өөр сервер) тогтмол хуулж хадгална уу.

## Бусад
- **Docker-гүй ажиллуулах:** Node.js 20.12+ суулгаад `npm ci && npm run build && npm start`. `.env.example`-ийг харна уу. Урд нь nginx г.м. reverse proxy тавибал `TRUST_PROXY=1`.
- **Нөөцөөс сэргээх:** `tar xzf ub-ОГНОО.tgz` → `sudo docker compose exec -T db psql -U ubmn ubmn < db.sql` (PostgreSQL), иргэдийн зургийг `uploads.tgz`-ээс `ubdata` volume руу (`docker compose cp`) хуулаад дахин асаана. Хуучин (SQLite) нөөцөд `backup.sqlite` байна.
