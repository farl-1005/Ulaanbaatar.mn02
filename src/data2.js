/* ================= Services ================= */
const SERVICES = {
  citizen: [
    { id: 'c1', i: 'file-text', m: 'on', t: ['Иргэний лавлагаа авах', 'Civil certificates'], d: ['Оршин суугаа хаяг, гэр бүлийн байдлын лавлагаа', 'Address and family status certificates'] },
    { id: 'c2', i: 'baby', m: 'on', t: ['Хүүхдийн мөнгө', 'Child benefit'], d: ['Сар бүрийн хүүхдийн мөнгөний хүсэлт', 'Apply for the monthly child benefit'] },
    { id: 'c3', i: 'recycle', m: 'on', t: ['Хог хаягдлын төлбөр', 'Waste fee'], d: ['Төлбөрөө шалгаж, онлайнаар төлөх', 'Check and pay your waste fee'] },
    { id: 'c4', i: 'circle-parking', m: 'on', t: ['Зогсоолын төлбөр', 'Parking payment'], d: ['Гудамжны зогсоол, торгууль төлөх', 'Street parking and fines'] },
    { id: 'c5', i: 'bus', m: 'on', t: ['Нийтийн тээврийн карт', 'Transit card'], d: ['Карт захиалах, цэнэглэх, хөнгөлөлт', 'Order, top up, concessions'] },
    { id: 'c6', i: 'map-pinned', m: 'off', t: ['Газар өмчлөх', 'Land ownership'], d: ['Өмчлөх эрхийн хүсэлт, кадастр', 'Ownership claims and cadastre'] },
    { id: 'c7', i: 'hand-heart', m: 'off', t: ['Халамжийн үйлчилгээ', 'Social welfare'], d: ['Тэтгэмж, хөнгөлөлт, асаргаа', 'Allowances, discounts and care'] },
    { id: 'c8', i: 'school', m: 'on', t: ['Цэцэрлэгийн бүртгэл', 'Kindergarten enrolment'], d: ['Дараалалд бүртгүүлэх, шилжүүлэх', 'Join the waiting list or transfer'] },
  ],
  business: [
    { id: 'b1', i: 'hard-hat', m: 'on', t: ['Барилгын зөвшөөрөл', 'Building permit'], d: ['Зураг төсөл, ашиглалтын зөвшөөрөл', 'Design approval and occupancy permits'] },
    { id: 'b2', i: 'store', m: 'on', t: ['Худалдааны тусгай зөвшөөрөл', 'Trade licence'], d: ['Худалдаа, үйлчилгээний зөвшөөрөл', 'Licences for shops and services'] },
    { id: 'b3', i: 'megaphone', m: 'on', t: ['Гадна зар сурталчилгаа', 'Outdoor advertising'], d: ['Самбар, хаягийн зөвшөөрөл', 'Billboard and signage permits'] },
    { id: 'b4', i: 'gavel', m: 'on', t: ['Тендерт оролцох', 'Bid for a tender'], d: ['Нээлттэй тендер, бүртгэл', 'Open tenders and registration'] },
    { id: 'b5', i: 'landmark', m: 'off', t: ['Газар эзэмших', 'Land lease'], d: ['Аж ахуйн зориулалтаар газар эзэмших', 'Lease land for business use'] },
    { id: 'b6', i: 'briefcase', m: 'off', t: ['Хөдөлмөр эрхлэлтийн дэмжлэг', 'Employment support'], d: ['Ажлын байр бий болгох хөтөлбөр', 'Job creation programmes'] },
    { id: 'b7', i: 'receipt-text', m: 'on', t: ['Татварын лавлагаа', 'Tax certificate'], d: ['Татварын өргүй тодорхойлолт', 'Proof of no tax arrears'] },
    { id: 'b8', i: 'droplets', m: 'off', t: ['Ус, дулааны холболт', 'Water and heat connection'], d: ['Инженерийн шугамд холбогдох', 'Connect to utility networks'] },
  ],
  esys: [
    { id: 'e1', i: 'messages-square', m: 'sys', t: ['Санал хүсэлтийн 1200 систем', '1200 feedback system'], d: ['Гомдол, санал, талархал илгээх', 'Complaints, ideas and thanks'] },
    { id: 'e2', i: 'map', m: 'sys', t: ['Газрын цахим систем', 'Land e-system'], d: ['Кадастрын зураг, газрын хүсэлт', 'Cadastre map and land requests'] },
    { id: 'e3', i: 'building-2', m: 'sys', t: ['Барилгын цахим зөвшөөрөл', 'Construction e-permits'], d: ['Зөвшөөрлийн явц хянах', 'Track permit progress'] },
    { id: 'e4', i: 'tram-front', m: 'sys', t: ['Нийтийн тээврийн апп', 'Transit app'], d: ['Автобусны байршил, хуваарь', 'Live buses and timetables'] },
    { id: 'e5', i: 'scale', m: 'sys', t: ['Цахим худалдан авалт', 'e-Procurement'], d: ['Тендерийн бүх шат цахимаар', 'Every tender step online'] },
    { id: 'e6', i: 'database', m: 'sys', t: ['Нээлттэй өгөгдөл', 'Open data'], d: ['Хотын 400 гаруй өгөгдлийн сан', '400+ city datasets'] },
    { id: 'e7', i: 'square-parking', m: 'sys', t: ['Ухаалаг зогсоол', 'Smart parking'], d: ['Сул зогсоол хайх, төлөх', 'Find and pay for parking'] },
    { id: 'e8', i: 'graduation-cap', m: 'sys', t: ['Боловсролын цахим бүртгэл', 'Education e-registration'], d: ['Сургууль, цэцэрлэгийн элсэлт', 'School and kindergarten admissions'] },
  ],
};

