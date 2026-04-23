# Talablar Hujjati

## Kirish

Ushbu hujjat **Mehmonxona Boshqaruv Tizimi (Hotel Management System)** uchun funksional va funksional bo'lmagan talablarni belgilaydi. Tizim mehmonxona xodimlariga mijozlarni ro'yxatga olish, xonalarni boshqarish, to'lovlarni qayta ishlash, xizmatlarni rejalashtirish va hisobotlar yaratish imkonini beruvchi web ilovadan iborat.

---

## Glossariy

- **Tizim** — Mehmonxona Boshqaruv Tizimining umumiy nomi (Hotel Management System)
- **Mijoz** — Mehmonxonada yashash uchun ro'yxatdan o'tgan yoki bron qilgan shaxs
- **Xodim** — Mehmonxonada ishlayotgan va tizimdan foydalanuvchi shaxs (administrator, menejer, tozalovchi va boshqalar)
- **Administrator** — Tizimga to'liq kirish huquqiga ega bo'lgan yuqori darajali xodim
- **Menejer** — Xonalar, xizmatlar va hisobotlarni boshqaruvchi xodim
- **Bron** — Mijozning ma'lum sanalar uchun xona zahirasini oldindan tasdiqlash jarayoni
- **Check-in** — Mijozning mehmonxonaga rasmiy kirib kelish jarayoni
- **Check-out** — Mijozning mehmonxonadan rasmiy chiqib ketish jarayoni
- **Xona** — Mijozga ijaraga beriladigan mehmonxona ichidagi yashash birligi
- **Xona_Turi** — Xonaning toifasi: Standard, Lux yoki VIP
- **Xizmat** — Mijozga taqdim etiladigan qo'shimcha imkoniyat (tozalash, SPA, transport va boshqalar)
- **Hisob_Faktura** — Mijozning barcha xarajatlarini o'z ichiga olgan rasmiy to'lov hujjati
- **Ro'yxatga_Olish_Tizimi** — Mijozlarni ro'yxatga olish va bron qilishni boshqaruvchi modul
- **To'lov_Tizimi** — To'lovlarni qayta ishlash va hisob-kitobni boshqaruvchi modul
- **Xona_Boshqaruvi** — Xonalar holati va narxlarini boshqaruvchi modul
- **Xodim_Boshqaruvi** — Xodimlar ma'lumotlari va ish jadvalini boshqaruvchi modul
- **Xizmat_Boshqaruvi** — Xizmatlar buyurtmasi va bajarilishini boshqaruvchi modul
- **Hisobot_Tizimi** — Statistik ma'lumotlar va hisobotlarni yaratuvchi modul
- **Autentifikatsiya_Tizimi** — Foydalanuvchi kirishini va huquqlarini boshqaruvchi modul
- **API** — Tashqi tizimlar bilan ma'lumot almashish uchun dasturiy interfeys
- **Bildirishnoma_Tizimi** — SMS va email orqali xabar yuboruvchi modul

---

## Talablar

### Talab 1: Mijozni Ro'yxatga Olish

**Foydalanuvchi hikoyasi:** Xodim sifatida men yangi mijozni tizimga kiritmoqchiman, shunda mehmonxona mijoz ma'lumotlarini rasmiy ravishda saqlashi mumkin.

#### Qabul qilish mezonlari

1. THE Ro'yxatga_Olish_Tizimi SHALL mijoz uchun ism, familiya, pasport raqami, telefon raqami va elektron pochta manzilini majburiy maydonlar sifatida qabul qilishi kerak.
2. WHEN xodim yangi mijoz ma'lumotlarini yuborsa, THE Ro'yxatga_Olish_Tizimi SHALL pasport raqamining yagona ekanligini tekshirishi va takroriy yozuv mavjud bo'lsa xatoni qaytarishi kerak.
3. WHEN mijoz muvaffaqiyatli ro'yxatdan o'tsa, THE Ro'yxatga_Olish_Tizimi SHALL mijozga noyob identifikator (ID) tayinlashi kerak.
4. IF pasport raqami noto'g'ri formatda kiritilsa, THEN THE Ro'yxatga_Olish_Tizimi SHALL xodimga aniq xato xabarini ko'rsatishi kerak.
5. IF telefon raqami noto'g'ri formatda kiritilsa, THEN THE Ro'yxatga_Olish_Tizimi SHALL xodimga aniq xato xabarini ko'rsatishi kerak.
6. THE Ro'yxatga_Olish_Tizimi SHALL mijoz ma'lumotlarini shifrlangan holda saqlashi kerak.

