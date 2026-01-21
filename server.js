const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// Swagger
const basicAuth = require("express-basic-auth");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swaggerConfig");
const { SwaggerTheme } = require("swagger-themes");
const theme = new SwaggerTheme();

// Routes
const userRouter = require("./Route/user_routes");
const fileRouter = require("./Route/filesystem_routes");
const profileRouter = require("./Route/Profile_routes");

// Utils
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controller/error_controller");

const app = express();

// ❌ REMOVED: server.listen and Socket.io initialization.
// Vercel does not support persistent WebSocket connections.
// For real-time features, use a provider like Pusher or Ably.

// ==================================================
// 🔹 SWAGGER
// ==================================================
app.use(
  "/api-docs",
  basicAuth({
    users: { [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: theme.getBuffer("dark"),
  }),
);

// ==================================================
// 🔹 MIDDLEWARES
// ==================================================
app.enable("trust proxy");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ❌ REMOVED: Local folder creation and local static serving.
// Vercel is read-only. For uploads, use Cloudinary or AWS S3.
// Static assets should be placed in a /public folder in your root.

// ==================================================
// 🔹 DATABASE CONNECTION
// ==================================================
const DB = process.env.mongo_uri;
mongoose
  .connect(DB)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("DB connection error:", err));

// ==================================================
// 🔹 ROUTES
// ==================================================
app.use("/api/v1/user", userRouter);
app.use("/api/v1/upload", fileRouter);
app.use("/api/v1/profile", profileRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

// ✅ EXPORT FOR VERCEL
module.exports = app;