/* ================= Life events ================= */
const SITS = [
  { id: 'birth', i: 'baby', t: ['Хүүхэд төрсөн', 'A new baby'], steps: [
    { m: 'on', t: ['Төрсний гэрчилгээ', 'Birth certificate'], d: ['Хүүхдээ улсын бүртгэлд бүртгүүлж, төрсний гэрчилгээ, регистрийн дугаар авна.', 'Register your baby and get a birth certificate and ID number.'], tm: ['1 өдөр', '1 day'] },
    { m: 'on', t: ['Хүүхдийн мөнгө', 'Child benefit'], d: ['Сар бүрийн хүүхдийн мөнгөний хүсэлтээ гаргаж, дансаа холбоно.', 'Apply for the monthly child benefit and link your bank account.'], tm: ['10 минут', '10 min'] },
    { m: 'off', t: ['Өрхийн эмнэлэгт бүртгүүлэх', 'Register at a family clinic'], d: ['Харьяа өрхийн эрүүл мэндийн төвд бүртгүүлж, вакцины хуваарь авна.', 'Register at your family health centre and get the vaccination schedule.'], tm: ['30 минут', '30 min'] },
    { m: 'on', t: ['Цэцэрлэгийн дараалал', 'Kindergarten waiting list'], d: ['Цахим бүртгэлээр цэцэрлэгийн дараалалд бүртгүүлнэ.', 'Join the kindergarten waiting list online.'], tm: ['5 минут', '5 min'] } ] },
  { id: 'marriage', i: 'heart', t: ['Гэр бүл болох', 'Getting married'], steps: [
    { m: 'off', t: ['Гэрлэлт бүртгүүлэх', 'Register the marriage'], d: ['Дүүргийн улсын бүртгэлийн хэлтэст хамтдаа очиж бүртгүүлнэ.', 'Visit the district civil registry together.'], tm: ['1 өдөр', '1 day'] },
    { m: 'on', t: ['Гэрлэлтийн гэрчилгээ', 'Marriage certificate'], d: ['Гэрчилгээний цахим хуулбараа авна.', 'Get a digital copy of the certificate.'], tm: ['5 минут', '5 min'] },
    { m: 'on', t: ['Хаягийн бүртгэл нэгтгэх', 'Combine address registration'], d: ['Хамтран амьдрах хаягаа бүртгүүлнэ.', 'Register your shared address.'], tm: ['10 минут', '10 min'] },
    { m: 'on', t: ['Залуу гэр бүлийн орон сууцны хөтөлбөр', 'Young families housing programme'], d: ['Хөнгөлөлттэй зээлийн шалгуурыг шалгаж, хүсэлт гаргана.', 'Check eligibility for subsidised mortgages and apply.'], tm: ['15 минут', '15 min'] } ] },
  { id: 'home', i: 'house', t: ['Орон сууц авах', 'Buying a home'], steps: [
    { m: 'on', t: ['Үл хөдлөх хөрөнгийн лавлагаа', 'Property record check'], d: ['Орон сууцны өмчлөл, барьцааны мэдээллийг шалгана.', 'Check ownership and any liens on the property.'], tm: ['5 минут', '5 min'] },
    { m: 'on', t: ['Ипотекийн зээлийн хүсэлт', 'Mortgage application'], d: ['Банкаа сонгож, зээлийн хүсэлтээ цахимаар илгээнэ.', 'Choose a bank and apply online.'], tm: ['3–5 өдөр', '3–5 days'] },
    { m: 'off', t: ['Өмчлөх эрхийн гэрчилгээ', 'Title certificate'], d: ['Худалдах, худалдан авах гэрээгээ бүртгүүлж, гэрчилгээ авна.', 'Register the sale and receive the title certificate.'], tm: ['5 өдөр', '5 days'] },
    { m: 'on', t: ['Хаягийн бүртгэл шилжүүлэх', 'Update your address'], d: ['Шинэ хаягаараа бүртгүүлнэ.', 'Register at your new address.'], tm: ['10 минут', '10 min'] },
    { m: 'on', t: ['Ус, дулаан, цахилгааны гэрээ', 'Utility contracts'], d: ['Хэрэглээний гэрээгээ өөрийн нэр дээр шилжүүлнэ.', 'Move utility contracts into your name.'], tm: ['1 өдөр', '1 day'] } ] },
  { id: 'business', i: 'briefcase', t: ['Бизнес эхлүүлэх', 'Starting a business'], steps: [
    { m: 'on', t: ['Нэр баталгаажуулах', 'Reserve a company name'], d: ['Аж ахуйн нэгжийн нэрээ шалгаж, баталгаажуулна.', 'Check and reserve your company name.'], tm: ['1 өдөр', '1 day'] },
    { m: 'on', t: ['Улсын бүртгэл', 'Register the company'], d: ['Дүрэм, үүсгэн байгуулагчийн мэдээллээ илгээж бүртгүүлнэ.', 'Submit the charter and founder details.'], tm: ['3 өдөр', '3 days'] },
    { m: 'on', t: ['Татвар төлөгчийн бүртгэл', 'Tax registration'], d: ['Татварын цахим системд бүртгүүлж, НӨАТ-ын шаардлагаа шалгана.', 'Register for tax and check VAT requirements.'], tm: ['1 өдөр', '1 day'] },
    { m: 'off', t: ['Тусгай зөвшөөрөл', 'Special licence'], d: ['Үйл ажиллагааны чиглэлээсээ хамаарч зөвшөөрөл авна.', 'Get any licence your type of business needs.'], tm: ['10 өдөр', '10 days'] },
    { m: 'on', t: ['Нийгмийн даатгалын бүртгэл', 'Social insurance registration'], d: ['Ажилтнуудаа нийгмийн даатгалд бүртгүүлнэ.', 'Register your employees for social insurance.'], tm: ['1 өдөр', '1 day'] } ] },
  { id: 'retire', i: 'armchair', t: ['Тэтгэвэрт гарах', 'Retiring'], steps: [
    { m: 'on', t: ['Даатгалын шимтгэлийн лавлагаа', 'Contribution record'], d: ['Нийгмийн даатгал төлсөн жилээ шалгана.', 'Check your years of social insurance.'], tm: ['5 минут', '5 min'] },
    { m: 'off', t: ['Тэтгэвэр тогтоолгох', 'Claim your pension'], d: ['Нийгмийн даатгалын хэлтэст материалаа өгнө.', 'Submit your documents to the social insurance office.'], tm: ['14 өдөр', '14 days'] },
    { m: 'on', t: ['Ахмадын тээврийн карт', 'Senior transit card'], d: ['Нийтийн тээврээр үнэгүй зорчих картаа захиална.', 'Order your free-travel transit card.'], tm: ['5 минут', '5 min'] },
    { m: 'off', t: ['Ахмадын холбоонд бүртгүүлэх', "Join the seniors' association"], d: ['Хорооныхоо ахмадын холбооны үйл ажиллагаанд нэгдэнэ.', "Take part in your khoroo's seniors' activities."], tm: ['30 минут', '30 min'] } ] },
  { id: 'move', i: 'truck', t: ['Шинэ хаягт нүүх', 'Moving house'], steps: [
    { m: 'on', t: ['Оршин суугаа хаягийн бүртгэл', 'Address registration'], d: ['Шинэ хаягаа цахимаар бүртгүүлнэ.', 'Register your new address online.'], tm: ['10 минут', '10 min'] },
    { m: 'off', t: ['Хорооны бүртгэл', 'Khoroo registration'], d: ['Хороондоо очиж өрхийн бүртгэлд орно.', 'Visit your khoroo office to join the household register.'], tm: ['30 минут', '30 min'] },
    { m: 'off', t: ['Өрхийн эмнэлэг солих', 'Change family clinic'], d: ['Шинэ хаягийн өрхийн эрүүл мэндийн төвд шилжинэ.', 'Transfer to the family clinic for your new address.'], tm: ['30 минут', '30 min'] },
    { m: 'on', t: ['Сургууль, цэцэрлэг шилжүүлэх', 'Transfer school or kindergarten'], d: ['Хүүхдийнхээ сургууль, цэцэрлэгийг цахимаар шилжүүлнэ.', "Move your child's school or kindergarten online."], tm: ['3 өдөр', '3 days'] } ] },
];

