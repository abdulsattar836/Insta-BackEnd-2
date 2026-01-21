// successMessage
const { successMessage } = require("../success/success_functions");
// appError
const AppError = require("../../utils/appError");
// catchAsync
const catchAsync = require("../../utils/catchAsync");
// forgetPassword
const sendForgotOtp = require("../../utils/email Sender/forgot_passwordEmail");
// cryptoJs
const CryptoJS = require("crypto-js");
//validate password
const {
  validatePassword,
} = require("../../utils/validation/validate password");
//

//userPasswordCheck
const userPasswordCheck = (admin, inputPassword) => {
  if (!admin || !admin.password) {
    throw new AppError("Admin password not found", 400);
  }

  let decryptedPassword;
  try {
    const bytes = CryptoJS.AES.decrypt(admin.password, process.env.CRYPTO_SEC);
    decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new AppError("Error decrypting password", 500);
  }

  if (decryptedPassword !== inputPassword) {
    throw new AppError("Incorrect password", 400);
  }
};

// method GET
// route /api/v1/user/forget-password:
// @desciption for  forgetPassword
const forgetPassword = (model) =>
  catchAsync(async (req, res, next) => {
    const { email } = req.query;
    const user = await model.findOne({ email });
    if (user) {
      function generateSixDigitNumber() {
        const min = 100000; // Smallest 6-digit number
        const max = 999999; // Largest 6-digit number
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      const sixDigitNumber = generateSixDigitNumber();
      const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes expiration
      await new sendForgotOtp(email, sixDigitNumber).sendVerificationCode();
      let otp = CryptoJS.AES.encrypt(
        JSON.stringify({
          code: sixDigitNumber,
          expirationTime: expirationTime,
        }),
        process.env.CRYPTO_SEC
      ).toString();
      user.forgetPassword = encodeURIComponent(otp);
      await user.save();
      return successMessage(202, res, null, {
        email,
      });
    } else {
      return next(new AppError("not user with this email", 400));
    }
  });

// method POST
// route /api/v1/user/setpassword:
// @desciption for  set app password
const setPassword = (model) =>
  catchAsync(async (req, res, next) => {
    const { email, currentPassword, newPassword } = req.body;
    const check = validatePassword(newPassword);

    if (check.length > 0) {
      return next(new AppError(check, 400));
    }

    const errors = [];

    if (!email) {
      errors.push("Email is required.");
    }

    if (errors.length > 0) {
      return next(new AppError(errors, 400));
    }

    // Find the user (assuming user information is available in req.user)
    const user = await model.findOne({ email });
    if (!user) {
      return next(new AppError("User not found.", 400));
    }

    // Check old password
    const decryptedcurrentPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.CRYPTO_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedcurrentPassword !== currentPassword) {
      return next(new AppError(" currentPassword is incorrect.", 400));
    }

    // Update the user's password
    user.password = CryptoJS.AES.encrypt(
      newPassword,
      process.env.CRYPTO_SEC
    ).toString();
    await user.save();

    return successMessage(202, res, "Password reset successfully.", null);
  });

module.exports = {
  userPasswordCheck,
  forgetPassword,

  setPassword,
};
