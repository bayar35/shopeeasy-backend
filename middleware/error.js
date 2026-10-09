import HandleError from "../utils/handleError.js";

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Mongoose CastError (буруу ObjectId)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    err = new HandleError(message, 400);
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = `This ${Object.keys(err.keyValue)} already registered. Please Login to continue`;
    err = new HandleError(message, 400);
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    err = new HandleError("JSON Web Token is invalid. Try again.", 401);
  }

  // JWT Expire
  if (err.name === "TokenExpiredError") {
    err = new HandleError("JSON Web Token is expired. Try again.", 401);
  }

  // Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    err = new HandleError(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;