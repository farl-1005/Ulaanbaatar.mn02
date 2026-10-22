import { closeMenu, renderReact } from '../core/bridge.js';
import { CMS, apiCall } from '../core/cms.js';
import { $, store } from '../core/helpers.js';
import { openModal, toast } from '../core/modal.js';
import { EN, L, S, t } from '../core/state.js';
import { addDays, fDate, num, today } from '../core/time.js';
import { POLL, TOPICS } from '../data/my-page.js';
import { resetMS } from './shared.js';
/* ================= Маягт илгээх туслах ================= */
export function submitErr(e) {
  const c = e && e.code;
  if (c === 'too_many_requests') return L(['Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.', 'Too many submissions. Please wait and try again.']);
  if (c === 'bad_email') return t('badEmail');
  if (c === 'too_large') return L(['Зураг хэт том байна', 'The photo is too large']);
  return L(['Илгээж чадсангүй. Интернэт холболтоо шалгаад дахин оролдоно уу.', "Couldn't send. Check your connection and try again."]);
}

/* ================= Эрсдэл мэдээлэх =================
   Нийслэлийн нэгдсэн «Санал хүсэлт» системд (open.ulaanbaatar.mn, ДАН-аар нэвтэрч «Эрсдэл мэдээлэх» төрлийг сонгоно) шинэ цонхонд нээнэ. */
export const REPORT_URL = 'https://open.ulaanbaatar.mn/feedback';
export function openReport() {
  closeMenu();
  window.open(REPORT_URL, '_blank', 'noopener');
}
/* ================= Have your say =================
   Санал асуулга нь vote.ulaanbaatar.mn (шинэ цонх); «Санал илгээх» цонхыг site/app/modals/Vote.tsx зурна.
   Цонхны төлөв (таб, сонголт, сэдэв, текст, алдаа) энд; товчнуудыг (v-pick, v-cast, v-topic, v-send, tab vote) features/wiring.js → MS барина. */
export const VOTE_URL = 'https://vote.ulaanbaatar.mn/home';
export function openVote(tab, opts = {}) {
  closeMenu();
  if ((tab || 'poll') === 'poll') { window.open(VOTE_URL, '_blank', 'noopener'); return; }
  const V = { cur: tab || 'poll', dir: 0, pick: null, topic: opts.topic || (opts.gov ? 'other' : 'plan'), sent: false, text: '', err: '', busy: false, castN: 0 };
  /* React-д: текст нь сонгосон хэлээр */
  const data = () => {
    const d = { title: t('vTitle'), tab: V.cur, dir: V.dir, tabs: [['poll', t('vPoll'), 'chart-bar-big'], ['idea', t('vIdea'), 'message-square-plus']], sent: V.sent, castN: V.castN };
    if (V.cur === 'poll') {
      const v = S.vote, counts = POLL.map((p, i) => p[2] + (v === i ? 1 : 0)), tot = counts.reduce((a, b) => a + b, 0);
      d.poll = { q: t('pollQ'), until: t('pollUntil', { d: fDate(addDays(today(), 23)) }), voted: v, pick: V.pick, btn: t('voteBtn'), total: t('totalVotes', { n: num(tot) }),
        opts: POLL.map((p, i) => ({ label: EN() ? p[1] : p[0], pct: Math.round((counts[i] / tot) * 100) })) };
    } else {
      d.idea = { gov: opts.gov ? t('toGov') : '', topicLbl: t('topic'), topic: V.topic, topics: TOPICS.map(([k, mn, en]) => [k, EN() ? en : mn]),
        text: V.text, ph: t('ideaPh'), err: V.err, busy: V.busy, send: t('ideaSend'), sentMsg: t('ideaSent') };
    }
    return d;
  };
  const onText = (v) => { V.text = v; if (V.err) { V.err = ''; renderReact(); } };
  openModal({ size: 'md', label: t('vTitle'), view: 'Vote', props: { data, onText } });
  resetMS({
    vTab: (v) => { if (v === V.cur) return; if (v === 'poll') { window.open(VOTE_URL, '_blank', 'noopener'); return; } V.dir = v === 'idea' ? 1 : -1; V.cur = v; renderReact(); },
    vPick: (i) => { V.pick = i; renderReact(); },
    vCast: () => { if (V.pick == null) return; S.vote = V.pick; store.set('vote', V.pick); V.castN++; renderReact(); toast(t('voted'), 'vote'); },
    vTopic: (k) => { V.topic = k; renderReact(); },
    vSend: async () => {
      if (!V.text.trim()) { V.err = t('needText'); renderReact(); const ta = $('#v-text'); if (ta) ta.focus(); return; }
      if (CMS.mode === 'api') {
        if (V.busy) return;
        V.busy = true; renderReact();
        try { await apiCall('/submit/idea', { method: 'POST', body: { topic: V.topic, text: V.text, gov: !!opts.gov } }); }
        catch (e) { V.busy = false; renderReact(); toast(submitErr(e), 'triangle-alert'); return; }
        V.busy = false;
      }
      V.sent = true; renderReact(); toast(t('ideaSent'), 'send'); },
  });
}
