// app error
const AppError = require("../utils/appError");
// catchAsync
const catchAsync = require("../utils/catchAsync");
// model
const user_model = require("../Model/vendor_model");
// password encryption
const CryptoJS = require("crypto-js");
// utility functions
const { successMessage } = require("../functions/success/success_functions");
//validate password
const { validatePassword } = require("../utils/validation/validate password");
// validation
const {
  signupUserValidation,
  loginUserValidation,
  updateprofileValidation,
} = require("../utils/validation/user_joi_validation");
// authorization
const {
  generateAccessTokenRefreshToken,
} = require("../utils/verifyToken_util");
const sendOTPEmail = require("../utils/sendEmail/emailsend");
//
const uploadToCloudinary = require("../utils/cloudinary");
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  const expirationTime = new Date().getTime() + 1 * 60 * 1000; // Current time + 1minutes
  return { otp, expirationTime };
};

// method POST
// route /api/v1/user/signup:
// @desciption for signup of user and sendotp
const signUpUser = catchAsync(async (req, res, next) => {
  // validate body
  const { error, value } = signupUserValidation.validate(req.body);
  if (error) {
    const errors = error.details.map((el) => el.message);
    return next(new AppError(errors.join(", "), 400));
  }

  const { username, email, password, bio, website } = value;

  // profile picture required
  if (!req.file) {
    return next(new AppError("Profile picture is required", 400));
  }

  // upload image to cloudinary
  const imageResult = await uploadToCloudinary(req.file.buffer);
  const profilePic = imageResult.secure_url; // ✅ URL

  // check existing user
  let existingUser = await user_model.findOne({ email });

  // encrypt password
  const encryptPassword = CryptoJS.AES.encrypt(
    password,
    process.env.CRYPTO_SEC,
  ).toString();

  // generate OTP
  const otpData = generateOTP();
  const expirationTime = Date.now() + 1 * 60 * 1000;

  const encryptOtp = CryptoJS.AES.encrypt(
    JSON.stringify({ otp: otpData.otp, expirationTime }),
    process.env.CRYPTO_SEC,
  ).toString();

  if (existingUser) {
    if (existingUser.isVerified) {
      return next(
        new AppError("You are already signed up, please log in", 400),
      );
    }

    // update unverified user
    existingUser.username = username || existingUser.username;
    existingUser.bio = bio || existingUser.bio;
    existingUser.website = website || existingUser.website;
    existingUser.password = encryptPassword;
    existingUser.profilePic = profilePic;
    existingUser.otp = encryptOtp;

    await existingUser.save();
  } else {
    // create new user
    await user_model.create({
      username: username || "",
      email,
      password: encryptPassword,
      bio: bio || "",
      website: website || "",
      profilePic,
      otp: encryptOtp,
    });
  }

  // send OTP email
  await sendOTPEmail(email, otpData.otp);

  res.status(202).json({
    status: "success",
    message: "OTP sent to your email, please verify your account",
  });
});

// method POST
// route /api/v1/user/login:
// @desciption for login of user
const loginUser = catchAsync(async (req, res, next) => {
  const { error, value } = loginUserValidation.validate(req.body);
  if (error) {
    const errors = error.details.map((el) => el.message);
    return next(new AppError(errors, 400));
  }
  const userExists = await user_model.findOne({
    email: value.email,
  });
  if (!userExists) {
    return next(new AppError("User not found", 400));
  }
  if (!userExists.isVerified) {
    return next(new AppError("Email not verified", 400));
  }
  if (userExists.isBlock) {
    return next(new AppError("User is block", 400));
  }
  const hashedPassword = CryptoJS.AES.decrypt(
    userExists.password,
    process.env.CRYPTO_SEC,
  );
  //console.log(hashedPassword);
  const realPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  if (realPassword !== value.password) {
    return next(new AppError("Incorrect password", 400));
  }
  const { refreshToken, accessToken } = generateAccessTokenRefreshToken(
    userExists._id,
  );
  userExists.refreshToken.push(refreshToken);
  await userExists.save();
  userExists.refreshToken = undefined;
  userExists.password = undefined;
  return successMessage(202, res, "login success", {
    ...JSON.parse(JSON.stringify(userExists)),
    accessToken,
    refreshToken,
  });
});

// method POST
// route /api/v1/user/verifyAccount:
// @desciption for verifying email
const verifyAccount = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  // Validate request
  if (!email || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }

  // Find user by email
  const user = await user_model.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Decrypt OTP and check expiration
  const decryptedOtpData = CryptoJS.AES.decrypt(
    user.otp,
    process.env.CRYPTO_SEC,
  ).toString(CryptoJS.enc.Utf8);
  const { otp: storedOtp, expirationTime } = JSON.parse(decryptedOtpData);

  // Check if OTP has expired
  const currentTime = new Date().getTime();
  if (currentTime > expirationTime) {
    return next(new AppError("Verification code has expired.", 400));
  }

  // Check if user is already verified
  if (user.isVerified) {
    return next(new AppError("User is already verified", 400));
  }

  // console.log("Stored OTP:", storedOtp);
  // console.log("Provided OTP:", otp);

  // Compare OTP
  if (storedOtp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Mark user as verified
  user.isVerified = true;
  user.isBlocked = false;
  user.otp = undefined; // Clear OTP after successful verification
  await user.save();

  // Send success response
  return successMessage(200, res, "Email verified successfully");
});

