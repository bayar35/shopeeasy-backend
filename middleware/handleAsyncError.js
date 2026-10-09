export default (myErrorFun) => async (req, res, next) => {
  try {
    await myErrorFun(req, res, next);
  } catch (error) {
    console.error("=== handleAsyncError caught ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("next type:", typeof next);
    if (typeof next === "function") {
      next(error);
    } else {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
};