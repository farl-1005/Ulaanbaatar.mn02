import type { NextConfig } from 'next';

/* Нийтийн сайт (site/): Nest сервер (server/site/next-app.ts) өөр дотроо ажиллуулна — нэг процесс, нэг порт.
   Хуудсууд (нүүр, /news, /news/<id> …) энд, API (/api), admin (/admin), зураг (/assets, /og) Nest-д. */
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  agentRules: false,   // next dev нь AGENTS.md, CLAUDE.md файл үүсгэхгүй
};

export default config;
