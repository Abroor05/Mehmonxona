..








......................................................................................................................# Implementatsiya Rejasi: Mehmonxona Boshqaruv Tizimi

## Umumiy Ko'rinish

React 18 + TypeScript asosida qurilgan Mehmonxona Boshqaruv Tizimini bosqichma-bosqich implementatsiya qilish. Har bir qadam oldingi qadam ustiga quriladi va oxirida barcha komponentlar birlashtiriladi. Zustand (UI/auth holati), React Query (server holati), Ant Design 5 (UI komponentlar) va Axios (HTTP) ishlatiladi.

---

## Vazifalar

- [x] 1. Loyiha tuzilmasini va asosiy konfiguratsiyani sozlash
  - `create-react-app` yoki Vite yordamida React 18 + TypeScript loyihasini yaratish
  - Kerakli paketlarni o'rnatish: `antd`, `zustand`, `@tanstack/react-query`, `axios`, `react-router-dom`, `recharts`
  - `tsconfig.json`, `vite.config.ts` (yoki CRA konfiguratsiyasi), `.env` fayllari sozlash
  - `src/` ichida papka tuzilmasini yaratish: `api/`, `components/`, `pages/`, `store/`, `types/`, `hooks/`, `utils/`
  - Ant Design global tema va CSS import sozlash
  - _Talablar: 10.1, 10.4_

- [x] 2. TypeScript turlari va enum'larni aniqlash
  - [x] 2.1 Barcha enum'larni `src/types/enums.ts` faylida yaratish
    - `RoomType`, `RoomStatus`, `BookingStatus`, `PaymentMethod`, `PaymentStatus`, `StaffRole`, `ServiceOrderStatus`, `NotificationChannel`, `DiscountType` enum'larini yozish
    - _Talablar: 5.1, 5.2, 6.1_
  - [x] 2.2 Asosiy interfeys va DTO turlarini `src/types/` papkasida yaratish
    - `Guest`, `Room`, `Booking`, `Payment`, `Invoice`, `Staff`, `ServiceType`, `ServiceOrder`, `Discount` interfeyslari
    - `CreateBookingDto`, `ProcessPaymentDto`, `UpdateRoomStatusDto`, `ReportQueryDto` DTO'lari
    - _Talablar: 1.1, 2.1, 4.1, 5.1, 6.1, 7.1_

- [x] 3. API xizmat qatlamini yaratish
  - [x] 3.1 Axios instance va interceptor'larni `src/api/axiosInstance.ts` da sozlash
    - Base URL, timeout, `Authorization` header (JWT token) sozlash
    - Response interceptor: 401 xatosida token yangilash (refresh token) logikasi
    - Request/response xatolarini ushlab olish
    - _Talablar: 10.1, 11.2, 11.3_
  - [x] 3.2 Auth API funksiyalarini `src/api/auth.ts` da yozish
    - `login()`, `logout()`, `refreshToken()`, `changePassword()` funksiyalari
    - _Talablar: 10.1, 10.2_
  - [x] 3.3 Guests, Rooms, Bookings API funksiyalarini yozish
    - `src/api/guests.ts`: CRUD operatsiyalari
    - `src/api/rooms.ts`: CRUD + `getAvailableRooms()` + `updateRoomStatus()`
    - `src/api/bookings.ts`: CRUD + `checkIn()` + `checkOut()` + `cancelBooking()`
    - _Talablar: 1.1–1.5, 2.1–2.7, 3.1–3.5, 4.1–4.5, 5.1–5.6_
  - [x] 3.4 Payments, Staff, Services, Reports API funksiyalarini yozish
    - `src/api/payments.ts`: `processPayment()`, `refund()`, `getInvoice()`
    - `src/api/staff.ts`: CRUD + `getSchedule()` + `updateSchedule()`
    - `src/api/services.ts`: `getServices()`, `createServiceOrder()`, `completeServiceOrder()`
    - `src/api/reports.ts`: `getRevenueReport()`, `getOccupancyReport()`, `getGuestStats()`, `exportReport()`
    - _Talablar: 6.1–6.7, 7.1–7.6, 8.1–8.6, 9.1–9.6_

- [x] 4. Zustand store'larini yaratish
  - [x] 4.1 Auth store'ni `src/store/authStore.ts` da yaratish
    - `user`, `token`, `role`, `isAuthenticated` holatlari
    - `login()`, `logout()`, `setTokens()` action'lari
    - LocalStorage bilan sinxronizatsiya
    - _Talablar: 10.1, 10.4, 10.5_
  - [x] 4.2 UI store'ni `src/store/uiStore.ts` da yaratish
    - Sidebar holati, global loading, notification holatlari
    - _Talablar: 10.7_

