const path = require("path");
const fs = require("fs");
const AppError = require("../../utils/appError"); // Assuming you have an AppError utility for handling errors
const mime = require("mime-types");

const getExtensionOfFile = (fileName) => {
  let lastDotIndex = fileName.lastIndexOf(".");

  // Split the string into two parts based on the last dot
  let firstPart = fileName.substring(0, lastDotIndex);
  let secondPart = fileName.substring(lastDotIndex + 1);

  // Create an array with the two parts
  return secondPart;
};
const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    // Resolve the absolute path correctly
    const absolutePath = path.resolve(__dirname, "../../files", filePath);

    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.log(`No file exists at ${absolutePath}`);
        reject(err); // Reject the promise if an error occurs
      } else {
        console.log(`${filePath} file deleted successfully`);
        resolve(); // Resolve the promise if deletion is successful
      }
    });
  });
};

function fileExistsSync(fileName) {
  const fs = require("fs");
  const path = require("path");
  // Example usage
  const folderPath = path.join(__dirname, "../../files");
  const filePath = path.join(folderPath, fileName);
  const fileExist = fs.existsSync(filePath);
  return fileExist;
}

// checkPDF function
// checkPDF.js
const checkPDFContent = (req, res, next) => {
  const { content } = req.body;

  // Check if content exists
  if (!content) {
    return next(new AppError("No file content provided", 400));
  }

  // Resolve the file path
  const filePath = path.join(__dirname, "..","..", "files", content); // Adjust the path to where your files are stored


  // Validate the file is a PDF
  const mimeType = mime.lookup(filePath);
  if (mimeType !== "application/pdf") {
    return next(new AppError("Only PDF files are allowed", 400));
  }

  next();
};


// const checkPDFContent = (req, res, next) => {
//   const { content } = req.body;

//   // Check if content exists
//   if (!content) {
//     return next(new AppError("No file content provided", 400));
//   }

//   // Log the content to verify it's correct
//   console.log("Content provided:", content);

//   // Resolve the file path
//   const filePath = path.join(__dirname, "..", "..", "files", content);

//   // Log the file path to verify it resolves correctly
//   console.log("Resolved file path:", filePath);

//   // Check if the file exists
//   if (!fs.existsSync(filePath)) {
//     return next(new AppError("File not found", 404));
//   }

//   // Validate that the file is a PDF
//   const mimeType = mime.lookup(filePath);
//   if (mimeType !== "application/pdf") {
//     return next(new AppError("Only PDF files are allowed", 400));
//   }

//   next();
// };


module.exports = {
  getExtensionOfFile,
  deleteFile,
  fileExistsSync,
  checkPDFContent,
};
