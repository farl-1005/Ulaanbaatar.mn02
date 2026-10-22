import { qrSVG } from '../art/scene.js';
import { closeMenu, renderReact } from '../core/bridge.js';
import { setActiveNav } from '../core/header.js';
import { $, store } from '../core/helpers.js';
import { closeModal, openModal, toast } from '../core/modal.js';
import { L, S, t } from '../core/state.js';
import { ME } from '../data/my-page.js';
import { currentSec, resetMS } from './shared.js';
/* ================= DAN sign-in =================
   Одоогоор sso.gov.mn-ийг шинэ цонхонд нээнэ. Доорх концепц цонхыг (site/app/modals/Login.tsx) буцааж асаахад return-ийг хасахад хангалттай.
   Цонхны төлөв (таб, алхам, цаг) энд; товчнуудыг (tab dan, dan-send, dan-ok) features/wiring.js → MS барина. */
export const DAN_URL = 'https://sso.gov.mn/login';
export function openLogin(after) {
  closeMenu();
  window.open(DAN_URL, '_blank', 'noopener'); return;
  const D = { tab: 'app', dir: 0, stage: 0, timer: null, qr: '' };
  const finish = () => {
    clearTimeout(D.timer); D.stage = 9; renderReact();
    setTimeout(() => { S.user = { on: 1 }; store.set('user', S.user); closeModal(); renderReact(); setActiveNav(currentSec); toast(t('signedIn'), 'fingerprint'); if (after) after(); }, 950);
  };
  /* React-д: текст нь сонгосон хэлээр */
  const data = () => ({
    tab: D.tab, dir: D.dir, stage: D.stage, title: t('danTitle'), desc: t('danDesc'), note: t('demoNote'), signedIn: t('signedIn'), me: L(ME.n),
    tabs: [['app', t('danApp')], ['code', t('danCode')], ['bank', t('danBank')]],
    qr: D.qr || (D.qr = qrSVG(11)), scanQr: t('scanQr'), waiting: t('waiting'),
    regPh: t('regPh'), sendCode: t('sendCode'), codeSent: t('codeSent'), codePh: t('codePh'), signIn: t('signIn'),
    bankNote: L(['Өөрийн банкны апп руу шилжиж нэвтрэлтээ баталгаажуулна.', 'You will confirm the sign-in in your bank app.']), bankBtn: L(['Банкны апп нээх', 'Open bank app']),
  });
  openModal({ size: 'sm', label: t('danTitle'), view: 'Login', props: { data }, onClose: () => clearTimeout(D.timer) });
  D.timer = setTimeout(finish, 4200);   // QR: хэдэн секундын дараа «уншигдана»
  resetMS({
    danTab: (v) => { const order = ['app', 'code', 'bank']; D.dir = order.indexOf(v) > order.indexOf(D.tab) ? 1 : -1; D.tab = v; D.stage = 0; clearTimeout(D.timer); renderReact(); if (v === 'app') D.timer = setTimeout(finish, 4200); },
    danSend: () => { D.stage = 1; renderReact(); setTimeout(() => { const c = $('#dan-code'); if (c) c.focus(); }, 40); },
    danOk: finish,
  });
}
