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