- [x] 5. Autentifikatsiya sahifasi va marshrutlashni implementatsiya qilish
  - [x] 5.1 Login sahifasini `src/pages/Login.tsx` da yaratish
    - Ant Design `Form`, `Input`, `Button` komponentlari bilan login formasi
    - Parol validatsiyasi (kamida 8 belgi, 1 raqam, 1 maxsus belgi)
    - Xato xabarlarini ko'rsatish (noto'g'ri parol, hisob bloklangan)
    - _Talablar: 10.1, 10.2, 10.3_
  - [x] 5.2 React Router v6 bilan marshrutlashni `src/App.tsx` da sozlash
    - `PrivateRoute` komponenti: autentifikatsiya tekshiruvi
    - `RoleGuard` komponenti: rol asosida sahifaga kirish nazorati
    - Barcha sahifalar uchun lazy loading
    - _Talablar: 10.4, 10.7_
  - [ ]* 5.3 Auth logikasi uchun unit testlar yozish
    - Login validatsiyasi, token saqlash, sessiya tugashi testlari
    - _Talablar: 10.1–10.5_

- [x] 6. Asosiy layout va navigatsiya komponentlarini yaratish
  - [x] 6.1 `src/components/layout/AppLayout.tsx` komponentini yaratish
    - Ant Design `Layout`, `Sider`, `Header`, `Content` komponentlari
    - Rol asosida dinamik menyu elementlari (RBAC)
    - Foydalanuvchi profili va logout tugmasi
    - _Talablar: 10.4, 10.7_
  - [x] 6.2 `src/components/layout/Sidebar.tsx` komponentini yaratish
    - Barcha modullar uchun navigatsiya linklari
    - Faol sahifani belgilash
    - _Talablar: 10.4_

- [x] 7. Dashboard sahifasini implementatsiya qilish
  - [x] 7.1 `src/pages/Dashboard.tsx` sahifasini yaratish
    - Umumiy statistika kartochkalari: jami xonalar, band xonalar, bugungi check-in/out soni, kunlik daromad
    - React Query bilan real-vaqt ma'lumotlarni yuklash
    - _Talablar: 5.5, 9.1, 9.2_
  - [x] 7.2 Xonalar holati vizualizatsiyasini qo'shish
    - Recharts `PieChart` yoki `BarChart` bilan xonalar holati diagrammasi
    - _Talablar: 5.5, 9.2_
  - [x] 7.3 Daromad grafigini qo'shish
    - Recharts `LineChart` bilan haftalik/oylik daromad grafigi
    - _Talablar: 9.1_

- [x] 8. Mijozlar (Guests) modulini implementatsiya qilish
  - [x] 8.1 `src/pages/Guests/GuestList.tsx` sahifasini yaratish
    - Ant Design `Table` bilan mijozlar ro'yxati (pagination, qidiruv, filter)
    - Yangi mijoz qo'shish tugmasi
    - _Talablar: 1.1, 1.3_
  - [x] 8.2 `src/pages/Guests/GuestForm.tsx` komponentini yaratish
    - Ism, familiya, pasport raqami, telefon, email majburiy maydonlari
    - Pasport raqami va telefon format validatsiyasi
    - Pasport raqami yagona ekanligini tekshirish (API orqali)
    - Xato xabarlarini ko'rsatish
    - _Talablar: 1.1, 1.2, 1.4, 1.5_
  - [x] 8.3 `src/pages/Guests/GuestDetail.tsx` sahifasini yaratish
    - Mijoz ma'lumotlari, bron tarixi, to'lov tarixi
    - Tahrirlash va o'chirish (faqat Admin) imkoniyatlari
    - _Talablar: 1.3, 1.6_
  - [ ]* 8.4 Mijoz formasi validatsiyasi uchun unit testlar yozish
    - Pasport format, telefon format, majburiy maydonlar testlari
    - _Talablar: 1.1, 1.4, 1.5_