---

### Talab 2: Xona Bron Qilish

**Foydalanuvchi hikoyasi:** Mijoz sifatida men ma'lum sanalar uchun xona bron qilmoqchiman, shunda kelganimda xona tayyor bo'lsin.

#### Qabul qilish mezonlari

1. WHEN mijoz bron so'rovini yuborsa, THE Ro'yxatga_Olish_Tizimi SHALL kirish va chiqish sanalarini, xona turini va mehmonlar sonini qabul qilishi kerak.
2. WHEN bron so'rovi qabul qilinsa, THE Xona_Boshqaruvi SHALL ko'rsatilgan sanalar uchun bo'sh xonalarni tekshirishi kerak.
3. IF so'ralgan sanalar uchun mos xona mavjud bo'lmasa, THEN THE Ro'yxatga_Olish_Tizimi SHALL mijozga muqobil sanalar yoki xona turlarini taklif qilishi kerak.
4. WHEN bron muvaffaqiyatli yaratilsa, THE Bildirishnoma_Tizimi SHALL mijozga email yoki SMS orqali tasdiqlash xabarini yuborishi kerak.
5. WHEN bron muvaffaqiyatli yaratilsa, THE Ro'yxatga_Olish_Tizimi SHALL bronni noyob bron raqami bilan ro'yxatga olishi kerak.
6. THE Ro'yxatga_Olish_Tizimi SHALL bronni check-in sanasidan kamida 1 soat oldin bekor qilish imkonini berishi kerak.
7. WHEN bron bekor qilinsa, THE Bildirishnoma_Tizimi SHALL mijozga bekor qilish tasdiqlash xabarini yuborishi kerak.

---

### Talab 3: Check-in Jarayoni

**Foydalanuvchi hikoyasi:** Administrator sifatida men kelgan mijozni tizimda rasmiylashtirmoqchiman, shunda xona unga tayinlansin va xizmat ko'rsatish boshlansin.

#### Qabul qilish mezonlari

1. WHEN administrator check-in jarayonini boshlasa, THE Ro'yxatga_Olish_Tizimi SHALL mijozning bron raqami yoki pasport raqami orqali ma'lumotlarini topishi kerak.
2. WHEN check-in tasdiqlansa, THE Xona_Boshqaruvi SHALL xona holatini "Band" ga o'zgartirishi kerak.
3. WHEN check-in tasdiqlansa, THE Ro'yxatga_Olish_Tizimi SHALL kirish vaqti va sanasini avtomatik ravishda qayd etishi kerak.
4. IF mijozning bronida oldindan to'lov talab qilingan bo'lsa, THEN THE To'lov_Tizimi SHALL to'lov amalga oshirilganligini tekshirishi kerak.
5. WHEN check-in muvaffaqiyatli yakunlansa, THE Bildirishnoma_Tizimi SHALL mijozga xona raqami va xizmatlar haqida ma'lumot yuborishi kerak.

---

### Talab 4: Check-out Jarayoni

**Foydalanuvchi hikoyasi:** Administrator sifatida men ketayotgan mijozni tizimda rasmiylashtirmoqchiman, shunda hisob-kitob amalga oshirilsin va xona bo'shatilsin.

#### Qabul qilish mezonlari

