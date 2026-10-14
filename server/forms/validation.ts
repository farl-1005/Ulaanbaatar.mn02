/* Иргэдийн маягтын шалгалт: хөтчөөс ирсэн өгөгдлийг цэвэрлэж, зөвхөн зөвшөөрөгдсөн талбаруудыг үлдээнэ. */
import { clean } from '../common/http';

export type FormKind = 'report' | 'idea' | 'digest';
export const FORM_KINDS: FormKind[] = ['report', 'idea', 'digest'];
/** Хүсэлтийн дугаарын угтвар: UB-2026-48501 */
export const ID_PREFIX: Record<FormKind, string> = { report: 'UB', idea: 'SA', digest: 'EM' };
const REPORT_CATS = ['pothole', 'light', 'waste', 'water', 'building', 'other'];

export function validate(kind: FormKind, b: any): { data: Record<string, unknown> } | { error: string } {
  if (kind === 'report') {   // Эрсдэл мэдээлэх: ангилал, газрын зураг дээрх цэг, дүүрэг, тайлбар (зургийг тусад нь хадгална)
    if (!REPORT_CATS.includes(b.cat)) return { error: 'bad_category' };
    const pt = Array.isArray(b.pt) && b.pt.length === 2 && b.pt.every((n: unknown) => Number.isFinite(+(n as number))) ? [Math.round(+b.pt[0]), Math.round(+b.pt[1])] : null;
    if (!pt) return { error: 'bad_location' };
    return { data: { cat: b.cat, pt, dist: clean(b.dist, 60), desc: clean(b.desc, 2000) } };
  }
  if (kind === 'idea') {   // Санал хүсэлт
    const text = clean(b.text, 3000);
    if (!text) return { error: 'empty_text' };
    return { data: { topic: clean(b.topic, 30), text, gov: !!b.gov } };
  }
  const email = clean(b.email, 200).toLowerCase();   // Имэйл бүртгэл
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'bad_email' };
  return { data: { email } };
}