- [x] 9. Xonalar (Rooms) modulini implementatsiya qilish
  - [x] 9.1 `src/pages/Rooms/RoomList.tsx` sahifasini yaratish
    - Xonalar grid ko'rinishi (karta yoki jadval)
    - Holat bo'yicha filter (Bo'sh, Band, Tozalanmoqda, Ta'mirda)
    - Xona turi bo'yicha filter (Standard, Lux, VIP)
    - _Talablar: 5.1, 5.2, 5.5_
  - [x] 9.2 `src/pages/Rooms/RoomForm.tsx` komponentini yaratish
    - Xona raqami, turi, sig'im, narx, holat maydonlari
    - Faqat Admin uchun yangi xona qo'shish
    - _Talablar: 5.1, 5.2_
  - [x] 9.3 Xona holati o'zgartirish komponentini yaratish
    - `src/components/rooms/RoomStatusModal.tsx`
    - Holat o'zgartirish (Admin, Menejer, Tozalovchi rollari uchun)
    - "Ta'mirda" holatida yangi bronlarni bloklash logikasi
    - _Talablar: 5.3, 5.4, 5.6_
  - [ ]* 9.4 Xona holati o'zgartirish uchun unit testlar yozish
    - "Ta'mirda" holatida bron bloklash, narx yangilash testlari
    - _Talablar: 5.3, 5.6_

- [ ] 10. Checkpoint — Asosiy modullar ishlashini tekshirish
  - Barcha testlar o'tishini tekshirish, savollar bo'lsa foydalanuvchiga murojaat qilish.

- [x] 11. Bronlar (Bookings) modulini implementatsiya qilish
  - [x] 11.1 `src/pages/Bookings/BookingList.tsx` sahifasini yaratish
    - Bronlar jadvali: bron raqami, mijoz, xona, sanalar, holat, summa
    - Holat bo'yicha filter va sana oralig'i bo'yicha filter
    - _Talablar: 2.5_
  - [x] 11.2 `src/pages/Bookings/BookingForm.tsx` komponentini yaratish
    - Mijoz tanlash (qidiruv bilan), xona turi tanlash, kirish/chiqish sanalari, mehmonlar soni
    - Bo'sh xonalarni real vaqtda tekshirish va ko'rsatish
    - Muqobil sanalar/xona turlarini taklif qilish (agar mos xona yo'q bo'lsa)
    - Chegirma kodi maydoni
    - _Talablar: 2.1, 2.2, 2.3, 6.3_
  - [x] 11.3 Check-in jarayonini `src/pages/Bookings/CheckIn.tsx` da implementatsiya qilish
    - Bron raqami yoki pasport raqami orqali qidiruv
    - Mijoz ma'lumotlarini ko'rsatish va tasdiqlash
    - Oldindan to'lov tekshiruvi
    - Kirish vaqtini avtomatik qayd etish
    - _Talablar: 3.1, 3.2, 3.3, 3.4_
  - [x] 11.4 Check-out jarayonini `src/pages/Bookings/CheckOut.tsx` da implementatsiya qilish
    - Barcha xarajatlar (xona + xizmatlar) jamlangan hisob-faktura ko'rsatish
    - To'lanmagan qoldiq bo'lsa to'lov bloklash
    - Chiqish vaqtini avtomatik qayd etish
    - _Talablar: 4.1, 4.2, 4.3, 4.5_
  - [x] 11.5 Bron bekor qilish funksiyasini implementatsiya qilish
    - Check-in sanasidan kamida 1 soat oldin bekor qilish imkoni
    - Bekor qilish tasdiqlash modali
    - _Talablar: 2.6_
  - [ ]* 11.6 Bron jarayoni uchun unit testlar yozish
    - Sana validatsiyasi, bo'sh xona tekshiruvi, bekor qilish vaqt chegarasi testlari
    - _Talablar: 2.1, 2.2, 2.6_

- [x] 12. To'lov (Payments) modulini implementatsiya qilish
  - [x] 12.1 `src/pages/Payments/PaymentList.tsx` sahifasini yaratish
    - To'lovlar jadvali: tranzaksiya raqami, bron, summa, usul, holat, vaqt
    - Sana oralig'i va to'lov usuli bo'yicha filter
    - _Talablar: 6.2, 6.6_
  - [x] 12.2 `src/pages/Payments/PaymentForm.tsx` komponentini yaratish
    - To'lov usuli tanlash (Naqd, Karta, Onlayn)
    - Chegirma kodi kiritish va validatsiya
    - Umumiy summa hisoblash va ko'rsatish
    - Xato xabarlarini ko'rsatish
    - _Talablar: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 12.3 Hisob-faktura ko'rinishini `src/pages/Payments/InvoiceView.tsx` da yaratish
    - Barcha xarajatlar tafsiloti (xona, xizmatlar, chegirma, soliq, jami)
    - PDF eksport tugmasi
    - _Talablar: 4.1, 6.4_
  - [x] 12.4 Qaytarish (Refund) funksiyasini implementatsiya qilish
    - Menejer tasdig'i bilan qaytarish modali
    - _Talablar: 6.7_
  - [ ]* 12.5 To'lov logikasi uchun unit testlar yozish
    - Chegirma hisoblash, to'lov usuli validatsiyasi testlari
    - _Talablar: 6.1, 6.3, 6.4_

