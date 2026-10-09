import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  console.log("📧 sendEmail started →", options.email);
  console.log("SMTP_MAIL:", process.env.SMTP_MAIL);
  console.log("SMTP_PASSWORD exists:", !!process.env.SMTP_PASSWORD);
  console.log("SMTP_SERVICE:", process.env.SMTP_SERVICE);

  const transporter = nodeMailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
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
  } catch (err) {
    // ⚠️ `error` биш `err` гэж нэрлэсэн!
    console.error("❌ Email send error:", err.message);
    console.error("❌ Full error:", err);
    throw err;
  }
};