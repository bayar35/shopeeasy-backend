import { Resend } from "resend";

// ⭐ API key байгаа үед л Resend үүсгэх
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async (options) => {
  console.log("📧 sendEmail started →", options.email);
  console.log("📧 Subject:", options.subject);

  // ⭐ Тест эсвэл API key байхгүй үед имэйл илгээхгүй
  if (process.env.NODE_ENV === "test" || !resend) {
    console.log("🧪 Test mode: email skipped →", options.email);
    return {
      success: true,
      message: "Test mode - email not sent",
      testMode: true,
    };
  }

  try {
    const info = await resend.emails.send({
      from: "ShopEasy <onboarding@resend.dev>",
      to: options.email,
      subject: options.subject,
      html: options.message,
    });
    console.log("✅ Email sent:", info);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    console.error("Full error:", err);
    throw err;
  }
};