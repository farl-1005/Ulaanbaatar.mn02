# ulaanbaatar.mn: сайт + backend. Байнгын өгөгдлийг /data хавтсанд (volume) хадгална.
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 TRUST_PROXY=1 DATA_DIR=/data NEWS_CACHE_DIR=/data/news-cache
COPY package.json package-lock.json ./
# Сайтыг сервер дээр тогтмол дахин бүтээдэг тул tailwind, sharp г.м. хэрэгслүүд бас хэрэгтэй
RUN npm ci --include=dev && npm cache clean --force
COPY . .
RUN mkdir -p /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
