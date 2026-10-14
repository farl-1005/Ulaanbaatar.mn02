/* sharp: зураг жижигрүүлэх сан. Суугаагүй үед сайт зураг жижигрүүлэхгүйгээр ажилласаар байна (эх зургийг ашиглана). */
type Sharp = typeof import('sharp');

function load(): Sharp | null {
  try { return require('sharp'); } catch { return null; }
}

export const sharp = load();
