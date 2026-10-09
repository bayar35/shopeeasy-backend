export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + Number(process.env.EXPIRE_COOKIE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Frontend JavaScript-ээс хамгаалах (XSS-ээс сэргийлнэ)
    secure: true,   // Өөр өөр домэйн (Render -> Vercel) хооронд күүки зөв дамжихад заавал TRUE байна
    sameSite: "none", // Өөр домэйн дээрх Frontend күүкиг хүлээж авч хадгалах тохиргоо
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};
