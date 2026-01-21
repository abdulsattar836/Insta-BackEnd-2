// define route
const express = require("express");
const ROUTE = express.Router();
// model
const vendor_model = require("../Model/vendor_model");
const admin_model = require("../Model/admin_model");
// controller
const {
  // uploadFile,
  multiplefile,
} = require("../Controller/filesystem_contoller");
// multer
const upload = require("../multer/multer");
// authorization
const { verifyToken } = require("../utils/verifyToken_util");
const uploadsUser = require("../utils/uploadFileFunctionality/fileUpload");

/**
 * @swagger
 * /api/v1/upload/uploadfile:
 *   post:
 *     summary: Upload multiple files
 *     description: Uploads up to 100 files with each file saved using a timestamp-based filename.
 *     tags:
 *       - User/upload
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
 *         description: Successfully uploaded file
 */
ROUTE.route("/uploadfile").post(uploadsUser, multiplefile);
module.exports = ROUTE;
