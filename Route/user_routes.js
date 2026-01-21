// define route
const express = require("express");
const ROUTE = express.Router();
// model
const user_model = require("../Model/vendor_model");
// controller
const {
  signUpUser,
  loginUser,
  verifyAccount,
  updateProfile,
  otpValidation,
  setEmailPassword,
} = require("../Controller/user_controller");
const { logout } = require("../functions/user/user_functions");
const uploadsUser = require("../utils/uploadFileFunctionality/fileUpload");

const {
  forgetPassword,
  setPassword,
} = require("../functions/password/password_function");
const { refreshToken, verifyToken } = require("../utils/verifyToken_util");
const upload = require("../multer/multer");
// const { verifyToken } = require("../utils/verifyToken_util");
/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     summary: User signup
 *     tags:
 *       - User/account
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - profilePic
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: OTP sent to the user's email for verification
 */
ROUTE.route("/signup").post(upload.single("profilePic"), signUpUser);
/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - User/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sattar15844@gmail.com
 *               password:
 *                 type: string
 *                 example: "securepassword123"
 *                 description: The user's password.
 *     responses:
 *       202:
 *         description: Login successfulk
 */
ROUTE.route("/login").post(loginUser);

/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     summary: Log out a user
 *     description: Removes the refresh token from the user's record to log them out.
 *     tags:
 *       - User/account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       202:
 *         description: Logout successful
 */

ROUTE.route("/logout").post(logout(user_model));

/**
 * @swagger
 * /api/v1/user/verifyAccount:
 *   post:
 *     summary: Verify Account
 *     description: Verified the Account for user email verification
 *     tags:
 *       - User/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sattar15844@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
ROUTE.route("/verifyAccount").post(verifyAccount);

/**
 * @swagger
 * /api/v1/user/refresh-token:
 *   post:
 *     summary: Refresh the access token
 *     description: Generates a new access token using a valid refresh token.
 *     tags:
 *       - User/account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       202:
 *         description: Refresh token processed successfully
 */

ROUTE.route("/refresh-token").post(refreshToken(user_model));

/**
 * @swagger
 * /api/v1/user/forget-password:
 *   get:
 *     summary: Initiate forgot password process
 *     tags:
 *       - User/account
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       202:
 *         description: OTP sent successfully
 */
ROUTE.route("/forget-password").get(forgetPassword(user_model));

/**
 * @swagger
 * /api/v1/user/otp-validation:
 *   get:
 *     summary: Validate OTP for user email
 *     description: Validates the OTP sent to the user's email. Checks if the OTP is correct and if it has expired. Includes the ability to handle encrypted options.
 *     tags:
 *       - User/account
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: The email address of the user.
 *       - in: query
 *         name: otp
 *         schema:
 *           type: string
 *         required: true
 *         description: The OTP entered by the user.
 *     responses:
 *       '202':
 *         description: OTP is correct and the user is successfully validated.
 */
ROUTE.route("/otp-validation").get(otpValidation);

/**
 * @swagger
 * /api/v1/user/setpassword:
 *   post:
 *     summary: Reset user password
 *     description: Allows users to reset their password by providing their email, old password, and a new password.
 *     tags:
 *       - User/account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               currentPassword:
 *                 type: string
 *                 description: The user's current password.
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set.
 *     responses:
 *       202:
 *         description: Password reset successfully.
 */

ROUTE.route("/setpassword").post(setPassword(user_model));

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the user's profile information.
 *     tags:
 *       - User/account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johnny"
 *               bio:
 *                 type: string
 *                 example: "Hello, I love coding!"
 *               website:
 *                 type: string
 *                 example: "https://mywebsite.com"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
ROUTE.route("/profile").put(verifyToken([user_model]), updateProfile);

/**
 * @swagger
 * /api/v1/user/set-password:
 *   post:
 *     summary: Set a new password for a user
 *     description: Allows a user to set a new password using a verification code (OTP) and encrypted options. The endpoint verifies the OTP, checks expiration, and updates the password if everything is correct.
 *     tags:
 *       - User/account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user requesting to set a new password.
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email.
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set.
 *             required:
 *               - email
 *               - otp
 *               - encryptOpts
 *               - newPassword
 *     responses:
 *       '202':
 *         description: Password updated successfully
 */
ROUTE.route("/set-password").post(setEmailPassword(user_model));

module.exports = ROUTE;
