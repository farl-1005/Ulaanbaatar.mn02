/* ================= Alerts (ticker) ================= */
const ALERTS = [
  { id: 'a1', i: 'droplets', k: ['Халуун ус тасарна', 'Hot water off'],
    t: ['Баянзүрх дүүргийн 4, 5, 26-р хороо, {t+2} – {t+4}, шугамын засвар', 'Bayanzürkh khoroos 4, 5 and 26, {t+2} – {t+4}, pipe repairs'],
    area: ['Баянзүрх дүүргийн 4, 5, 26-р хороо, нийт 214 байр', 'Bayanzürkh khoroos 4, 5 and 26, 214 buildings'],
    when: ['{t+2} 09:00 – {t+4} 21:00', '{t+2} 09:00 – {t+4} 21:00'],
    adv: ['Ус нөөцлөх, цахилгаан халаагуурыг хэт ачаалахгүй байх. Дулааны хангамж хэвийн үргэлжилнэ.', 'Store water ahead and avoid overloading electric heaters. Heating stays on.'] },
  { id: 'a2', i: 'construction', k: ['Замын хаалт', 'Road closure'],
    t: ['Энхтайвны өргөн чөлөө, Баруун 4 зам – Их тойруу, өнөө шөнө 22:00–06:00', 'Peace Avenue, West Crossroads to Ring Road, tonight 22:00–06:00'],
    area: ['Энхтайвны өргөн чөлөөний 1.8 км хэсэг, хоёр чиглэлд', '1.8 km of Peace Avenue, both directions'],
    when: ['Өнөө шөнө 22:00 – маргааш 06:00', 'Tonight 22:00 – tomorrow 06:00'],
    adv: ['Сөүлийн гудамж болон Их тойруугаар тойрч явна уу. Нийтийн тээврийн 7 чиглэл түр өөрчлөгдөнө.', 'Use Seoul Street or the Ring Road. Seven bus routes are temporarily diverted.'] },
  { id: 'a3', i: 'wind', k: ['Агаарын чанар', 'Air quality'],
    t: ['20:00 цагаас PM2.5 өсөх төлөвтэй, мэдрэг бүлгийнхэн гадаа удаан байхгүй байна уу', 'PM2.5 expected to rise after 20:00; sensitive groups should limit time outdoors'],
    area: ['Нийслэлийн төв 6 дүүрэг', 'All six central districts'],
    when: ['Өнөөдөр 20:00 – маргааш 10:00', 'Today 20:00 – tomorrow 10:00'],
    adv: ['Агаар цэвэршүүлэгчээ асааж, гадуур амны хаалт зүүнэ үү. Хүүхэд, ахмад настнууд гадаа удаан байхгүй байх.', 'Run air purifiers and wear a mask outdoors. Children and older adults should stay inside where possible.'] },
  { id: 'a4', i: 'zap', k: ['Цахилгаан тасарна', 'Power outage'],
    t: ['Хан-Уул дүүргийн 11-р хороо, {t+1} 10:00–16:00, хуваарьт засвар', 'Khan-Uul khoroo 11, {t+1} 10:00–16:00, scheduled maintenance'],
    area: ['Хан-Уул дүүргийн 11-р хороо, 3 дэд станц', 'Khan-Uul khoroo 11, three substations'],
    when: ['{t+1} 10:00 – 16:00', '{t+1} 10:00 – 16:00'],
    adv: ['Цахилгаан хэрэгслээ сүлжээнээс салгаж, лифт ашиглахгүй байна уу.', 'Unplug appliances and avoid lifts during the outage.'] },
];

