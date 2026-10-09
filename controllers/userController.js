export const requestPasswordReset = handleAsyncError(
  async (req, res, next) => {
    const { email } = req.body;

    // Email байгаа эсэхийг шалгах
    if (!email) {
      return next(new HandleError("Please provide an email", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new HandleError("User doesn't exist with this email", 404));
    }

    let resetToken;
    try {
      resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });
    } catch (error) {
      return next(
        new HandleError(
          "Could not save reset token, please try again later",
          500
        )
      );
    }

    const clientUrl =
      process.env.CLIENT_URL || "https://shopeeasy-frontend.vercel.app";
    const resetPasswordURL = `${clientUrl}/reset/${resetToken}`;
    const message = `Use the following link to reset your password: ${resetPasswordURL}. \n\n This link will expire in 30 minutes. \n\n If you didn't request a password reset, please ignore this message.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email is sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new HandleError("Email couldn't be sent, please try again later", 500)
      );
    }
  }
);