'use client';
/* React цонхнуудын жагсаалт: lib/ub/ код openModal({ view: '<нэр>', props: {...} })-ээр нээнэ (lib/ub/core/modal.js) */
import type { ComponentType } from 'react';
import { Complaint } from './Complaint';
import { Doc, EventView, Tender } from './Docs';
import { Alert, Gov } from './Info';
import { Login } from './Login';
import { MediaPlayer } from './MediaPlayer';
import { Project } from './Project';
import { Search } from './Search';
import { Booking, Service } from './Service';
import { Vote } from './Vote';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- цонх бүр өөрийн props-той (src/ кодын openModal props)
export type ModalView = ComponentType<any>;

export const MODALS: Record<string, ModalView> = {
  Alert,
  Booking,
  Complaint,
  Doc,
  EventView,
  Gov,
  Login,
  MediaPlayer,
  Project,
  Search,
  Service,
  Tender,
  Vote,
};
