const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../utils/appError");

const uploadPath = path.join(process.cwd(), "files");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new AppError("Only image files allowed", 400), false);
};

module.exports = multer({ storage, fileFilter });