/* ================= Map geometry (schematic, 1000 x 620) ================= */
const DISTRICTS = [
  { id: 'skh', n: ['Сонгинохайрхан', 'Songinokhairkhan'], lx: 165, ly: 250, poly: [[0,40],[340,40],[350,260],[330,450],[0,480]] },
  { id: 'chd', n: ['Чингэлтэй', 'Chingeltei'], lx: 410, ly: 150, poly: [[340,40],[470,30],[480,250],[350,260]] },
  { id: 'sbd', n: ['Сүхбаатар', 'Sükhbaatar'], lx: 540, ly: 140, poly: [[470,30],[600,30],[600,260],[700,270],[700,470],[520,460],[500,350],[480,250]] },
  { id: 'bzd', n: ['Баянзүрх', 'Bayanzürkh'], lx: 850, ly: 210, poly: [[600,30],[1000,40],[1000,470],[700,470],[700,270],[600,260]] },
  { id: 'bgd', n: ['Баянгол', 'Bayangol'], lx: 418, ly: 395, poly: [[350,260],[480,250],[500,350],[520,460],[330,450]] },
  { id: 'khud', n: ['Хан-Уул', 'Khan-Uul'], lx: 300, ly: 548, poly: [[0,480],[330,450],[520,460],[700,470],[1000,470],[1000,620],[0,620]] },
];

