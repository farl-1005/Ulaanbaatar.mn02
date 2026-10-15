/* Backend (Nest.js, server/) API. Admin ба сайт нэг хаяг дээр тул нэвтрэлтийн cookie шууд явна. */

export class ApiError extends Error {
  constructor(readonly code: string, readonly status: number) {
    super(code);
  }
}

export async function api<T = any>(path: string, opt: { method?: string; body?: unknown } = {}): Promise<T> {
  const init: RequestInit = { method: opt.method || 'GET', credentials: 'same-origin', headers: {} };
  if (opt.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(opt.body);
  }
  const r = await fetch('/api' + path, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(j.error || 'http_' + r.status, r.status);
  return j as T;
}
