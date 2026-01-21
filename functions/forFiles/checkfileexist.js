const path = require("path");
const fs = require("fs");

// Function to check if files exist
const checkFilesExist = async (fileNames) => {
  try {
    const fileExistences = await Promise.all(
      fileNames.map((fileName) => {
        const filePath = path.join(__dirname, "..","..", "files", fileName);
        console.log(`Checking file path: ${filePath}`); // Debugging line
        return fs.promises
          .access(filePath, fs.constants.F_OK)
          .then(() => true)
          .catch((error) => {
            // console.error(`Error accessing file: ${filePath}`, error); // Debugging line
            return false;
          });
      })
    );

    if (fileExistences.every((exists) => exists)) {
      return {
        message: `All files exist.`,
        success: true,
      };
    }

    return {
      message: `One or more files do not exist.`,
      success: false,
    };
  } catch (error) {
    console.error("An error occurred in checkFilesExist function:", error); // Debugging line
    return {
      message: `An error occurred while checking file existence.`,
      success: false,
    };
  }
};

const generateStaticFileUrl = (filePaths) => {
  const baseUrl = `http://localhost:8000`;
  filePaths = filePaths.map((item) => {
    const url = `${baseUrl}/${item}`;
    return url;
  });
  return filePaths;
};

const getFileName = (urls) => {
  urls = urls.map((item) => {
    const urlParts = item.split("/");
    const filename = urlParts[urlParts.length - 1];
    return filename;
  });
  return urls;
};

module.exports = {
  checkFilesExist,
  generateStaticFileUrl,
  getFileName,
};
