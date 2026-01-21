const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: [{ type: String }],
    forgetPassword: { type: String },
  },
  {
    timestamps: true,
  }
);
const data = mongoose.model("admin", adminSchema);
module.exports = data;
