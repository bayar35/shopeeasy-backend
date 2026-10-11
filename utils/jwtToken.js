export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // ⭐ Cookie expire хоног (fallback 7 хоног)
  const cookieExpireDays = Number(
    process.env.EXPIRE_COOKIE || process.env.COOKIE_EXPIRE || 7
  );

  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};