/* ================= Projects ================= */
const PCAT = {
  transport: { c: '#1D5BFF', i: 'route', t: ['Тээвэр', 'Transport'] },
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

/* ================= Events ================= */
const ECAT = {
  music: { c: '#C026D3', t: ['Хөгжим', 'Music'] }, sport: { c: '#0EA5E9', t: ['Спорт', 'Sport'] }, art: { c: '#F08C1A', t: ['Урлаг', 'Art'] },
  kids: { c: '#10A36A', t: ['Хүүхэд', 'Kids'] }, tech: { c: '#1D5BFF', t: ['Технологи', 'Tech'] }, theatre: { c: '#D81E34', t: ['Театр', 'Theatre'] },
  green: { c: '#0E9AA7', t: ['Байгаль', 'Nature'] }, food: { c: '#B45309', t: ['Хоол', 'Food'] }, civic: { c: '#7C4DFF', t: ['Иргэний оролцоо', 'Civic'] },
};
const EVENTS = [
  { id: 'e1', c: 'music', w: 'sat', tm: '18:00', x: 560, y: 285, price: 0, img: 'stage:dusk:41', t: ['Намрын хөгжмийн наадам', 'Autumn Music Festival'], v: ['Сүхбаатарын талбай', 'Sükhbaatar Square'] },
  { id: 'e2', c: 'sport', w: 'sun', tm: '09:00', x: 470, y: 300, price: 0, img: 'sport:day:42', t: ['Хотын гүйлт 10 км', 'City 10K run'], v: ['Энхтайвны өргөн чөлөө', 'Peace Avenue'] },
  { id: 'e3', c: 'art', w: 'today', tm: '10:00', x: 576, y: 268, price: 5000, img: 'art:civic:43', t: ['«Хотын өнгө» уран зургийн үзэсгэлэн', '"Colours of the City" exhibition'], v: ['Хотын урлагийн галерей', 'City Art Gallery'] },
  { id: 'e4', c: 'kids', w: 'sat', tm: '11:00', x: 520, y: 292, price: 0, img: 'stage:dawn:44', t: ['Хүүхдийн кино өдөрлөг', "Children's film day"], v: ['Хүүхдийн ордон', "Children's Palace"] },
  { id: 'e5', c: 'tech', w: 'tomorrow', tm: '19:00', x: 612, y: 250, price: 0, img: 'tech:navy:45', t: ['Ухаалаг хот: стартапуудын уулзалт', 'Smart city startup meetup'], v: ['Хотын инновацийн төв', 'City Innovation Hub'] },
  { id: 'e6', c: 'theatre', w: 'fri', tm: '19:00', x: 570, y: 296, price: 30000, img: 'civic:dusk:46', t: ['Дуурь «Учиртай гурван толгой»', 'Opera "Three Fateful Hills"'], v: ['Улсын дуурь бүжгийн эрдмийн театр', 'State Opera and Ballet Theatre'] },
  { id: 'e7', c: 'green', w: 'sun', tm: '10:00', x: 382, y: 482, price: 0, img: 'park:green:47', t: ['Мод тарих өдөрлөг', 'Tree planting day'], v: ['Туулын эрэг, Яармаг', 'Tuul riverbank, Yarmag'] },
  { id: 'e8', c: 'food', w: 'sat', tm: '09:00', x: 722, y: 322, price: 0, img: 'market:day:48', t: ['Фермерийн зах', "Farmers' market"], v: ['Нарантуул захын талбай', 'Naran Tuul market grounds'] },
  { id: 'e9', c: 'music', w: 'today', tm: '20:00', x: 530, y: 262, price: 25000, img: 'stage:night:49', t: ['Жазз үдэш', 'Jazz night'], v: ['Хотын соёлын төв', 'City Cultural Centre'] },
  { id: 'e10', c: 'civic', w: 3, tm: '18:30', x: 410, y: 318, price: 0, img: 'civic:day:50', t: ['Иргэдийн хэлэлцүүлэг: Улаанбаатар 2040', 'Public meeting: Ulaanbaatar 2040'], v: ['Баянгол дүүргийн Засаг даргын Тамгын газар', 'Bayangol District Office'] },
  { id: 'e11', c: 'sport', w: 'today', tm: '16:00', x: 560, y: 505, price: 0, img: 'sport:dusk:51', t: ['3x3 сагсан бөмбөгийн тэмцээн', '3x3 basketball tournament'], v: ['Хан-Уул спорт цогцолбор', 'Khan-Uul Sports Complex'] },
  { id: 'e12', c: 'civic', w: 6, tm: '18:00', x: 560, y: 272, price: 0, img: 'ger:dawn:52', t: ['Хорооны иргэдийн нийтийн хурал', "Khoroo residents' meeting"], v: ['Сүхбаатар дүүргийн 1-р хороо', 'Sükhbaatar khoroo 1'] },
];
const EVDESC = {
  music: ['Нээлттэй тайзан дээр хотын хамтлаг, дуучид тоглоно. Дулаан хувцаслаарай.', 'City bands and singers on an open stage. Dress warmly.'],
  sport: ['Бүртгэл арга хэмжээ эхлэхээс 1 цагийн өмнө хаагдана. Замын хөдөлгөөн түр хязгаарлагдана.', 'Registration closes an hour before the start. Some roads close temporarily.'],
  art: ['Улаанбаатарын 40 уран бүтээлчийн хотын тухай бүтээлүүд.', '40 Ulaanbaatar artists show work about their city.'],
  kids: ['6–12 насны хүүхдэд зориулсан хүүхэлдэйн кино, богино кинонууд.', 'Animated and short films for children aged 6 to 12.'],
  tech: ['Хотын асуудлыг шийдэх стартапуудын танилцуулга, нээлттэй өгөгдлийн хакатоны дүн.', 'Startups pitch fixes for city problems, plus open-data hackathon results.'],
  theatre: ['Монголын анхны дуурийн шинэчилсэн найруулга. Тасалбарыг театрын кассаас авна.', 'A new staging of the first Mongolian opera. Tickets at the theatre box office.'],
  green: ['Багаж, суулгацыг зохион байгуулагчид хангана. Гэр бүлээрээ оролцоорой.', 'Tools and saplings are provided. Bring the family.'],
  food: ['Орон нутгийн малчид, тариаланчдын шинэ бүтээгдэхүүн шууд худалдаалагдана.', 'Fresh produce sold directly by herders and farmers.'],
  civic: ['Төлөвлөгөөний баг танилцуулга хийж, иргэдийн асуулт, саналыг шууд хүлээн авна.', 'The planning team presents and takes questions and comments on the spot.'],
};

/* ================= Transparency ================= */
const DOCS = {
  res: [
    { no: '№ 18/02', ago: 5, t: ['Нийслэлийн 2027 оны төсвийн хүрээний мэдэгдэл батлах тухай', 'On the 2027 city budget framework statement'] },
    { no: '№ 18/01', ago: 5, t: ['Хотын ерөнхий төлөвлөгөөний шинэчлэлийг олон нийтийн хэлэлцүүлэгт оруулах тухай', 'On public consultation for the master plan update'] },
    { no: '№ 17/06', ago: 21, t: ['Нийтийн тээврийн хөнгөлөлтийн тухай', 'On public transport fare concessions'] },
    { no: '№ 17/04', ago: 21, t: ['Хорооны хөгжлийн сангийн журмыг шинэчлэх тухай', 'On updating the khoroo development fund rules'] },
    { no: '№ 16/09', ago: 48, t: ['Агаарын бохирдлыг бууруулах 2026–2028 оны хөтөлбөр батлах тухай', 'On the 2026–2028 air pollution reduction programme'] },
    { no: '№ 16/03', ago: 48, t: ['Ногоон байгууламжийн тухай журам батлах тухай', 'On rules for green spaces'] },
  ],
  ord: [
    { no: 'А/1147', ago: 2, t: ['Өвлийн улиралд бэлтгэх ажлын тухай', 'On winter readiness measures'] },
    { no: 'А/1139', ago: 3, t: ['Цас цэвэрлэгээний ажлын хэсэг байгуулах тухай', 'On a snow-clearing task force'] },
    { no: 'А/1120', ago: 9, t: ['Гэр хорооллын дахин төлөвлөлтийн төслүүдэд хяналт тавих тухай', 'On oversight of ger-district redevelopment'] },
    { no: 'А/1098', ago: 15, t: ['Нийтийн тээврийн шинэ чиглэл нээх тухай', 'On opening new bus routes'] },
    { no: 'А/1085', ago: 19, t: ['Иргэдийн санал хүсэлтийг шийдвэрлэх хугацааг богиносгох тухай', "On faster handling of residents' requests"] },
    { no: 'А/1061', ago: 27, t: ['Хотын ногоон байгууламжийг нэмэгдүүлэх тухай', 'On expanding urban greenery'] },
  ],
  tender: [
    { no: 'НЗДТГ/202610023', ago: 6, left: 3, st: 'open', bud: 1200, t: ['Баянзүрх дүүргийн 26-р хорооны авто замын засвар', 'Road repair, Bayanzürkh khoroo 26'] },
    { no: 'НЗДТГ/202610019', ago: 9, left: 11, st: 'open', bud: 38000, t: ['40 цахилгаан автобус нийлүүлэх', 'Supply of 40 electric buses'] },
    { no: 'НЗДТГ/202610011', ago: 18, left: 0, st: 'eval', bud: 2600, t: ['4 сургуулийн барилгын дулаалга', 'Insulation for 4 school buildings'] },
    { no: 'НЗДТГ/202609087', ago: 26, left: 0, st: 'eval', bud: 3400, t: ['Гудамжны LED гэрэлтүүлэг, 1 200 цэг', 'LED street lighting, 1,200 points'] },
    { no: 'НЗДТГ/202609052', ago: 41, left: 0, st: 'won', bud: 1850, t: ['Хүүхдийн 30 тоглоомын талбай', '30 children\u2019s playgrounds'] },
    { no: 'НЗДТГ/202608033', ago: 55, left: 0, st: 'won', bud: 420, t: ['Агаарын чанарын 50 мэдрэгч', '50 air-quality sensors'] },
  ],
};

/* ================= About ================= */
const STRUCT = [
  { i: 'users-round', t: ['Иргэд', 'Residents'], d: ['Дөрвөн жил тутам төлөөлөгчөө сонгоно', 'Elect representatives every four years'] },
  { i: 'landmark', t: ['Нийслэлийн Иргэдийн Төлөөлөгчдийн Хурал', 'City Council (Citizens\u2019 Representatives Khural)'], d: ['45 төлөөлөгч. Төсөв, журам батлах, хяналт тавих', '45 members. Approves the budget and rules, oversees'] },
  { i: 'building', t: ['Нийслэлийн Засаг дарга, Хотын Захирагч', 'Governor of the Capital City and Mayor'], d: ['Гүйцэтгэх засаглал, өдөр тутмын удирдлага', 'Executive power and day-to-day management'] },
  { i: 'network', t: ['Тамгын газар, 30 гаруй агентлаг', 'City Hall and 30+ agencies'], d: ['Тээвэр, боловсрол, эрүүл мэнд, дэд бүтэц', 'Transport, education, health, utilities'] },
  { i: 'map', t: ['9 дүүрэг, 204 хороо', '9 districts, 204 khoroos'], d: ['Иргэдэд хамгийн ойр засаглал', 'Government closest to residents'] },
];
const ORGS = [
  { i: 'siren', t: ['Онцгой байдлын газар', 'Emergency Management Agency'] },
  { i: 'bus', t: ['Нийтийн тээврийн газар', 'Public Transport Department'] },
  { i: 'graduation-cap', t: ['Боловсролын газар', 'Education Department'] },
  { i: 'stethoscope', t: ['Эрүүл мэндийн газар', 'Health Department'] },
  { i: 'building-2', t: ['Хот байгуулалтын газар', 'Urban Development Department'] },
  { i: 'wind', t: ['Агаарын чанарын газар', 'Air Quality Department'] },
  { i: 'droplets', t: ['Ус сувгийн удирдах газар', 'Water Supply and Sewerage Authority'] },
  { i: 'flame', t: ['Дулааны сүлжээ', 'District Heating Network'] },
  { i: 'trending-up', t: ['Хөрөнгө оруулалтын газар', 'Investment Department'] },
  { i: 'trees', t: ['Ногоон байгууламжийн газар', 'Parks and Greenery Department'] },
  { i: 'shield', t: ['Цагдаагийн газар', 'City Police'] },
  { i: 'hand-heart', t: ['Нийгмийн халамжийн газар', 'Social Welfare Department'] },
];

/* ================= Data series ================= */
const AQI_PROFILE = [118, 112, 104, 96, 90, 86, 84, 88, 82, 70, 58, 49, 44, 42, 45, 52, 61, 72, 88, 104, 121, 129, 126, 122];
const POP = [['Сонгинохайрхан', 'Songinokhairkhan', 392400], ['Баянзүрх', 'Bayanzürkh', 386900], ['Баянгол', 'Bayangol', 244300], ['Хан-Уул', 'Khan-Uul', 238600], ['Чингэлтэй', 'Chingeltei', 158200], ['Сүхбаатар', 'Sükhbaatar', 151700], ['Налайх', 'Nalaikh', 44900], ['Багануур', 'Baganuur', 29800], ['Багахангай', 'Bagakhangai', 5100]];
const BUDGET_Q = [[820, 790], [960, 941], [1010, 872], [1110, 0]];
const ROADS = [[['Энхтайвны өргөн чөлөө', 'Peace Avenue'], 8.2], [['Чингисийн өргөн чөлөө', 'Chinggis Avenue'], 7.4], [['Их тойруу', 'Ring Road'], 6.6]];
const FORECAST = [[6, -5, 'cloud-sun'], [3, -7, 'cloud'], [4, -6, 'sun'], [8, -3, 'sun'], [7, -4, 'cloud-snow']];

/* ================= My page ================= */
const ME = { n: ['Б. Тэмүүлэн', 'B. Temuulen'], ini: ['БТ', 'BT'], reg: 'УБ90••••12', addr: ['Сүхбаатар дүүрэг, 1-р хороо', 'Sükhbaatar District, Khoroo 1'], x: 560, y: 268 };
const REQ_DEFAULT = [
  { id: 'UB-2026-48127', cat: 'pothole', st: 2, ago: 3, place: ['8-р хорооллын 23-р байрны урд', 'Outside building 23, 8th microdistrict'], ag: ['Нийслэлийн Авто замын газар', 'City Roads Department'], note: ['Засварын баг {t+2}-нд ажиллахаар төлөвлөсөн.', 'A repair crew is scheduled for {t+2}.'] },
  { id: 'UB-2026-48302', cat: 'waste', st: 0, ago: 0, place: ['1-р хорооны 14-р байр', 'Building 14, Khoroo 1'], ag: ['Чингэлтэй дүүргийн Тохижилтын алба', 'District Services Office'], note: ['Хүлээн авч, хариуцах алба руу шилжүүлж байна.', 'Received and being routed to the responsible office.'] },
  { id: 'UB-2026-47310', cat: 'light', st: 3, ago: 12, place: ['Их сургуулийн гудамж', 'University Street'], ag: ['Гэрэлтүүлгийн алба', 'Street Lighting Office'], note: ['Гэрэлтүүлгийг засварлаж, хэвийн ажиллагаанд орууллаа.', 'The lights were repaired and are working again.'] },
];
const RCAT = {
  pothole: { i: 'construction', t: ['Замын эвдрэл, нүх', 'Pothole or road damage'] },
  light: { i: 'lamp', t: ['Гэрэлтүүлэг ажиллахгүй', 'Street light out'] },
  waste: { i: 'trash-2', t: ['Хог хаягдал', 'Uncollected waste'] },
  water: { i: 'droplets', t: ['Ус, шугам гоожсон', 'Water or pipe leak'] },
  building: { i: 'triangle-alert', t: ['Аюултай барилга, ил худаг', 'Unsafe structure or open manhole'] },
  other: { i: 'circle-help', t: ['Бусад', 'Something else'] },
  service: { i: 'file-check', t: ['Үйлчилгээний хүсэлт', 'Service request'] },
};
const KHOROO = {
  gov: ['Д. Нарангэрэл', 'D. Narangerel'], hours: ['Да–Ба, 09:00–18:00', 'Mon–Fri, 09:00–18:00'], res: 12480, hh: 4210,
  near: [[['1-р хорооны өрхийн эрүүл мэндийн төв', 'Khoroo 1 family health centre'], 'stethoscope', '350 м'], [['24-р сургууль', 'School No. 24'], 'school', '600 м'], [['12-р цэцэрлэг', 'Kindergarten No. 12'], 'baby', '420 м'], [['Хэсгийн цагдаа', 'Neighbourhood police officer'], 'shield', '200 м']],
  notices: [['Иргэдийн нийтийн хурал {t+6}, 18:00 цагт хорооны байранд болно.', "Residents' meeting {t+6} at 18:00 in the khoroo office."], ['Хорооны хөгжлийн сангийн санал асуулгад оролцоорой.', "Vote in the khoroo development fund poll."], ['Өвлийн улиралд гудамжны цас цэвэрлэгээнд сайн дурын баг бүрдүүлж байна.', 'Volunteers wanted for winter snow-clearing.']],
};
const PAYMENTS = [{ id: 'pay1', t: ['Хог хаягдлын төлбөр, 10-р сар', 'Waste fee, October'], amt: 3600 }, { id: 'pay2', t: ['Үл хөдлөх хөрөнгийн албан татвар', 'Property tax'], amt: 48000, paid: 1 }];
const POLL = [['Гудамжны гэрэлтүүлэг', 'Street lighting', 1840], ['Хүүхдийн тоглоомын талбай', 'Playgrounds', 2310], ['Явган хүний зам', 'Footpaths', 1460], ['Ногоон байгууламж', 'Green space', 1190], ['Хяналтын камер', 'Safety cameras', 870]];
const TOPICS = [['plan', 'Улаанбаатар 2040', 'Ulaanbaatar 2040'], ['road', 'Зам, тээвэр', 'Roads and transport'], ['green', 'Ногоон байгууламж', 'Green space'], ['safety', 'Аюулгүй байдал', 'Safety'], ['other', 'Бусад', 'Other']];

/* ================= Засаг даргын ажлын хуваарь (sections.js renderGov, admin «Засаг даргын хуваарь») =================
   Жишээ хуваарь: өнөөдрөөс хамааран огноо нь тооцогдоно. Admin-аас бодит хуваариар солино. */
const GOV_TYPES = {
  meeting: { c: '#1D5BFF', i: 'handshake', t: ['Уулзалт', 'Meeting'] },
  session: { c: '#7C4DFF', i: 'landmark', t: ['Хуралдаан', 'Session'] },
  visit: { c: '#0EA068', i: 'map-pinned', t: ['Ажлын айлчлал', 'Site visit'] },
  reception: { c: '#D81E34', i: 'users-round', t: ['Иргэдийн хүлээн авалт', 'Citizen reception'] },
  event: { c: '#E58A00', i: 'sparkles', t: ['Арга хэмжээ', 'Event'] },
};
const isoOff = (n) => { const d = addDays(today(), n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const GOV_SCHED = [
  { id: 'g1', date: isoOff(-1), from: '16:00', to: '17:30', type: 'event', t: ['«Залуу Улаанбаатар» залуучуудын форум', '"Young Ulaanbaatar" youth forum'], place: ['Төв цэнгэлдэх хүрээлэн', 'Central Stadium'], d: ['Залуучуудын санал санаачилгыг сонсож, хотын хөгжлийн бодлогод тусгах.', 'Listening to young people\u2019s ideas for city policy.'] },
  { id: 'g2', date: isoOff(0), from: '09:00', to: '10:30', type: 'session', t: ['Засаг даргын шуурхай зөвлөгөөн', 'Weekly operational meeting'], place: ['Нийслэлийн Засаг даргын Тамгын газар, 3 давхар', 'City Hall, 3rd floor'], d: ['Өвөлжилтийн бэлтгэл, нийтийн тээвэр, гэр хорооллын дахин төлөвлөлтийн явц.', 'Winter readiness, public transport and ger-district redevelopment.'] },
  { id: 'g3', date: isoOff(0), from: '14:00', to: '16:00', type: 'reception', t: ['Иргэдийн хүлээн авалт', 'Citizen reception'], place: ['Иргэний танхим', 'Civic Hall'], d: ['Иргэд санал, хүсэлтээ Засаг даргад биечлэн уламжилна.', 'Residents bring their requests to the Governor in person.'] },
  { id: 'g4', date: isoOff(1), from: '10:00', to: '11:00', type: 'meeting', t: ['Сөүл хотын төлөөлөгчидтэй уулзалт', 'Meeting with a Seoul city delegation'], place: ['Төрийн ордон, Хүлээн авалтын танхим', 'Government Palace, reception hall'], d: ['Ухаалаг хот, нийтийн тээврийн чиглэлээр хамтран ажиллах.', 'Cooperation on smart city and public transport.'] },
  { id: 'g5', date: isoOff(1), from: '15:00', to: '16:30', type: 'visit', t: ['Туул хурдны замын ажлын явцтай танилцах', 'Site visit: Tuul Expressway'], place: ['Хан-Уул дүүрэг, 2-р хэсэг', 'Khan-Uul District, section 2'], d: ['Гүйцэтгэл 64% хүрсэн 2-р хэсгийн ажлыг газар дээр нь шалгах.', 'Checking section 2, now 64% complete.'] },
  { id: 'g6', date: isoOff(2), from: '11:00', to: '13:00', type: 'session', t: ['Нийслэлийн ИТХ-ын ээлжит хуралдаан', 'City Council regular session'], place: ['НИТХ-ын хуралдааны танхим', 'City Council chamber'], d: ['2027 оны төсвийн хүрээний мэдэгдлийг хэлэлцэнэ.', 'Discussing the 2027 budget framework.'] },
  { id: 'g7', date: isoOff(3), from: '10:00', to: '12:00', type: 'meeting', t: ['Баянзүрх дүүргийн иргэдтэй уулзалт', 'Town hall with Bayanzürkh residents'], place: ['Баянзүрх дүүргийн соёлын төв', 'Bayanzürkh cultural centre'], d: ['Дулаан, ус хангамж, авто замын асуудлаар иргэдийн санал сонсох.', 'Hearing residents on heating, water and roads.'] },
  { id: 'g8', date: isoOff(4), from: '09:30', to: '11:00', type: 'visit', t: ['Өвөлжилтийн бэлтгэлийг шалгах', 'Winter readiness inspection'], place: ['Дулааны III цахилгаан станц', 'Thermal Power Plant No. 3'], d: ['Түлш, нөөц, засварын ажлын бэлэн байдлыг шалгах.', 'Checking fuel, reserves and repairs.'] },
];
/* ================= Босоо баннер: өргөн дэлгэцийн баруун хоосон зайд (sections.js renderRail, admin «Босоо баннер») ================= */
const RAIL_THEMES = { red: ['#D81E34', '#7A0D20'], navy: ['#1A3576', '#070F26'], blue: ['#1D5BFF', '#0A2A8C'], green: ['#0EA068', '#04573A'], gold: ['#E9A213', '#8F5200'] };
const RAIL_THEME_L = { red: ['Улаан', 'Red'], navy: ['Хар хөх', 'Navy'], blue: ['Цэнхэр', 'Blue'], green: ['Ногоон', 'Green'], gold: ['Алтан', 'Gold'] };
const BANNERS = [
  { id: 'b1', ord: 10, theme: 'red', img: 'skyline:dawn:21', tag: ['2026 он', '2026'], t: ['Бизнес эрхлэгчдийг дэмжих жил', 'Year of Supporting Entrepreneurs'],
    d: ['Бизнесээ эхлүүлэх алхмууд, хөнгөлөлт, зөвлөгөө нэг дор.', 'Steps to start a business, incentives and advice in one place.'], btn: ['Алхмуудыг үзэх', 'See the steps'], act: 'go', go: { sec: 'situations', sit: 'business' }, from: '', to: '' },
  { id: 'b2', ord: 20, theme: 'navy', img: 'park:green:57', tag: ['Санал асуулга', 'Poll'], t: ['Таны хороонд юу хэрэгтэй вэ?', 'What does your khoroo need?'],
    d: ['2027 оны хорооны хөгжлийн сангийн санал асуулга нээлттэй байна.', 'The 2027 khoroo development fund poll is open.'], btn: ['Санал өгөх', 'Have your say'], act: 'vote', from: '',
    to: (() => { const d = addDays(today(), 23); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() },
];

/* ================= Chat (fallback answers) ================= */
const FAQ = [
  { re: /халуун ус|hot water|ус тасар|усгүй/i, a: ['Баянзүрх дүүргийн 4, 5, 26-р хороонд {t+2} – {t+4} хооронд шугамын засвартай тул халуун ус тасарна. Бусад хороонд хэвийн. Ус нөөцлөхийг зөвлөж байна.', 'Hot water is off in Bayanzürkh khoroos 4, 5 and 26 from {t+2} to {t+4} for pipe repairs. Other khoroos are not affected. Store some water ahead.'], acts: ['alerts'] },
  { re: /хүүхдийн мөнгө|child benefit|хүүхэд төр|new baby|төрсний/i, a: ['Хүүхэд төрсний дараах 4 алхмыг дарааллаар нь бэлдсэн: төрсний гэрчилгээ, хүүхдийн мөнгө, өрхийн эмнэлэгт бүртгүүлэх, цэцэрлэгийн дараалал. Гурав нь онлайн.', 'There are four steps after a birth: birth certificate, child benefit, family clinic registration and the kindergarten waiting list. Three are online.'], acts: ['situation:birth'] },
  { re: /нүх|pothole|эвдэр|гэрэлтүүлэг|street light|хог|waste|гоож|leak|аюултай|мэдээлэх|report/i, a: ['Эрсдэл мэдээлэх маягтаар 1 минутад мэдээлэх боломжтой. Байршлаа газрын зураг дээр зааж, зураг хавсаргана. Явцыг Миний булан хэсгээс хянана. Амь насанд аюултай бол 101, 102, 103 руу залгана уу.', 'Use the hazard form; it takes a minute. Mark the spot on the map and add a photo, then follow progress in My page. If anyone is in danger, call 101, 102 or 103.'], acts: ['report'] },
  { re: /агаар|air|aqi|утаа|smog|pm2/i, a: ['Одоо AQI {aqi}, дунд зэрэг. 20:00 цагаас PM2.5 өсөх төлөвтэй тул хүүхэд, ахмад настнууд гадаа удаан байхгүй байх нь зүйтэй.', 'AQI is {aqi} right now, moderate. PM2.5 is expected to rise after 20:00, so children and older adults should limit time outdoors.'], acts: ['data'] },
  { re: /тендер|tender|худалдан авалт|procure|тогтоол|захирамж|resolution/i, a: ['Нээлттэй тендер, Нийслэлийн ИТХ-ын тогтоол, Засаг даргын захирамжийг Ил тод байдал хэсгээс дугаар, нэрээр хайна. Одоогоор 2 тендер нээлттэй байна.', 'Open tenders, council resolutions and governor orders are under Transparency, searchable by number or title. Two tenders are open right now.'], acts: ['transparency'] },
  { re: /арга хэмжээ|event|амралт|weekend|концерт|concert|наадам|festival/i, a: ['Энэ амралтын өдөр Сүхбаатарын талбайд намрын хөгжмийн наадам, Туулын эрэгт мод тарих өдөрлөг, Нарантуулын талбайд фермерийн зах болно. Ихэнх нь үнэгүй.', 'This weekend: an autumn music festival on Sükhbaatar Square, tree planting on the Tuul riverbank and a farmers\u2019 market. Most are free.'], acts: ['events'] },
  { re: /түгжрэл|traffic|зам хаа|road clos|автобус|bus/i, a: ['Түгжрэлийн индекс одоо {tr}/10. Энхтайвны өргөн чөлөөний Баруун 4 зам – Их тойруу хэсэг өнөө шөнө 22:00–06:00 хаагдана. Нийтийн тээврийн 7 чиглэл түр өөрчлөгдөнө.', 'The congestion index is {tr}/10. Peace Avenue between West Crossroads and the Ring Road closes tonight 22:00–06:00, and seven bus routes are diverted.'], acts: ['data'] },
  { re: /санал|vote|poll|хорооны хөгжлийн/i, a: ['2027 оны хорооны хөгжлийн сангийн санал асуулга нээлттэй байна. Мөн хотын аль ч асуудлаар санал хүсэлт илгээх боломжтой.', 'The 2027 khoroo development fund poll is open. You can also send a suggestion on any city issue.'], acts: ['vote'] },
  { re: /нэвтр|login|sign in|дан\b|dan\b/i, a: ['ДАН бол төрийн цахим үйлчилгээний нэгдсэн нэвтрэлт. И-Монголиа апп, нэг удаагийн код эсвэл интернэт банкаар нэвтэрнэ.', 'DAN is the single sign-in for government e-services. Use the e-Mongolia app, a one-time code or your internet bank.'], acts: ['login'] },
  { re: /бизнес|business|компани|company/i, a: ['Бизнес эхлүүлэх 5 алхам: нэр баталгаажуулах, улсын бүртгэл, татвар төлөгчийн бүртгэл, тусгай зөвшөөрөл, нийгмийн даатгал. Дөрөв нь онлайн.', 'Starting a business takes five steps: reserve a name, register, tax registration, any special licence and social insurance. Four are online.'], acts: ['situation:business'] },
];
const FAQ_DEFAULT = { a: ['Энэ талаар надад тодорхой мэдээлэл алга. 1200 дугаарт залгавал 24 цагийн турш хариулна. Эсвэл хайлтаар үйлчилгээ, мэдээг хайж болно.', "I don't have details on that. The 1200 hotline answers around the clock, or you can search services and news."], acts: ['search'] };
const CHAT_CHIPS = [['Халуун ус хэзээ ирэх вэ?', 'When is hot water back?'], ['Хүүхдийн мөнгө хэрхэн авах вэ?', 'How do I claim child benefit?'], ['Замын нүх мэдээлэх', 'Report a pothole'], ['Өнөөдөр агаар ямар байна?', "How's the air today?"]];
