// ==================================================
// 🔹 IMPORTS
// ==================================================
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

// ==================================================
// 🔹 CREATE APP FUNCTION
// ==================================================
function createServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize Socket
  initializeSocket(server);

  // Swagger
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

  // Middlewares
  app.enable("trust proxy");
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());

  // Create required folders
  const rootFolders = ["files", "uploads"];
  rootFolders.forEach((folder) => {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });
  });

  // Static files
  app.use("/files", express.static(path.join(process.cwd(), "files")));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Routes
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/upload", fileRouter);
  app.use("/api/v1/profile", profileRouter);

  // 404 handler
  app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });

  // Global error handler
  app.use(globalErrorHandler);

  return { app, server };
}

// ==================================================
// 🔹 START SERVER FUNCTION
// ==================================================
async function startServer() {
  const { app, server } = createServer();
  const DB = process.env.mongo_uri;

  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB connection error:", error);
    process.exit(1);
  }

  return { app, server };
}

// ==================================================
// 🔹 EXPORTS
// ==================================================
module.exports = { createServer, startServer };
