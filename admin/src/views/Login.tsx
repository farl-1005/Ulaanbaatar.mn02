'use client';
/* Нэвтрэх: нууц үг нь серверийн .env-ийн ADMIN_PASSWORD */
import { FormEvent, useState } from 'react';
import { ApiError } from '../api';
import { cms } from '../cms';
import { kit, L } from '../kit';
import { Html, Icon, useToast } from '../ui';

export function Login() {
  const toast = useToast(), [pw, setPw] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pw) return;
    setBusy(true); setErr('');
    try { await cms.login(pw); toast(L(['Амжилттай нэвтэрлээ', 'Signed in'])); }
    catch (er) {
      const c = er instanceof ApiError ? er.code : '';
      setErr(c === 'too_many_attempts' ? L(['Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу.', 'Too many attempts. Try again in 15 minutes.'])
        : c === 'wrong_password' ? L(['Нууц үг буруу байна', 'Wrong password']) : L(['Нэвтэрч чадсангүй. Дахин оролдоно уу.', "Couldn't sign in. Try again."]));
      setBusy(false);
    }
  };
  return (
    <div className="min-h-[100dvh] grid place-items-center p-6 bg-page">
      <form className="card w-full max-w-sm p-8" autoComplete="on" onSubmit={submit}>
        <div className="flex justify-center"><Html as="span" className="contents" html={kit().logoMark('w-14 h-14')} /></div>
        <h1 className="mt-4 text-center text-[22px] font-extrabold">{L(['Удирдлагын хэсэг', 'Content admin'])}</h1>
        <p className="mt-1 text-center text-[14px] text-muted">{L(['Үргэлжлүүлэхийн тулд админы нууц үгээ оруулна уу.', 'Enter the admin password to continue.'])}</p>
        <input type="text" name="username" defaultValue="admin" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
        <label className="block mt-6 text-[13.5px] font-semibold mb-2" htmlFor="adm-pw">{L(['Нууц үг', 'Password'])}</label>
        <input id="adm-pw" name="password" type="password" className="field" autoComplete="current-password" required autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
        <p className="mt-2 min-h-[20px] text-[13px] font-semibold text-ubred" role="alert">{err}</p>
        <button type="submit" className="btn btn-ink w-full mt-2" disabled={busy}><Icon name="log-in" className="w-[18px] h-[18px]" />{L(['Нэвтрэх', 'Sign in'])}</button>
        <a className="btn btn-ghost w-full mt-2" href="/"><Icon name="arrow-left" className="w-[18px] h-[18px]" />{L(['Сайт руу буцах', 'Back to site'])}</a>
        <p className="mt-5 text-[12.5px] text-muted text-center leading-relaxed">{L(['Нууц үг төслийн .env файлын ADMIN_PASSWORD-д байна.', 'The password is ADMIN_PASSWORD in the project’s .env file.'])}</p>
      </form>
    </div>
  );
}
