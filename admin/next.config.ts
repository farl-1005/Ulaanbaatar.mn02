import type { NextConfig } from 'next';

/* Admin (/admin): `next build` нь статик файл (out/) гаргана, Nest сервер түүнийг /admin хаягаар үйлчилнэ (server/site/static-assets.ts).
   npm run dev үед `next dev` (3001 порт) ажиллаж, Nest /admin-ийг түүн рүү дамжуулна: хөгжүүлэлтэд ч http://localhost:8080/admin. */
const config: NextConfig = {
  basePath: '/admin',
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  agentRules: false,   // next dev нь AGENTS.md, CLAUDE.md файл үүсгэхгүй
};

export default config;