1. WHEN administrator check-out jarayonini boshlasa, THE Ro'yxatga_Olish_Tizimi SHALL mijozning barcha xarajatlarini (xona narxi, qo'shimcha xizmatlar) jamlagan Hisob_Faktura yaratishi kerak.
2. WHEN to'lov muvaffaqiyatli amalga oshirilsa, THE Xona_Boshqaruvi SHALL xona holatini "Bo'sh" ga o'zgartirishi kerak.
3. WHEN check-out tasdiqlansa, THE Ro'yxatga_Olish_Tizimi SHALL chiqish vaqti va sanasini avtomatik ravishda qayd etishi kerak.
4. WHEN check-out yakunlansa, THE Bildirishnoma_Tizimi SHALL mijozga yakuniy Hisob_Faktura nusxasini email orqali yuborishi kerak.
5. IF mijozda to'lanmagan qoldiq mavjud bo'lsa, THEN THE To'lov_Tizimi SHALL check-out jarayonini to'liq to'lov amalga oshirilgunga qadar bloklashi kerak.

---

### Talab 5: Xonalar Boshqaruvi

**Foydalanuvchi hikoyasi:** Menejer sifatida men xonalar holati va narxlarini boshqarmoqchiman, shunda mehmonxona resurslaridan samarali foydalanilsin.

#### Qabul qilish mezonlari

1. THE Xona_Boshqaruvi SHALL har bir xona uchun xona raqami, Xona_Turi, sig'im, narx va holat (Bo'sh, Band, Tozalanmoqda, Ta'mirda) ma'lumotlarini saqlashi kerak.
2. THE Xona_Boshqaruvi SHALL Standard, Lux va VIP xona turlarini qo'llab-quvvatlashi kerak.
3. WHEN menejer xona narxini yangilasa, THE Xona_Boshqaruvi SHALL yangi narxni darhol tizimda aks ettirishi kerak.
4. WHEN menejer xona holatini o'zgartirsa, THE Xona_Boshqaruvi SHALL o'zgarishni qayd etishi va vaqt tamg'asini saqlashi kerak.
5. THE Xona_Boshqaruvi SHALL barcha xonalarning real vaqt rejimidagi holat ko'rinishini taqdim etishi kerak.
6. IF xona "Ta'mirda" holatiga o'tkazilsa, THEN THE Xona_Boshqaruvi SHALL ushbu xona uchun yangi bronlarni bloklashi kerak.

---

### Talab 6: To'lov Tizimi

**Foydalanuvchi hikoyasi:** Administrator sifatida men mijoz to'lovlarini qayta ishlamoqchiman, shunda barcha moliyaviy operatsiyalar to'g'ri qayd etilsin.

#### Qabul qilish mezonlari

1. THE To'lov_Tizimi SHALL naqd pul, bank kartasi va onlayn to'lov usullarini qabul qilishi kerak.
2. WHEN to'lov amalga oshirilsa, THE To'lov_Tizimi SHALL to'lov summasini, usulini, vaqtini va xodim identifikatorini qayd etishi kerak.
3. WHEN chegirma kodi kiritilsa, THE To'lov_Tizimi SHALL chegirma kodining haqiqiyligini tekshirishi va mos miqdorni umumiy summadan ayirishi kerak.
4. THE To'lov_Tizimi SHALL har bir to'lov uchun noyob tranzaksiya raqami bilan Hisob_Faktura yaratishi kerak.
5. IF to'lov amalga oshirishda xatolik yuz bersa, THEN THE To'lov_Tizimi SHALL xatoni qayd etishi va administratorga aniq xato xabarini ko'rsatishi kerak.
6. THE To'lov_Tizimi SHALL to'lov tarixini kamida 5 yil davomida saqlashi kerak.
7. WHEN qaytarish (refund) so'rovi yuborilsa, THE To'lov_Tizimi SHALL menejer tasdig'idan so'ng qaytarishni amalga oshirishi kerak.

---

### Talab 7: Xodimlar Boshqaruvi

**Foydalanuvchi hikoyasi:** Administrator sifatida men xodimlar ma'lumotlari va ish jadvallarini boshqarmoqchiman, shunda mehmonxona samarali ishlashi ta'minlansin.

#### Qabul qilish mezonlari

