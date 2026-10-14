/* HTTP-ийн жижиг туслахууд: JSON хариу, хүсэлтийн бие (JSON) унших, cookie, хэрэглэгчийн IP, хурдны хязгаар. */
const crypto = require('crypto');

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
const fail = (res, code, error) => send(res, code, { error });

function readJSON(req, limit) {
  return new Promise((resolve, reject) => {
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) { reject({ code: 415, error: 'json_required' }); return; }
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject({ code: 413, error: 'too_large' }); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject({ code: 400, error: 'bad_json' }); } });
    req.on('error', () => reject({ code: 400, error: 'bad_request' }));
  });
}
function cookies(req) {
  const out = {}; String(req.headers.cookie || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
const clientIp = (req) => (process.env.TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket.remoteAddress || '?';
const secure = (req) => !!(req.socket.encrypted || (process.env.TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https'));

/* Энгийн хурдны хязгаар: key-ээр (IP + үйлдэл) тодорхой хугацаанд N удаа. */
const hits = new Map();
function limited(key, max, windowMs) {
  const t = Date.now(), arr = (hits.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t); hits.set(key, arr);
  return arr.length > max;
}
setInterval(() => { const t = Date.now(); for (const [k, v] of hits) if (!v.some((x) => t - x < 3600e3)) hits.delete(k); }, 600e3).unref();

module.exports = { sha, send, fail, readJSON, cookies, clientIp, secure, limited };
