/* ================= DAN sign-in ================= */
const DAN_URL = 'https://sso.gov.mn/login';
function openLogin(after) {
  closeMenu();
  window.open(DAN_URL, '_blank', 'noopener'); return;
  let tab = 'app', stage = 0, timer = null;
  const finish = () => {
    clearTimeout(timer); stage = 9; paintModal();
    setTimeout(() => { S.user = { on: 1 }; store.set('user', S.user); closeModal(); renderHeader(); setActiveNav(currentSec); toast(t('signedIn'), 'fingerprint'); if (after) after(); }, 950);
  };
  const body = () => {
    if (tab === 'app') return `<div class="mx-auto w-48 h-48 rounded-2xl border border-line p-2 bg-white">${qrSVG(11)}</div><p class="mt-4 text-center font-semibold">${t('scanQr')}</p><p class="mt-1.5 flex justify-center items-center gap-2 text-[13.5px] text-muted"><span class="typing"><span></span><span></span><span></span></span>${t('waiting')}</p>`;
    if (tab === 'code') return stage < 1
      ? `<label class="block text-[13.5px] font-semibold mb-2" for="dan-reg">${t('regPh')}</label><input id="dan-reg" class="field tnum uppercase" placeholder="УБ90011234" autocomplete="off"/><button type="button" class="btn btn-ink w-full mt-4" data-act="dan-send">${t('sendCode')}</button>`
      : `<p class="text-[13.5px] text-greenink font-semibold flex items-center gap-2">${ic('circle-check', 'w-4 h-4')}${t('codeSent')}</p><label class="block text-[13.5px] font-semibold mt-4 mb-2" for="dan-code">${t('codePh')}</label><input id="dan-code" class="field tnum tracking-[.4em] text-center !text-[20px]" inputmode="numeric" maxlength="6" placeholder="••••••" autocomplete="one-time-code"/><button type="button" class="btn btn-blue w-full mt-4" data-act="dan-ok">${t('signIn')}</button>`;
    return `<div class="rounded-2xl bg-soft p-5 text-center">${ic('landmark', 'w-9 h-9 mx-auto text-ubblue')}<p class="mt-3 text-[14.5px] font-semibold">${L(['Өөрийн банкны апп руу шилжиж нэвтрэлтээ баталгаажуулна.', 'You will confirm the sign-in in your bank app.'])}</p></div><button type="button" class="btn btn-ink w-full mt-4" data-act="dan-ok">${ic('external-link', 'w-[18px] h-[18px]')}${L(['Банкны апп нээх', 'Open bank app'])}</button>`;
  };
  openModal({ size: 'sm', label: t('danTitle'), onClose: () => clearTimeout(timer),
    render: () => {
      if (stage === 9) return `<div class="p-10 text-center"><span class="w-16 h-16 mx-auto rounded-full bg-ubgreen text-white grid place-items-center check-pop">${ic('check', 'w-8 h-8', 2.6)}</span><p class="mt-4 text-[19px] font-extrabold">${t('signedIn')}</p><p class="text-muted mt-1">${esc(L(ME.n))}</p></div>`;
      return `${modalHead(t('danTitle'), t('danDesc'), 'fingerprint', 'bg-navy text-white')}<div class="px-5 sm:px-7 py-6">${tabs('dan', [['app', t('danApp')], ['code', t('danCode')], ['bank', t('danBank')]], tab, { cls: 'w-full [&>button]:flex-1 [&>button]:justify-center [&>button]:px-2 [&>button]:text-[13.5px]' })}<div class="mt-6" id="dan-body">${body()}</div><p class="mt-6 text-[12.5px] text-muted flex items-center gap-2">${ic('info', 'w-4 h-4')}${t('demoNote')}</p></div>`;
    },
    after: () => { if (tab === 'app' && stage === 0) { clearTimeout(timer); timer = setTimeout(finish, 4200); } } });
  MS = {
    danTab: (v) => { const order = ['app', 'code', 'bank'], dir = order.indexOf(v) > order.indexOf(tab) ? 1 : -1; tab = v; stage = 0; clearTimeout(timer); selectTab('dan', v); swap($('#dan-body'), body(), dir); if (v === 'app') timer = setTimeout(finish, 4200); },
    danSend: () => { stage = 1; $('#dan-body').innerHTML = body(); setTimeout(() => { const c = $('#dan-code'); if (c) c.focus(); }, 40); },
    danOk: finish,
  };
}

