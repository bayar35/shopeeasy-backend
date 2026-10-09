import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  console.log("📧 sendEmail started →", options.email);

  try {
    const info = await resend.emails.send({
      from: "ShopEasy <onboarding@resend.dev>",
      to: options.email,
      subject: options.subject,
      text: options.message,
    });
    console.log("✅ Email sent:", info);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    throw err;
  }
};