/* ================= Projects ================= */
const PCAT = {
  transport: { c: '#145095', i: 'route', t: ['Тээвэр', 'Transport'] },
  housing: { c: '#D81E34', i: 'building-2', t: ['Орон сууц', 'Housing'] },
  infra: { c: '#E8840F', i: 'zap', t: ['Дэд бүтэц', 'Infrastructure'] },
  social: { c: '#0E9F6E', i: 'graduation-cap', t: ['Нийгэм', 'Social'] },
  green: { c: '#0E9AA7', i: 'trees', t: ['Ногоон', 'Green'] },
};
const PROJECTS = [
  { id: 'p1', c: 'transport', p: 64, x: 420, y: 470, bud: 1200, due: 2027, n: ['Туул хурдны зам', 'Tuul Expressway'] },
  { id: 'p2', c: 'housing', p: 41, x: 540, y: 118, bud: 850, due: 2028, n: ['Сэлбэ дэд төв', 'Selbe sub-centre'] },
  { id: 'p3', c: 'housing', p: 35, x: 380, y: 540, bud: 620, due: 2028, n: ['Яармаг дэд төв', 'Yarmag sub-centre'] },
  { id: 'p4', c: 'housing', p: 52, x: 220, y: 160, bud: 540, due: 2027, n: ['Баянхошуу дэд төв', 'Bayankhoshuu sub-centre'] },
  { id: 'p5', c: 'housing', p: 18, x: 640, y: 598, bud: 900, due: 2030, n: ['Шинэ Зуунмод дэд төв', 'New Zuunmod sub-centre'] },
  { id: 'p6', c: 'transport', p: 72, x: 760, y: 305, bud: 180, due: 2026, n: ['Хүнсний IV – Шар хадын автобусны тусгай эгнээ', 'Khünsnii IV – Shar Khad bus lane'] },
  { id: 'p7', c: 'transport', p: 93, x: 470, y: 466, bud: 310, due: 2026, n: ['Нисэх – Зайсан гүүрэн гарц', 'Nisekh – Zaisan flyover'] },
  { id: 'p8', c: 'transport', p: 29, x: 688, y: 332, bud: 140, due: 2027, n: ['Зүүн 4 замын гүүрэн гарц', 'East Crossroads flyover'] },
  { id: 'p9', c: 'transport', p: 81, x: 592, y: 302, bud: 95, due: 2026, n: ['Ухаалаг гэрлэн дохио, 320 уулзвар', 'Smart traffic lights, 320 junctions'] },
  { id: 'p10', c: 'transport', p: 58, x: 505, y: 328, bud: 60, due: 2026, n: ['Дугуйн замын сүлжээ, 1-р шат', 'Cycle network, phase 1'] },
  { id: 'p11', c: 'transport', p: 8, x: 120, y: 380, bud: 2400, due: 2031, n: ['Төмөр замын тойрог', 'Railway bypass'] },
  { id: 'p12', c: 'infra', p: 88, x: 250, y: 440, bud: 420, due: 2026, n: ['Төв цэвэрлэх байгууламж', 'Central wastewater plant'] },
  { id: 'p13', c: 'infra', p: 18, x: 180, y: 330, bud: 1500, due: 2029, n: ['Дулааны шинэ эх үүсвэр', 'New heat plant'] },
  { id: 'p14', c: 'infra', p: 70, x: 862, y: 330, bud: 210, due: 2026, n: ['Амгалан дулааны станцын өргөтгөл', 'Amgalan heat plant expansion'] },
  { id: 'p15', c: 'infra', p: 37, x: 880, y: 160, bud: 280, due: 2027, n: ['Гэр хорооллын инженерийн шугам', 'Ger-district utility lines'] },
  { id: 'p16', c: 'infra', p: 45, x: 90, y: 200, bud: 330, due: 2027, n: ['Хог боловсруулах үйлдвэр', 'Waste processing plant'] },
  { id: 'p17', c: 'social', p: 100, x: 300, y: 230, bud: 38, due: 2026, n: ['2 400 суудалтай шинэ сургууль', 'New 2,400-seat school'] },
  { id: 'p18', c: 'social', p: 47, x: 800, y: 232, bud: 160, due: 2027, n: ['250 ортой нэгдсэн эмнэлэг', '250-bed general hospital'] },
  { id: 'p19', c: 'social', p: 66, x: 642, y: 160, bud: 72, due: 2026, n: ['12 шинэ цэцэрлэг', '12 new kindergartens'] },
  { id: 'p20', c: 'social', p: 54, x: 562, y: 502, bud: 120, due: 2027, n: ['Хан-Уул спорт цогцолбор', 'Khan-Uul sports complex'] },
  { id: 'p21', c: 'social', p: 22, x: 578, y: 252, bud: 85, due: 2028, n: ['Нийслэлийн шинэ номын сан', 'New central library'] },
  { id: 'p22', c: 'green', p: 76, x: 328, y: 474, bud: 48, due: 2026, n: ['Туулын эргийн цэцэрлэгт хүрээлэн', 'Tuul riverside park'] },
  { id: 'p23', c: 'green', p: 100, x: 548, y: 280, bud: 26, due: 2025, n: ['Бага тойруугийн явган хүний гудамж', 'Small Ring pedestrian street'] },
  { id: 'p24', c: 'green', p: 61, x: 722, y: 560, bud: 30, due: 2027, n: ['Богд хан уулын ногоон бүс', 'Bogd Khan mountain green belt'] },
];
/* Бодит 24 мега төсөл (build үед ulaanbaatar.mn/mega-project-оос, server/sources/mega.ts): ангилал = төсөл, мэдээ = явцын мэдээлэл.
   Нэр, ангилал, схем газрын зураг дээрх ойролцоо байрлалыг энд тохируулна (admin-аас засаж болно). Гүйцэтгэлийн хувь зөвхөн мэдээнд тодорхой бичигдсэн бол. */
