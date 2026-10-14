/* ================= Rubrics ================= */
const RUB = {
  city: { c: '#145095', t: ['Хотын захиргаа', 'City hall'] },
  plan: { c: '#7C4DFF', t: ['Хот төлөвлөлт', 'Planning'] },
  transport: { c: '#145095', t: ['Тээвэр', 'Transport'] },
  env: { c: '#10A36A', t: ['Байгаль орчин', 'Environment'] },
  build: { c: '#F08C1A', t: ['Бүтээн байгуулалт', 'Development'] },
  edu: { c: '#0D9488', t: ['Боловсрол', 'Education'] },
  health: { c: '#DB2777', t: ['Эрүүл мэнд', 'Health'] },
  culture: { c: '#C026D3', t: ['Соёл', 'Culture'] },
  util: { c: '#64748B', t: ['Дэд бүтэц', 'Utilities'] },
  zar: { c: '#E5A800', t: ['Зар', 'Notice'] },
  biz: { c: '#C2410C', t: ['Бизнес', 'Business'] },
};

/* ================= News: summarised from ulaanbaatar.mn (each links to the original) ================= */
const NEWS_SRC = 'https://ulaanbaatar.mn/news/';
let HERO_ID = 'n23265', FEATURED_ID = 'n23262';
const NEWS = [
  { id: 'n23265', cat: 'biz', d: '2026-10-02 18:13', views: 679, mins: 3, img: 'skyline:dawn:21', act: 'biz', rel: ['n23269', 'n23264', 'n23276'],
    t: ['Улаанбаатарт гарааны бизнесийн хотхон байгуулна', 'Ulaanbaatar to build a startup town'],
    l: ['Нийслэлийн Бизнес инновацын газар Солонгосын Стартап, энтрепренер хөгжлийн хүрээлэн (KISED)-тэй хамтран гарааны бизнесийн хотхон байгуулах хурдасгуур хөтөлбөрийг 2026–2028 онд хэрэгжүүлж байна.', "The city's Business Innovation Department and Korea's startup institute KISED are running a 2026–2028 accelerator programme to build a startup town in Ulaanbaatar."],
    b: [['Төслийг эрчимжүүлэх зорилгоор Нийслэлийн Засаг даргын Тамгын газрын дарга Ү.Ганболд тэргүүтэй албаны хүмүүс KISED-тэй хамтран ажиллаж байна.', "To speed the project up, officials led by Ü. Ganbold, Chief of the Capital City Governor's Office, are working with KISED."]] },
  { id: 'n23277', br: 1, cat: 'transport', d: '2026-10-08 10:34', views: 123, img: 'road:day:77',
    t: ['Цахилгаан скүтер, мопед, дугуйн аюулгүй байдлыг сайжруулна', 'Push to make e-scooter, moped and bike travel safer'],
    l: ['Засаг даргын орлогч Г.Жаргалсайхан Эрүүл хотуудын түншлэлийн төлөөлөгчидтэй уулзаж, эдгээр тээврийн хэрэгслийн дэд бүтэц, аюулгүй хэрэглээ, замын хөдөлгөөний дүрмийн хэрэгжилтийг сайжруулах талаар ярилцлаа.', 'Deputy Governor G. Jargalsaikhan met the Partnership for Healthy Cities to discuss infrastructure, safe use and traffic-rule enforcement for these light vehicles.'] },
  { id: 'n23276', br: 1, cat: 'city', d: '2026-10-07 19:18', views: 254, img: 'civic:day:76',
    t: ['Хүний эрхэд суурилсан төсвийн хэлэлцүүлэг боллоо', 'Discussion held on human-rights-based budgeting'],
    l: ['Иргэдийн эрх бодитоор хангагдах төсөв боловсруулах зорилгоор Тамгын газарт хэлэлцүүлэг болж, яамд болон хүүхэд, гэр бүл, хөдөлмөр, нийгмийн хамгаалал, боловсролын асуудал хариуцсан албаны хүмүүс оролцлоо.', "The Governor's Office hosted a discussion on budgets that deliver residents' rights, joined by ministries and officials for children, family, labour, social protection and education."] },
  { id: 'n23275', br: 1, cat: 'edu', d: '2026-10-07 18:04', views: 176, img: 'school:day:75',
    t: ['Олон улсын олимпиадын амжилттай сурагчдыг шагналаа', 'Students honoured for international olympiad success'],
    l: ['Засаг даргын орлогч Г.Жаргалсайхан, Боловсролын газрын дарга Б.Амартүвшин нар олон улсын олимпиадад амжилт гаргасан сурагчдад баяр хүргэж, шагнал гардууллаа.', 'Deputy Governor G. Jargalsaikhan and Education Department head B. Amartuvshin congratulated and awarded students who excelled at international olympiads.'] },
  { id: 'n23274', br: 1, cat: 'env', d: '2026-10-06 21:57', views: 603, img: 'park:green:74',
    t: ['Улаанбаатар цэцэрлэгт хүрээлэнг нийслэл хариуцна', 'The city takes over Ulaanbaatar Park'],
    l: ['«Рио Тинто Монгол» ХХК-ийн байгуулж, 2024 онд нээсэн 10.2 га цэцэрлэгт хүрээлэнгийн менежментийг компани хоёр жил хариуцсаны эцэст нийслэлд албан ёсоор шилжүүллээ.', 'Rio Tinto Mongolia built the 10.2-hectare park, opened in 2024, and has formally handed its management to the city after two years.'],
    b: [['Хүрээлэн Үндэсний соёл амралтын хүрээлэнгийн баруун жигүүрт байрладаг бөгөөд задгай театр, хүүхдийн тоглоомын талбайтай.', "It sits in the west wing of the National Recreation Park and includes an open-air theatre and a children's playground."]] },
  { id: 'n23273', br: 1, cat: 'env', d: '2026-10-06 14:28', views: 441, img: 'park:dawn:73',
    t: ['Ахмадууд намрын мод тарих аянд нэгдлээ', 'Elders join the autumn tree-planting drive'],
    l: ['«Тэрбум мод» үндэсний хөдөлгөөний хүрээнд Нийслэлийн ахмадын хороо, Баянзүрх дүүргийн Ахмадын зөвлөлийн төлөөлөл Үндэсний цэцэрлэгт хүрээлэнд мод тарилаа.', "Under the national Billion Trees movement, members of the city elders' committee and the Bayanzürkh elders' council planted trees in the National Park."] },
  { id: 'n23272', br: 1, cat: 'util', d: '2026-10-06 11:51', views: 507, img: 'heat:winter:72',
    t: ['Дулаан хангамжийн сүлжээг шинэчлэх асуудлыг ЕХ-ны багтай хэлэлцлээ', 'Heating-network renewal discussed with an EU team'],
    l: ['Нийслэлийн эрчим хүч, дулаан хангамжийн салбарын төлөөлөл Европын Холбооны баг болон эрчим хүчний зөвлөхүүдтэй уулзаж, хотын эрчим хүчний шилжилт, цаашдын хамтын ажиллагааны талаар санал солилцлоо.', "The city's energy and heating officials met an EU team and energy advisers on Ulaanbaatar's energy transition and next steps."] },
  { id: 'n23271', br: 1, cat: 'util', d: '2026-10-05 19:28', views: 609, img: 'road:winter:71',
    t: ['Цас цэвэрлэгээний давс, бодисын нөөцийг 65%-иар нэмэгдүүлж байна', 'Road salt and de-icer stocks up 65% ahead of winter'],
    l: ['Баянзүрх дүүргийн өвөлжилтийн бэлтгэл 90% хүрчээ. Дүүрэгт 37 байгууллага 400 гаруй техникээр зам талбай цэвэрлэдэг бөгөөд Засаг дарга Б.Пүрэвдагва бэлтгэл ажилтай газар дээр нь танилцлаа.', 'Bayanzürkh is 90% ready for winter: 37 organisations clear its roads with 400+ machines. Governor B. Purevdagva inspected preparations on site.'] },
  { id: 'n23270', br: 1, cat: 'city', d: '2026-10-05 16:37', views: 620, img: 'civic:civic:70',
    t: ['Нийслэлийн өвөлжилтийн бэлтгэл 90% хүрлээ', "The city's winter readiness reaches 90%"],
    l: ['Удирдах ажилтнуудын ээлжит шуурхай зөвлөгөөнөөр мод тарилт, өвөлжилтийн бэлтгэл, эмнэлгүүдийн бэлэн байдал, «Нүхэн гарц» төслийн явц, 2026 оны төсвийн гүйцэтгэл, 2027 оны төсвийн төлөвлөлтийг хэлэлцлээ.', "The leadership's regular operations meeting reviewed tree planting, winter readiness, hospital preparedness, the underpass project, 2026 budget execution and 2027 budget planning."] },
  { id: 'n23269', zar: 1, cat: 'zar', d: '2026-10-05 15:47', views: 447,
    t: ['«Нүүрс-пиролизийн үйлдвэр» төслийн санал хүлээн авалт хаагдлаа', 'Proposals closed for the coal-pyrolysis plant project'],
    l: ['Төр, хувийн хэвшлийн түншлэлээр хэрэгжүүлэх төслийн санал хүлээн авах хугацаа 10-р сарын 5-ны 10:00 цагт дууссан. Ирсэн саналын талаарх мэдээллийг ажлын хэсэг танилцуулжээ.', 'Submissions for this public-private partnership project closed on 5 October at 10:00. The working group has shared details of the proposals received.'] },
  { id: 'n23267', br: 1, cat: 'transport', d: '2026-10-05 11:02', views: 725, img: 'road:dusk:67',
    t: ['Замын хөдөлгөөнийг зохицуулах Шуурхай штаб байгууллаа', 'A traffic operations HQ has been set up'],
    l: ['Засаг даргын захирамжаар замын хөдөлгөөний эрчмийг сайжруулж, нийтийн тээврийн хүртээмжийг нэмэгдүүлэх Шуурхай штаб байгуулагдав. Штаб нь Цөлжилттэй тэмцэх тухай НҮБ-ын конвенцын Талуудын 17-р бага хурлын үеэр хот даяар нэгдсэн байдлаар ажиллана.', "By the Governor's order, an operations HQ will keep traffic moving and improve public transport, working city-wide during the UN desertification convention's COP17."] },
  { id: 'n23266', cat: 'edu', d: '2026-10-02 18:25', views: 1083, img: 'build:day:66',
    t: ['Багш нарын гэр бүлд түрээслээд өмчлөх орон сууцны батламж гардуулав', 'Teacher families receive rent-to-own housing certificates'],
    l: ['Дэлхийн багш нарын 32, Монголын багш нарын 60 дахь удаагийн баярын өдрөөр нийслэлийн боловсролын салбарын шилдэг байгууллага, багш нарыг шагнаж, багш гэр бүлийн төлөөлөлд орон сууцны батламж гардууллаа.', "On Teachers' Day (the 32nd worldwide, Mongolia's 60th), the city honoured top schools and teachers and gave rent-to-own housing certificates to teacher families."] },
  { id: 'n23264', cat: 'util', d: '2026-10-02 18:02', views: 732, img: 'tech:navy:64',
    t: ['Монгол–Солонгосын хотын эрчим хүчний форум боллоо', 'Mongolia–Korea urban energy forum held'],
    l: ['Хотын Захирагчийн ажлын алба, Эрчим хүчний яам, Сөүлийн Үндэсний их сургуулийн хамтын ажиллагааны төв, Барилгын зураг төсөл зохиогчдын холбоо хамтран эрчим хүчний хэмнэлттэй Улаанбаатарын талаар форум зохион байгууллаа.', "The Mayor's Office, the Ministry of Energy, a Seoul National University cooperation centre and Mongolia's architects' association co-hosted a forum on an energy-efficient Ulaanbaatar."] },
  { id: 'n23262', cat: 'build', d: '2026-09-30 10:17', views: 1143, img: 'cable:day:62',
    t: ['Дүүжин замын тээвэр 12-р сард ашиглалтад орно', 'Cable car to open in December'],
    l: ['Нийтийн тээврийг төрөлжүүлж, түгжрэлийг бууруулах дүүжин замын барилга угсралт бүрэн дуусч, нийт гүйцэтгэл 90% хүрсэн. Одоо тохиргоо, туршилтын ажил үргэлжилж байна.', 'Construction of the cable car, meant to diversify transit and ease congestion, is finished and the project is 90% complete. Tuning and test runs are under way.'] },
  { id: 'n23261', cat: 'health', d: '2026-09-29 15:13', views: 1021, img: 'school:green:61',
    t: ['Томуугийн эсрэг дархлаажуулалт 67.2% хүрлээ', 'Flu vaccination reaches 67.2%'],
    l: ['9-р сарын 3-наас 10-р сарын 3 хүртэл үргэлжилсэн аяны хүрээнд 0–6 насны хүүхэд, жирэмсэн эмэгтэй, ахмад настан, боловсрол, эрүүл мэндийн ажилтан, архаг өвчтэй нийт 293,619 иргэнийг вакцинжуулахаар төлөвлөжээ.', 'The 3 September – 3 October campaign planned to vaccinate 293,619 high-risk residents: children aged 0–6, pregnant women, older people, education and health workers, and people with chronic conditions.'] },
  { id: 'n23257', cat: 'env', d: '2026-09-27 18:01', views: 1443, img: 'park:green:57',
    t: ['Үндэсний цэцэрлэгт хүрээлэнд мянган мод суулгалаа', '1,000 trees planted in the National Park'],
    l: ['«Тэрбум мод» үндэсний хөдөлгөөний хүрээнд намрын мод тарих нэгдсэн арга хэмжээ эхэлж, ногоон хөгжлийг дэмжих, уур амьсгалын өөрчлөлтийг сааруулах зорилгоор 1000 мод тарилаа.', 'The autumn planting drive under the Billion Trees movement opened with 1,000 trees, in support of green growth and climate action.'] },
];
/* Бодит мэдээ: build үед ulaanbaatar.mn API-аас татсан LIVE_NEWS (news.js). Гараар бэлдсэн мэдээтэй ID-аар нь нийлүүлнэ:
   текст, огноо, үзэлт, зураг нь бодит; англи орчуулга, рубрик, үйлдлийн товч, холбоотой мэдээ нь гараар бэлдсэнээс. */