// method PUT
// route /api/v1/user/profile:
// @desciption for update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  // Validate request body
  const { error, value } = updateprofileValidation.validate(req.body);
  if (error) {
    const errors = error.details.map((el) => el.message);
    return next(new AppError(errors, 400));
  }

  const { username, email, website, bio } = value;
  const userId = req.user.id; // Assuming user ID is available in req.user

  // Find and update user profile
  let updatedUser = await user_model.findByIdAndUpdate(
    userId,
    { username, email, bio, website },
    { new: true }, // Return the updated document
  );

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  // Remove sensitive data before sending response
  updatedUser = JSON.parse(JSON.stringify(updatedUser));
  updatedUser.password = undefined;
  updatedUser.refreshToken = undefined;

  return successMessage(200, res, "Profile updated successfully", updatedUser);
});

// method GET
// route /api/v1/user/otp-validation:
// @desciption for otp-validation
const otpValidation = catchAsync(async (req, res, next) => {
  const { email, otp } = req.query;
  // Decrypt the encrypted options and compare with the user-entered code
  if (!email || !otp) {
    return next(new AppError("Email and OTP are required", 400));
  }

  const user = await user_model.findOne({ email });
  if (!user) {
    return next(new AppError("No user with this email", 400));
  }
  const encryptOpts = user.forgetPassword; // Assuming `forgetPassword` contains the encrypted OTP options
  if (!encryptOpts) {
    return next(new AppError("No OTP found for this user.", 400));
  }
  const decrypted = CryptoJS.AES.decrypt(
    decodeURIComponent(encryptOpts),
    process.env.CRYPTO_SEC,
  ).toString(CryptoJS.enc.Utf8);
  let otpData;
  try {
    otpData = JSON.parse(decrypted);
  } catch (error) {
    return next(new AppError("Invalid encrypted options format.", 400));
  }

  const { code, expirationTime } = otpData;
  // Check if the OTP has expired
  const currentTime = new Date().getTime();
  if (currentTime > expirationTime) {
    return next(new AppError("Verification code has expired.", 400));
  }

  if (code != otp) {
    return next(new AppError("Invalid verification code.", 400));
  }

  return successMessage(202, res, "Correct OTP", null);
});

// method POST
// route /api/v1/user/set-password:
// @desciption for setEmailPassword using forgetPassword
const setEmailPassword = (model) =>
  catchAsync(async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    const check = validatePassword(newPassword);
    if (check.length > 0) {
      return next(new AppError(check, 400));
    }
    const errors = [];

    if (!email) {
      errors.push("Email is required.");
    }

    if (!otp) {
      errors.push("Verification code is required.");
    }

    if (errors.length > 0) {
      return next(new AppError(errors, 400));
    }

    const user = await model.findOne({ email });
    if (!user) {
      return next(new AppError("User not found.", 400));
    }
    const encryptOpts = user.forgetPassword; // Assuming `forgetPassword` contains the encrypted OTP options
    if (!encryptOpts) {
      return next(new AppError("No OTP found for this user.", 400));
    }
    // Decrypt the encrypted options and compare with the user-entered code
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptOpts),
      process.env.CRYPTO_SEC,
    ).toString(CryptoJS.enc.Utf8);

    let otpData;
    try {
      otpData = JSON.parse(decrypted);
    } catch (error) {
      return next(new AppError("Invalid encrypted options format.", 400));
    }

    const { code, expirationTime } = otpData;

    if (code != otp) {
      return next(new AppError("Invalid verification code.", 400));
    }

    // Check if the OTP has expired
    const currentTime = new Date().getTime();
    if (currentTime > expirationTime) {
      return next(new AppError("Verification code has expired.", 400));
    }

    // Find the user by email

    // console.log("User's OTP state:", user.forgetPassword);
    if (!user.forgetPassword) {
      return next(new AppError("Unable to change password without OTP", 400));
    }
    if (encryptOpts != user.forgetPassword) {
      new AppError("generate otp first", 400);
    }
    // Update the user's password
    user.password = CryptoJS.AES.encrypt(
      newPassword,
      process.env.CRYPTO_SEC,
    ).toString();
    user.forgetPassword = null;
    await user.save();
    return successMessage(202, res, "Password reset successfully.", null);
  });

module.exports = {
  signUpUser,
  loginUser,
  otpValidation,
  verifyAccount,
  updateProfile,
  setEmailPassword,
};
