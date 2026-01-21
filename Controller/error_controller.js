const AppError = require("../utils/appError");
//ok
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const UnverifiedNumber = (err) => {
  const message = `Unverified Number. Please verify your number on twilio😮`;
  return new AppError(message, 400);
};
const InvalidNumber = (err) => {
  const message = `Invalid Number`;
  return new AppError(message, 400);
};
const handleDublicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const errors = Object.keys(err.keyValue);
  const message = `Dublicate field value (${errors}). Please use another value.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation Error. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) => {
  return new AppError("Invalid Token. Please log in again!", 401);
};
const handleJWTExpiredError = (err) => {
  return new AppError("Expired Token!", 401);
};
const handleJWTDeleteUser = (err) => {
  return new AppError("The user belonging to this token no longer exist!", 401);
};
const handleJWTPasswordChange = (err) => {
  return new AppError(
    "User Recently Changed Password. please login again!",
    401
  );
};
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  console.error("Error 🔥", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error("Error 🔥", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Please try again later!",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV.startsWith("development")) {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.startsWith("production")) {
    let error = { ...err };
    error.message = err.message;
    // console.log(error.message);
    if (error.code === 20404) {
      error = InvalidNumber(error);
    }
    if (error.code === 21608) {
      error = UnverifiedNumber(error);
    }
    if (error.name) {
      if (error.name.startsWith("Change Password")) {
        error = handleJWTPasswordChange(error);
      } else if (error.name.startsWith("User Deleted")) {
        error = handleJWTDeleteUser(error);
      } else if (error.name.startsWith("TokenExpiredError")) {
        error = handleJWTExpiredError(error);
      } else if (error.name.startsWith("JsonWebTokenError")) {
        error = handleJWTError(error);
      }
    }

    if (!error.code) {
      if (error.kind) {
        if (error.kind.startsWith("ObjectId")) error = handleCastErrorDB(error);
      }
    }
    if (
      error.status.startsWith("Error") &&
      error.message.startsWith("E11000 duplicate key error")
    ) {
      error = handleDublicateFieldsDB(error);
    }
    if (error._message) {
      if (String(error._message).startsWith("User validation")) {
        error = handleValidationErrorDB(error);
      }
    }
    sendErrorProd(error, req, res);
  }
};
