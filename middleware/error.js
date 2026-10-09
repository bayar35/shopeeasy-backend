export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

    // CastError
    if(err.name==='CastError') {
        const message = `This is invalid resource ${err.path}`;
        err = new HandleError(message, 404)
    }

    // Duplicate key error
    if(err.code===11000) {
      const message=`This ${Object.keys(err.keyValue)} already registered. Please Login to continue`;
      err=new HandleError(message, 400);
    }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose CastError (буруу ID)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found. Invalid: ${err.path}`;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate ${Object.keys(err.keyValue)} entered`;
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "JSON Web Token is invalid. Try again.";
  }

  // JWT Expire
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "JSON Web Token is expired. Try again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;