- [x] 13. Xodimlar (Staff) modulini implementatsiya qilish
  - [x] 13.1 `src/pages/Staff/StaffList.tsx` sahifasini yaratish
    - Xodimlar jadvali: ism, lavozim, telefon, holat
    - Rol bo'yicha filter
    - _Talablar: 7.1, 7.2_
  - [x] 13.2 `src/pages/Staff/StaffForm.tsx` komponentini yaratish
    - Ism, familiya, lavozim, telefon, email, soatlik stavka maydonlari
    - Yangi xodim qo'shilganda avtomatik tizim kirish huquqlari tayinlash
    - _Talablar: 7.1, 7.2, 7.3_
  - [x] 13.3 Ish jadvali komponentini `src/pages/Staff/StaffSchedule.tsx` da yaratish
    - Haftalik ish jadvali ko'rinishi
    - Jadval yangilash va xodimga bildirishnoma yuborish
    - Oylik maosh hisoblash va ko'rsatish
    - _Talablar: 7.4, 7.5_
  - [x] 13.4 Xodimni arxivlash funksiyasini implementatsiya qilish
    - Arxivlash tasdiqlash modali (tarixiy ma'lumotlar saqlanadi)
    - _Talablar: 7.6_

- [x] 14. Xizmatlar (Services) modulini implementatsiya qilish
  - [x] 14.1 `src/pages/Services/ServiceList.tsx` sahifasini yaratish
    - Xizmatlar katalogi: tozalash, kir yuvish, transport, SPA, sport zali, konferensiya zali
    - Xizmat buyurtma qilish tugmasi
    - _Talablar: 8.1_
  - [x] 14.2 `src/pages/Services/ServiceOrderForm.tsx` komponentini yaratish
    - Xizmat turi tanlash, bron bilan bog'lash, vaqt belgilash
    - Mas'ul xodimga avtomatik tayinlash
    - _Talablar: 8.2, 8.6_
  - [x] 14.3 Xizmat buyurtmalari ro'yxatini `src/pages/Services/ServiceOrders.tsx` da yaratish
    - Buyurtmalar jadvali: xizmat turi, mijoz, xodim, holat, vaqt
    - "Bajarildi" deb belgilash funksiyasi
    - Kechikish ogohlantirishlari (30 daqiqadan ko'p kechiksa)
    - _Talablar: 8.3, 8.5_
  - [x] 14.4 Kunlik tozalash jadvalini `src/pages/Services/CleaningSchedule.tsx` da yaratish
    - Avtomatik yaratilgan kunlik tozalash jadvali ko'rinishi
    - _Talablar: 8.4_

- [ ] 15. Checkpoint — Barcha biznes modullari ishlashini tekshirish
  - Barcha testlar o'tishini tekshirish, savollar bo'lsa foydalanuvchiga murojaat qilish.

- [x] 16. Hisobotlar (Reports) modulini implementatsiya qilish
  - [x] 16.1 `src/pages/Reports/RevenueReport.tsx` sahifasini yaratish
    - Sana oralig'i tanlash (kunlik/haftalik/oylik)
    - Recharts `BarChart` va `LineChart` bilan daromad vizualizatsiyasi
    - _Talablar: 9.1, 9.5_
  - [x] 16.2 `src/pages/Reports/OccupancyReport.tsx` sahifasini yaratish
    - Xonalar bandlik darajasi foiz ko'rinishida
    - Recharts `PieChart` va jadval ko'rinishi
    - _Talablar: 9.2, 9.3_
  - [x] 16.3 `src/pages/Reports/GuestStats.tsx` sahifasini yaratish
    - Yangi va qaytuvchi mijozlar statistikasi
    - Millat bo'yicha taqsimot diagrammasi
    - _Talablar: 9.4_
  - [x] 16.4 Hisobot eksport funksiyasini implementatsiya qilish
    - PDF va Excel formatlarida eksport tugmalari
    - Eksport so'rovini API ga yuborish va faylni yuklab olish
    - _Talablar: 9.6_
  - [ ]* 16.5 Hisobot filtrlash uchun unit testlar yozish
    - Sana oralig'i validatsiyasi, format tanlash testlari
    - _Talablar: 9.1, 9.5, 9.6_

- [ ] 17. Real-vaqt yangilanishlar (WebSocket) ni implementatsiya qilish
  - [ ] 17.1 WebSocket xizmatini `src/services/websocketService.ts` da yaratish
    - Socket.io-client bilan ulanish va qayta ulanish logikasi
    - JWT token bilan autentifikatsiya
    - _Talablar: 5.5_
  - [ ] 17.2 WebSocket hodisalarini React Query cache bilan integratsiya qilish
    - `room:status_changed` hodisasida xonalar ro'yxatini yangilash
    - `booking:created`, `booking:checkin`, `booking:checkout` hodisalarida bronlar ro'yxatini yangilash
    - `service:assigned`, `service:completed` hodisalarida xizmatlar ro'yxatini yangilash
    - `notification:alert` hodisasida Ant Design `notification` ko'rsatish
    - _Talablar: 5.5, 8.3_

- [ ] 18. Bildirishnomalar UI ni implementatsiya qilish
  - [ ] 18.1 Bildirishnomalar markazi komponentini `src/components/notifications/NotificationCenter.tsx` da yaratish
    - Header'da bildirishnomalar qo'ng'irog'i ikonkasi
    - O'qilmagan bildirishnomalar soni badge
    - Bildirishnomalar ro'yxati dropdown
    - _Talablar: 12.1_
  - [ ] 18.2 Bildirishnoma sozlamalari komponentini yaratish
    - SMS bildirishnomalardan voz kechish toggle
    - _Talablar: 12.6_

- [x] 19. Xatolarni boshqarish va foydalanuvchi tajribasini yaxshilash
  - [x] 19.1 Global xato chegarasi (Error Boundary) komponentini yaratish
    - `src/components/common/ErrorBoundary.tsx`
    - Kutilmagan xatolarni ushlab olish va foydalanuvchiga ko'rsatish
    - _Talablar: 6.5_
  - [x] 19.2 Loading va bo'sh holat komponentlarini yaratish
    - `src/components/common/LoadingSpinner.tsx`
    - `src/components/common/EmptyState.tsx`
    - _Talablar: 9.5_
  - [x] 19.3 Sessiya tugashi logikasini implementatsiya qilish
    - 30 daqiqa faolsizlikdan so'ng avtomatik logout
    - Foydalanuvchiga ogohlantirish modali (5 daqiqa oldin)
    - _Talablar: 10.5_

- [x] 20. Barcha komponentlarni birlashtirish va yakuniy sozlash
  - [x] 20.1 React Query `QueryClient` va Zustand store'larini `src/main.tsx` da sozlash
    - Global provider'larni o'rash: `QueryClientProvider`, `ConfigProvider` (Ant Design)
    - _Talablar: barcha_
  - [x] 20.2 Rol asosida menyu va sahifalarni to'liq sozlash
    - Har bir rol uchun ko'rinadigan menyu elementlarini tekshirish
    - Ruxsatsiz sahifaga kirishda 403 sahifasini ko'rsatish
    - _Talablar: 10.4, 10.7_
  - [x] 20.3 Responsive dizaynni tekshirish va sozlash
    - Ant Design grid tizimi bilan mobil va desktop ko'rinishlarini moslashtirish
    - _Talablar: 11.1_
  - [ ]* 20.4 End-to-end integratsiya testlari yozish
    - Bron yaratish → Check-in → To'lov → Check-out to'liq oqimi testi
    - _Talablar: 2.1–2.7, 3.1–3.5, 4.1–4.5, 6.1–6.4_

- [ ] 21. Yakuniy Checkpoint — Barcha testlar va integratsiya tekshiruvi
  - Barcha testlar o'tishini tekshirish, savollar bo'lsa foydalanuvchiga murojaat qilish.

---

## Eslatmalar

- `*` bilan belgilangan vazifalar ixtiyoriy bo'lib, tezroq MVP uchun o'tkazib yuborilishi mumkin
- Har bir vazifa aniq talablar raqamlariga havola qiladi
- Checkpoint vazifalar bosqichma-bosqich tekshirishni ta'minlaydi
- WebSocket integratsiyasi backend Socket.io serveriga bog'liq
- API endpointlari design hujjatidagi `/api/v1/` prefiksiga mos kelishi kerak
