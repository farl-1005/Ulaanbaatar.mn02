/* ================= Events ================= */
const ECAT = {
  music: { c: '#C026D3', t: ['Хөгжим', 'Music'] }, sport: { c: '#145095', t: ['Спорт', 'Sport'] }, art: { c: '#F08C1A', t: ['Урлаг', 'Art'] },
  kids: { c: '#10A36A', t: ['Хүүхэд', 'Kids'] }, tech: { c: '#145095', t: ['Технологи', 'Tech'] }, theatre: { c: '#D81E34', t: ['Театр', 'Theatre'] },
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