/* ulaanbaatar.mn-ийн төсөл → ipiu.mn-ийн төсөл [slug, шууд таарсан эсэх] */
const MEGA_IPIU = {
  UB_METRO: ['metro', 1], BRT_BUS: ['brt', 1], CABLE_TRANSPORT: ['cablecar', 1], UB_TRAM: ['tram', 1], RING_ROAD: ['ring-road', 1], TUUL_HIGHWAY: ['tuul', 1],
  MULTILEVEL_INTERSECTION: ['intersection', 1], SELBE_HOUSING: ['selbe', 1], BAYANKHOSHUU_HOUSING: ['bayankhoshuu', 1], WALL_MATERIAL_HOUSING: ['khm', 1],
  KHUNNU_CITY: ['hunnu', 1], COAL_PLANT: ['sludge', 1], TPP_5: ['tpp5', 1], WASTE_TO_ENERGY: ['waste', 1], EMEELT_ECO_PARK: ['emeelt', 1],
  TUUL_WATER_COMPLEX: ['tuul-water', 1], WATER_FLOOD_PROTECTION: ['flood', 1],
  LRT: ['tram', 0], INTERNATIONAL_HOTEL: ['hunnu', 0], NEW_TSENGELDEKHIAN: ['hunnu', 0], DISTRIBUTED_ENERGY: ['tpp5', 0],
};
/* ipiu.mn-ийн үе шат */
const MEGA_STAGE = { construction: ['Барилгын ажил', 'Construction', '#0EA068'], design: ['Зураг төсөл', 'Design', '#145095'], feasibility: ['ТЭЗҮ', 'Feasibility study', '#E58A00'], planned: ['Төлөвлөлт', 'Planning', '#7C4DFF'] };
const MEGA_META = {
  SELBE_HOUSING: ['housing', 500, 90, 'Сэлбэ хот', 'Selbe City'],
  RING_ROAD: ['transport', 610, 215, 'Тойрог зам', 'Ring Road'],
  TUUL_WATER_COMPLEX: ['green', 150, 535, 'Туул усан цогцолбор', 'Tuul Water Complex'],
  BRT_BUS: ['transport', 430, 300, 'Тусгай замын автобус (BRT)', 'Bus Rapid Transit (BRT)'],
  MULTILEVEL_INTERSECTION: ['transport', 645, 360, 'Олон түвшний уулзвар', 'Multi-level interchanges'],
  KHUNNU_CITY: ['housing', 70, 575, 'Хүннү хот', 'Khunnu City'],
  EMEELT_ECO_PARK: ['infra', 40, 300, 'Эмээлт эко аж үйлдвэрийн парк', 'Emeelt eco-industrial park'],
  TPP_5: ['infra', 205, 395, 'Дулааны 5-р цахилгаан станц', 'Thermal Power Plant No. 5'],
  UB_TRAM: ['transport', 725, 320, 'Улаанбаатар трам', 'Ulaanbaatar Tram'],
  BAYANKHOSHUU_HOUSING: ['housing', 235, 150, 'Баянхошуу хот', 'Bayankhoshuu City'],
  WASTE_TO_ENERGY: ['infra', 95, 175, 'Хог шатааж эрчим хүч үйлдвэрлэх', 'Waste-to-energy plant'],
  WATER_FLOOD_PROTECTION: ['green', 380, 565, 'Хөрсний ус, үерийн хамгаалалт', 'Groundwater and flood protection'],
  CABLE_TRANSPORT: ['transport', 305, 440, 'Дүүжин замын тээвэр', 'Cable car'],
  COAL_PLANT: ['infra', 235, 505, 'Лаг шатаах үйлдвэр', 'Sludge incineration plant'],
  TUUL_HIGHWAY: ['transport', 480, 520, 'Туулын хурдны зам', 'Tuul Expressway'],
  UB_METRO: ['transport', 520, 340, 'Улаанбаатар метро', 'Ulaanbaatar Metro'],
  WALL_MATERIAL_HOUSING: ['housing', 420, 415, 'Ханын материал хот', 'Khanyn Material City'],
  BARUUN_DALAI_PALACE: ['infra', 960, 110, 'Баруун далай орд', 'Baruun Dalai project'],
  DISTRIBUTED_ENERGY: ['infra', 565, 65, 'Тархмал эх үүсвэр', 'Distributed heat sources'],
  BAGAKHANGAI_KHUNNU_RAILWAY: ['transport', 135, 600, 'Багахангай – Хүннү хот төмөр зам', 'Bagakhangai – Khunnu City railway'],
  LRT: ['transport', 825, 395, 'Хөнгөн төмөр зам (LRT)', 'Light rail (LRT)'],
  INTERNATIONAL_HOTEL: ['social', 545, 270, 'Олон улсын зочид буудал', 'International hotel'],
  NEW_TSENGELDEKHIAN: ['social', 745, 440, 'Шинэ цэнгэлдэх хүрээлэн', 'New stadium'],
  FLYOVER_BRIDGE: ['transport', 690, 255, 'Өөдөө тэмүүлэх гүүр', 'Ascending bridge'],
};
(function () {
  if (typeof LIVE_MEGA === 'undefined' || !LIVE_MEGA.length) return;
  PROJECTS.splice(0, PROJECTS.length, ...LIVE_MEGA.map((m, k) => {
    const meta = MEGA_META[m.key] || ['infra', 380 + (k % 6) * 60, 160 + Math.floor(k / 6) * 70, m.name, ''];
    return { id: 'mp-' + m.key.toLowerCase(), key: m.key, live: 1, c: meta[0], x: meta[1], y: meta[2], n: [meta[3], meta[4]], p: m.pct ? m.pct.v : null, pct: m.pct, ups: m.ups, bud: 0, due: null };
  }));
  // ipiu.mn-ийн албан ёсны тоо: шууд таарсан төсөлд гүйцэтгэл, төсөв, хугацаа, үе шат; холбоотойд («Хүннү» → зочид буудал г.м.) зөвхөн мэдээлэл
  if (typeof LIVE_IPIU === 'undefined' || !LIVE_IPIU.length) return;
  const IP = Object.fromEntries(LIVE_IPIU.map((x) => [x.slug, x]));
  Object.entries(MEGA_IPIU).forEach(([key, [slug, own]]) => {
    const p = PROJECTS.find((x) => x.key === key), ip = IP[slug]; if (!p || !ip) return;
    p.ipiu = ip; p.ipOwn = !!own;
    if (own) { if (ip.prog != null) p.p = ip.prog; p.budUsd = ip.budUsd; p.from = ip.from; p.due = ip.to; p.stage = ip.status; }
  });
})();

