import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
} from "../utils/emailTemplates/orderStatus.js";

// ============================================
// CREATE NEW ORDER
// ============================================
export const newOrder = handleAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  console.log("✅ Order created:", order._id);

  // ⭐ Захиалгын баталгаажуулах имэйл
  try {
    await sendEmail({
      email: req.user.email,
      subject: `Захиалга амжилттай - #${order._id}`,
      message: orderConfirmationEmail(order),
    });
    console.log("✅ Order confirmation email sent to:", req.user.email);
  } catch (emailError) {
    console.error("❌ Email send failed:", emailError.message);
  }

  res.status(201).json({
    success: true,
    order,
  });
});

// ============================================
// GET SINGLE ORDER
// ============================================
export const getSingleOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new HandleError("Order not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ============================================
// MY ORDERS
// ============================================
export const myOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// ============================================
// ADMIN — GET ALL ORDERS
// ============================================
export const getAllOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// ============================================
// ADMIN — UPDATE ORDER STATUS
// ============================================
export const updateOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found with this id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new HandleError("This order has been already delivered", 400));
  }

  const previousStatus = order.orderStatus;
  const newStatus = req.body.status;

  // Update stock (зөвхөн Shipped болгох үед)
  if (newStatus === "Shipped" && previousStatus !== "Shipped") {
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save({ validateBeforeSave: false });
      }
    }
  }

  order.orderStatus = newStatus;

  if (newStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  // ⭐ Имэйл илгээх (статус өөрчлөгдсөн бол)
  if (previousStatus !== newStatus) {
    try {
      const user = await User.findById(order.user);

      if (user) {
        let emailTemplate;
        let subject;

        switch (newStatus) {
  case "Shipped":
    emailTemplate = orderShippedEmail(order);
    subject = `Таны захиалга илгээгдлээ - #${order._id}`;
    break;
  case "On The Way":
    emailTemplate = orderShippedEmail(order);  // ⭐ "On The Way"-д мөн адил
    subject = `Таны захиалга замдаа гарлаа - #${order._id}`;
    break;
  case "Delivered":
    emailTemplate = orderDeliveredEmail(order);
    subject = `Таны захиалга хүргэгдлээ - #${order._id}`;
    break;
  case "Cancelled":
    emailTemplate = orderCancelledEmail(order);
    subject = `Захиалга цуцлагдлаа - #${order._id}`;
    break;
  default:
    emailTemplate = null;
}

        if (emailTemplate) {
          await sendEmail({
            email: user.email,
            subject,
            message: emailTemplate,
          });
          console.log(`✅ Order status email sent to: ${user.email}`);
        }
      }
    } catch (emailError) {
      console.error("❌ Status email failed:", emailError.message);
    }
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// ============================================
// ADMIN — DELETE ORDER
// ============================================
export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found with this id", 404));
  }

  if (order.orderStatus === "Processing") {
    return next(
      new HandleError("This order is under processing and cannot be deleted", 400)
    );
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});