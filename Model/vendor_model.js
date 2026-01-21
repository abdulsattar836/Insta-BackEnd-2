const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  username: { type: String, default: "" },
  bio: { type: String, default: "" },
  website: { type: String, default: "" },
  profilePic: { type: String, default: "" }, // works if user doesn't upload

  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  isBlock: { type: Boolean, default: false },

  posts: [{ type: String }],
  reels: [{ type: String }],
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },

  refreshToken: [{ type: String }],
  forgetPassword: { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);
