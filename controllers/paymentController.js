import handleAsyncError from "../middleware/handleAsyncError.js";
import crypto from "crypto";

// ============================================
// FAKE PROCESS PAYMENT (Razorpay-гүй)
// ============================================
export const processPayment = handleAsyncError(async (req, res) => {
  const { amount } = req.body;

  // Fake order үүсгэх
  const fakeOrder = {
    id: `fake_order_${Date.now()}`,
    entity: "order",
    amount: Number(amount * 100),
    currency: "INR",
    status: "created",
    created_at: Math.floor(Date.now() / 1000),
  };

  res.status(200).json({
    success: true,
    order: fakeOrder,
  });
});

// ============================================
// FAKE SEND API KEY
// ============================================
export const sendAPIKey = handleAsyncError(async (req, res) => {
  res.status(200).json({
    key: "fake_razorpay_key_12345",
  });
});

// ============================================
// FAKE PAYMENT VERIFICATION
// ============================================
export const paymentVerification = handleAsyncError(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id } = req.body;

  // Бүх төлбөрийг амжилттай гэж үзэх
  return res.status(200).json({
    success: true,
    message: "Payment verified successfully (FAKE)",
    reference: razorpay_payment_id || `fake_payment_${Date.now()}`,
  });
});