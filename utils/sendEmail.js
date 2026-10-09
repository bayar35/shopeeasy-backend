import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  console.log("📧 sendEmail started →", options.email);
  console.error("➡️ Email failed:", error.code, error.message);

  const transporter = nodeMailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    console.log("✅ Email accepted:", info.accepted);
    return info;
  } catch (error) {
    console.error("❌ Email send error:", error.code, error.message);
    throw error;
  }
};