// database model
const product_model = require("../../Model/product_model.js");
const privacy_model=require("../../Model/privacy_model.js")
const termsConditions_model=require("../../Model/Term_model.js")
const aboutUs_model=require("../../Model/about_model.js")
const adminBanner_model=require("../../Model/adminbanner_model.js")
const admincategory_model = require("../../Model/admin_category_model.js");


// check duplication of aws image in db
const checkDuplicateImgsInRecords = async (fileNames, fieldName) => {
  try {
    const promises = fileNames.map(async (fileName) => {
      const [product, privacy, termsConditions,aboutUs] = await Promise.all([
        product_model.findOne({ ProductImage: fileName }),
        privacy_model.findOne({ content: fileName }),
        termsConditions_model.findOne({ content: fileName }),
        aboutUs_model.findOne({ content: fileName }),
      ]);
      if (product || privacy || termsConditions || aboutUs) {
        return fileName;
      }
    });

    const results = await Promise.all(promises);

    const duplicates = results.filter((fileName) => fileName);

    if (duplicates.length > 0) {
      return {
        message: `These ${fieldName} are already used: ${duplicates.join(
          ", "
        )}`,
        success: false,
      };
    }

    // If none of the promises find a match, return some success message or proceed with other logic.
    return {
      message: `${fieldName} is unique and can be used.`,
      success: true,
    };
  } catch (error) {
    return {
      message: `An error occurred while checking ${fieldName}`,
      success: false,
    };
  }
};
const checkDuplicateImagesInRecords = async (fileNames, fieldName) => {
  try {
    const promises = fileNames.map(async (fileName) => {
      const [adminBanner, admincategory] = await Promise.all([
        adminBanner_model.findOne({ ProductImage: fileName }),
        admincategory_model.findOne({ CategoryImage: fileName }),
      ]);
      if (adminBanner || admincategory) {
        return fileName;
      }
    });

    const results = await Promise.all(promises);

    const duplicates = results.filter((fileName) => fileName);

    if (duplicates.length > 0) {
      return {
        message: `These ${fieldName} are already used: ${duplicates.join(
          ", "
        )}`,
        success: false,
      };
    }

    // If none of the promises find a match, return some success message or proceed with other logic.
    return {
      message: `${fieldName} is unique and can be used.`,
      success: true,
    };
  } catch (error) {
    return {
      message: `An error occurred while checking ${fieldName}`,
      success: false,
    };
  }
};

module.exports = {
  checkDuplicateImgsInRecords,
  checkDuplicateImagesInRecords,
};
