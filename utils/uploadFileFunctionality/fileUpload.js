const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "files");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const uploadsUser = multer({ storage: multerStorageUser });

module.exports = uploadsUser.fields([{ name: "file", maxCount: 100 }]);
