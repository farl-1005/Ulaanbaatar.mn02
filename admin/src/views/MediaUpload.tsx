'use client';
/* Видео, аудио оруулах (медиа, мэдээний бичлэг): файлыг /api/upload/media руу шууд илгээнэ (XMLHttpRequest — явцын мөртэй).
   Үргэлжлэх хугацааг хөтөч дээр файлын metadata-аас уншина (admin гараар бичихгүй). Сервер: server/uploads/. */
import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';
import { errMsg } from '../cms';
import { L } from '../kit';
import { Icon, useToast } from '../ui';

/** Хэмжээний хязгаар: server/uploads/uploads.service.ts-тэй ижил */
const VIDEO_MAX = 500 * 1024 * 1024, AUDIO_MAX = 100 * 1024 * 1024;
/** Өргөтгөл → серверт илгээх Content-Type (жинхэнэ төрлийг сервер файлын эхний байтаар шалгана) */
const TYPES: Record<string, string> = { mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', oga: 'audio/ogg', wav: 'audio/wav' };
const AUDIO_EXT = ['mp3', 'm4a', 'ogg', 'oga', 'wav'];
const ACCEPT_VIDEO = 'video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov';
const ACCEPT_ANY = ACCEPT_VIDEO + ',audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,audio/wav,.mp3,.m4a,.ogg,.oga,.wav';
/** Серверт хадгалсан файлын хаяг (site/lib/ub/sections/media.js MEDIA_FILE-тэй ижил) */
export const MEDIA_FILE = /^\/media\/[\w-]+\.(mp4|webm|mp3|m4a|ogg|wav)$/;
const isAudio = (u: string) => /\.(mp3|m4a|ogg|wav)$/.test(u);
const extOf = (f: File) => (f.name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
const mb = (n: number) => (n / 1048576).toFixed(n < 10 * 1048576 ? 1 : 0);
const pad = (n: number) => String(n).padStart(2, '0');
/** Секунд → «12:34» эсвэл «1:02:03» */
export const fmtDur = (s: number) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return (h ? h + ':' + pad(m) : m) + ':' + pad(s % 60); };

/** Хөтөч дээр файлын үргэлжлэх хугацааг (секунд) metadata-аас уншина. Хөтөч тоглуулж чадахгүй файл бол алдаа. */
export function readDuration(file: File, kind: 'video' | 'audio'): Promise<number> {
  return new Promise((resolve, reject) => {
    const el = document.createElement(kind), url = URL.createObjectURL(file);
    let done = false;
    const finish = (v: number | null) => {
      if (done) return;
      done = true;
      clearTimeout(tm);
      el.onloadedmetadata = el.ondurationchange = el.onerror = null;
      el.removeAttribute('src'); el.load();
      URL.revokeObjectURL(url);
      if (v == null) reject(new Error('unreadable')); else resolve(v);
    };
    const tm = setTimeout(() => finish(null), 30000);
    const ok = () => Number.isFinite(el.duration) && el.duration > 0;
    el.preload = 'metadata';
    el.muted = true;
    el.onloadedmetadata = () => {
      if (ok()) { finish(el.duration); return; }
      // MediaRecorder-ийн WebM: хугацаа Infinity байдаг, төгсгөл рүү гүйлгэхэд жинхэнэ утга гарна
      el.ondurationchange = () => { if (ok()) finish(el.duration); };
      el.currentTime = 1e101;
    };
    el.onerror = () => finish(null);
    el.src = url;
  });
}

export interface Uploaded { url: string; size: number; type: 'video' | 'audio' }
/** POST /api/upload/media: биед нь файл өөрөө. onProgress(0..1). abort() дуудвал сервер дутуу файлыг устгана. */
export function uploadMedia(file: File, contentType: string, onProgress: (frac: number) => void): { promise: Promise<Uploaded>; abort: () => void } {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<Uploaded>((resolve, reject) => {
    xhr.open('POST', '/api/upload/media');
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    xhr.onload = () => {
      const j = xhr.response || {};
      if (xhr.status >= 200 && xhr.status < 300 && j.url) resolve(j as Uploaded);
      else reject(new ApiError(j.error || 'http_' + xhr.status, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('network', 0));
    xhr.onabort = () => reject(new ApiError('aborted', 0));
    xhr.send(file);
  });
  return { promise, abort: () => xhr.abort() };
}

function uploadErr(e: unknown): string {
  const c = e instanceof ApiError ? e.code : '';
  if (c === 'too_large') return L(['Файл хэт том байна (видео 500 МБ, аудио 100 МБ хүртэл)', 'The file is too large (video up to 500 MB, audio up to 100 MB)']);
  if (c === 'bad_type') return L(['Энэ төрлийн файл оруулах боломжгүй. MP4, WebM, MOV, MP3, M4A, OGG, WAV файл оруулна уу.', 'This file type is not supported. Use MP4, WebM, MOV, MP3, M4A, OGG or WAV.']);
  if (c === 'network') return L(['Сүлжээ тасарлаа. Дахин оролдоно уу.', 'The connection was lost. Try again.']);
  if (c === 'unauthorized') return errMsg(e);
  return L(['Бичлэгийг оруулж чадсангүй. Дахин оролдоно уу.', "Couldn't upload the recording. Try again."]);
}

interface Up { name: string; frac: number; total: number; step: 'read' | 'send' }

/** Файл сонгосны дараа: төрөл, хэмжээг шалгаж, хугацааг уншаад серверт илгээнэ. Цонх хаагдвал илгээлтийг зогсооно. */
function useUpload(accept: 'video' | 'any', onDone: (url: string, dur: number | null) => void) {
  const toast = useToast();
  const [up, setUp] = useState<Up | null>(null);
  const job = useRef<{ abort: () => void } | null>(null), busy = useRef(false);
  useEffect(() => () => job.current?.abort(), []);
  const start = async (file: File | undefined) => {
    if (!file || busy.current) return;
    const ext = extOf(file), kind = !TYPES[ext] ? null : AUDIO_EXT.includes(ext) ? 'audio' : 'video';
    if (!kind || (accept === 'video' && kind !== 'video')) {
      toast(accept === 'video' ? L(['MP4, WebM эсвэл MOV видео файл сонгоно уу', 'Choose an MP4, WebM or MOV video']) : L(['Видео (MP4, WebM, MOV) эсвэл аудио (MP3, M4A, OGG, WAV) файл сонгоно уу', 'Choose a video (MP4, WebM, MOV) or audio (MP3, M4A, OGG, WAV) file']), 'triangle-alert');
      return;
    }
    if (file.size > (kind === 'video' ? VIDEO_MAX : AUDIO_MAX)) { toast(uploadErr(new ApiError('too_large', 413)), 'triangle-alert'); return; }
    busy.current = true;
    setUp({ name: file.name, frac: 0, total: file.size, step: 'read' });
    try {
      let dur: number;
      try { dur = await readDuration(file, kind); } catch {
        toast(L(['Хөтөч энэ бичлэгийг уншиж чадсангүй. MP4 (H.264), WebM, MP3 эсвэл M4A болгож хөрвүүлээд дахин оруулна уу.', "The browser can't read this recording. Convert it to MP4 (H.264), WebM, MP3 or M4A and try again."]), 'triangle-alert');
        return;
      }
      const x = uploadMedia(file, TYPES[ext], (frac) => setUp((u) => u && { ...u, frac }));
      job.current = x;
      setUp((u) => u && { ...u, step: 'send' });
      const r = await x.promise;
      onDone(r.url, dur > 0 ? Math.max(1, Math.round(dur)) : null);
      toast(L(['Бичлэг орууллаа. «Хадгалах»-ыг дарна уу.', 'Recording uploaded. Press Save.']), kind === 'video' ? 'film' : 'headphones');
    } catch (e) {
      if (!(e instanceof ApiError && e.code === 'aborted')) toast(uploadErr(e), 'triangle-alert');
    } finally {
      job.current = null;
      busy.current = false;
      setUp(null);
    }
  };
  return { up, start, abort: () => job.current?.abort() };
}

/** Явцын мөр: хувь, МБ, «Цуцлах» */
function Progress({ up, onAbort }: { up: Up; onAbort: () => void }) {
  const pct = Math.round(up.frac * 100);
  return (
    <div className="rounded-xl border border-line bg-soft/50 p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-[13.5px]">
        <Icon name="upload" className="w-4 h-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 truncate font-semibold">{up.name}</span>
        <span className="tnum text-muted shrink-0">{up.step === 'read' ? L(['Шалгаж байна…', 'Checking…']) : `${pct}% · ${mb(up.frac * up.total)} / ${mb(up.total)} МБ`}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-ubblue transition-[width] duration-300" style={{ width: (up.step === 'read' ? 0 : pct) + '%' }} /></div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[12.5px] text-muted">{L(['Дуустал энэ цонхыг бүү хаа', "Don't close this window until it finishes"])}</span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onAbort}><Icon name="x" className="w-4 h-4" />{L(['Цуцлах', 'Cancel'])}</button>
      </div>
    </div>
  );
}

/** Файл сонгох товч */
function Pick({ label, accept, onFile, icon = 'upload' }: { label: string; accept: string; onFile: (f: File | undefined) => void; icon?: string }) {
  return (
    <label className="btn btn-sm btn-ghost cursor-pointer"><Icon name={icon} className="w-4 h-4" />{label}
      <input type="file" accept={accept} className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
    </label>
  );
}

/** Оруулсан файл: тоглуулагч + хугацаа + солих / хасах */
function Current({ file, dur, accept, onFile, onRemove }: { file: string; dur?: number | null; accept: string; onFile: (f: File | undefined) => void; onRemove: () => void }) {
  const audio = isAudio(file);
  return (
    <div className="rounded-xl border border-line p-3 space-y-3">
      {audio ? <audio src={file} controls preload="metadata" className="w-full" /> : <video src={file} controls preload="metadata" playsInline className="w-full max-h-[280px] rounded-lg bg-black" />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted tnum mr-auto">
          <Icon name={audio ? 'headphones' : 'film'} className="w-4 h-4" />{audio ? L(['Аудио', 'Audio']) : L(['Видео', 'Video'])}{dur ? ` · ${fmtDur(dur)}` : ''}
        </span>
        <Pick label={L(['Солих', 'Replace'])} accept={accept} onFile={onFile} icon="refresh-cw" />
        <button type="button" className="btn btn-sm btn-ghost !text-ubred" onClick={onRemove}><Icon name="trash-2" className="w-4 h-4" />{L(['Хасах', 'Remove'])}</button>
      </div>
    </div>
  );
}

/** Медиа (mediaitems): видео эсвэл аудио файл. Утга: file ('/media/<файл>'), dur (секунд, файлаас автоматаар). */
export function MediaFileField({ file, dur, onChange }: { file?: string; dur?: unknown; onChange: (file: string, dur: number | null) => void }) {
  const { up, start, abort } = useUpload('any', onChange);
  const cur = MEDIA_FILE.test(file || '') ? file! : '';
  if (up) return <Progress up={up} onAbort={abort} />;
  if (cur) return <Current file={cur} dur={typeof dur === 'number' ? dur : null} accept={ACCEPT_ANY} onFile={start} onRemove={() => onChange('', null)} />;
  return (
    <div className="space-y-2">
      <Pick label={L(['Файл сонгох', 'Choose a file'])} accept={ACCEPT_ANY} onFile={start} />
      <p className="text-[12.5px] text-muted leading-snug">{L(['Видео: MP4, WebM, MOV (500 МБ хүртэл). Аудио: MP3, M4A, OGG, WAV (100 МБ хүртэл). Үргэлжлэх хугацааг файлаас автоматаар авна.', 'Video: MP4, WebM, MOV (up to 500 MB). Audio: MP3, M4A, OGG, WAV (up to 100 MB). The duration is read from the file.'])}</p>
    </div>
  );
}

/** Мэдээний бичлэг (news.video): оруулсан видео ('/media/<файл>') эсвэл YouTube / Facebook холбоос */
export function VideoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { up, start, abort } = useUpload('video', (url) => onChange(url));
  const file = MEDIA_FILE.test(value) ? value : '', link = file ? '' : value;
  const host = /youtu\.?be/.test(link) ? 'YouTube' : /facebook\.com|fb\.watch/.test(link) ? 'Facebook' : '';
  if (up) return <Progress up={up} onAbort={abort} />;
  if (file) return <Current file={file} accept={ACCEPT_VIDEO} onFile={start} onRemove={() => onChange('')} />;
  return (
    <div className="space-y-2">
      <input type="url" className="field" value={link} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => onChange(e.target.value)} />
      {link && (
        <p className={`text-[12.5px] leading-snug ${/^https?:\/\//.test(link) ? 'text-muted' : 'text-ubred'}`}>
          {!/^https?:\/\//.test(link) ? L(['Холбоос https://-ээр эхэлнэ', 'The link must start with https://'])
            : host ? L([`${host} бичлэг: мэдээний текстийн дээр тоглуулагч харагдана.`, `${host} video: a player is shown above the story.`])
            : L(['YouTube, Facebook биш холбоос: «Бичлэг үзэх» товч болж харагдана.', 'Not a YouTube or Facebook link: shown as a "Watch the video" button.'])}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[12.5px] text-muted">{L(['эсвэл', 'or'])}</span>
        <Pick label={L(['Видео файл оруулах', 'Upload a video file'])} accept={ACCEPT_VIDEO} onFile={start} />
        <span className="text-[12.5px] text-muted">MP4, WebM, MOV · 500 {L(['МБ хүртэл', 'MB max'])}</span>
      </div>
    </div>
  );
}
