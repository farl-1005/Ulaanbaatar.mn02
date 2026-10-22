/* ================= My page ================= */
export const ME = { n: ['Б. Тэмүүлэн', 'B. Temuulen'], ini: ['БТ', 'BT'], reg: 'УБ90••••12', addr: ['Сүхбаатар дүүрэг, 1-р хороо', 'Sükhbaatar District, Khoroo 1'], x: 560, y: 268 };
export const REQ_DEFAULT = [
  { id: 'UB-2026-48127', cat: 'pothole', st: 2, ago: 3, place: ['8-р хорооллын 23-р байрны урд', 'Outside building 23, 8th microdistrict'], ag: ['Нийслэлийн Авто замын газар', 'City Roads Department'], note: ['Засварын баг {t+2}-нд ажиллахаар төлөвлөсөн.', 'A repair crew is scheduled for {t+2}.'] },
  { id: 'UB-2026-48302', cat: 'waste', st: 0, ago: 0, place: ['1-р хорооны 14-р байр', 'Building 14, Khoroo 1'], ag: ['Чингэлтэй дүүргийн Тохижилтын алба', 'District Services Office'], note: ['Хүлээн авч, хариуцах алба руу шилжүүлж байна.', 'Received and being routed to the responsible office.'] },
  { id: 'UB-2026-47310', cat: 'light', st: 3, ago: 12, place: ['Их сургуулийн гудамж', 'University Street'], ag: ['Гэрэлтүүлгийн алба', 'Street Lighting Office'], note: ['Гэрэлтүүлгийг засварлаж, хэвийн ажиллагаанд орууллаа.', 'The lights were repaired and are working again.'] },
];
export const RCAT = {
  pothole: { i: 'construction', t: ['Замын эвдрэл, нүх', 'Pothole or road damage'] },
  light: { i: 'lamp', t: ['Гэрэлтүүлэг ажиллахгүй', 'Street light out'] },
  waste: { i: 'trash-2', t: ['Хог хаягдал', 'Uncollected waste'] },
  water: { i: 'droplets', t: ['Ус, шугам гоожсон', 'Water or pipe leak'] },
  building: { i: 'triangle-alert', t: ['Аюултай барилга, ил худаг', 'Unsafe structure or open manhole'] },
  other: { i: 'circle-help', t: ['Бусад', 'Something else'] },
  service: { i: 'file-check', t: ['Үйлчилгээний хүсэлт', 'Service request'] },
};
export const KHOROO = {
  gov: ['Д. Нарангэрэл', 'D. Narangerel'], hours: ['Да–Ба, 09:00–18:00', 'Mon–Fri, 09:00–18:00'], res: 12480, hh: 4210,
  near: [[['1-р хорооны өрхийн эрүүл мэндийн төв', 'Khoroo 1 family health centre'], 'stethoscope', '350 м'], [['24-р сургууль', 'School No. 24'], 'school', '600 м'], [['12-р цэцэрлэг', 'Kindergarten No. 12'], 'baby', '420 м'], [['Хэсгийн цагдаа', 'Neighbourhood police officer'], 'shield', '200 м']],
  notices: [['Иргэдийн нийтийн хурал {t+6}, 18:00 цагт хорооны байранд болно.', "Residents' meeting {t+6} at 18:00 in the khoroo office."], ['Хорооны хөгжлийн сангийн санал асуулгад оролцоорой.', "Vote in the khoroo development fund poll."], ['Өвлийн улиралд гудамжны цас цэвэрлэгээнд сайн дурын баг бүрдүүлж байна.', 'Volunteers wanted for winter snow-clearing.']],
};
export const PAYMENTS = [{ id: 'pay1', t: ['Хог хаягдлын төлбөр, 10-р сар', 'Waste fee, October'], amt: 3600 }, { id: 'pay2', t: ['Үл хөдлөх хөрөнгийн албан татвар', 'Property tax'], amt: 48000, paid: 1 }];
export const POLL = [['Гудамжны гэрэлтүүлэг', 'Street lighting', 1840], ['Хүүхдийн тоглоомын талбай', 'Playgrounds', 2310], ['Явган хүний зам', 'Footpaths', 1460], ['Ногоон байгууламж', 'Green space', 1190], ['Хяналтын камер', 'Safety cameras', 870]];
export const TOPICS = [['plan', 'Улаанбаатар 2040', 'Ulaanbaatar 2040'], ['road', 'Зам, тээвэр', 'Roads and transport'], ['green', 'Ногоон байгууламж', 'Green space'], ['safety', 'Аюулгүй байдал', 'Safety'], ['other', 'Бусад', 'Other']];