1. THE Xodim_Boshqaruvi SHALL har bir xodim uchun ism, familiya, lavozim, ish jadvali va maosh ma'lumotlarini saqlashi kerak.
2. THE Xodim_Boshqaruvi SHALL Administrator, Menejer, Resepsionist, Tozalovchi va Hisobchi lavozimlarini qo'llab-quvvatlashi kerak.
3. WHEN administrator yangi xodim qo'shsa, THE Xodim_Boshqaruvi SHALL xodimga lavozimiga mos tizim kirish huquqlarini avtomatik tayinlashi kerak.
4. WHEN administrator ish jadvalini yangilasa, THE Xodim_Boshqaruvi SHALL o'zgarishlarni qayd etishi va xodimga bildirishnoma yuborishi kerak.
5. THE Xodim_Boshqaruvi SHALL oylik maoshni ish soatlari va stavka asosida hisoblashi kerak.
6. IF xodim tizimdan o'chirilsa, THEN THE Xodim_Boshqaruvi SHALL xodimning barcha tarixiy ma'lumotlarini arxivlashi kerak.

---

### Talab 8: Xizmat Ko'rsatish Tizimi

**Foydalanuvchi hikoyasi:** Mijoz sifatida men qo'shimcha xizmatlar buyurtma qilmoqchiman, shunda mehmonxona yashash tajribam yaxshilansin.

#### Qabul qilish mezonlari

1. THE Xizmat_Boshqaruvi SHALL xona tozalash, kir yuvish, transport, SPA, sport zali va konferensiya zali xizmatlarini qo'llab-quvvatlashi kerak.
2. WHEN mijoz xizmat buyurtma qilsa, THE Xizmat_Boshqaruvi SHALL buyurtmani mas'ul xodimga avtomatik ravishda tayinlashi kerak.
3. WHEN xizmat bajarilsa, THE Xizmat_Boshqaruvi SHALL xizmat holatini "Bajarildi" ga o'zgartirishi va vaqtni qayd etishi kerak.
4. THE Xizmat_Boshqaruvi SHALL xona tozalash jadvalini kunlik asosda avtomatik yaratishi kerak.
5. IF xizmat belgilangan vaqtdan 30 daqiqa kechiksa, THEN THE Xizmat_Boshqaruvi SHALL menejerga ogohlantirish xabarini yuborishi kerak.
6. WHEN xizmat buyurtmasi yaratilsa, THE To'lov_Tizimi SHALL xizmat narxini mijozning joriy hisobiga qo'shishi kerak.

---

### Talab 9: Hisobot Tizimi

**Foydalanuvchi hikoyasi:** Menejer sifatida men mehmonxona faoliyati bo'yicha hisobotlarni ko'rmoqchiman, shunda boshqaruv qarorlarini ma'lumotlarga asoslanib qabul qilishim mumkin.

#### Qabul qilish mezonlari

