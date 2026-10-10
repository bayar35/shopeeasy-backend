// ============================================
// ORDER CONFIRMATION EMAIL
// ============================================
export const orderConfirmationEmail = (order) => {
  const itemsList = order.orderItems
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} - ${item.quantity}ш x ${item.price}₮ = ${
          item.quantity * item.price
        }₮`
    )
    .join("\n");

  return `
Сайн байна уу! 👋

Таны захиалга амжилттай хүлээн авлаа.

📦 ЗАХИАЛГЫН МЭДЭЭЛЭЛ:
━━━━━━━━━━━━━━━━━━━━━━━
Захиалгын дугаар: ${order._id}
Захиалгын огноо: ${new Date(order.createdAt).toLocaleString("mn-MN")}
━━━━━━━━━━━━━━━━━━━━━━━

🛒 ЗАХИАЛСАН БҮТЭЭГДЭХҮҮН:
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━
💰 ТӨЛБӨРИЙН ДҮН:
Дэд нийт: ${order.itemsPrice}₮
НӨАТ: ${order.taxPrice}₮
Хүргэлт: ${order.shippingPrice}₮
━━━━━━━━━━━━━━━━━━━━━━━
НИЙТ: ${order.totalPrice}₮
━━━━━━━━━━━━━━━━━━━━━━━

📍 ХҮРГЭЛТИЙН ХАЯГ:
${order.shippingInfo.address}
${order.shippingInfo.city}, ${order.shippingInfo.state}
${order.shippingInfo.country} - ${order.shippingInfo.pinCode}
Утас: ${order.shippingInfo.phoneNo}

⏰ Таны захиалга 1-3 ажлын өдөрт хүргэгдэнэ.

Захиалгын статусыг хянах: https://shopeeasy-frontend.vercel.app/orders/user

---
ShopEasy - Хурдан, найдвартай, хямд
Утас: +1234455
Имэйл: ub35@gmail.com

© 2026 ShopEasy. Бүх эрх хуулиар хамгаалагдсан.
  `.trim();
};

// ============================================
// ORDER SHIPPED EMAIL
// ============================================
export const orderShippedEmail = (order) => {
  return `
Сайн байна уу! 📦

Таны захиалга илгээгдлээ!

📦 ЗАХИАЛГЫН МЭДЭЭЛЭЛ:
━━━━━━━━━━━━━━━━━━━━━━━
Захиалгын дугаар: ${order._id}
Статус: Илгээгдсэн
━━━━━━━━━━━━━━━━━━━━━━━

📍 ХҮРГЭЛТИЙН ХАЯГ:
${order.shippingInfo.address}
${order.shippingInfo.city}, ${order.shippingInfo.state}

💰 НИЙТ ДҮН: ${order.totalPrice}₮

⏰ Таны захиалга 1-2 ажлын өдөрт хүргэгдэнэ.

Захиалгын статусыг хянах: https://shopeeasy-frontend.vercel.app/orders/user

---
ShopEasy - Хурдан, найдвартай, хямд
Утас: +1234455
Имэйл: ub35@gmail.com

© 2026 ShopEasy. Бүх эрх хуулиар хамгаалагдсан.
  `.trim();
};

// ============================================
// ORDER DELIVERED EMAIL
// ============================================
export const orderDeliveredEmail = (order) => {
  return `
Баяр хүргэе! 🎉

Таны захиалга амжилттай хүргэгдлээ!

📦 ЗАХИАЛГЫН МЭДЭЭЛЭЛ:
━━━━━━━━━━━━━━━━━━━━━━━
Захиалгын дугаар: ${order._id}
Статус: Хүргэгдсэн
━━━━━━━━━━━━━━━━━━━━━━━

💰 НИЙТ ДҮН: ${order.totalPrice}₮

Таны сэтгэгдлийг бид үнэлж байна! 
Бүтээгдэхүүн дээр сэтгэгдэл бичиж өгөөрэй:
https://shopeeasy-frontend.vercel.app/orders/user

Дараагийн удаа таныг дахин хүлээж байна! 🛍️

---
ShopEasy - Хурдан, найдвартай, хямд
Утас: +1234455
Имэйл: ub35@gmail.com

© 2026 ShopEasy. Бүх эрх хуулиар хамгаалагдсан.
  `.trim();
};

// ============================================
// ORDER CANCELLED EMAIL
// ============================================
export const orderCancelledEmail = (order) => {
  return `
Сайн байна уу,

Таны захиалга цуцлагдлаа.

📦 ЗАХИАЛГЫН МЭДЭЭЛЭЛ:
━━━━━━━━━━━━━━━━━━━━━━━
Захиалгын дугаар: ${order._id}
Статус: Цуцлагдсан
━━━━━━━━━━━━━━━━━━━━━━━

💰 НИЙТ ДҮН: ${order.totalPrice}₮

Хэрэв асуулт байвал бидэнтэй холбогдоно уу:
Утас: +1234455
Имэйл: ub35@gmail.com

---
ShopEasy - Хурдан, найдвартай, хямд

© 2026 ShopEasy. Бүх эрх хуулиар хамгаалагдсан.
  `.trim();
};

// ============================================
// REVIEW THANKS EMAIL
// ============================================
export const reviewThanksEmail = (user, product, rating) => {
  const stars = "⭐".repeat(rating);
  return `
Сайн байна уу, ${user.name}! 👋

Таны сэтгэгдэл амжилттай бүртгэгдлээ. Баярлалаа!

📦 БҮТЭЭГДЭХҮҮН: ${product.name}
⭐ ҮНЭЛГЭЭ: ${stars} (${rating}/5)
💬 СЭТГЭГДЭЛ: ${user.comment || "Сэтгэгдэл байхгүй"}

Таны сэтгэгдэл бусад хэрэглэгчдэд тусална.

Бусад бүтээгдэхүүнийг үзэх: https://shopeeasy-frontend.vercel.app/products

---
ShopEasy - Хурдан, найдвартай, хямд
Утас: +1234455
Имэйл: ub35@gmail.com

© 2026 ShopEasy. Бүх эрх хуулиар хамгаалагдсан.
  `.trim();
};