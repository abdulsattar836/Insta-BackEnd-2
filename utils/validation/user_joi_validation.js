const Joi = require("joi");

const signupUserValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  refreshToken: Joi.array().items(Joi.string()),
  isVerified: Joi.boolean(),
  forgetPassword: Joi.string().allow(null, ""),
  isBlock: Joi.boolean(),
  otp: Joi.string().allow(null, ""),

  // PROFILE INFO
  username: Joi.string().trim().allow("").max(30),
  bio: Joi.string().allow("").max(200),
  website: Joi.string().allow(""),

  // MEDIA
  posts: Joi.array().items(Joi.string().uri()),
  reels: Joi.array().items(Joi.string().uri()),

  // SOCIAL COUNTS
  followers: Joi.number().integer().min(0),
  following: Joi.number().integer().min(0),

  // PROFILE PICTURE
  profilePic: Joi.any().optional().allow(""), // allow empty or filename or URL
});
const loginUserValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  isBlock: Joi.boolean().optional(),
});

const updateprofileValidation = Joi.object({
  username: Joi.string().trim().allow("").max(30),
  bio: Joi.string().allow("").max(200),
  website: Joi.string().uri().allow(""),
});

module.exports = {
  signupUserValidation,
  loginUserValidation,
  updateprofileValidation,
};
