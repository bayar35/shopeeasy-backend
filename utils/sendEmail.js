import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  console.log("📧 sendEmail started →", options.email);

  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // 587 портод false (TLS ашиглана)
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // IPv6-г албадахгүй байх
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
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
    console.error("❌ Email send error:", err.message);
    console.error("❌ Full error:", err);
    throw err;
  }
};