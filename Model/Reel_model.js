// models/Post.js
const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reel", reelSchema);
