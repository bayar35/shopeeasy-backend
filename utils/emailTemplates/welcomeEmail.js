export const welcomeEmailTemplate = (user) => {
  return `
Сайн байна уу, ${user.name}! 👋

ShopEasy-д тавтай морил!

Таны бүртгэл амжилттай үүслээ. Одоо та:
✅ Бүтээгдэхүүн худалдан авах
✅ Захиалга хянах
✅ Хүслийн жагсаалт үүсгэх
✅ Сэтгэгдэл бичих

боломжтой.

--- 
ShopEasy - Хурдан, найдвартай, хямд
Утас: +1234455
Имэйл: ub35@gmail.com
Вебсайт: https://shopeeasy-frontend.vercel.app

© 2026 ShopEasy. Бүх эрх хуулиар хамгаалагдсан.
  `.trim();
};