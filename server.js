const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const http = require("http");
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

// Socket
const { initializeSocket } = require("./socket.io/webSocket");

const app = express();
const server = http.createServer(app);
initializeSocket(server);

// ==================================================
// 🔹 SWAGGER
// ==================================================
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

// ==================================================
// 🔹 MIDDLEWARES
// ==================================================
app.enable("trust proxy");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ==================================================
// 🔹 CREATE REQUIRED FOLDERS
// ==================================================
const rootFolders = ["files", "uploads"];

rootFolders.forEach((folder) => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});

// ==================================================
// 🔹 STATIC FILES
// ==================================================
app.use("/files", express.static(path.join(__dirname, "files")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================================================
// 🔹 ROUTES
// ==================================================
app.use("/api/v1/user", userRouter);
app.use("/api/v1/upload", fileRouter);
app.use("/api/v1/profile", profileRouter);

// ==================================================
// 🔹 404 HANDLER
// ==================================================
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ==================================================
// 🔹 GLOBAL ERROR HANDLER
// ==================================================
app.use(globalErrorHandler);

// ==================================================
// 🔹 DATABASE
// ==================================================
const DB = process.env.mongo_uri;

mongoose
  .connect(DB)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("DB connection error:", err));

// ==================================================
// 🔹 SERVER
// ==================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});

module.exports = app;
