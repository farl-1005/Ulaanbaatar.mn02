'use client';
/* Сайтын логикийг (lib/ub/: төлөв, өгөгдөл, товчны үйлдэл, чиглүүлэлт) хуудас hydrate болсны дараа асаана.
   Асаахад window.UB бэлэн болж React бүрэлдэхүүнүүд (useUB) зурагдана. */
import { useEffect } from 'react';
import { bootSite } from '../lib/ub/boot.js';

export function Boot() {
  useEffect(() => { bootSite().catch((e) => console.error('Сайт асаахад алдаа:', e)); }, []);
  return null;
}
