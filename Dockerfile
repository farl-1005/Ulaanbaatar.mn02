# ulaanbaatar.mn: сайт + backend. Байнгын өгөгдлийг /data хавтсанд (volume) хадгална.
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 TRUST_PROXY=1 DATA_DIR=/data NEWS_CACHE_DIR=/data/news-cache
COPY package.json package-lock.json ./
COPY admin/package.json admin/
COPY site/package.json site/
# Сайтыг сервер дээр тогтмол дахин бүтээдэг тул tailwind, sharp г.м. хэрэгслүүд бас хэрэгтэй
RUN npm ci --include=dev && npm cache clean --force
COPY . .
# Сервер (Nest.js) → dist/server, сайтын хуудсууд (Next.js) → site/.next, admin (Next.js) → admin/out.
# style.css, assets/live.json (бодит мэдээ, икон)-ийг сервер асахдаа бүтээнэ.
RUN npx tsc -p server && npm run build -w site && npm run build -w admin && mkdir -p /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/main.js"]
