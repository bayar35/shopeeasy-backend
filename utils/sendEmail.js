import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  console.log("📧 sendEmail started →", options.email);
  console.log("📧 Subject:", options.subject);

  try {
    const info = await resend.emails.send({
      from: "ShopEasy <onboarding@resend.dev>",
      to: options.email,
      subject: options.subject,
      html: options.message,  // ⭐ text → html
    });
    console.log("✅ Email sent:", info);
    return info;
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    console.error("Full error:", err);
    throw err;
  }
};