(function mergeLiveNews() {
  if (typeof LIVE_NEWS === 'undefined' || !LIVE_NEWS.length) return;
  const cur = {}; NEWS.forEach((n) => { cur[n.id] = n; });
  const scn = { transport: 'road:day:', env: 'park:green:', build: 'skyline:dawn:', plan: 'skyline:dawn:' };
  const fresh = (d) => Date.now() - new Date(String(d).replace(' ', 'T') + ':00+08:00') < 36 * 3600e3;
  const live = LIVE_NEWS.map((x) => {
    const c = cur[x.id]; delete cur[x.id];
    if (!c) return Object.assign({}, x, { img: x.img || (scn[x.cat] || 'civic:day:') + x.id.slice(-2), br: fresh(x.d) ? 1 : 0 });
    return Object.assign({}, c, x, { cat: c.cat, img: x.img || c.img, br: c.br, t: [x.t[0], c.t[1]], l: [x.l[0], c.l[1]], sumEn: (c.b || []).map((p) => p[1]).filter(Boolean) });
  });
  NEWS.splice(0, NEWS.length, ...live, ...Object.values(cur));
})();
const INCOMING = [];
const GOV = ['n23271', 'n23270', 'n23257'];
const ADMIN_NAMES = [
  [1924, 'Нийслэл хотын түр захиргаа', 'Provisional Administration of the Capital'],
  [1925, 'Улаанбаатар хотын захиргааны хэрэг эрхлэх газар', 'Ulaanbaatar City Administrative Affairs Office'],
  [1932, 'Улаанбаатар хотын аймгийн захиргаа', 'Ulaanbaatar City Aimag Administration'],
  [1933, 'Улаанбаатар хотын захиргаа', 'Ulaanbaatar City Administration'],
  [1938, 'Улаанбаатар хотын захирах яам', 'Ulaanbaatar City Governing Ministry'],
  [1941, 'Улаанбаатар хотын захиргаа', 'Ulaanbaatar City Administration'],
  [1948, 'Улаанбаатар хотын хөдөлмөрчдийн бага хурал', "Ulaanbaatar Workers' Small Khural"],
  [1953, 'Хөдөлмөрчдийн ардын хурлын гүйцэтгэх захиргаа', "Executive of the Workers' People's Khural"],
  [1961, 'Ардын депутатуудын хурлын гүйцэтгэх захиргаа', "Executive of the People's Deputies' Khural"],
  [1992, 'Нийслэлийн Засаг даргын Тамгын газар', "Capital City Governor's Office"],
];

