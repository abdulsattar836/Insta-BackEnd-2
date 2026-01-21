const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

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

// ================= SWAGGER =================
app.use(
  "/api-docs",
  basicAuth({
    users: {
      [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD,
    },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: theme.getBuffer("dark"),
  }),
);

// ================= MIDDLEWARES =================
app.enable("trust proxy");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/v1/user", userRouter);
app.use("/api/v1/upload", fileRouter);
app.use("/api/v1/profile", profileRouter);

// ================= 404 =================
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

// ================= DB =================
mongoose
  .connect(process.env.mongo_uri)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

module.exports = app; // ✅ IMPORTANT
