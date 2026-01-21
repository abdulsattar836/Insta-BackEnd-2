const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const user_model = require("../Model/vendor_model");
const { successMessage } = require("../functions/success/success_functions");
const Post_model = require("../Model/Post_model");
const Reel_model = require("../Model/Reel_model");

// GET PROFILE
const getProfile = catchAsync(async (req, res, next) => {
  const user = req.fullUser;
  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

  const makeFileUrl = (file) => {
    if (!file) return null;
    if (file.startsWith("http")) return file;
    return `${BASE_URL}/files/${file.replace(/\\/g, "/")}`;
  };

  const profileData = {
    profilePic: makeFileUrl(user.profilePic) || "/default-avatar.png",

    username: user.username ?? "",
    bio: user.bio ?? "",
    website: user.website ?? "",

    followers: Array.isArray(user.followers) ? user.followers.length : 0,
    following: Array.isArray(user.following) ? user.following.length : 0,

    posts: Array.isArray(user.posts)
      ? user.posts.map(makeFileUrl).filter(Boolean)
      : [],

    reels: Array.isArray(user.reels)
      ? user.reels.map(makeFileUrl).filter(Boolean)
      : [],
  };

  return successMessage(200, res, "Profile fetched successfully", profileData);
});

// method POST
// route /api/v1/upload/posts
// @desc  posts upload (image or video)
// @access logged-in user
const multiplePosts = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.file || req.files.file.length === 0) {
    return next(new AppError("No post files found", 400));
  }

  const user = req.fullUser;
  if (!Array.isArray(user.posts)) user.posts = [];

  const savedFiles = [];
  const invalidFiles = [];

  for (const file of req.files.file) {
    if (!file.mimetype.startsWith("image/")) {
      invalidFiles.push(file.originalname);
      continue;
    }

    const relativePath = `${file.filename}`;

    // Create post in DB
    const postDoc = await Post_model.create({
      userId: user._id,
      fileUrl: relativePath,
    });

    // Save relativePath in user.posts array
    user.posts.push(relativePath);

    // Respond with _id (so frontend can use backend_id)
    savedFiles.push({
      _id: postDoc._id, // <--- key changed to _id
      file: relativePath,
    });
  }

  if (!savedFiles.length) {
    return next(
      new AppError(
        `Only image posts allowed. Invalid files: ${invalidFiles.join(", ")}`,
        400,
      ),
    );
  }

  await user.save();

  return successMessage(201, res, "Posts uploaded successfully", {
    files: savedFiles,
  });
});

// method POST
// route /api/v1/upload/reels
// @desc  reels upload (video only)
// @access logged-in user
const multipleReels = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.file || req.files.file.length === 0) {
    return next(new AppError("No reel files found", 400));
  }

  const user = req.fullUser;
  if (!Array.isArray(user.reels)) user.reels = [];

  const savedFiles = [];
  const invalidFiles = [];

  for (const file of req.files.file) {
    if (!file.mimetype.startsWith("video/")) {
      invalidFiles.push(file.originalname);
      continue;
    }

    const relativePath = `${file.filename}`;

    // Create reel in DB
    const reelDoc = await Reel_model.create({
      userId: user._id,
      fileUrl: relativePath,
    });

    // Save relativePath in user.reels array
    user.reels.push(relativePath);

    // Save both _id and file path in response
    savedFiles.push({
      _id: reelDoc._id, // backend ID
      file: relativePath,
    });
  }

  if (!savedFiles.length) {
    return next(
      new AppError(
        `Only video reels allowed. Invalid files: ${invalidFiles.join(", ")}`,
        400,
      ),
    );
  }

  await user.save();

  return successMessage(201, res, "Reels uploaded successfully", {
    files: savedFiles,
  });
});

