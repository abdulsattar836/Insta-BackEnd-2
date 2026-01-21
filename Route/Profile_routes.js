// define route
const express = require("express");
const ROUTE = express.Router();

// model
const user_model = require("../Model/vendor_model");

// controller
const {
  getProfile,
  uploadPost,
  uploadReel,
  multiplePosts,
  multipleReels,
  deletePosts,
  deleteReels,
  getAllPostAndReels,
} = require("../Controller/Profile_controller");

// multer
const uploadsUser = require("../utils/uploadFileFunctionality/fileUpload");

// authorization
const { verifyToken } = require("../utils/verifyToken_util");
const upload = require("../multer/multer");

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     description: |
 *       Fetch the profile of the currently authenticated user using **Bearer Refresh Token**.
 *       Only the user whose token is provided can access their own profile.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
ROUTE.route("/").get(verifyToken([user_model]), getProfile);

/**
 * @swagger
 * /api/v1/profile/uploadpost:
 *   post:
 *     summary: Upload Post
 *     description: Uploads up to 100 files with each file saved using a timestamp-based filename.
 *     tags:
 *       - User/upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The files to be uploaded. Can include up to 100 files.
 *             required:
 *               - file
 *     responses:
 *       202:
 *         description: Post uploaded Successfully
 */
ROUTE.route("/uploadpost").post(
  verifyToken([user_model]),
  uploadsUser,
  multiplePosts
);

/**
 * @swagger
 * /api/v1/profile/uploadreel:
 *   post:
 *     summary: Upload Reels
 *     description: Uploads up to 100 files with each file saved using a timestamp-based filename.
 *     tags:
 *       - User/upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: The files to be uploaded. Can include up to 100 files.
 *             required:
 *               - file
 *     responses:
 *       202:
 *         description: Reel uploaded Successfully
 */
ROUTE.route("/uploadreel").post(
  verifyToken([user_model]),
  uploadsUser,
  multipleReels
);

/**
 * @swagger
 * /api/v1/profile/deletepost:
 *   delete:
 *     summary: Delete multiple posts
 *     description: Deletes multiple image posts uploaded by the logged-in user.
 *     tags:
 *       - User/upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of post _id strings to delete
 *     responses:
 *       200:
 *         description: Posts deletion result
 */
ROUTE.route("/deletepost").delete(verifyToken([user_model]), deletePosts);

/**
 * @swagger
 *  /api/v1/profile/deletereel:
 *   delete:
 *     summary: Delete multiple reels
 *     description: Deletes multiple video reels uploaded by the logged-in user.
 *     tags:
 *       - User/upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of reel _id strings to delete
 *     responses:
 *       200:
 *         description: Reels deletion result
 */
ROUTE.route("/deletereel").delete(verifyToken([user_model]), deleteReels);

/**
 * @swagger
 * /api/v1/profile/getallpostsandreels:
 *   get:
 *     summary: Get all posts and reels of logged-in user
 *     description: Retrieves all image posts and video reels uploaded by the logged-in user.
 *     tags:
 *       - User/upload
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user media (posts and reels)
 */
ROUTE.route("/getallpostsandreels").get(
  verifyToken([user_model]),
  getAllPostAndReels
);

module.exports = ROUTE;