1. THE Hisobot_Tizimi SHALL kunlik, haftalik va oylik daromad hisobotlarini yaratishi kerak.
2. THE Hisobot_Tizimi SHALL xonalar bandlik darajasini foiz ko'rinishida ko'rsatishi kerak.
3. THE Hisobot_Tizimi SHALL eng ko'p bron qilingan xona turlarini ro'yxat ko'rinishida taqdim etishi kerak.
4. THE Hisobot_Tizimi SHALL mijozlar statistikasini (yangi, qaytuvchi, millati bo'yicha) ko'rsatishi kerak.
5. WHEN menejer hisobot so'rasa, THE Hisobot_Tizimi SHALL hisobotni 5 soniya ichida yaratishi kerak.
6. THE Hisobot_Tizimi SHALL hisobotlarni PDF va Excel formatlarida eksport qilish imkonini berishi kerak.
7. WHERE administrator roli mavjud bo'lsa, THE Hisobot_Tizimi SHALL moliyaviy hisobotlarga to'liq kirish huquqini taqdim etishi kerak.

---

### Talab 10: Autentifikatsiya va Kirish Nazorati

**Foydalanuvchi hikoyasi:** Tizim foydalanuvchisi sifatida men faqat o'z vakolatim doirasidagi funksiyalarga kirmoqchiman, shunda tizim xavfsizligi ta'minlansin.

#### Qabul qilish mezonlari

1. THE Autentifikatsiya_Tizimi SHALL foydalanuvchi nomi va parol orqali tizimga kirishni talab qilishi kerak.
2. THE Autentifikatsiya_Tizimi SHALL parolni kamida 8 ta belgi, 1 ta raqam va 1 ta maxsus belgi bo'lishini talab qilishi kerak.
3. WHEN foydalanuvchi noto'g'ri parolni ketma-ket 5 marta kiritsa, THE Autentifikatsiya_Tizimi SHALL hisobni 15 daqiqaga bloklashi kerak.
4. THE Autentifikatsiya_Tizimi SHALL har bir foydalanuvchiga lavozimiga mos rol asosida kirish huquqlarini tayinlashi kerak.
5. WHILE foydalanuvchi tizimda faol bo'lmasa va 30 daqiqa o'tsa, THE Autentifikatsiya_Tizimi SHALL sessiyani avtomatik yakunlashi kerak.
6. THE Autentifikatsiya_Tizimi SHALL barcha kirish urinishlarini (muvaffaqiyatli va muvaffaqiyatsiz) audit jurnalida qayd etishi kerak.
7. IF foydalanuvchi o'z vakolati doirasidan tashqaridagi sahifaga kirishga urinsa, THEN THE Autentifikatsiya_Tizimi SHALL kirishni rad etishi va xato xabarini ko'rsatishi kerak.

---

### Talab 11: Mobil va API Integratsiyasi

**Foydalanuvchi hikoyasi:** Mijoz sifatida men mobil qurilmam orqali xona bron qilmoqchiman, shunda mehmonxonaga kelmasdan ham xizmatlardan foydalana olayim.

#### Qabul qilish mezonlari

1. THE API SHALL xona qidiruv, bron yaratish, bron bekor qilish va to'lov operatsiyalari uchun RESTful endpointlarni taqdim etishi kerak.
2. THE API SHALL har bir so'rovni autentifikatsiya tokeni orqali tekshirishi kerak.
3. WHEN tashqi tizim API orqali so'rov yuborsa, THE API SHALL so'rovga 2 soniya ichida javob berishi kerak.
4. THE API SHALL API versiyalashni qo'llab-quvvatlashi va eskirgan versiyalarni kamida 6 oy davomida faol saqlashi kerak.
5. IF API so'rovida noto'g'ri ma'lumotlar bo'lsa, THEN THE API SHALL standart HTTP xato kodlari va tavsiflovchi xato xabarlari bilan javob berishi kerak.
6. THE API SHALL kuniga 10,000 so'rovgacha yuklamani qo'llab-quvvatlashi kerak.

---

### Talab 12: Bildirishnomalar Tizimi

**Foydalanuvchi hikoyasi:** Mijoz sifatida men bron va xizmatlar haqida o'z vaqtida xabar olmoqchiman, shunda muhim ma'lumotlarni o'tkazib yubormasam.

#### Qabul qilish mezonlari

1. THE Bildirishnoma_Tizimi SHALL email va SMS orqali xabar yuborishni qo'llab-quvvatlashi kerak.
2. WHEN bron tasdiqlansa, THE Bildirishnoma_Tizimi SHALL mijozga 5 daqiqa ichida tasdiqlash xabarini yuborishi kerak.
3. WHEN check-in sanasiga 24 soat qolsa, THE Bildirishnoma_Tizimi SHALL mijozga eslatma xabarini yuborishi kerak.
4. WHEN check-out yakunlansa, THE Bildirishnoma_Tizimi SHALL mijozga Hisob_Faktura va minnatdorchilik xabarini yuborishi kerak.
5. IF xabar yuborishda xatolik yuz bersa, THEN THE Bildirishnoma_Tizimi SHALL xatoni qayd etishi va 3 marta qayta urinishi kerak.
6. WHERE mijoz SMS bildirishnomalardan voz kechgan bo'lsa, THE Bildirishnoma_Tizimi SHALL faqat email orqali xabar yuborishi kerak.
