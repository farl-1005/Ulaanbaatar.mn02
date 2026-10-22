'use client';
/* Богино мэдэгдлүүд (src/core/modal.js toast()): доод талд гарч ирээд 2.7 секундын дараа алга болно */
import { Icon, useUB } from '../ub';

export function Toaster() {
  const ub = useUB();
  if (!ub) return null;
  return (
    <>
      {ub.toasts().map((x) => (
        <div key={x.id} className={`toast${x.out ? ' out' : ''}`} role="status"><Icon ub={ub} n={x.icon} c="w-5 h-5 text-ubgreen" /><span>{x.msg}</span></div>
      ))}
    </>
  );
}