// method DELETE
// route /api/v1/upload/deletepost
// @desc  reels delete (video only)
// @access logged-in user
const deletePosts = catchAsync(async (req, res, next) => {
  const { ids } = req.body; // array of post _ids to delete
  if (!ids || !Array.isArray(ids) || !ids.length) {
    return next(new AppError("No post IDs provided for deletion", 400));
  }

  const user = req.fullUser;
  if (!Array.isArray(user.posts)) user.posts = [];

  const deletedPosts = [];
  const invalidIds = [];

  for (const id of ids) {
    const post = await Post_model.findOne({ _id: id });
    if (!post) {
      invalidIds.push({ id, reason: "Post does not exist" });
      continue;
    }

    // Check if this post actually belongs to this user
    if (post.userId.toString() !== user._id.toString()) {
      invalidIds.push({ id, reason: "Post belongs to another user" });
      continue;
    }

    // Only delete if it is a post
    if (!user.posts.includes(post.fileUrl)) {
      invalidIds.push({ id, reason: "Not a post or already deleted" });
      continue;
    }

    // Remove from user's posts array
    const index = user.posts.indexOf(post.fileUrl);
    if (index !== -1) user.posts.splice(index, 1);

    // Delete from DB
    await Post_model.findByIdAndDelete(id);

    // Delete from filesystem
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../files", post.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Push deleted info with id and file path
    deletedPosts.push({ id, file: post.fileUrl });
  }

  await user.save();

  if (!deletedPosts.length && invalidIds.length) {
    return next(
      new AppError(`No posts fetchted. Invalid or non-post IDs.`, 400),
    );
  }

  return successMessage(200, res, "Posts deleted successfully", {
    deleted: deletedPosts, // array of {id, file}
    invalid: invalidIds, // array of {id, reason}
  });
});

// method DELETE
// route /api/v1/upload/deletereels
// @desc  reels delete (video only)
// @access logged-in user
const deleteReels = catchAsync(async (req, res, next) => {
  const { ids } = req.body; // array of reel _ids to delete
  if (!ids || !Array.isArray(ids) || !ids.length) {
    return next(new AppError("No reel IDs provided for deletion", 400));
  }

  const user = req.fullUser;
  if (!Array.isArray(user.reels)) user.reels = [];

  const deletedReels = [];
  const invalidIds = [];

  for (const id of ids) {
    const reel = await Reel_model.findOne({ _id: id });
    if (!reel) {
      invalidIds.push({ id, reason: "Reel does not exist" });
      continue;
    }

    // Check if this reel actually belongs to this user
    if (reel.userId.toString() !== user._id.toString()) {
      invalidIds.push({ id, reason: "Reel belongs to another user" }); // belongs to another user
      continue;
    }

    // ✅ Only delete if it is a reel
    if (!user.reels.includes(reel.fileUrl)) {
      invalidIds.push({ id, reason: "Not a post or already deleted" }); // maybe it's a post or invalid
      continue;
    }

    // Remove from user's reels array
    const index = user.reels.indexOf(reel.fileUrl);
    if (index !== -1) user.reels.splice(index, 1);

    // Delete from DB
    await Reel_model.findByIdAndDelete(id);

    // Delete from filesystem
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "../files", reel.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    deletedReels.push({ id, file: reel.fileUrl });
  }

  await user.save();

  if (!deletedReels.length && invalidIds.length) {
    return next(
      new AppError(
        `Only reels fetchted. Invalid or non-reel IDs: ${invalidIds.join(
          ", ",
        )}`,
        400,
      ),
    );
  }

  return successMessage(200, res, "Reels deleted successfully", {
    deleted: deletedReels,
    invalid: invalidIds,
  });
});

// method GET
// route /api/v1/upload/getallpostsandreels
// @desc get all posts and reels (video only)
// @access logged-in user
const getAllPostAndReels = catchAsync(async (req, res, next) => {
  const user = req.fullUser;
  const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

  const makeFileUrl = (file) => {
    if (!file) return null;
    if (file.startsWith("http")) return file;
    return `${BASE_URL}/files/${file.replace(/\\/g, "/")}`;
  };

  // Fetch posts as plain JS objects
  const posts = await Post_model.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  const formattedPosts = posts.map((post) => ({
    id: post._id.toString(),
    file: makeFileUrl(post.fileUrl),
    createdAt: post.createdAt,
  }));

  // Fetch reels as plain JS objects
  const reels = await Reel_model.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean();

  const formattedReels = reels.map((reel) => ({
    id: reel._id.toString(),
    file: makeFileUrl(reel.fileUrl),
    createdAt: reel.createdAt,
  }));

  // Send response
  return successMessage(200, res, "User media fetched successfully", {
    id: user._id.toString(),
    posts: formattedPosts,
    reels: formattedReels,
  });
});

module.exports = {
  getProfile,
  multiplePosts,
  multipleReels,
  deletePosts,
  deleteReels,
  getAllPostAndReels,
};
